import { defineEventHandler, getQuery, createError, setHeader } from "h3";
import { prisma } from "../../utils/prisma";
import { anilistRequest } from "../../services/anilist/anilistClient";
import { title } from "node:process";

/* ----------------------------------
 * Config
 * ---------------------------------- */
const EXCLUDED_STATUSES = new Set(["COMPLETED", "WATCHING"]);

const CACHE_TTL_ANIME_DB = 1000 * 60 * 30;
const CACHE_TTL_ANILIST = 1000 * 60 * 5;

/* ----------------------------------
 * Scoring Configuration
 * ---------------------------------- */
const GENRE_WEIGHT = 1.5;
const TAG_WEIGHT = 1.0;

const NORMALIZATION_MODE: "sqrt" | "linear" = "sqrt";

const SINGLE_MATCH_PENALTY = 0.4;
const MULTI_GENRE_BONUS = 1.2;

const MAX_SINGLE_TAG_CONTRIBUTION: number | null = 300;

/* ----------------------------------
 * Quality Scoring
 * ---------------------------------- */
const USE_AVERAGE_SCORE = true;
const MIN_AVERAGE_SCORE: number | null = 60;

const AVG_SCORE_BASELINE = 75;
const AVG_SCORE_MIN_MULTIPLIER = 0.7;
const AVG_SCORE_MAX_MULTIPLIER = 1.3;

/* ----------------------------------
 * Helpers (Query Parsing)
 * ---------------------------------- */
