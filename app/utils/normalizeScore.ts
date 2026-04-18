/**
 * AniList scoring systems and score normalization to a 0–100 scale.
 *
 * AniList supports multiple score formats per user. When comparing scores
 * across users, the raw values must be converted to a common scale first,
 * otherwise a POINT_5 score of 5 looks identical to a POINT_10 score of 5
 * even though they represent completely different opinions (max vs mid).
 */

export type ScoreFormat =
  | "POINT_100"
  | "POINT_10_DECIMAL"
  | "POINT_10"
  | "POINT_5"
  | "POINT_3"
  | "SMILEY";

/**
 * Convert a raw AniList score to a 0–100 normalised value.
 *
 * A score of 0 always means "not rated" and is returned as-is so that
 * callers can keep treating 0 as "no score".
 */
export function normalizeScoreTo100(
  score: number,
  format: ScoreFormat | string | null | undefined,
): number {
  if (score === 0) return 0;

  switch (format) {
    case "POINT_100":
      // Already on a 0–100 scale
      return score;

    case "POINT_10_DECIMAL":
      // 0–10 with one decimal place → multiply by 10
      return score * 10;

    case "POINT_10":
      // 0–10 integer → multiply by 10
      return score * 10;

    case "POINT_5":
      // 1–5 → map to 20/40/60/80/100
      return (score / 5) * 100;

    case "POINT_3":
      // 1–3 (sad/neutral/happy) → map to ~33/67/100
      return (score / 3) * 100;

    case "SMILEY":
      // AniList encodes smiley as 1 (sad), 2 (neutral), 3 (happy) internally
      return (score / 3) * 100;

    default:
      // Unknown format: assume POINT_10 (AniList default) for safety
      return score * 10;
  }
}
