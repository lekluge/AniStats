import { GlobalStats } from "./types/GlobalStats";
import { TasteProfile } from "./types/TasteProfile";
import { idf } from "./globalStats";
import { mapToSortedArray } from "./utils";
export function buildTasteProfile(
  completedIds: number[],
  scoreById: Map<number, number | null>,
  animeById: Map<number, any>,
  global: GlobalStats,
  debug?: { user?: string; topN?: number; log?: boolean }
): TasteProfile {
  const genres = new Map<string, number>();
  const tags = new Map<number, number>();
  const negativeGenres = new Map<string, number>();
  const negativeTags = new Map<number, number>();

  const weights: number[] = [];

  for (const id of completedIds) {
    const a = animeById.get(id);
    if (!a) continue;

    const s = scoreById.get(id) ?? 5;
    const weight = s / 10; // 🔹 Schritt 4: Z-Score-light
    weights.push(weight);

    const isNegative = s <= 4;
    if (s === 5) continue; // Neutral → ignorieren
    for (const g of a.genres) {
      const idfWeight = idf(
        global.genreCount.get(g.name) ?? 1,
        global.totalAnime
      );
      const w = weight * idfWeight;

      if (isNegative) {
        negativeGenres.set(
          g.name,
          (negativeGenres.get(g.name) ?? 0) + Math.abs(w)
        );
      } else {
        genres.set(g.name, (genres.get(g.name) ?? 0) + w);
      }
    }

    for (const t of a.tags) {
      const idfWeight = idf(
        global.tagCount.get(t.tagId) ?? 1,
        global.totalAnime
      );
      const w = weight * idfWeight;

      if (isNegative) {
        negativeTags.set(
          t.tagId,
          (negativeTags.get(t.tagId) ?? 0) + Math.abs(w)
        );
      } else {
        tags.set(t.tagId, (tags.get(t.tagId) ?? 0) + w);
      }
    }
  }

  // 🔹 Schritt 3: Soft-Cap / Sättigung
  function soften<K>(m: Map<K, number>) {
    for (const [k, v] of m) {
      m.set(k, Math.sign(v) * Math.log1p(Math.abs(v)));
    }
  }
  function cap<K>(m: Map<K, number>, max: number) {
    for (const [k, v] of m) {
      m.set(k, Math.min(v, max));
    }
  }

  cap(negativeGenres, 2.5);
  cap(negativeTags, 3.0);
  soften(genres);
  soften(tags);
  soften(negativeGenres);
  soften(negativeTags);

  if (debug?.log) {
    console.log(`\n[TasteProfile+Advanced] user=${debug.user}`);
    console.log("Top Positive Genres", mapToSortedArray(genres, 15));
    console.log("Top Negative Genres", mapToSortedArray(negativeGenres, 15));
    console.log("Top Positive Tags", mapToSortedArray(tags, 15));
    console.log("Top Negative Tags", mapToSortedArray(negativeTags, 15));
  }

  return { genres, tags, negativeGenres, negativeTags };
}