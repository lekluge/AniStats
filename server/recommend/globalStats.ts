import { GlobalStats } from "./types/GlobalStats";
export async function loadGlobalStats(anime: any[]): Promise<GlobalStats> {
  const tagCount = new Map<number, number>();
  const genreCount = new Map<string, number>();

  for (const a of anime) {
    for (const g of a.genres) {
      genreCount.set(g.name, (genreCount.get(g.name) ?? 0) + 1);
    }
    for (const t of a.tags) {
      tagCount.set(t.tagId, (tagCount.get(t.tagId) ?? 0) + 1);
    }
  }

  return { tagCount, genreCount, totalAnime: anime.length };
}

export function idf(globalCount: number, total: number) {
  return Math.log((1 + total) / (1 + globalCount));
}