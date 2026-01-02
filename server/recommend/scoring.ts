import {
  GENRE_WEIGHT,
  TAG_WEIGHT,
  NORMALIZATION_MODE,
  MATCH_PENALTY_CURVE,
  MIN_MATCH_COUNT,
  MULTI_GENRE_BONUS,
  MAX_SINGLE_TAG_CONTRIBUTION,
  USE_AVERAGE_SCORE,
  MIN_AVERAGE_SCORE,
  AVG_SCORE_BASELINE,
  AVG_SCORE_MIN_MULTIPLIER,
  AVG_SCORE_MAX_MULTIPLIER,
} from "./config";

export function scoreAnime(anime: any, taste: any) {
  let rawScore = 0;

  const matchedGenres: string[] = [];
  const matchedTags: string[] = [];

  /* ----------------------------------
   * 🚫 HARD BLOCK: UNSEEN GENRE
   * ---------------------------------- */
  let hasUnseenGenre = false;

  for (const g of anime.genres) {
    if (taste.unseenGenres?.has(g.name)) {
      hasUnseenGenre = true;
      break;
    }
  }

  /* ----------------------------------
   * GENRES
   * ---------------------------------- */
  for (const g of anime.genres) {
    const name = g.name;

    const w = taste.genres?.get(name);
    if (w) {
      rawScore += w * GENRE_WEIGHT;
      matchedGenres.push(name);
    }
  }

  // 🚫 Wenn Genre unseen UND kein positives Genre → sofort raus
  if (hasUnseenGenre && matchedGenres.length === 0) {
    return { score: 0, matchedGenres, matchedTags };
  }

  /* ----------------------------------
   * TAGS
   * ---------------------------------- */
  for (const t of anime.tags) {
    const id = t.tagId;

    let w = taste.tags?.get(id);
    if (!w) continue;

    if (MAX_SINGLE_TAG_CONTRIBUTION !== null) {
      w = Math.min(w, MAX_SINGLE_TAG_CONTRIBUTION);
    }

    rawScore += w * TAG_WEIGHT;
    matchedTags.push(t.name);
  }

  const matchCount = matchedGenres.length + matchedTags.length;

  if (!matchCount) return { score: 0, matchedGenres, matchedTags };
  if (matchCount < MIN_MATCH_COUNT)
    return { score: 0, matchedGenres, matchedTags };

  /* ----------------------------------
   * Normalisierung
   * ---------------------------------- */
  let score =
    NORMALIZATION_MODE === "sqrt"
      ? rawScore / Math.sqrt(matchCount)
      : rawScore / matchCount;

  score *= MATCH_PENALTY_CURVE[matchCount] ?? 1;

  const hasGenre = matchedGenres.length > 0;
  const hasTag = matchedTags.length > 0;

  if (matchedTags.length === 1 && matchedGenres.length === 0) {
    score *= 0.2;
  }

  if (!(hasGenre && hasTag)) {
    score *= 0.3;
  }

  const breadthBonus = Math.log2(1 + matchCount);
  score *= breadthBonus;

  if (matchedGenres.length >= 2) {
    score *= MULTI_GENRE_BONUS;
  }

  /* ----------------------------------
   * Qualitätsgewichtung
   * ---------------------------------- */
  if (USE_AVERAGE_SCORE && typeof anime.averageScore === "number") {
    if (MIN_AVERAGE_SCORE !== null && anime.averageScore < MIN_AVERAGE_SCORE) {
      return { score: 0, matchedGenres, matchedTags };
    }

    const q = anime.averageScore / AVG_SCORE_BASELINE;
    score *= Math.min(
      AVG_SCORE_MAX_MULTIPLIER,
      Math.max(AVG_SCORE_MIN_MULTIPLIER, q)
    );
  }

  return {
    score,
    matchedGenres,
    matchedTags,
  };
}
