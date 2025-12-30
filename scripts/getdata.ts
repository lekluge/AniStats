import "dotenv/config";
import { prisma } from "../utils/prisma";
import { anilistRequest } from "../services/anilist/anilistClient";
import { enqueueAniList } from "../services/anilist/anilistQueue";

const PER_PAGE = 50; // bewusst konservativ
const DRY_RUN = false;

const QUERY = `
query ($page: Int!, $perPage: Int!) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      currentPage
      hasNextPage
    }
    media(type: ANIME) {
      id
      season
      seasonYear
      episodes
      averageScore
    }
  }
}
`;

async function main() {
  console.log("🔄 Full AniList pagination for anime meta data");

  // 🔹 Alle IDs aus deiner DB in ein Set laden
  const dbIds = new Set(
    (
      await prisma.anime.findMany({
        select: { id: true },
      })
    ).map((a) => a.id)
  );

  console.log(`📦 DB contains ${dbIds.size} anime`);

  let page = 1;
  let updated = 0;

  while (true) {
    const res: any = await enqueueAniList(() =>
      anilistRequest<any>(QUERY, {
        page,
        perPage: PER_PAGE,
      })
    );

    const media = res?.Page?.media ?? [];
    const pageInfo = res?.Page?.pageInfo;

    console.log(
      `➡️ Page ${page} – received ${media.length} entries`
    );

    for (const m of media) {
      // ❗ Nur updaten, wenn wir den Anime kennen
      if (!dbIds.has(m.id)) continue;
      if (!DRY_RUN) {
        await prisma.anime.update({
          where: { id: m.id },
          data: {
            season: m.season ?? null,
            seasonYear: m.seasonYear ?? null,
            episodes: m.episodes ?? null,
            averageScore: m.averageScore ?? null,
          },
        });
      }

      updated++;
    }

    if (!pageInfo?.hasNextPage) break;
    page++;
  }

  console.log(`🎉 Done – updated ${updated} anime`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
