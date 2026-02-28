import { prisma } from "../../../utils/prisma";
import { createError } from "h3";
import crypto from "crypto";
import { anilistRequest } from "../../../services/anilist/anilistClient";
import type { AniListCollection, AniUserMediaEntry } from "../../types/api/anilist";
import type { AnimeWithGenresTags } from "../../types/api/private";

interface NormalizedAniUserMediaEntry {
  status: string | null
  score: number | null
  progress: number | null
  completedAt: AniUserMediaEntry["completedAt"]
  startedAt: AniUserMediaEntry["startedAt"]
  media: {
    id: number
    season: string | null
    seasonYear: number | null
    duration: number | null
    episodes: number | null
    countryOfOrigin: string | null
  }
}

interface NormalizedAniList {
  entries: NormalizedAniUserMediaEntry[]
}

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

function isNormalizedEntry(
  value: AniUserMediaEntry | null | undefined
): value is NormalizedAniUserMediaEntry {
  if (!isPresent(value) || !isPresent(value.media)) return false
  return typeof value.media.id === "number"
}

function normalizeAniLists(
  response: AniListCollection<AniUserMediaEntry>
): NormalizedAniList[] {
  const lists = response.MediaListCollection
    ? response.MediaListCollection.lists ?? []
    : []

  return lists.filter(isPresent).map((list) => ({
    entries: (list.entries ?? [])
      .filter(isNormalizedEntry)
      .map((entry) => ({
        status: entry.status ?? null,
        score: entry.score ?? null,
        progress: entry.progress ?? null,
        completedAt: entry.completedAt ?? null,
        startedAt: entry.startedAt ?? null,
        media: {
          id: entry.media.id,
          season: entry.media.season ?? null,
          seasonYear: entry.media.seasonYear ?? null,
          duration: entry.media.duration ?? null,
          episodes: entry.media.episodes ?? null,
          countryOfOrigin: entry.media.countryOfOrigin ?? null,
        },
      })),
  }))
}

export default defineEventHandler(async (event) => {
  const { user } = getQuery(event);
  const userName = String(user || "").trim();
  

  if (!userName) {
    throw createError({ statusCode: 400, statusMessage: "Missing ?user=" });
  }

  /* -----------------------------
   * 1. AniList: User + season data
   * ----------------------------- */
  const query = `
    query ($userName: String) {
      MediaListCollection(userName: $userName, type: ANIME) {
        lists {
          entries {
            status
            score
            progress
            completedAt { year month day }
            startedAt { year month day }
            media {
              id
              season
              seasonYear
              duration
              episodes
              countryOfOrigin
            }
          }
        }
      }
    }
  `;

  const res = await anilistRequest<AniListCollection<AniUserMediaEntry>>(query, {
    userName,
  });

  const lists = normalizeAniLists(res)
  /* -----------------------------
   * 2. IDs sammeln
   * ----------------------------- */
  const mediaIds: number[] = lists
    .flatMap((l) => l.entries)
    .map((e) => e.media.id)

  const uniqueIds = [...new Set(mediaIds)].sort((a, b) => a - b);

  /* -----------------------------
   * 3. DB: Anime + Genres + Tags (CACHED)
   * ----------------------------- */
  const storage = useStorage("cache");

  const cacheKey =
    "anime-meta:" +
    crypto
      .createHash("sha1")
      .update(uniqueIds.join(","))
      .digest("hex");

  let animeRows = await storage.getItem<AnimeWithGenresTags[]>(cacheKey);

  if (!animeRows) {
    animeRows = await prisma.anime.findMany({
      where: { id: { in: uniqueIds } },
      include: {
        genres: true,
        tags: true,
      },
    });

    // Cache für 15 Minuten (kannst du erhöhen)
    await storage.setItem(cacheKey, animeRows, {
      ttl: 60 * 15,
    });
  }

  const animeMap = new Map(animeRows.map((a) => [a.id, a]));

  /* -----------------------------
   * 4. Merge → AniList-Struktur
   * ----------------------------- */
  const enrichedLists = lists.map((l) => ({
    ...l,
    entries: l.entries.map((e) => {
      const a = animeMap.get(e.media.id);

      // Fallback: falls Anime noch nicht in DB ist
      if (!a) return e;

      return {
        ...e,
        media: {
          id: a.id,
          season: e.media.season,
          seasonYear: e.media.seasonYear,
          duration: e.media.duration,
          episodes: e.media.episodes,
          countryOfOrigin: e.media.countryOfOrigin,

          title: {
            romaji: a.titleRo ?? null,
            english: a.titleEn ?? null,
          },

          format: a.format ?? null,

          genres: a.genres.map((g) => g.name),

          tags: a.tags.map((t) => ({
            name: t.name,
            rank: t.rank,
          })),

          coverImage: {
            extraLarge: a.cover ?? null,
            large: a.cover ?? null,
          },
        },
      };
    }),
  }));

  /* -----------------------------
   * 5. Rückgabe: AniList-kompatibel
   * ----------------------------- */
  return {
    data: {
      MediaListCollection: {
        lists: enrichedLists,
      },
    },
  };
});
