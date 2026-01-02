import { GlobalStats } from "./types/GlobalStats";
import { TasteProfile } from "./types/TasteProfile";
import { idf } from "./globalStats";
import { mapToSortedArray } from "./utils";
import {
  GENRE_THRESHOLD,
  TAG_THRESHOLD,
  NEG_SCARCITY_ALPHA_GENRE,
  NEG_SCARCITY_ALPHA_TAG,
  UNSEEN_GENRE_PENALTY,
  UNSEEN_TAG_PENALTY,
  MIN_GLOBAL_TAG_COUNT,
  POSITIVE_GENRE_MIN,
  WEAK_GENRE_NEGATIVE_FACTOR,
  CORE_GENRE_EXPOSURE_BOOST,
} from "./tasteConfig";

export function buildTasteProfile(
  completedIds: number[],
  scoreById: Map<number, number | null>,
  animeById: Map<number, any>,
  global: GlobalStats,
  debug?: { user?: string; topN?: number; log?: boolean }
): TasteProfile {
  const genreScore = new Map<string, number>();
  const tagScore = new Map<number, number>();

  const genreExposure = new Map<string, number>();
  const tagExposure = new Map<number, number>();

  const tagNames = new Map<number, string>();

  // globale Tag-Namen
  for (const a of animeById.values()) {
    for (const t of a.tags) {
      if (!tagNames.has(t.tagId)) tagNames.set(t.tagId, t.name);
    }
  }

  /* ----------------------------------
   * Build net taste
   * ---------------------------------- */
  for (const id of completedIds) {
    const a = animeById.get(id);
    if (!a) continue;

    const score = scoreById.get(id) ?? 5;
    if (score === 5) continue;

    const signedWeight = (score - 5) / 5;

    for (const g of a.genres) {
      const name = g.name;
      genreExposure.set(name, (genreExposure.get(name) ?? 0) + 1);

      const w =
        signedWeight * idf(global.genreCount.get(name) ?? 1, global.totalAnime);

      genreScore.set(name, (genreScore.get(name) ?? 0) + w);
    }

    for (const t of a.tags) {
      const id = t.tagId;
      tagExposure.set(id, (tagExposure.get(id) ?? 0) + 1);

      const w =
        signedWeight * idf(global.tagCount.get(id) ?? 1, global.totalAnime);

      tagScore.set(id, (tagScore.get(id) ?? 0) + w);
    }
  }

  /* ----------------------------------
   * Buckets
   * ---------------------------------- */
  const genres = new Map<string, number>();
  const negativeGenres = new Map<string, number>();
  const tags = new Map<number, number>();
  const negativeTags = new Map<number, number>();
  const unseenGenres = new Map<string, number>();
  const unseenTags = new Map<number, number>();

  const TOTAL = Math.max(1, completedIds.length);
  const CORE_GENRE_MIN_SHARE = 0.25;

  function scarcityBoost(exposure: number, alpha: number) {
    return 1 + alpha / Math.sqrt(Math.max(1, exposure));
  }

  /* ----------------------------------
   * Genres
   * ---------------------------------- */
  for (const [name, v] of genreScore) {
    const exposure = genreExposure.get(name) ?? 0;
    const share = exposure / TOTAL;
    const isCoreGenre = share >= CORE_GENRE_MIN_SHARE;

    if (v > GENRE_THRESHOLD) {
      const boostedValue = isCoreGenre ? v * CORE_GENRE_EXPOSURE_BOOST : v;

      genres.set(name, boostedValue);
    } else if (v < -GENRE_THRESHOLD && !isCoreGenre) {
      negativeGenres.set(
        name,
        Math.abs(v) * scarcityBoost(exposure, NEG_SCARCITY_ALPHA_GENRE)
      );
    }
  }

  /* ----------------------------------
   * Tags
   * ---------------------------------- */
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
   * Unseen
   * ---------------------------------- */
  for (const [name] of global.genreCount) {
    if (!genreExposure.has(name) && !genres.has(name)) {
      unseenGenres.set(name, UNSEEN_GENRE_PENALTY);
    }
  }

  for (const [id, count] of global.tagCount) {
    if (count < MIN_GLOBAL_TAG_COUNT) continue;
    if (!tagExposure.has(id) && !tags.has(id)) {
      unseenTags.set(id, UNSEEN_TAG_PENALTY);
    }
  }

  /* ----------------------------------
   * Soften
   * ---------------------------------- */
  function soften<K>(m: Map<K, number>) {
    for (const [k, v] of m) m.set(k, Math.log1p(v));
  }

  soften(genres);
  soften(tags);
  soften(negativeGenres);
  soften(negativeTags);
  soften(unseenGenres);
  soften(unseenTags);

  /* ----------------------------------
   * Reclassify weak positives (nur wenn KEIN Core)
   * ---------------------------------- */
  for (const [name, value] of genres) {
    const share = (genreExposure.get(name) ?? 0) / TOTAL;
    const isCore = share >= CORE_GENRE_MIN_SHARE;

    if (value < POSITIVE_GENRE_MIN && !isCore) {
      genres.delete(name);
      negativeGenres.set(
        name,
        Math.max(
          negativeGenres.get(name) ?? 0,
          value * WEAK_GENRE_NEGATIVE_FACTOR
        )
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
