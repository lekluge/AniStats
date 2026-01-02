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

  // Genre-Matches addieren
  for (const g of anime.genres) {
    const w = taste.genres.get(g.name);
    if (w) {
      rawScore += w * GENRE_WEIGHT;
      matchedGenres.push(g.name);
    }
  }

  // Tag-Matches addieren (mit Cap)
  for (const t of anime.tags) {
    let w = taste.tags.get(t.tagId);
    if (!w) continue;

    if (MAX_SINGLE_TAG_CONTRIBUTION !== null) {
      w = Math.min(w, MAX_SINGLE_TAG_CONTRIBUTION);
    }

    rawScore += w * TAG_WEIGHT;
    matchedTags.push(t.name);
  }

  const matchCount = matchedGenres.length + matchedTags.length;

  // Keine oder zu wenige Matches → direkt raus
  if (!matchCount) return { score: 0, matchedGenres, matchedTags };
  if (matchCount < MIN_MATCH_COUNT)
    return { score: 0, matchedGenres, matchedTags };

  // Normalisierung gegen Anzahl der Treffer
  let score =
    NORMALIZATION_MODE === "sqrt"
      ? rawScore / Math.sqrt(matchCount)
      : rawScore / matchCount;

  // Progressive Strafe für geringe Match-Breite
  score *= MATCH_PENALTY_CURVE[matchCount] ?? 1;
  // 🔻 Negativ-Taste anwenden
  for (const g of matchedGenres) {
    const neg = taste.negativeGenres?.get(g);
if (neg) score -= neg * 0.15;
  }

  for (const t of anime.tags) {
    if (!taste.tags?.has(t.tagId)) continue; // 🔥 WICHTIG
    const neg = taste.negativeTags?.get(t.tagId);
   if (neg) score -= neg * 0.08;
  }

  const hasGenre = matchedGenres.length > 0;
  const hasTag = matchedTags.length > 0;

  // Reiner Einzel-Tag ohne Genre → extrem abwerten
  if (matchedTags.length === 1 && matchedGenres.length === 0) {
    score *= 0.2;
  }

  // Fehlt entweder Genre oder Tag → starke Abwertung
  if (!(hasGenre && hasTag)) {
    score *= 0.3;
  }

  // Bonus für Breite (mehr unabhängige Treffer)
  const breadthBonus = Math.log2(1 + matchedGenres.length + matchedTags.length);
  score *= breadthBonus;

  // Extra-Bonus für mehrere Genres
  if (matchedGenres.length >= 2) score *= MULTI_GENRE_BONUS;

  // Qualitätsgewichtung über AverageScore
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

  return { score, matchedGenres, matchedTags };
}