import { defineEventHandler, setHeader } from "h3";
import { prisma } from "../../../utils/prisma";
import crypto from "crypto";

const CHAIN_REL = new Set(["PREQUEL", "SEQUEL"] as const);

function pickDeterministic<T extends { toId: number }>(edges: T[]) {
  return [...edges].sort((a, b) => a.toId - b.toId)[0] ?? null;
}

/* ----------------------------------
 * ✅ Server Cache (IN-MEMORY)
 * ---------------------------------- */
let cachedResult: any | null = null;
let cachedAt = 0;
const CACHE_TTL = 1000 * 60 * 60; // 1 Stunde

export default defineEventHandler(async (event) => {
  setHeader(event, "Cache-Control", "public, max-age=300");

  const now = Date.now();
  if (cachedResult && now - cachedAt < CACHE_TTL) {
    return cachedResult;
  }
  const storage = useStorage("cache");
  const cacheKey =
    "anime-relation:" +
    crypto
      .createHash("sha1")
      .digest("hex");
  let anime = await storage.getItem<any[]>(cacheKey);
  /* ----------------------------------
   * 1) ALLE Anime inkl. Relations + Genres + Tags
   * ---------------------------------- */
  if (!anime) {
    anime = await prisma.anime.findMany({
    include: {
      relationsFrom: true,
      relationsTo: true,
      genres: true,
      tags: true,
    },
  });
    // Cache für 8 Stunden (kannst du erhöhen)
    await storage.setItem(cacheKey, anime, {
      ttl: 60 * 60 * 8,
    });
  }
  

  const byId = new Map(anime.map((a) => [a.id, a]));
  const ROOT_REL = new Set(["PREQUEL", "PARENT"] as const);

  /* ----------------------------------
   * 2) Root-Finder
   * ---------------------------------- */
  function findRoot(start: any) {
    let current = start;
    const visited = new Set<number>();

    while (true) {
      if (visited.has(current.id)) break;
      visited.add(current.id);

      const prequels = (current.relationsFrom ?? [])
        .filter((r: any) => ROOT_REL.has(r.relationType))
        .filter((r: any) => r.toId && r.toId !== current.id);

      const next = pickDeterministic(prequels);
      if (!next) break;

      const nextNode = byId.get(next.toId);
      if (!nextNode) break;

      current = nextNode;
    }

    return current;
  }

  /* ----------------------------------
   * 3) Alle Roots bestimmen
   * ---------------------------------- */
  const rootMap = new Map<number, any>();

  for (const a of anime) {
    const root = findRoot(a);
    if (!rootMap.has(root.id)) {
      rootMap.set(root.id, root);
    }
  }

  /* ----------------------------------
   * 4) Chains mit METADATEN
   * ---------------------------------- */
  const groups: any[] = [];

  for (const root of rootMap.values()) {
    let current = root;
    const chain: any[] = [];
    const fwdVisited = new Set<number>();

    while (true) {
      if (fwdVisited.has(current.id)) break;
      fwdVisited.add(current.id);

      chain.push({
        id: current.id,
        titleEn: current.titleEn,
        titleRo: current.titleRo,
        cover: current.cover,
        genres: current.genres.map((g: any) => g.name),
        tags: current.tags.map((t: any) => ({
          id: t.tagId,
          name: t.name,
          rank: t.rank,
          isAdult: t.isAdult,
        })),
      });

      const sequels = (current.relationsFrom ?? [])
        .filter((r: any) => r.relationType === "SEQUEL")
        .filter((r: any) => r.toId && r.toId !== current.id);

      const next = pickDeterministic(sequels);
      if (!next) break;

      const nextNode = byId.get(next.toId);
      if (!nextNode) break;

      current = nextNode;
    }

    const chainIds = new Set(chain.map((c) => c.id));

    /* ----------------------------------
     * 5) Related (MIT GENRES & TAGS)
     * ---------------------------------- */
    const chainWithRelated: any[] = [];
    const globallySeenRelated = new Set<number>();

    for (const item of chain) {
      const node = byId.get(item.id);
      if (!node) continue;

      const related = (node.relationsFrom ?? [])
        .filter((r: any) => r.toId && r.toId !== node.id)
        .filter((r: any) => !CHAIN_REL.has(r.relationType))
        .filter((r: any) => !chainIds.has(r.toId))
        .filter((r: any) => {
          if (globallySeenRelated.has(r.toId)) return false;
          globallySeenRelated.add(r.toId);
          return true;
        })
        .map((r: any) => {
          const to = byId.get(r.toId);
          if (!to) return null;

          return {
            id: to.id,
            titleEn: to.titleEn,
            titleRo: to.titleRo,
            cover: to.cover,
            relationType: r.relationType,
            genres: to.genres.map((g: any) => g.name),
            tags: to.tags.map((t: any) => ({
              id: t.tagId,
              name: t.name,
              rank: t.rank,
              isAdult: t.isAdult,
            })),
          };
        })
        .filter(Boolean);

      chainWithRelated.push({
        ...item,
        related,
      });
    }

    groups.push({
      rootId: root.id,
      chainLength: chainWithRelated.length,
      chain: chainWithRelated,
    });
  }

  const result = {
    ok: true,
    count: groups.length,
    groups,
  };

  cachedResult = result;
  cachedAt = Date.now();

  return result;
});
