import { defineEventHandler, getQuery, createError, setHeader } from "h3";
import { prisma } from "../../../utils/prisma";

import { EXCLUDED_STATUSES } from "../../recommend/config";
import { loadUserAnilistEntries } from "../../recommend/anilist";
import { loadGlobalStats } from "../../recommend/globalStats";
import { buildTasteProfile } from "../../recommend/tasteProfile";
import { scoreAnime } from "../../recommend/scoring";
import { buildChainMapFromEdges, isFirstUnseenInChain } from "../../recommend/chain";
import {
  parseNumber,
  parseList,
  hasStartDate,
  isReleased,
} from "../../recommend/filters";
import type { RecommendationItem } from "../../types/api/private";
import type { GlobalStats } from "../../recommend/types/GlobalStats";
import type { ChainRelationEdge } from "../../recommend/chain";

interface BaseAnime {
  id: number;
  titleEn: string | null;
  titleRo: string | null;
  cover: string | null;
  format: string | null;
  averageScore: number | null;
  season: string | null;
  startYear: number | null;
  startMonth: number | null;
  startDay: number | null;
  episodes: number | null;
}

interface AnimeWithMeta extends BaseAnime {
  genres: Array<{ name: string }>;
  tags: Array<{ tagId: number; name: string; rank: number | null; isAdult: boolean }>;
}

const ANIME_BASE_CACHE_KEY = "anime-base/v3";
const ANIME_META_CACHE_KEY = "anime-meta-all/v1";
const REL_CACHE_KEY = "anime-relation/v2";
const CHAIN_CACHE_TTL_MS = 1000 * 60 * 30;

