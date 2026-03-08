import type { AnimeEntry, AnimeTitle, AnimeTag, FuzzyDate } from "~/types/anime";

interface RawMedia {
  id?: number | null;
  episodes?: number | null;
  duration?: number | null;
  format?: string | null;
  countryOfOrigin?: string | null;
  genres?: Array<string | null> | null;
  seasonYear?: number | null;
  title?: AnimeTitle | null;
  tags?: Array<Partial<AnimeTag> | null> | null;
  coverImage?: { large?: string | null; extraLarge?: string | null } | null;
  nextAiringEpisode?: {
    episode?: number | null;
    airingAt?: number | null;
  } | null;
}

interface RawEntry {
  status?: string | null;
  score?: number | null;
  progress?: number | null;
  startedAt?: FuzzyDate | null;
  completedAt?: FuzzyDate | null;
  media?: RawMedia | null;
}

interface RawList {
  entries?: Array<RawEntry | null> | null;
}

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

const STATUS_PRIORITY: Record<string, number> = {
  COMPLETED: 6,
  REPEATING: 5,
  CURRENT: 4,
  PAUSED: 3,
  DROPPED: 2,
  PLANNING: 1,
};

function mergeUniqueStrings(a: string[], b: string[]) {
  return [...new Set([...a, ...b])];
}

function mergeUniqueTags(a: AnimeTag[], b: AnimeTag[]) {
  const map = new Map<string, AnimeTag>();
  for (const tag of [...a, ...b]) {
    const existing = map.get(tag.name);
    if (!existing || tag.rank > existing.rank) {
      map.set(tag.name, tag);
    }
  }
  return [...map.values()];
}

function dateToTs(date: FuzzyDate | null) {
  if (!date?.year) return 0;
  const month = Math.max((date.month ?? 1) - 1, 0);
  const day = Math.max(date.day ?? 1, 1);
  return Date.UTC(date.year, month, day);
}

function pickLatestDate(a: FuzzyDate | null, b: FuzzyDate | null) {
  return dateToTs(b) > dateToTs(a) ? b : a;
}

function shouldReplaceByStatus(current: AnimeEntry, incoming: AnimeEntry) {
  const currentPrio = STATUS_PRIORITY[current.status] ?? 0;
  const incomingPrio = STATUS_PRIORITY[incoming.status] ?? 0;
  return incomingPrio > currentPrio;
}

export function normalizeAnilist(lists: RawList[]): AnimeEntry[] {
  const byId = new Map<number, AnimeEntry>();

  for (const list of lists ?? []) {
    for (const entry of list.entries ?? []) {
      if (!entry?.media?.id) continue;

      const media = entry.media;
      const genres = (media.genres ?? []).filter(
        (genre): genre is string => typeof genre === "string" && genre.length > 0
      );
      const tags = (media.tags ?? [])
        .filter(isPresent)
        .map((tag) => ({
          name: typeof tag.name === "string" ? tag.name : "",
          rank: typeof tag.rank === "number" ? tag.rank : 0,
        }))
        .filter((tag) => tag.name.length > 0);

      const normalized: AnimeEntry = {
        id: media.id,
        status: entry.status ?? "",
        score: typeof entry.score === "number" ? entry.score : 0,
        progress: typeof entry.progress === "number" ? entry.progress : 0,
        episodes: media.episodes ?? null,
        duration: media.duration ?? null,
        format: media.format ?? null,
        countryOfOrigin: media.countryOfOrigin ?? null,
        genres,
        seasonYear: media.seasonYear ?? null,
        title: media.title ?? {},
        tags,
        startedAt: entry.startedAt ?? null,
        completedAt: entry.completedAt ?? null,
        coverImage: media.coverImage?.large ?? media.coverImage?.extraLarge ?? null,
        nextAiringEpisode:
          typeof media.nextAiringEpisode?.episode === "number" &&
          typeof media.nextAiringEpisode?.airingAt === "number"
            ? {
                episode: media.nextAiringEpisode.episode,
                airingAt: media.nextAiringEpisode.airingAt,
              }
            : null,
      };

      const existing = byId.get(normalized.id);
      if (!existing) {
        byId.set(normalized.id, normalized);
        continue;
      }

      const preferred = shouldReplaceByStatus(existing, normalized) ? normalized : existing;
      const fallback = preferred === normalized ? existing : normalized;

      byId.set(normalized.id, {
        ...preferred,
        score: Math.max(existing.score, normalized.score),
        progress: Math.max(existing.progress, normalized.progress),
        episodes: preferred.episodes ?? fallback.episodes ?? null,
        duration: preferred.duration ?? fallback.duration ?? null,
        format: preferred.format ?? fallback.format ?? null,
        countryOfOrigin: preferred.countryOfOrigin ?? fallback.countryOfOrigin ?? null,
        seasonYear: preferred.seasonYear ?? fallback.seasonYear ?? null,
        title: {
          romaji: preferred.title.romaji ?? fallback.title.romaji ?? null,
          english: preferred.title.english ?? fallback.title.english ?? null,
        },
        genres: mergeUniqueStrings(existing.genres, normalized.genres),
        tags: mergeUniqueTags(existing.tags, normalized.tags),
        startedAt: pickLatestDate(existing.startedAt, normalized.startedAt),
        completedAt: pickLatestDate(existing.completedAt, normalized.completedAt),
        coverImage: preferred.coverImage ?? fallback.coverImage ?? null,
        nextAiringEpisode:
          preferred.nextAiringEpisode ?? fallback.nextAiringEpisode ?? null,
      });
    }
  }

  return [...byId.values()];
}
