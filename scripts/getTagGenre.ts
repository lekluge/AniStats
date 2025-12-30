import "dotenv/config";
import { prisma } from "../utils/prisma";
import { anilistRequest } from "../services/anilist/anilistClient";
import { enqueueAniList } from "../services/anilist/anilistQueue";

const QUERY = `
query GenreCollection {
  GenreCollection
  MediaTagCollection {
    id
    name
    description
    category
    rank
    isAdult
  }
}
`;


type AniListResponse = {
  GenreCollection: string[];
  MediaTagCollection: {
    id: number;
    name: string;
    description: string;
    category: string;
    rank: number | null;
    isAdult: boolean;
  }[];
};

async function main() {
  console.log("🔄 Syncing AniList genres & tags");

  const res = await enqueueAniList(() =>
    anilistRequest<AniListResponse>(QUERY, {})
  );

  /* -----------------------------
   * Genres
   * ----------------------------- */
  console.log(`🎯 Genres: ${res.GenreCollection.length}`);

  await prisma.genre.deleteMany(); // 🔁 global truth reset

  await prisma.genre.createMany({
    data: res.GenreCollection.map((name) => ({ name })),
  });

  /* -----------------------------
   * Tags
   * ----------------------------- */
  console.log(`🏷️ Tags: ${res.MediaTagCollection.length}`);

  for (const tag of res.MediaTagCollection) {
    await prisma.tag.upsert({
      where: { id: tag.id },
      update: {
        name: tag.name,
        description: tag.description,
        category: tag.category,
        rank: tag.rank,
        isAdult: tag.isAdult,
      },
      create: {
        id: tag.id,
        name: tag.name,
        description: tag.description,
        category: tag.category,
        rank: tag.rank,
        isAdult: tag.isAdult,
      },
    });
  }

  console.log("🎉 Genre & Tag sync complete");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
