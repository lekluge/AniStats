import { defineEventHandler, getQuery, createError, setHeader } from "h3";
import { prisma } from "../../utils/prisma";
import crypto from "crypto";

import { EXCLUDED_STATUSES } from "../recommend/config";
import { loadUserAnilistEntries } from "../recommend/anilist";
import { loadGlobalStats } from "../recommend/globalStats";
import { buildTasteProfile } from "../recommend/tasteProfile";
import { scoreAnime } from "../recommend/scoring";
import { buildChainMap, isFirstUnseenInChain } from "../recommend/chain";
import {
  parseNumber,
  parseList,
  hasStartDate,
  isReleased,
} from "../recommend/filters";

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
    (await storage.getItem<any[]>(animeKey)) ??
    (await prisma.anime.findMany({
      where: { format: { in: ["TV", "MOVIE"] } },
      include: { genres: true, tags: true },
    }));

  await storage.setItem(animeKey, anime, { ttl: 60 * 60 * 8 });

  const relations =
    (await storage.getItem<any[]>(relKey)) ??
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

  const recs: any[] = [];

  for (const a of anime) {
    if (excludedIds.has(a.id)) continue;

    // ❌ kein Startdatum → nie empfehlen
    if (!hasStartDate(a)) continue;

    // ❌ Upcoming nur wenn explizit erlaubt
    if (!includeUpcoming && !isReleased(a)) continue;

    // 🔹 Season-Filter
    if (filterSeason && a.season !== filterSeason) continue;

    // 🔹 Year-Filter
    if (seasonYearMin !== null && (a.startYear ?? 0) < seasonYearMin) continue;
    if (seasonYearMax !== null && (a.startYear ?? 9999) > seasonYearMax)
      continue;

    // 🔹 Episoden
    if (episodesMin !== null && (a.episodes ?? 0) < episodesMin) continue;
    if (episodesMax !== null && (a.episodes ?? Infinity) > episodesMax)
      continue;

    // 🔹 Average Score
    if (avgScoreMin !== null && (a.averageScore ?? 0) < avgScoreMin) continue;
    if (avgScoreMax !== null && (a.averageScore ?? Infinity) > avgScoreMax)
      continue;

    // 🔹 Chain-Logik
    if (!isFirstUnseenInChain(a.id, chainMap, excludedIds)) continue;

    // 🚫 HARD BLOCK: uninteressantes (unseen) Genre
    if (a.genres.some((g) => taste.unseenGenres?.has(g.name))) {
      continue;
    }

    const { score, matchedGenres, matchedTags } = scoreAnime(a, taste);
    if (score <= 0 || matchedTags.length === 0) continue;

    // 🔹 Genre Include / Exclude
    if (includeGenres && !matchedGenres.some((g) => includeGenres.includes(g)))
      continue;

    if (excludeGenres && matchedGenres.some((g) => excludeGenres.includes(g)))
      continue;

    // 🔹 Tag Include / Exclude
    if (includeTags && !matchedTags.some((t) => includeTags.includes(t)))
      continue;

    if (excludeTags && matchedTags.some((t) => excludeTags.includes(t)))
      continue;

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
