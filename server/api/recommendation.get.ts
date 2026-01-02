import { defineEventHandler, getQuery, createError, setHeader } from "h3";
import { prisma } from "../../utils/prisma";
import { anilistRequest } from "../../services/anilist/anilistClient";
import crypto from "crypto";

/* ----------------------------------
 * Config
 * ---------------------------------- */
const EXCLUDED_STATUSES = new Set(["COMPLETED", "WATCHING"]);

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

const NOW = new Date();
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

function hasStartDate(a: any) {
  return a.startYear !== null;
}

function isReleased(a: any) {
  // ❌ kein Jahr → niemals released
  if (typeof a.startYear !== "number") return false;

  // ❌ nur Jahr bekannt → zu ungenau → schlechte Recommendation
  if (typeof a.startMonth !== "number") return false;

  // Vergleichsdatum bauen
  const y = a.startYear;
  const m = a.startMonth;
  const d = typeof a.startDay === "number" ? a.startDay : 1;

  // 👉 Anime gilt ab dem *ersten möglichen Tag* als released
  const releaseDate = new Date(y, m - 1, d);

  return releaseDate <= NOW;
}

/* ----------------------------------
 * AniList Cache
 * ---------------------------------- */
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

  const res: any = await anilistRequest(ANILIST_LIST_QUERY, { userName: user });
  const out: any[] = [];

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
function scoreAnime(anime: any, taste: any) {
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
  if (!matchCount) return { score: 0, matchedGenres, matchedTags };

  let score =
    NORMALIZATION_MODE === "sqrt"
      ? rawScore / Math.sqrt(matchCount)
      : rawScore / matchCount;

  if (matchCount < 2) score *= SINGLE_MATCH_PENALTY;
  if (matchedGenres.length >= 2) score *= MULTI_GENRE_BONUS;

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

/* ----------------------------------
 * Chain Logic
 * ---------------------------------- */
const ROOT_REL = new Set(["PREQUEL", "PARENT"]);
const SEQUEL_REL = "SEQUEL";

function pickDeterministic<T extends { toId: number }>(edges: T[]) {
  return [...edges].sort((a, b) => a.toId - b.toId)[0] ?? null;
}

function buildChainMap(relations: any[]) {
  const byId = new Map<number, any>();
  relations.forEach((a) => byId.set(a.id, a));

  function findRoot(start: any) {
    let current = start;
    const visited = new Set<number>();
    while (true) {
      if (visited.has(current.id)) break;
      visited.add(current.id);

      const prequels = (current.relationsFrom ?? [])
        .filter((r: any) => ROOT_REL.has(r.relationType))
        .filter((r: any) => r.toId !== current.id);

      const next = pickDeterministic(prequels);
      if (!next) break;

      const node = byId.get(next.toId);
      if (!node) break;
      current = node;
    }
    return current;
  }

  const chainByAnimeId = new Map<number, number[]>();

  for (const a of relations) {
    const root = findRoot(a);
    let current = root;
    const chain: number[] = [];
    const visited = new Set<number>();

    while (true) {
      if (visited.has(current.id)) break;
      visited.add(current.id);
      chain.push(current.id);

      const sequels = (current.relationsFrom ?? [])
        .filter((r: any) => r.relationType === SEQUEL_REL)
        .filter((r: any) => r.toId !== current.id);

      const next = pickDeterministic(sequels);
      if (!next) break;

      const node = byId.get(next.toId);
      if (!node) break;
      current = node;
    }

    for (const id of chain) {
      chainByAnimeId.set(id, chain);
    }
  }

  return chainByAnimeId;
}

function isFirstUnseenInChain(
  animeId: number,
  chainMap: Map<number, number[]>,
  excludedIds: Set<number>
) {
  const chain = chainMap.get(animeId);
  if (!chain) return true;

  for (const id of chain) {
    if (!excludedIds.has(id)) {
      return id === animeId;
    }
  }
  return false;
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
  const taste = buildTasteProfile(completedIds, scoreById, animeById);

  const recs: any[] = [];

  for (const a of anime) {
    if (excludedIds.has(a.id)) continue;

    // ❌ kein Startdatum → nie empfehlen
    if (!hasStartDate(a)) continue;

    // ❌ Upcoming nur wenn explizit erlaubt
    if (!includeUpcoming && !isReleased(a)) continue;

    // 🔹 Season-Filter
    if (filterSeason && a.season !== filterSeason) continue;

    // 🔹 Year-Filter (JETZT korrekt auf startYear)
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
      seasonYear: a.startYear, // ← bewusst!
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
