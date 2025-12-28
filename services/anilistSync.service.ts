import { prisma } from "../server/utils/prisma";
import { createError } from "h3";
import crypto from "crypto";
const STORY_RELATIONS = new Set([
  "PREQUEL",
  "SEQUEL",
  "SPIN_OFF",
  "SIDE_STORY",
  "SUMMARY",
  "ALTERNATIVE",
  "COMPILATION",
  "ADAPTATION",
]);
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

function normalizeRelation(fromId: number, toId: number, type: string) {
  return fromId < toId
    ? { fromId, toId, relationType: type }
    : { fromId: toId, toId: fromId, relationType: type };
}

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
    const waitMs = retryAfter ? Number(retryAfter) * 1000 : 10000; // konstant, AniList-freundlich

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
      pageInfo { hasNextPage }
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

    // Phase 1 ist bewusst deaktiviert
    // const phase1 = await this.syncAnime();
    const phase2 = await this.syncRelations();

    console.log(
      `[AniList] Full sync finished in ${formatDuration(Date.now() - start)}`
    );

    return { phase2 };
  }

  /* ================================
   * Phase 1 – Anime (BATCHED)
   * ================================ */
  async syncAnime() {
    // UNVERÄNDERT – bleibt drin, wird aktuell nicht aufgerufen
  }

  /* ================================
   * Phase 2 – Relations ONLY
   * ================================ */
  async syncRelations() {
    await prisma.animeRelation.deleteMany();
    console.log("[Phase2] All existing relations deleted");
    console.log("[AniList] Phase 2 – Relation sync started");

    //const animeRows = await prisma.anime.findMany({ select: { id: true } });
    const ids = (
      await prisma.anime.findMany({
        where: {
          relationsFrom: { none: {} },
          relationsTo: { none: {} },
        },
        select: { id: true },
      })
    ).map((a) => a.id);
    const existingAnimeIds = new Set(ids); // 🔑 FK-Schutz

    const BATCH_SIZE = 10;
    const REQUEST_DELAY = 1200;
    const totalBatches = Math.ceil(ids.length / BATCH_SIZE);

    let processed = 0;
    let inserted = 0;
    let deleted = 0;
    let fkSkipped = 0;

    let batchCount = 0;
    let totalBatchTime = 0;
    const globalStart = Date.now();

    for (let i = 0; i < ids.length; i += BATCH_SIZE) {
      const batchStart = Date.now();
      batchCount++;

      await sleep(REQUEST_DELAY);
      const batch = ids.slice(i, i + BATCH_SIZE);
      processed += batch.length;

      const res = await aniFetch(RELATION_BATCH_QUERY, { ids: batch });
      const medias = res?.data?.Page?.media ?? [];

      const rows: any[] = [];
      const seen = new Set<string>();

      for (const m of medias) {
        for (const e of m.relations?.edges ?? []) {
          if (
            !e.node?.id ||
            !e.relationType ||
            !STORY_RELATIONS.has(e.relationType)
          ) {
            continue;
          }

          const norm = normalizeRelation(m.id, e.node.id, e.relationType);

          // 🔑 FK-Filter
          if (
            !existingAnimeIds.has(norm.fromId) ||
            !existingAnimeIds.has(norm.toId)
          ) {
            fkSkipped++;
            continue;
          }

          const key = `${norm.fromId}|${norm.toId}|${norm.relationType}`;
          if (seen.has(key)) continue;
          seen.add(key);

          rows.push(norm);
        }
      }

      // 🔥 Idempotent: alte Relations dieses Batches löschen
      const del = await prisma.animeRelation.deleteMany({
        where: {
          OR: [{ fromId: { in: batch } }, { toId: { in: batch } }],
        },
      });
      deleted += del.count;

      if (rows.length) {
        await prisma.animeRelation.createMany({
          data: rows,
        });
        inserted += rows.length;
      }

      const batchTime = Date.now() - batchStart;
      totalBatchTime += batchTime;

      const avgMs = totalBatchTime / batchCount;
      const etaMs = (totalBatches - batchCount) * avgMs;

      if (batchCount % 10 === 0 || batchCount === 1) {
        console.warn(
          `[Phase2] Batch ${batchCount}/${totalBatches} | ` +
            `processed ${processed} | deleted ${deleted} | inserted ${inserted} | ` +
            `fkSkipped ${fkSkipped} | avg ${Math.round(
              avgMs
            )}ms | ETA ${formatDuration(etaMs)}`
        );
      }
    }

    return {
      phase: 2,
      animeProcessed: processed,
      relationsDeleted: deleted,
      relationsInserted: inserted,
      relationsFkSkipped: fkSkipped,
      runtime: formatDuration(Date.now() - globalStart),
    };
  }
}
