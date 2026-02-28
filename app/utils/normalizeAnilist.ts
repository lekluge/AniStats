import type { AnimeEntry } from '~/types/anime'

export function normalizeAnilist(lists: any[]): AnimeEntry[] {
  const result: AnimeEntry[] = []

  for (const list of lists) {
    for (const e of list.entries) {
      result.push({
        status: e.status,
        score: e.score,
        progress: e.progress ?? 0,
        episodes: e.media?.episodes ?? null,
        duration: e.media?.duration ?? null,
        format: e.media?.format ?? null,
        countryOfOrigin: e.media?.countryOfOrigin ?? null,
        genres: e.media?.genres ?? [],
        seasonYear: e.media?.seasonYear ?? null,
        title: e.media?.title,
        id: e.media.id,
        tags: e.media?.tags ?? [],
        startedAt: e.startedAt ?? undefined,
        completedAt: e.completedAt ?? undefined,
        coverImage: e.media?.coverImage?.large

      })
    }
  }

  return result
}
