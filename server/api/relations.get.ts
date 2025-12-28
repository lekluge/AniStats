import { defineEventHandler, setHeader } from "h3";
import { prisma } from "../utils/prisma";

const CHAIN_REL = new Set(["PREQUEL", "SEQUEL"] as const);

function pickDeterministic<T extends { toId: number }>(edges: T[]) {
  return [...edges].sort((a, b) => a.toId - b.toId)[0] ?? null;
}

/* ----------------------------------
 * ✅ Server Cache (IN-MEMORY)
 * ---------------------------------- */
let cachedResult: any | null = null;
let cachedAt = 0;
const CACHE_TTL = 1000 * 60 * 60; // 5 Minuten

export default defineEventHandler(async (event) => {
  // HTTP cache header darf bleiben (optional)
  setHeader(event, "Cache-Control", "public, max-age=300");

  // ✅ SERVER cache hit
  const now = Date.now();
  if (cachedResult && now - cachedAt < CACHE_TTL) {
    return cachedResult;
  }

  /* ----------------------------------
   * 1) ALLE Daten einmal laden
   * ---------------------------------- */
  const anime = await prisma.anime.findMany({
    include: {
      relationsFrom: true,
      relationsTo: true,
    },
  });

  const byId = new Map(anime.map((a) => [a.id, a]));

  /* ----------------------------------
   * 2) Helper = IDENTISCHE Root-Find-Logik
   * ---------------------------------- */
  function findRoot(start: any) {
    let current = start;
    const visited = new Set<number>();

    while (true) {
      if (visited.has(current.id)) break;
      visited.add(current.id);

      const prequels = (current.relationsFrom ?? [])
        .filter((r: any) => r.relationType === "PREQUEL")
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
   * 3) Alle Roots eindeutig bestimmen
   * ---------------------------------- */
  const rootMap = new Map<number, any>();

  for (const a of anime) {
    const root = findRoot(a);
    if (!rootMap.has(root.id)) {
      rootMap.set(root.id, root);
    }
  }

  /* ----------------------------------
   * 4) Für jeden Root: EXAKT deine Chain
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
     * 5) Related – IDENTISCH zu vorher
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

  // ✅ SERVER cache set
  cachedResult = result;
  cachedAt = Date.now();

  return result;
});
