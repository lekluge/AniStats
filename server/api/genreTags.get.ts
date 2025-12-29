import { defineEventHandler, setHeader } from "h3";
import { prisma } from "../../utils/prisma";

/**
 * GET /api/genreTags
 *
 * Liefert alle verfügbaren Genres & Tags aus der DB
 * für Filter-UI (Include / Exclude).
 */
export default defineEventHandler(async (event) => {
  // ✅ event MUSS übergeben werden
  setHeader(event, "Cache-Control", "public, max-age=3600");

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