function parseNumber(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function parseList(v: any): string[] | null {
  if (!v || typeof v !== "string") return null;
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

/* ----------------------------------
 * In-memory caches
 * ---------------------------------- */
let cachedAnimeDbAt = 0;
let cachedAnimeDb: Array<{
  id: number;
  titleEn: string | null;
  titleRo: string | null;
  cover: string | null;
  format: string | null;
  averageScore: number | null;
  season: string | null;
  seasonYear: number | null;
  episodes: number | null;
  genres: { name: string }[];
  tags: {
    tagId: number;
    name: string;
    isAdult: boolean;
    rank: number | null;
  }[];
}> | null = null;

const anilistCache = new Map<
  string,
  {
    at: number;
    data: { mediaId: number; status: string; score: number | null }[];
  }
>();

/* ----------------------------------
 * AniList Query
 * ---------------------------------- */
const ANILIST_LIST_QUERY = `
query ($userName: String!) {
  MediaListCollection(userName: $userName, type: ANIME) {
    lists {
      entries {
        status
        score(format: POINT_10)
        media { id }
      }
    }
  }
}
`;

async function loadUserAnilistEntries(user: string) {
  const hit = anilistCache.get(user);
  const now = Date.now();
  if (hit && now - hit.at < CACHE_TTL_ANILIST) return hit.data;

  const res: any = await anilistRequest<any>(ANILIST_LIST_QUERY, {
    userName: user,
  });

  const out: { mediaId: number; status: string; score: number | null }[] = [];

  for (const l of res?.MediaListCollection?.lists ?? []) {
    for (const e of l.entries ?? []) {
      if (!e?.media?.id) continue;
      out.push({
        mediaId: e.media.id,
        status: String(e.status),
        score: typeof e.score === "number" ? e.score : null,
      });
    }
  }

  anilistCache.set(user, { at: now, data: out });
  return out;
}

/* ----------------------------------
 * Taste Profile
 * ---------------------------------- */
type TasteProfile = {
  genres: Map<string, number>;
  tags: Map<number, number>;
};

function buildTasteProfile(
  completedIds: number[],
  scoreById: Map<number, number | null>,
  animeById: Map<number, any>
): TasteProfile {
  const genres = new Map<string, number>();
  const tags = new Map<number, number>();

  for (const id of completedIds) {
    const a = animeById.get(id);
    if (!a) continue;

    const s = scoreById.get(id);
    const weight = s ? s / 10 : 1;

    for (const g of a.genres) {
      genres.set(g.name, (genres.get(g.name) ?? 0) + weight);
    }

    for (const t of a.tags) {
      tags.set(t.tagId, (tags.get(t.tagId) ?? 0) + weight);
    }
  }

  return { genres, tags };
}

/* ----------------------------------
 * Scoring
 * ---------------------------------- */
function scoreAnime(anime: any, taste: TasteProfile) {
  let rawScore = 0;
  const matchedGenres: string[] = [];
  const matchedTags: string[] = [];

  for (const g of anime.genres) {
    const w = taste.genres.get(g.name);
    if (w) {
      rawScore += w * GENRE_WEIGHT;
      matchedGenres.push(g.name);
    }
  }

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
  if (matchCount === 0) return { score: 0, matchedGenres, matchedTags };

  let score =
    NORMALIZATION_MODE === "sqrt"
      ? rawScore / Math.sqrt(matchCount)
      : rawScore / matchCount;

  if (matchCount < 2) score *= SINGLE_MATCH_PENALTY;
  if (matchedGenres.length >= 2) score *= MULTI_GENRE_BONUS;

  if (USE_AVERAGE_SCORE && typeof anime.averageScore === "number") {
    if (
      MIN_AVERAGE_SCORE !== null &&
      anime.averageScore < MIN_AVERAGE_SCORE
    ) {
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

/* ----------------------------------
 * Handler
 * ---------------------------------- */
export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "public, max-age=60");

  const q = getQuery(event);
  const user = q.user;

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

  /* 2) Anime DB */
  const now = Date.now();
  if (!cachedAnimeDb || now - cachedAnimeDbAt > CACHE_TTL_ANIME_DB) {
    cachedAnimeDb = await prisma.anime.findMany({
      where: { format: { in: ["TV", "MOVIE"] } },
      include: { genres: true, tags: true },
    });
    cachedAnimeDbAt = now;
  }

  const animeById = new Map<number, any>();
  for (const a of cachedAnimeDb) animeById.set(a.id, a);

  /* 3) Taste */
  const taste = buildTasteProfile(completedIds, scoreById, animeById);

  /* 4) Build recommendations */
  const recs: any[] = [];

  for (const anime of cachedAnimeDb) {
    if (excludedIds.has(anime.id)) continue;

    if (filterSeason && anime.season !== filterSeason) continue;
    if (seasonYearMin !== null && (anime.seasonYear ?? 0) < seasonYearMin)
      continue;
    if (seasonYearMax !== null && (anime.seasonYear ?? 9999) > seasonYearMax)
      continue;
    if (episodesMin !== null && (anime.episodes ?? 0) < episodesMin)
      continue;
    if (
      episodesMax !== null &&
      (anime.episodes ?? Infinity) > episodesMax
    )
      continue;
    if (
      avgScoreMin !== null &&
      (anime.averageScore ?? 0) < avgScoreMin
    )
      continue;
    if (
      avgScoreMax !== null &&
      (anime.averageScore ?? Infinity) > avgScoreMax
    )
      continue;

    const { score, matchedGenres, matchedTags } =
      scoreAnime(anime, taste);

    if (score <= 0) continue;
    if (matchedTags.length === 0) continue;

    if (
      includeGenres &&
      !matchedGenres.some((g) => includeGenres.includes(g))
    )
      continue;

    if (
      excludeGenres &&
      matchedGenres.some((g) => excludeGenres.includes(g))
    )
      continue;

    if (
      includeTags &&
      !matchedTags.some((t) => includeTags.includes(t))
    )
      continue;

    if (
      excludeTags &&
      matchedTags.some((t) => excludeTags.includes(t))
    )
      continue;

    recs.push({
      id: anime.id,
      titleEn: anime.titleEn,
      titleRo: anime.titleRo,
      cover: anime.cover,
      format: anime.format,
      score: Number(score.toFixed(3)),
      averageScore: anime.averageScore,
      season: anime.season,
      seasonYear: anime.seasonYear,
      episodes: anime.episodes,
      matchedGenres,
      matchedTags,
    });
  }

  recs.sort((a, b) => b.score - a.score);

  const itemsByFormat = { TV: [] as any[], MOVIE: [] as any[] };
  for (const r of recs) {
    if (r.format === "TV") itemsByFormat.TV.push(r);
    else if (r.format === "MOVIE") itemsByFormat.MOVIE.push(r);
  }

  return {
    user,
    excluded: excludedIds.size,
    total: recs.length,
    items: {
      TV: itemsByFormat.TV.slice(0, 100),
      MOVIE: itemsByFormat.MOVIE.slice(0, 100),
    },
    cache: {
      animeDbCachedAt: cachedAnimeDbAt,
      anilistCached: Boolean(anilistCache.get(user)),
    },
  };
});
