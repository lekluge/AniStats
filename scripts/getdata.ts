import "dotenv/config";
import { prisma } from "../utils/prisma";
import { anilistRequest } from "../services/anilist/anilistClient";
import { enqueueAniList } from "../services/anilist/anilistQueue";

const PER_PAGE = 50;
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
      startDate {
        year
        month
        day
      }
      endDate {
        year
        month
        day
      }
    }
  }
}
`;

async function main() {
  console.log("🔄 Full AniList pagination for anime meta data (with fuzzy dates)");

  const dbIds = new Set(
    (await prisma.anime.findMany({ select: { id: true } })).map((a) => a.id)
  );

  console.log(`📦 DB contains ${dbIds.size} anime`);

  let page = 1;
  let updated = 0;

  while (true) {
    const res: any = await enqueueAniList(() =>
      anilistRequest(QUERY, {
        page,
        perPage: PER_PAGE,
      })
    );

    const media = res?.Page?.media ?? [];
    const pageInfo = res?.Page?.pageInfo;

    console.log(`➡️ Page ${page} – received ${media.length} entries`);

    for (const m of media) {
      if (!dbIds.has(m.id)) continue;

      if (!DRY_RUN) {
        await prisma.anime.update({
          where: { id: m.id },
          data: {
            season: m.season ?? null,
            seasonYear: m.seasonYear ?? null,
            episodes: m.episodes ?? null,
            averageScore: m.averageScore ?? null,

            // ✅ Fuzzy start date
            startYear: m.startDate?.year ?? null,
            startMonth: m.startDate?.month ?? null,
            startDay: m.startDate?.day ?? null,

            // ✅ Fuzzy end date
            endYear: m.endDate?.year ?? null,
            endMonth: m.endDate?.month ?? null,
            endDay: m.endDate?.day ?? null,
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
