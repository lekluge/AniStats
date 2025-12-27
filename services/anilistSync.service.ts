import { prisma } from "../server/utils/prisma";
import { createError } from "h3";
import crypto from "crypto";

/* ----------------------------------
 * Hash Helper (inkl. Genres & Tags)
 * ---------------------------------- */
function hashAnime(m: any) {
  return crypto
    .createHash("sha1")
    .update(
      JSON.stringify({
        en: m.title?.english ?? null,
        ro: m.title?.romaji ?? null,
        cover: m.coverImage?.large ?? null,
        format: m.format ?? null, // 👈 NEU
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

// Phase 1 – Anime + Genres + Tags
const ALL_ANIME_QUERY = `
  query ($page: Int!) {
    Page(page: $page, perPage: 50) {
      pageInfo {
        currentPage
        hasNextPage
      }
      media(type: ANIME) {
  id
  format
  title {
    english
    romaji
  }
  coverImage {
    large
  }
  genres
  tags {
    id
    name
    rank
    isAdult
  }
}

    }
  }
`;

// Phase 2 – Relations
const RELATION_BATCH_QUERY = `
  query ($ids: [Int!]!) {
    Page {
      media(id_in: $ids, type: ANIME) {
        id
        relations {
          edges {
            relationType
            node {
              id
            }
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
  /* ----------------------------------
   * ETA State
   * ---------------------------------- */
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

    try {
      const phase1 = await this.syncAnime();
      const phase2 = await this.syncRelations();

      console.log(
        `[AniList] Full sync finished in ${formatDuration(Date.now() - start)}`
      );

      return { phase1, phase2 };
    } catch (err) {
      console.error("[AniList] Full sync failed", err);
      throw err;
    }
  }

  /* ================================
   * Phase 1 – Anime + Genres + Tags
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

      const ids = media.map((m: any) => m.id).filter(Boolean);

      const existing = await prisma.anime.findMany({
        where: { id: { in: ids } },
        select: { id: true, dataHash: true },
      });

      const hashMap = new Map(existing.map((a) => [a.id, a.dataHash]));

      for (const m of media) {
        if (!m?.id) continue;

        const hash = hashAnime(m);
        const existingHash = hashMap.get(m.id);

        if (existingHash === hash) {
          skipped++;
          continue;
        }

        // 🧹 alte Genres & Tags löschen
        await prisma.animeGenre.deleteMany({
          where: { animeId: m.id },
        });

        await prisma.animeTag.deleteMany({
          where: { animeId: m.id },
        });

        // 🔁 Upsert Anime
        await prisma.anime.upsert({
          where: { id: m.id },
          update: {
            titleEn: m.title?.english ?? null,
            titleRo: m.title?.romaji ?? null,
            cover: m.coverImage?.large ?? null,
            format: m.format ?? null, // 👈 NEU
            dataHash: hash,
          },
          create: {
            id: m.id,
            titleEn: m.title?.english ?? null,
            titleRo: m.title?.romaji ?? null,
            cover: m.coverImage?.large ?? null,
            format: m.format ?? null, // 👈 NEU
            dataHash: hash,
          },
        });

        // ➕ Genres
        if (m.genres?.length) {
          await prisma.animeGenre.createMany({
            data: m.genres.map((g: string) => ({
              animeId: m.id,
              name: g,
            })),
          });
        }

        // ➕ Tags
        if (m.tags?.length) {
          await prisma.animeTag.createMany({
            data: m.tags.map((t: any) => ({
              animeId: m.id,
              tagId: t.id,
              name: t.name,
              rank: t.rank ?? null,
              isAdult: t.isAdult ?? false,
            })),
          });
        }

        upserted++;
      }

      processed += media.length;
      hasNextPage = pageData.pageInfo.hasNextPage;
      page++;

      const pageTime = Date.now() - pageStart;
      totalPageTime += pageTime;

      const avgMs = totalPageTime / pageCount;
      const etaMs = avgMs * (hasNextPage ? 9999 : 0);

      // 🔥 erste ETA setzen
      this.setInitialEta(etaMs);

      if (pageCount % 10 === 0 || pageCount === 1) {
        console.log(
          `[Phase1] Page ${pageCount} | processed ${processed} | ` +
            `upserted ${upserted} | skipped ${skipped} | ` +
            `avg ${Math.round(avgMs)}ms | ETA ${formatDuration(etaMs)}`
        );
      }
    }

    return {
      phase: 1,
      animeProcessed: processed,
      animeUpserted: upserted,
      animeSkipped: skipped,
      runtime: formatDuration(Date.now() - globalStart),
      totalAnimeInDb: await prisma.anime.count(),
    };
  }

  /* ================================
   * Phase 2 – Relations
   * ================================ */
  async syncRelations() {
    console.log("[AniList] Phase 2 – Relation sync started");

    const animeIds = await prisma.anime.findMany({
      select: { id: true },
      orderBy: { id: "asc" },
    });

    const BATCH_SIZE = 25;
    const REQUEST_DELAY = 1200;

    const ids = animeIds.map((a) => a.id);
    const totalBatches = Math.ceil(ids.length / BATCH_SIZE);

    let relationsInserted = 0;
    let relationsSkipped = 0;
    let processed = 0;

    let batchCount = 0;
    let totalBatchTimeMs = 0;
    const globalStart = Date.now();

    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const batchStart = Date.now();
      const batch = ids.slice(i, i + BATCH_SIZE);
      batchCount++;
      processed += batch.length;

      await sleep(REQUEST_DELAY);

      const res = await aniFetch(RELATION_BATCH_QUERY, { ids: batch });
      const medias = res?.data?.Page?.media ?? [];

      for (const media of medias) {
        const fromId = media.id;
        const edges = media.relations?.edges ?? [];

        for (const edge of edges) {
          const toId = edge.node?.id;
          const type = edge.relationType;
          if (!toId || !type) continue;

          try {
            await prisma.animeRelation.create({
              data: { fromId, toId, relationType: type },
            });
            relationsInserted++;
          } catch {
            relationsSkipped++;
          }
        }
      }

      const batchTime = Date.now() - batchStart;
      totalBatchTimeMs += batchTime;

      const avgMs = totalBatchTimeMs / batchCount;
      const remaining = totalBatches - batchCount;
      const etaMs = remaining * avgMs;

      if (batchCount % 10 === 0 || batchCount === 1) {
        console.log(
          `[Phase2] Batch ${batchCount}/${totalBatches} | ` +
            `avg ${Math.round(avgMs)}ms | ETA ${formatDuration(etaMs)}`
        );
      }
    }

    return {
      phase: 2,
      animeProcessed: processed,
      relationsInserted,
      relationsSkipped,
      runtime: formatDuration(Date.now() - globalStart),
      totalRelationsInDb: await prisma.animeRelation.count(),
    };
  }
}
