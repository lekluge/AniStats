export const GENRE_WEIGHT = 1.5;
export const TAG_WEIGHT = 1.0;
export const NORMALIZATION_MODE: "sqrt" | "linear" = "sqrt";
export const MATCH_PENALTY_CURVE: Record<number, number> = {
  1: 0.15,
  2: 0.45,
  3: 0.8,
};
export const MIN_MATCH_COUNT = 3;
export const MULTI_GENRE_BONUS = 1.2;
export const MAX_SINGLE_TAG_CONTRIBUTION: number | null = 300;
export const USE_AVERAGE_SCORE = true;
export const MIN_AVERAGE_SCORE: number | null = 60;
export const AVG_SCORE_BASELINE = 75;
export const AVG_SCORE_MIN_MULTIPLIER = 0.7;
export const AVG_SCORE_MAX_MULTIPLIER = 1.3;