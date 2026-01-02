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
  /* ----------------------------------
   * Raw net scores
   * ---------------------------------- */
  const genreScore = new Map<string, number>();
  const tagScore = new Map<number, number>();

  /* ----------------------------------
   * Exposure (user evidence)
   * ---------------------------------- */
  const genreExposure = new Map<string, number>();
  const tagExposure = new Map<number, number>();

  /* ----------------------------------
   * Debug name lookup (LOG ONLY)
   * ---------------------------------- */
  const tagNames = new Map<number, string>();

  // 🔹 WICHTIG: globale Tag-ID → Name Map
  for (const a of animeById.values()) {
    for (const t of a.tags) {
      if (!tagNames.has(t.tagId)) {
        tagNames.set(t.tagId, t.name);
      }
    }
  }

  /* ----------------------------------
   * Build net taste from completed anime
   * ---------------------------------- */
  for (const id of completedIds) {
    const a = animeById.get(id);
    if (!a) continue;

    const score = scoreById.get(id) ?? 5;
    if (score === 5) continue; // neutral → ignore

    // -1 .. +1
    const signedWeight = (score - 5) / 5;

    /* -------- Genres -------- */
    for (const g of a.genres) {
      const name = g.name;

      genreExposure.set(name, (genreExposure.get(name) ?? 0) + 1);

      const idfWeight = idf(
        global.genreCount.get(name) ?? 1,
        global.totalAnime
      );

      const w = signedWeight * idfWeight;
      genreScore.set(name, (genreScore.get(name) ?? 0) + w);
    }

    /* -------- Tags -------- */
    for (const t of a.tags) {
      const id = t.tagId;

      tagExposure.set(id, (tagExposure.get(id) ?? 0) + 1);

      const idfWeight = idf(global.tagCount.get(id) ?? 1, global.totalAnime);

      const w = signedWeight * idfWeight;
      tagScore.set(id, (tagScore.get(id) ?? 0) + w);
    }
  }

  /* ----------------------------------
   * Split into positive / negative
   * + Scarcity boost for negative
   * ---------------------------------- */
  const genres = new Map<string, number>();
  const negativeGenres = new Map<string, number>();

  const tags = new Map<number, number>();
  const negativeTags = new Map<number, number>();

  /* ----------------------------------
   * Unseen (uninteressant)
   * ---------------------------------- */
  const unseenGenres = new Map<string, number>();
  const unseenTags = new Map<number, number>();

  const GENRE_THRESHOLD = 0.15;
  const TAG_THRESHOLD = 0.2;

  const NEG_SCARCITY_ALPHA_GENRE = 1.1;
  const NEG_SCARCITY_ALPHA_TAG = 1.3;

  function scarcityBoost(exposure: number, alpha: number) {
    return 1 + alpha / Math.sqrt(Math.max(1, exposure));
  }

  for (const [name, v] of genreScore) {
    if (v > GENRE_THRESHOLD) {
      genres.set(name, v);
    } else if (v < -GENRE_THRESHOLD) {
      const exp = genreExposure.get(name) ?? 1;
      negativeGenres.set(
        name,
        Math.abs(v) * scarcityBoost(exp, NEG_SCARCITY_ALPHA_GENRE)
      );
    }
  }

  for (const [id, v] of tagScore) {
    if (v > TAG_THRESHOLD) {
      tags.set(id, v);
    } else if (v < -TAG_THRESHOLD) {
      const exp = tagExposure.get(id) ?? 1;
      negativeTags.set(
        id,
        Math.abs(v) * scarcityBoost(exp, NEG_SCARCITY_ALPHA_TAG)
      );
    }
  }

  /* ----------------------------------
   * Unseen = uninteressant
   * (global relevant, never seen)
   * ---------------------------------- */
  const UNSEEN_GENRE_PENALTY = 0.6;
  const UNSEEN_TAG_PENALTY = 0.4;
  const MIN_GLOBAL_TAG_COUNT = 50;

  for (const [name] of global.genreCount) {
    if (
      !genreExposure.has(name) &&
      !genres.has(name) &&
      !negativeGenres.has(name)
    ) {
      unseenGenres.set(name, UNSEEN_GENRE_PENALTY);
    }
  }

  for (const [id, count] of global.tagCount) {
    if (count < MIN_GLOBAL_TAG_COUNT) continue;

    if (!tagExposure.has(id) && !tags.has(id) && !negativeTags.has(id)) {
      unseenTags.set(id, UNSEEN_TAG_PENALTY);
    }
  }

  /* ----------------------------------
   * Soft-Cap / Saturation
   * ---------------------------------- */
  function soften<K>(m: Map<K, number>) {
    for (const [k, v] of m) m.set(k, Math.log1p(v));
  }

  function cap<K>(m: Map<K, number>, max: number) {
    for (const [k, v] of m) m.set(k, Math.min(v, max));
  }

  soften(genres);
  soften(tags);
  soften(negativeGenres);
  soften(negativeTags);
  soften(unseenGenres);
  soften(unseenTags);

  /* ----------------------------------
   * Reclassify weak positive genres
   * ---------------------------------- */
  const POSITIVE_GENRE_MIN = 3.5;
  const WEAK_GENRE_NEGATIVE_FACTOR = 0.6;

  for (const [name, value] of genres) {
    if (value < POSITIVE_GENRE_MIN) {
      genres.delete(name);

      const existingNeg = negativeGenres.get(name) ?? 0;
      negativeGenres.set(
        name,
        Math.max(existingNeg, value * WEAK_GENRE_NEGATIVE_FACTOR)
      );
    }
  }

  /* ----------------------------------
   * Debug Logs (NAMES ONLY)
   * ---------------------------------- */
  if (debug?.log) {
    console.log(`\n[TasteProfile+Net+Scarcity+Unseen] user=${debug.user}`);

    console.log(
      "Top Positive Genres",
      mapToSortedArray(genres, debug.topN ?? 15)
    );
    console.log(
      "Top Negative Genres",
      mapToSortedArray(negativeGenres, debug.topN ?? 15)
    );
    console.log(
      "Top Unseen Genres",
      mapToSortedArray(unseenGenres, debug.topN ?? 15)
    );

    console.log(
      "Top Positive Tags",
      mapToSortedArray(
        new Map([...tags].map(([id, v]) => [tagNames.get(id) ?? `#${id}`, v])),
        debug.topN ?? 15
      )
    );

    console.log(
      "Top Negative Tags",
      mapToSortedArray(
        new Map(
          [...negativeTags].map(([id, v]) => [tagNames.get(id) ?? `#${id}`, v])
        ),
        debug.topN ?? 15
      )
    );

    console.log(
      "Top Unseen Tags",
      mapToSortedArray(
        new Map(
          [...unseenTags].map(([id, v]) => [tagNames.get(id) ?? `#${id}`, v])
        ),
        debug.topN ?? 15
      )
    );
  }

  /* ----------------------------------
   * Return
   * ---------------------------------- */
  return {
    genres,
    tags,
    negativeGenres,
    negativeTags,
    unseenGenres,
    unseenTags,
  };
}
