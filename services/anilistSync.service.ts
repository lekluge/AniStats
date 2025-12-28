import { prisma } from "../server/utils/prisma";
import { createError } from "h3";
import crypto from "crypto";

/* ----------------------------------
 * Hash Helper
 * ---------------------------------- */
function hashAnime(m: any) {
  return crypto
    .createHash("sha1")
    .update(
      JSON.stringify({
        en: m.title?.english ?? null,
        ro: m.title?.romaji ?? null,
        cover: m.coverImage?.large ?? null,
        format: m.format ?? null,
        genres: m.genres ?? [],
        tags: (m.tags ?? []).map((t: any) => t.id),
      })
    )
    .digest("hex");
}

/* ----------------------------------
 * Helpers
 * ---------------------------------- */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const formatDuration = (ms: number) => {
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
};

/* ----------------------------------
 * AniList Fetch
 * ---------------------------------- */
async function aniFetch(
  query: string,
  variables: any,
  attempt = 1
): Promise<any> {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (res.status === 429) {
    if (attempt >= 5) {
      throw createError({
        statusCode: 429,
        statusMessage: "AniList rate limit exceeded",
      });
    }

    const retryAfter = res.headers.get("retry-after");
    const waitMs = retryAfter
      ? Number(retryAfter) * 1000
      : 1000 * Math.pow(2, attempt);

    console.warn(`[AniList] 429 – retry ${attempt}/5 in ${waitMs}ms`);
    await sleep(waitMs);
    return aniFetch(query, variables, attempt + 1);
  }

  if (!res.ok) {
    throw createError({
      statusCode: res.status,
      statusMessage: await res.text(),
    });
  }

  return res.json();
}

/* ----------------------------------
 * Queries
 * ---------------------------------- */
const ALL_ANIME_QUERY = `
  query ($page: Int!) {
    Page(page: $page, perPage: 50) {
      pageInfo {
        hasNextPage
      }
      media(type: ANIME) {
        id
        format
        title { english romaji }
        coverImage { large }
        genres
        tags { id name rank isAdult }
      }
    }
  }
`;

const RELATION_BATCH_QUERY = `
  query ($ids: [Int!]!) {
    Page {
      media(id_in: $ids, type: ANIME) {
        id
        relations {
          edges {
            relationType
            node { id }
          }
        }
      }
    }
  }
`;

/* ==================================
 * Service
 * ================================== */
export class AniListSyncService {
  private initialEta: string | null = null;

  getInitialEta() {
    return this.initialEta;
  }

  private setInitialEta(ms: number) {
    if (!this.initialEta && ms > 0) {
      this.initialEta = formatDuration(ms);
      console.log("[AniList] Initial ETA:", this.initialEta);
    }
  }

  /* ----------------------------------
   * Public Runner
   * ---------------------------------- */
  async runFullSync() {
    const start = Date.now();
    console.log("[AniList] Full sync started");

    const phase1 = await this.syncAnime();
    const phase2 = await this.syncRelations();

    console.log(
      `[AniList] Full sync finished in ${formatDuration(Date.now() - start)}`
    );

    return { phase1, phase2 };
  }

  /* ================================
   * Phase 1 – Anime (BATCHED)
   * ================================ */
  async syncAnime() {
    console.log("[AniList] Phase 1 – Anime sync started");

    let page = 1;
    let hasNextPage = true;

    let processed = 0;
    let upserted = 0;
    let skipped = 0;

    let pageCount = 0;
    let totalPageTime = 0;
    const globalStart = Date.now();

    while (hasNextPage) {
      const pageStart = Date.now();
      pageCount++;

      await sleep(700);
      const res = await aniFetch(ALL_ANIME_QUERY, { page });
      const pageData = res.data.Page;
      const media = pageData.media ?? [];

      const ids = media.map((m: any) => m.id);

      const existing = await prisma.anime.findMany({
        where: { id: { in: ids } },
        select: { id: true, dataHash: true },
      });

      const existingMap = new Map(existing.map((e) => [e.id, e.dataHash]));

      const animeUpserts: any[] = [];
      const genreRows: any[] = [];
      const tagRows: any[] = [];

      for (const m of media) {
        const hash = hashAnime(m);
        if (existingMap.get(m.id) === hash) {
          skipped++;
          continue;
        }

        animeUpserts.push({
          id: m.id,
          titleEn: m.title?.english ?? null,
          titleRo: m.title?.romaji ?? null,
          cover: m.coverImage?.large ?? null,
          format: m.format ?? null,
          dataHash: hash,
        });

        for (const g of m.genres ?? []) {
          genreRows.push({ animeId: m.id, name: g });
        }

        for (const t of m.tags ?? []) {
          tagRows.push({
            animeId: m.id,
            tagId: t.id,
            name: t.name,
            rank: t.rank ?? null,
            isAdult: t.isAdult ?? false,
          });
        }

        upserted++;
      }

      if (animeUpserts.length) {
        await prisma.$transaction([
          prisma.anime.deleteMany({ where: { id: { in: animeUpserts.map(a => a.id) } } }),
          prisma.anime.createMany({ data: animeUpserts }),
          prisma.animeGenre.deleteMany({ where: { animeId: { in: animeUpserts.map(a => a.id) } } }),
          prisma.animeTag.deleteMany({ where: { animeId: { in: animeUpserts.map(a => a.id) } } }),
          prisma.animeGenre.createMany({ data: genreRows }),
          prisma.animeTag.createMany({ data: tagRows }),
        ]);
      }

      processed += media.length;
      hasNextPage = pageData.pageInfo.hasNextPage;
      page++;

      const pageTime = Date.now() - pageStart;
      totalPageTime += pageTime;
      const avgMs = totalPageTime / pageCount;
      const etaMs = avgMs * (hasNextPage ? 9999 : 0);

      this.setInitialEta(etaMs);

      console.log(
        `[Phase1] Page ${pageCount} | processed ${processed} | upserted ${upserted} | skipped ${skipped}`
      );
    }

    return {
      phase: 1,
      animeProcessed: processed,
      animeUpserted: upserted,
      animeSkipped: skipped,
      runtime: formatDuration(Date.now() - globalStart),
    };
  }

  /* ================================
   * Phase 2 – Relations (BATCHED)
   * ================================ */
  async syncRelations() {
    console.log("[AniList] Phase 2 – Relation sync started");

    const ids = (await prisma.anime.findMany({ select: { id: true } })).map(
      (a) => a.id
    );

    const BATCH_SIZE = 25;
    const REQUEST_DELAY = 1200;

    let inserted = 0;
    let skipped = 0;
    const globalStart = Date.now();

    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      await sleep(REQUEST_DELAY);
      const batch = ids.slice(i, i + BATCH_SIZE);

      const res = await aniFetch(RELATION_BATCH_QUERY, { ids: batch });
      const medias = res?.data?.Page?.media ?? [];

      const rows: any[] = [];

      for (const m of medias) {
        for (const e of m.relations?.edges ?? []) {
          if (e.node?.id && e.relationType) {
            rows.push({
              fromId: m.id,
              toId: e.node.id,
              relationType: e.relationType,
            });
          }
        }
      }

      if (rows.length) {
        try {
          await prisma.animeRelation.createMany({
            data: rows,
            skipDuplicates: true,
          });
          inserted += rows.length;
        } catch {
          skipped += rows.length;
        }
      }
    }

    return {
      phase: 2,
      relationsInserted: inserted,
      relationsSkipped: skipped,
      runtime: formatDuration(Date.now() - globalStart),
    };
  }
}
