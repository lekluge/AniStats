import { defineEventHandler, setHeader } from "h3";
import { prisma } from "../../../utils/prisma";
import crypto from "crypto";
import type { GenreTagCache } from "../../types/api/private";

/**
 * GET /api/genreTags
 *
 * Liefert alle verfügbaren Genres & Tags aus der DB
 * für Filter-UI (Include / Exclude).
 */
export default defineEventHandler(async (event) => {
  // ✅ event MUSS übergeben werden
  setHeader(event, "Cache-Control", "public, max-age=3600");
  const storage = useStorage("cache");
  const cacheKey =
    "genre-tags:" +
    crypto
      .createHash("sha1")
      .digest("hex");
  let genres: GenreTagCache["genres"];
  let tags: GenreTagCache["tags"];
  const cached = await storage.getItem<GenreTagCache>(cacheKey);
  if (cached && cached.genres && cached.tags) {
    genres = cached.genres;
    tags = cached.tags;
  } else {
    [genres, tags] = await Promise.all([
      prisma.genre.findMany({
        select: { name: true },
        orderBy: { name: "asc" },
      }),
      prisma.tag.findMany({
        select: {
          id: true,
          name: true,
          category: true,
          isAdult: true,
          rank: true,
        },
        orderBy: { name: "asc" },
      }),
    ]);
    await storage.setItem(cacheKey, { genres, tags }, { ttl: 60 * 60 * 48 });
  }
  return {
    genres: genres.map((g) => g.name),
    tags: tags.map((t) => ({
      id: t.id,
      name: t.name,
      category: t.category,
      isAdult: t.isAdult,
      rank: t.rank,
    })),
  };
});
