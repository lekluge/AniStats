import { defineEventHandler, getQuery, createError, setHeader } from "h3";
import { prisma } from "../../../utils/prisma";
import crypto from "crypto";

import { EXCLUDED_STATUSES } from "../../recommend/config";
import { loadUserAnilistEntries } from "../../recommend/anilist";
import { loadGlobalStats } from "../../recommend/globalStats";
import { buildTasteProfile } from "../../recommend/tasteProfile";
import { scoreAnime } from "../../recommend/scoring";
import { buildChainMap, isFirstUnseenInChain } from "../../recommend/chain";
import {
  parseNumber,
  parseList,
  hasStartDate,
  isReleased,
} from "../../recommend/filters";
import type {
  AnimeWithGenresTags,
  AnimeWithRelations,
  RecommendationItem,
} from "../../types/api/private";
import type { GlobalStats } from "../../recommend/types/GlobalStats";

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function computeColdStartScore(
  anime: AnimeWithGenresTags,
  globalStats: GlobalStats
): number {
  const total = Math.max(1, globalStats.totalAnime);

  const genreSignals = anime.genres.map(
    (g) => (globalStats.genreCount.get(g.name) ?? 0) / total
  );
  const tagSignals = anime.tags
    .map((t) =>
      typeof t.tagId === "number"
        ? (globalStats.tagCount.get(t.tagId) ?? 0) / total
        : 0
    )
    .filter((v) => v > 0);

  const genreStrength =
    genreSignals.length > 0
      ? genreSignals.reduce((sum, v) => sum + v, 0) / genreSignals.length
      : 0;
  const tagStrength =
    tagSignals.length > 0
      ? tagSignals.reduce((sum, v) => sum + v, 0) / tagSignals.length
      : 0;

  const quality =
    typeof anime.averageScore === "number" ? clamp01(anime.averageScore / 100) : 0;
  const combinationBreadth = clamp01((anime.genres.length * anime.tags.length) / 25);
  const richness = clamp01((anime.genres.length + anime.tags.length) / 15);
  const diversity = Math.max(combinationBreadth, richness);

  return quality * 0.45 + genreStrength * 0.3 + tagStrength * 0.15 + diversity * 0.1;
}

/* ----------------------------------
 * Handler
 * ---------------------------------- */
