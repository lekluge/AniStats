import { createError, defineEventHandler, getQuery, setHeader } from "h3";
import { anilistRequest } from "../../../services/anilist/anilistClient";

type CurrentEntry = {
  status: string | null;
  progress: number | null;
  media: {
    id: number;
    status: string | null;
    episodes: number | null;
    title: {
      english: string | null;
      romaji: string | null;
    } | null;
    coverImage: {
      large: string | null;
      extraLarge: string | null;
    } | null;
    nextAiringEpisode: {
      episode: number | null;
    } | null;
    pastAiring?: {
      nodes?: Array<{
        episode: number | null;
        airingAt: number | null;
      } | null> | null;
    } | null;
    upcomingAiring?: {
      nodes?: Array<{
        episode: number | null;
        airingAt: number | null;
      } | null> | null;
    } | null;
  } | null;
};

type CurrentListResponse = {
  MediaListCollection?: {
    lists?: Array<{
      entries?: CurrentEntry[] | null;
    } | null> | null;
  } | null;
};

const USER_CURRENT_QUERY = `
  query ($user: String!) {
    MediaListCollection(userName: $user, type: ANIME) {
      lists {
        entries {
          status
          progress
          media {
            id
            status
            episodes
            title {
              english
              romaji
            }
            coverImage {
              large
              extraLarge
            }
            nextAiringEpisode {
              episode
            }
            pastAiring: airingSchedule(page: 1, perPage: 30, notYetAired: false) {
              nodes {
                episode
                airingAt
              }
            }
            upcomingAiring: airingSchedule(page: 1, perPage: 30, notYetAired: true) {
              nodes {
                episode
                airingAt
              }
            }
          }
        }
      }
    }
  }
`;

const CACHE_TTL_SECONDS = 60 * 5;
const inFlightCacheBuilds = new Map<string, Promise<{
  ok: true;
  user: string;
  count: number;
  events: Array<{
    id: number;
    title: string;
    coverImage: string | null;
    totalEpisodes: number | null;
    watchedEpisodes: number;
    episode: number;
    airingAt: number;
  }>;
}>>();

function normalizeCurrentEntries(res: CurrentListResponse) {
  const lists = res.MediaListCollection?.lists ?? [];
  return lists
    .flatMap((list) => list?.entries ?? [])
    .filter((entry): entry is CurrentEntry => Boolean(entry?.media?.id));
}

export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", `private, max-age=${CACHE_TTL_SECONDS}`);

  const q = getQuery(event);
  const user = String(q.user ?? "").trim();
  const includePlanningNotYetReleased =
    String(q.includePlanningNotYetReleased ?? "").toLowerCase() === "true";
  if (!user) {
    throw createError({ statusCode: 400, statusMessage: "Missing query param: user" });
  }

  const storage = useStorage("cache");
  const cacheKey = `anilist:airing-calendar:${user.toLowerCase()}:${includePlanningNotYetReleased ? "planning" : "current"}`;
  const cached = await storage.getItem<{
    ok: true;
    user: string;
    count: number;
    events: Array<{
      id: number;
      title: string;
      coverImage: string | null;
      totalEpisodes: number | null;
      watchedEpisodes: number;
      episode: number;
      airingAt: number;
    }>;
  }>(cacheKey);
  if (cached) return cached;

  const existingBuild = inFlightCacheBuilds.get(cacheKey);
  if (existingBuild) return existingBuild;

  const buildPromise = (async () => {
    const currentRes = await anilistRequest<CurrentListResponse>(USER_CURRENT_QUERY, { user });
    const entries = normalizeCurrentEntries(currentRes);
    const filteredEntries = entries.filter((entry) => {
      if (entry.status === "CURRENT") return true;
      if (!includePlanningNotYetReleased) return false;
      return entry.status === "PLANNING" && entry.media?.status === "NOT_YET_RELEASED";
    });

    const events: Array<{
      id: number;
      title: string;
      coverImage: string | null;
      totalEpisodes: number | null;
      watchedEpisodes: number;
      episode: number;
      airingAt: number;
    }> = [];

    for (const entry of filteredEntries) {
      const media = entry.media!;
      const watchedEpisodes = Math.max(entry.progress ?? 0, 0);
      const scheduleNodes = [
        ...(media.pastAiring?.nodes ?? []),
        ...(media.upcomingAiring?.nodes ?? []),
      ];
      const seenEpisodesInSchedule = new Set<number>();

      for (const node of scheduleNodes) {
        if (!node?.episode || !node?.airingAt) continue;
        if (seenEpisodesInSchedule.has(node.episode)) continue;
        seenEpisodesInSchedule.add(node.episode);

        events.push({
          id: media.id,
          title: media.title?.english ?? media.title?.romaji ?? "Unknown",
          coverImage: media.coverImage?.large ?? media.coverImage?.extraLarge ?? null,
          totalEpisodes: media.episodes ?? null,
          watchedEpisodes,
          episode: node.episode,
          airingAt: node.airingAt,
        });
      }
    }

    const result = {
      ok: true as const,
      user,
      count: events.length,
      events: events.sort((a, b) => a.airingAt - b.airingAt),
    };

    await storage.setItem(cacheKey, result, { ttl: CACHE_TTL_SECONDS });
    return result;
  })().finally(() => {
    inFlightCacheBuilds.delete(cacheKey);
  });

  inFlightCacheBuilds.set(cacheKey, buildPromise);
  return buildPromise;
});
