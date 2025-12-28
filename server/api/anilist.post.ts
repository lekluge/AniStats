import { prisma } from "../utils/prisma";
import { createError } from "h3";
import crypto from "crypto";

export default defineEventHandler(async (event) => {
  const { user } = getQuery(event);
  const userName = String(user || "").trim();

  if (!userName) {
    throw createError({ statusCode: 400, statusMessage: "Missing ?user=" });
  }

  /* -----------------------------
   * 1. AniList: User + season data
   * ----------------------------- */
  const query = `
    query ($userName: String) {
      MediaListCollection(userName: $userName, type: ANIME) {
        lists {
          entries {
            status
            score
            progress
            completedAt { year month day }
            startedAt { year month day }
            media {
              id
              season
              seasonYear
              duration
              episodes
            }
          }
        }
      }
    }
  `;

  const res: any = await $fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: { query, variables: { userName } },
  });

  const lists = res?.data?.MediaListCollection?.lists ?? [];

  /* -----------------------------
   * 2. IDs sammeln
   * ----------------------------- */
  const mediaIds: number[] = lists
    .flatMap((l: any) => l.entries ?? [])
    .map((e: any) => e.media?.id)
    .filter(Boolean);

  const uniqueIds = [...new Set(mediaIds)].sort((a, b) => a - b);

  /* -----------------------------
   * 3. DB: Anime + Genres + Tags (CACHED)
   * ----------------------------- */
  const storage = useStorage("cache");

  const cacheKey =
    "anime-meta:" +
    crypto
      .createHash("sha1")
      .update(uniqueIds.join(","))
      .digest("hex");

  let animeRows = await storage.getItem<any[]>(cacheKey);

  if (!animeRows) {
    animeRows = await prisma.anime.findMany({
      where: { id: { in: uniqueIds } },
      include: {
        genres: true,
        tags: true,
      },
    });

    // Cache für 15 Minuten (kannst du erhöhen)
    await storage.setItem(cacheKey, animeRows, {
      ttl: 60 * 15,
    });
  }

  const animeMap = new Map(animeRows.map((a: any) => [a.id, a]));

  /* -----------------------------
   * 4. Merge → AniList-Struktur
   * ----------------------------- */
  const enrichedLists = lists.map((l: any) => ({
    ...l,
    entries: l.entries.map((e: any) => {
      const a = animeMap.get(e.media.id);

      // Fallback: falls Anime noch nicht in DB ist
      if (!a) return e;

      return {
        ...e,
        media: {
          id: a.id,
          season: e.media.season ?? null,
          seasonYear: e.media.seasonYear ?? null,
          duration: e.media.duration ?? null,
          episodes: e.media.episodes ?? null,

          title: {
            romaji: a.titleRo ?? null,
            english: a.titleEn ?? null,
          },

          format: a.format ?? null,

          genres: a.genres.map((g: any) => g.name),

          tags: a.tags.map((t: any) => ({
            name: t.name,
            rank: t.rank,
          })),

          coverImage: {
            extraLarge: a.cover ?? null,
            large: a.cover ?? null,
          },
        },
      };
    }),
  }));

  /* -----------------------------
   * 5. Rückgabe: AniList-kompatibel
   * ----------------------------- */
  return {
    data: {
      MediaListCollection: {
        lists: enrichedLists,
      },
    },
  };
});
