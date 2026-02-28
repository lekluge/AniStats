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

export function normalizeAnilist(lists: RawList[]): AnimeEntry[] {
  const result: AnimeEntry[] = [];

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

      result.push({
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
      });
    }
  }

  return result;
}