export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "public, max-age=60");

  const q = getQuery(event);
  const user = q.user;
  const includeUpcoming =
    q.includeUpcoming === "true" || q.includeUpcoming === "1";

  if (!user || typeof user !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Missing user" });
  }

  const filterSeason =
    typeof q.season === "string" ? q.season.toUpperCase() : null;

  const seasonYearMin = parseNumber(q.seasonYearMin);
  const seasonYearMax = parseNumber(q.seasonYearMax);

  const episodesMin = parseNumber(q.episodesMin);
  const episodesMax = parseNumber(q.episodesMax);

  const avgScoreMin = parseNumber(q.averageScoreMin);
  const avgScoreMax = parseNumber(q.averageScoreMax);

  const includeGenres = parseList(q.genres);
  const excludeGenres = parseList(q.excludeGenres);

  const includeTags = parseList(q.tags);
  const excludeTags = parseList(q.excludeTags);

  /* 1) User list */
  const userEntries = await loadUserAnilistEntries(user);

  const excludedIds = new Set<number>();
  const completedIds: number[] = [];
  const scoreById = new Map<number, number | null>();

  for (const e of userEntries) {
    scoreById.set(e.mediaId, e.score);
    if (EXCLUDED_STATUSES.has(e.status)) excludedIds.add(e.mediaId);
    if (e.status === "COMPLETED") completedIds.push(e.mediaId);
  }

  const storage = useStorage("cache");
  const animeKey =
    "anime-db" + crypto.createHash("sha1").update("anime-db").digest("hex");
  const relKey =
    "anime-relation:" +
    crypto.createHash("sha1").update("anime-relation").digest("hex");

  const anime =
    (await storage.getItem<AnimeWithGenresTags[]>(animeKey)) ??
    (await prisma.anime.findMany({
      where: { format: { in: ["TV", "MOVIE"] } },
      include: { genres: true, tags: true },
    }));

  await storage.setItem(animeKey, anime, { ttl: 60 * 60 * 8 });

  const relations =
    (await storage.getItem<AnimeWithRelations[]>(relKey)) ??
    (await prisma.anime.findMany({
      include: { relationsFrom: true, relationsTo: true },
    }));

  await storage.setItem(relKey, relations, { ttl: 60 * 60 * 48 });

  const chainMap = buildChainMap(relations);

  const animeById = new Map(anime.map((a) => [a.id, a]));
  const globalStats = await loadGlobalStats(anime);

  const taste = buildTasteProfile(
    completedIds,
    scoreById,
    animeById,
    globalStats,
    { user, topN: 30, log: true }
  );
  const hasTasteSignal = taste.genres.size > 0 || taste.tags.size > 0;

  const recs: RecommendationItem[] = [];

  for (const a of anime) {
    if (excludedIds.has(a.id)) continue;

    // no start date -> never recommend
    if (!hasStartDate(a)) continue;

    // upcoming only if explicitly enabled
    if (!includeUpcoming && !isReleased(a)) continue;

    // season filter
    if (filterSeason && a.season !== filterSeason) continue;

    // year filter
    if (seasonYearMin !== null && (a.startYear ?? 0) < seasonYearMin) continue;
    if (seasonYearMax !== null && (a.startYear ?? 9999) > seasonYearMax)
      continue;

    // episode filter
    if (episodesMin !== null && (a.episodes ?? 0) < episodesMin) continue;
    if (episodesMax !== null && (a.episodes ?? Infinity) > episodesMax)
      continue;

    // average score filter
    if (avgScoreMin !== null && (a.averageScore ?? 0) < avgScoreMin) continue;
    if (avgScoreMax !== null && (a.averageScore ?? Infinity) > avgScoreMax)
      continue;

    // chain logic
    if (!isFirstUnseenInChain(a.id, chainMap, excludedIds)) continue;

    // genre include
    if (
      includeGenres &&
      !includeGenres.every((g) => a.genres.some((ag) => ag.name === g))
    ) {
      continue;
    }

    // genre exclude
    if (
      excludeGenres &&
      excludeGenres.some((g) => a.genres.some((ag) => ag.name === g))
    ) {
      continue;
    }

    // tag include
    if (
      includeTags &&
      !includeTags.every((t) => a.tags.some((at) => at.name === t))
    ) {
      continue;
    }

    // tag exclude
    if (
      excludeTags &&
      excludeTags.some((t) => a.tags.some((at) => at.name === t))
    ) {
      continue;
    }

    let score = 0;
    let matchedGenres: string[] = [];
    let matchedTags: string[] = [];

    if (hasTasteSignal) {
      // hard block: unseen genre for users with rating-based taste profile
      if (a.genres.some((g) => taste.unseenGenres.has(g.name))) {
        continue;
      }

      const scored = scoreAnime(a, taste);
      score = scored.score;
      matchedGenres = scored.matchedGenres;
      matchedTags = scored.matchedTags;

      if (score <= 0 || matchedTags.length === 0) continue;
    } else {
      // cold start fallback: rank by genre/tag combination strength + quality.
      if (a.genres.length === 0 && a.tags.length === 0) continue;
      score = computeColdStartScore(a, globalStats);
      if (score <= 0) continue;
    }

    recs.push({
      id: a.id,
      titleEn: a.titleEn,
      titleRo: a.titleRo,
      cover: a.cover,
      format: a.format,
      score: Number(score.toFixed(3)),
      averageScore: a.averageScore,
      season: a.season,
      seasonYear: a.startYear,
      episodes: a.episodes,
      genres: a.genres.map((g) => g.name),
      tags: a.tags.map((t) => t.name),
      matchedGenres,
      matchedTags,
    });
  }

  recs.sort((a, b) => b.score - a.score);

  return {
    user,
    total: recs.length,
    items: {
      TV: recs.filter((r) => r.format === "TV").slice(0, 100),
      MOVIE: recs.filter((r) => r.format === "MOVIE").slice(0, 100),
    },
  };
});
