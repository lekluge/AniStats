import { defineEventHandler, setHeader } from "h3";
import { prisma } from "../../../utils/prisma";
import type { GenreTagCache } from "../../types/api/private";

export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "public, max-age=3600");

  const storage = useStorage("cache");
  const cacheKey = "genre-tags";

  const cached = await storage.getItem<GenreTagCache>(cacheKey);
  if (cached?.genres && cached?.tags) {
    return {
      genres: cached.genres.map((genre) => genre.name),
      tags: cached.tags.map((tag) => ({
        id: tag.id,
        name: tag.name,
        category: tag.category,
        isAdult: tag.isAdult,
        rank: tag.rank,
      })),
    };
  }

  const [genres, tags] = await Promise.all([
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

  return {
    genres: genres.map((genre) => genre.name),
    tags: tags.map((tag) => ({
      id: tag.id,
      name: tag.name,
      category: tag.category,
      isAdult: tag.isAdult,
      rank: tag.rank,
    })),
  };
});
