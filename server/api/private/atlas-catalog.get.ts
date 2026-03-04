import { defineEventHandler, setHeader } from "h3";
import { prisma } from "../../../utils/prisma";

type AtlasCatalogItem = {
  id: number;
  titleEn: string | null;
  titleRo: string | null;
  format: string | null;
  averageScore: number | null;
  seasonYear: number | null;
  startYear: number | null;
  episodes: number | null;
  genres: string[];
  tags: Array<{ name: string; rank: number | null }>;
};

const ATLAS_CATALOG_CACHE_KEY = "anime-atlas-catalog/v1";

export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "public, max-age=60");

  const storage = useStorage("cache");
  let items = await storage.getItem<AtlasCatalogItem[]>(ATLAS_CATALOG_CACHE_KEY);

  if (!items) {
    const rows = await prisma.anime.findMany({
      select: {
        id: true,
        titleEn: true,
        titleRo: true,
        format: true,
        averageScore: true,
        seasonYear: true,
        startYear: true,
        episodes: true,
        genres: {
          select: { name: true },
        },
        tags: {
          select: { name: true, rank: true },
        },
      },
    });

    items = rows
      .map((row) => ({
        id: row.id,
        titleEn: row.titleEn,
        titleRo: row.titleRo,
        format: row.format,
        averageScore: row.averageScore,
        seasonYear: row.seasonYear,
        startYear: row.startYear,
        episodes: row.episodes,
        genres: row.genres.map((genre) => genre.name),
        tags: row.tags.map((tag) => ({
          name: tag.name,
          rank: tag.rank,
        })),
      }))
      .filter((row) => row.genres.length > 0 || row.tags.length > 0);

    await storage.setItem(ATLAS_CATALOG_CACHE_KEY, items, { ttl: 60 * 60 * 48 }); // Cache for 48 hours
  }

  return {
    total: items.length,
    items,
  };
});
