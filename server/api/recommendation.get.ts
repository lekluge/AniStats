import { defineEventHandler, getQuery, createError, setHeader } from "h3";
import { prisma } from "../../utils/prisma";
import { anilistRequest } from "../../services/anilist/anilistClient";

/* ----------------------------------
 * Config
 * ---------------------------------- */
const EXCLUDED_STATUSES = new Set(["COMPLETED", "WATCHING"]);

// Cache TTLs
const CACHE_TTL_ANIME_DB = 1000 * 60 * 30; // 30 min
const CACHE_TTL_ANILIST = 1000 * 60 * 5; // 5 min (pro user)

/* ----------------------------------
 * Scoring Configuration (TWEAK HERE)
 * ---------------------------------- */

// Taste weights
const GENRE_WEIGHT = 1.5;
const TAG_WEIGHT = 1.0;

const NORMALIZATION_MODE: "sqrt" | "linear" = "sqrt";

// Match penalties / bonuses
const SINGLE_MATCH_PENALTY = 0.4; // < 2 Matches
const MULTI_GENRE_BONUS = 1.2; // >= 2 Genre-Matches

// Tag dominance cap (e.g. Male Protagonist)
const MAX_SINGLE_TAG_CONTRIBUTION: number | null = 300;

/* ----------------------------------
 * Quality Scoring (AniList AverageScore)
 * ---------------------------------- */
const USE_AVERAGE_SCORE = true;

// harte Untergrenze (alles darunter komplett raus)
// null = deaktiviert
const MIN_AVERAGE_SCORE: number | null = 60;

// Mapping averageScore → multiplier
const AVG_SCORE_BASELINE = 75; // neutral
const AVG_SCORE_MIN_MULTIPLIER = 0.7;
const AVG_SCORE_MAX_MULTIPLIER = 1.3;

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
        media {
          id
        }
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

  const lists = res?.MediaListCollection?.lists ?? [];
  const out: { mediaId: number; status: string; score: number | null }[] = [];

  for (const l of lists) {
    for (const e of l.entries ?? []) {
      const mediaId = e?.media?.id;
      if (!mediaId) continue;

      out.push({
        mediaId,
        status: String(e.status ?? ""),
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
 * Final Scoring
 * ---------------------------------- */
function scoreAnime(anime: any, taste: TasteProfile) {
  let rawScore = 0;
  const matchedGenres: string[] = [];
  const matchedTags: string[] = [];

  // Genres
  for (const g of anime.genres) {
    const w = taste.genres.get(g.name);
    if (w) {
      rawScore += w * GENRE_WEIGHT;
      matchedGenres.push(g.name);
    }
  }

  // Tags
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
  if (matchCount === 0) {
    return { score: 0, matchedGenres, matchedTags };
  }

  // Normalisierung
  let score =
    NORMALIZATION_MODE === "sqrt"
      ? rawScore / Math.sqrt(matchCount)
      : rawScore / matchCount;

  // Match-Logik
  if (matchCount < 2) score *= SINGLE_MATCH_PENALTY;
  if (matchedGenres.length >= 2) score *= MULTI_GENRE_BONUS;

  // Quality Boost (AniList averageScore)
  if (
    USE_AVERAGE_SCORE &&
    typeof anime.averageScore === "number"
  ) {
    if (
      MIN_AVERAGE_SCORE !== null &&
      anime.averageScore < MIN_AVERAGE_SCORE
    ) {
      return { score: 0, matchedGenres, matchedTags };
    }

    const q =
      anime.averageScore / AVG_SCORE_BASELINE;

    const qualityMultiplier = Math.min(
      AVG_SCORE_MAX_MULTIPLIER,
      Math.max(AVG_SCORE_MIN_MULTIPLIER, q)
    );

    score *= qualityMultiplier;
  }

  return {
    score,
    matchedGenres,
    matchedTags,
  };
}

/* ----------------------------------
 * Handler
 * ---------------------------------- */
export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "public, max-age=60");

  const { user } = getQuery(event);
  if (!user || typeof user !== "string") {
    throw createError({ statusCode: 400, statusMessage: "Missing user" });
  }

  /* 1) AniList user list */
  const userEntries = await loadUserAnilistEntries(user);

  const excludedIds = new Set<number>();
  const completedIds: number[] = [];
  const scoreById = new Map<number, number | null>();

  for (const e of userEntries) {
    scoreById.set(e.mediaId, e.score);
    if (EXCLUDED_STATUSES.has(e.status)) excludedIds.add(e.mediaId);
    if (e.status === "COMPLETED") completedIds.push(e.mediaId);
  }

  /* 2) DB Anime (cached) */
  const now = Date.now();
  if (!cachedAnimeDb || now - cachedAnimeDbAt > CACHE_TTL_ANIME_DB) {
    cachedAnimeDb = await prisma.anime.findMany({
      where: {
        format: { in: ["TV", "MOVIE"] },
      },
      include: {
        genres: true,
        tags: true,
      },
    });
    cachedAnimeDbAt = now;
  }

  const animeById = new Map<number, any>();
  for (const a of cachedAnimeDb) animeById.set(a.id, a);

  /* 3) Taste profile */
  const taste = buildTasteProfile(completedIds, scoreById, animeById);

  /* 4) Score candidates */
  const recs: any[] = [];

  for (const anime of cachedAnimeDb) {
    if (excludedIds.has(anime.id)) continue;

    const { score, matchedGenres, matchedTags } =
      scoreAnime(anime, taste);

    // ❌ keine reinen Genre-Treffer
    if (matchedTags.length === 0) continue;

    if (score <= 0) continue;

    recs.push({
      id: anime.id,
      title: anime.titleRo ?? anime.titleEn ?? "Unknown",
      cover: anime.cover,
      format: anime.format,
      score: Number(score.toFixed(3)),
      matchedGenres,
      matchedTags,
      averageScore: anime.averageScore,
    });
  }

  recs.sort((a, b) => b.score - a.score);

  /* 5) Group by format */
  const itemsByFormat = {
    TV: [] as typeof recs,
    MOVIE: [] as typeof recs,
  };

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
