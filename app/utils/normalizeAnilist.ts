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

function hasDateValue(date: FuzzyDate | null | undefined): boolean {
  return Boolean(date?.year || date?.month || date?.day);
}

function mergeTags(a: AnimeTag[], b: AnimeTag[]): AnimeTag[] {
  const tagMap = new Map<string, number>();

  for (const tag of [...a, ...b]) {
    const prev = tagMap.get(tag.name);
    if (typeof prev === "number") {
      tagMap.set(tag.name, Math.max(prev, tag.rank));
    } else {
      tagMap.set(tag.name, tag.rank);
    }
  }

  return [...tagMap.entries()].map(([name, rank]) => ({ name, rank }));
}

function mergeEntry(existing: AnimeEntry, incoming: AnimeEntry): AnimeEntry {
  return {
    ...existing,
    status: existing.status || incoming.status,
    score: Math.max(existing.score ?? 0, incoming.score ?? 0),
    progress: Math.max(existing.progress ?? 0, incoming.progress ?? 0),
    episodes: Math.max(existing.episodes ?? 0, incoming.episodes ?? 0) || null,
    duration: Math.max(existing.duration ?? 0, incoming.duration ?? 0) || null,
    format: existing.format ?? incoming.format ?? null,
    countryOfOrigin: existing.countryOfOrigin ?? incoming.countryOfOrigin ?? null,
    genres: [...new Set([...existing.genres, ...incoming.genres])],
    seasonYear: existing.seasonYear ?? incoming.seasonYear ?? null,
    title: {
      romaji: existing.title.romaji ?? incoming.title.romaji ?? null,
      english: existing.title.english ?? incoming.title.english ?? null,
    },
    tags: mergeTags(existing.tags, incoming.tags),
    startedAt: hasDateValue(existing.startedAt) ? existing.startedAt : incoming.startedAt,
    completedAt: hasDateValue(existing.completedAt) ? existing.completedAt : incoming.completedAt,
    coverImage: existing.coverImage ?? incoming.coverImage ?? null,
  };
}

export function normalizeAnilist(lists: RawList[]): AnimeEntry[] {
  const deduped = new Map<number, AnimeEntry>();

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
      };

      const existing = deduped.get(normalized.id);
      deduped.set(normalized.id, existing ? mergeEntry(existing, normalized) : normalized);
    }
  }

  return [...deduped.values()];
}