let cachedChainMap: ReturnType<typeof buildChainMapFromEdges> | null = null;
let chainCachedAt = 0;

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function computeColdStartScore(
  anime: AnimeWithMeta,
  globalStats: GlobalStats
): number {
  const total = Math.max(1, globalStats.totalAnime);

  const genreSignals = anime.genres.map(
    (g) => (globalStats.genreCount.get(g.name) ?? 0) / total
  );
  const tagSignals = anime.tags
    .map((t) => (globalStats.tagCount.get(t.tagId) ?? 0) / total)
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

async function loadAnimeBaseDataset(): Promise<BaseAnime[]> {
  return prisma.anime.findMany({
    where: { format: { in: ["TV", "MOVIE"] } },
    select: {
      id: true,
      titleEn: true,
      titleRo: true,
      cover: true,
      format: true,
      averageScore: true,
      season: true,
      startYear: true,
      startMonth: true,
      startDay: true,
      episodes: true,
    },
  });
}

async function loadRelationEdges(): Promise<ChainRelationEdge[]> {
  return prisma.animeRelation.findMany({
    where: {
      relationType: {
        in: ["PREQUEL", "PARENT", "SEQUEL"],
      },
    },
    select: {
      fromId: true,
      toId: true,
      relationType: true,
    },
  });
}

async function loadAllMetadata() {
  const [genres, tags] = await Promise.all([
    prisma.animeGenre.findMany({
      select: { animeId: true, name: true },
    }),
    prisma.animeTag.findMany({
      select: { animeId: true, tagId: true, name: true, rank: true, isAdult: true },
    }),
  ]);
  return { genres, tags };
}

export default defineEventHandler(async (event) => {
  const totalStart = Date.now();
  const timings: Record<string, number> = {};
  const markStart = (name: string) => {
    const start = Date.now();
    return () => {
      timings[name] = (timings[name] ?? 0) + (Date.now() - start);
    };
  };

  setHeader(event, "Cache-Control", "public, max-age=60");

  const q = getQuery(event);
  const user = q.user;
  const includeUpcoming =
    q.includeUpcoming === "true" || q.includeUpcoming === "1";
  const debugTasteLog =
    q.debugTaste === "true" || q.debugTaste === "1" || q.debug === "taste";

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

  const includeGenres = parseList(q.genres) ?? [];
  const excludeGenres = parseList(q.excludeGenres) ?? [];
  const includeTags = parseList(q.tags) ?? [];
  const excludeTags = parseList(q.excludeTags) ?? [];

  const includeGenresLen = includeGenres.length;
  const excludeGenresLen = excludeGenres.length;
  const includeTagsLen = includeTags.length;
  const excludeTagsLen = excludeTags.length;

  const storage = useStorage("cache");

  const userPromise = (async () => {
    const done = markStart("user");
    try {
      return await loadUserAnilistEntries(user);
    } finally {
      done();
    }
  })();

  const animeBasePromise = (async () => {
    const doneCache = markStart("animeCache");
    try {
      let animeBase = await storage.getItem<BaseAnime[]>(ANIME_BASE_CACHE_KEY);
      if (!animeBase) {
        const doneDb = markStart("animeDb");
        try {
          animeBase = await loadAnimeBaseDataset();
        } finally {
          doneDb();
        }
        await storage.setItem(ANIME_BASE_CACHE_KEY, animeBase, { ttl: 60 * 60 * 8 });
      }
      return animeBase;
    } finally {
      doneCache();
    }
  })();

  const relationPromise = (async () => {
    const doneCache = markStart("relationsCache");
    try {
      let relationEdges = await storage.getItem<ChainRelationEdge[]>(REL_CACHE_KEY);
      if (!relationEdges) {
        const doneDb = markStart("relationsDb");
        try {
          relationEdges = await loadRelationEdges();
        } finally {
          doneDb();
        }
        await storage.setItem(REL_CACHE_KEY, relationEdges, { ttl: 60 * 60 * 48 });
      }
      return relationEdges;
    } finally {
      doneCache();
    }
  })();

  const metadataPromise = (async () => {
    const doneCache = markStart("animeMetaCache");
    try {
      let meta = await storage.getItem<{
        genres: Array<{ animeId: number; name: string }>;
        tags: Array<{
          animeId: number;
          tagId: number;
          name: string;
          rank: number | null;
          isAdult: boolean;
        }>;
      }>(ANIME_META_CACHE_KEY);
      if (!meta) {
        const doneDb = markStart("animeMetaDb");
        try {
          meta = await loadAllMetadata();
        } finally {
          doneDb();
        }
        await storage.setItem(ANIME_META_CACHE_KEY, meta, { ttl: 60 * 60 * 8 });
      }
      return meta;
    } finally {
      doneCache();
    }
  })();

  const [userEntries, animeBase, relationEdges, metadata] = await Promise.all([
    userPromise,
    animeBasePromise,
    relationPromise,
    metadataPromise,
  ]);

  const excludedIds = new Set<number>();
  const completedIds: number[] = [];
  const scoreById = new Map<number, number | null>();

  for (const entry of userEntries) {
    scoreById.set(entry.mediaId, entry.score);
    if (EXCLUDED_STATUSES.has(entry.status)) excludedIds.add(entry.mediaId);
    if (entry.status === "COMPLETED") completedIds.push(entry.mediaId);
  }

  const animeBaseById = new Map<number, BaseAnime>(animeBase.map((a) => [a.id, a]));

  const doneDerived = markStart("derived");
  const now = Date.now();
  if (!cachedChainMap || now - chainCachedAt > CHAIN_CACHE_TTL_MS) {
    cachedChainMap = buildChainMapFromEdges(relationEdges, animeBase.map((a) => a.id));
    chainCachedAt = now;
  }
  doneDerived();
  const chainMap = cachedChainMap!;

  const preCandidateIds: number[] = [];
  for (const base of animeBase) {
    if (excludedIds.has(base.id)) continue;
    if (!hasStartDate(base)) continue;
    if (!includeUpcoming && !isReleased(base)) continue;
    if (filterSeason && base.season !== filterSeason) continue;
    if (seasonYearMin !== null && (base.startYear ?? 0) < seasonYearMin) continue;
    if (seasonYearMax !== null && (base.startYear ?? 9999) > seasonYearMax) continue;
    if (episodesMin !== null && (base.episodes ?? 0) < episodesMin) continue;
    if (episodesMax !== null && (base.episodes ?? Infinity) > episodesMax) continue;
    if (avgScoreMin !== null && (base.averageScore ?? 0) < avgScoreMin) continue;
    if (avgScoreMax !== null && (base.averageScore ?? Infinity) > avgScoreMax) continue;
    if (!isFirstUnseenInChain(base.id, chainMap, excludedIds)) continue;
    preCandidateIds.push(base.id);
  }

  if (preCandidateIds.length === 0) {
    return {
      user,
      total: 0,
      items: { TV: [], MOVIE: [] },
    };
  }

  const metadataIds = new Set<number>(preCandidateIds);
  for (const completedId of completedIds) {
    if (animeBaseById.has(completedId)) metadataIds.add(completedId);
  }
  const metadataIdList = [...metadataIds];

  const metadataIdSet = new Set(metadataIdList);
  const genresByAnimeId = new Map<number, Array<{ name: string }>>();
  const tagsByAnimeId = new Map<
    number,
    Array<{ tagId: number; name: string; rank: number | null; isAdult: boolean }>
  >();

  for (const genre of metadata.genres) {
    if (!metadataIdSet.has(genre.animeId)) continue;
    const list = genresByAnimeId.get(genre.animeId);
    if (list) list.push({ name: genre.name });
    else genresByAnimeId.set(genre.animeId, [{ name: genre.name }]);
  }

  for (const tag of metadata.tags) {
    if (!metadataIdSet.has(tag.animeId)) continue;
    const compact = {
      tagId: tag.tagId,
      name: tag.name,
      rank: tag.rank,
      isAdult: tag.isAdult,
    };
    const list = tagsByAnimeId.get(tag.animeId);
    if (list) list.push(compact);
    else tagsByAnimeId.set(tag.animeId, [compact]);
  }

  const animeWithMetaById = new Map<number, AnimeWithMeta>();
  for (const id of metadataIdList) {
    const base = animeBaseById.get(id);
    if (!base) continue;
    animeWithMetaById.set(id, {
      ...base,
      genres: genresByAnimeId.get(id) ?? [],
      tags: tagsByAnimeId.get(id) ?? [],
    });
  }

  const candidateAnime = preCandidateIds
    .map((id) => animeWithMetaById.get(id))
    .filter((value): value is AnimeWithMeta => Boolean(value));

  const doneStats = markStart("stats");
  const globalStats = await loadGlobalStats(candidateAnime);
  doneStats();

  const taste = buildTasteProfile(
    completedIds,
    scoreById,
    animeWithMetaById,
    globalStats,
    { user, topN: 30, log: debugTasteLog }
  );
  const hasTasteSignal = taste.genres.size > 0 || taste.tags.size > 0;

  const tvItems: RecommendationItem[] = [];
  const movieItems: RecommendationItem[] = [];
  const doneScoring = markStart("scoring");

  for (const anime of candidateAnime) {
    if (includeGenresLen || excludeGenresLen || includeTagsLen || excludeTagsLen) {
      const genreNames = new Set<string>(anime.genres.map((g) => g.name));
      const tagNames = new Set<string>(anime.tags.map((t) => t.name));

      if (includeGenresLen && !includeGenres.every((g) => genreNames.has(g))) continue;
      if (excludeGenresLen && excludeGenres.some((g) => genreNames.has(g))) continue;
      if (includeTagsLen && !includeTags.every((t) => tagNames.has(t))) continue;
      if (excludeTagsLen && excludeTags.some((t) => tagNames.has(t))) continue;
    }

    let score = 0;
    let matchedGenres: string[] = [];
    let matchedTags: string[] = [];

    if (hasTasteSignal) {
      if (anime.genres.some((g) => taste.unseenGenres.has(g.name))) continue;
      const scored = scoreAnime(anime, taste);
      score = scored.score;
      matchedGenres = scored.matchedGenres;
      matchedTags = scored.matchedTags;
      if (score <= 0 || matchedTags.length === 0) continue;
    } else {
      if (anime.genres.length === 0 && anime.tags.length === 0) continue;
      score = computeColdStartScore(anime, globalStats);
      if (score <= 0) continue;
    }

    const item: RecommendationItem = {
      id: anime.id,
      titleEn: anime.titleEn,
      titleRo: anime.titleRo,
      cover: anime.cover,
      format: anime.format,
      score: Number(score.toFixed(3)),
      averageScore: anime.averageScore,
      season: anime.season,
      seasonYear: anime.startYear,
      episodes: anime.episodes,
      genres: anime.genres.map((g) => g.name),
      tags: anime.tags.map((t) => t.name),
      matchedGenres,
      matchedTags,
    };

    if (item.format === "TV") tvItems.push(item);
    else movieItems.push(item);
  }
  doneScoring();

  tvItems.sort((a, b) => b.score - a.score);
  movieItems.sort((a, b) => b.score - a.score);

  timings.total = Date.now() - totalStart;
  const serverTiming = [
    "user",
    "animeCache",
    "animeDb",
    "relationsCache",
    "relationsDb",
    "derived",
    "animeMetaCache",
    "animeMetaDb",
    "stats",
    "scoring",
    "total",
  ]
    .filter((name) => typeof timings[name] === "number")
    .map((name) => `${name};dur=${timings[name]}`);
  setHeader(event, "Server-Timing", serverTiming.join(", "));

  return {
    user,
    total: tvItems.length + movieItems.length,
    items: {
      TV: tvItems.slice(0, 100),
      MOVIE: movieItems.slice(0, 100),
    },
  };
});
