import { defineEventHandler, setHeader } from "h3";
import { prisma } from "../../../utils/prisma";
import crypto from "crypto";
import type {
  AnimeWithRelationsAndMeta,
  ChainItem,
  RelationGroup,
  RelationItem,
  RelationResponse,
  RelationTag,
} from "../../types/api/private";

const CHAIN_REL: Set<string> = new Set(["PREQUEL", "SEQUEL"]);

function pickDeterministic<T extends { toId: number }>(edges: T[]) {
  return [...edges].sort((a, b) => a.toId - b.toId)[0] ?? null;
}

/* ----------------------------------
 * ✅ Server Cache (IN-MEMORY)
 * ---------------------------------- */
let cachedResult: RelationResponse | null = null;
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
  let anime = await storage.getItem<AnimeWithRelationsAndMeta[]>(cacheKey);
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
  const ROOT_REL: Set<string> = new Set(["PREQUEL", "PARENT"]);

  /* ----------------------------------
   * 2) Root-Finder
   * ---------------------------------- */
  function findRoot(start: AnimeWithRelationsAndMeta) {
    let current = start;
    const visited = new Set<number>();

    while (true) {
      if (visited.has(current.id)) break;
      visited.add(current.id);

      const prequels = (current.relationsFrom ?? [])
        .filter((r) => ROOT_REL.has(r.relationType))
        .filter((r) => r.toId !== current.id);

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
  const rootMap = new Map<number, AnimeWithRelationsAndMeta>();

  for (const a of anime) {
    const root = findRoot(a);
    if (!rootMap.has(root.id)) {
      rootMap.set(root.id, root);
    }
  }

  /* ----------------------------------
   * 4) Chains mit METADATEN
   * ---------------------------------- */
  const groups: RelationGroup[] = [];

  for (const root of rootMap.values()) {
    let current = root;
    const chain: Omit<ChainItem, "related">[] = [];
    const fwdVisited = new Set<number>();

    while (true) {
      if (fwdVisited.has(current.id)) break;
      fwdVisited.add(current.id);

      chain.push({
        id: current.id,
        titleEn: current.titleEn,
        titleRo: current.titleRo,
        cover: current.cover,
        genres: current.genres.map((g) => g.name),
        tags: current.tags.map((t): RelationTag => ({
          id: t.tagId,
          name: t.name,
          rank: t.rank,
          isAdult: t.isAdult,
        })),
      });

      const sequels = (current.relationsFrom ?? [])
        .filter((r) => r.relationType === "SEQUEL")
        .filter((r) => r.toId !== current.id);

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
    const chainWithRelated: ChainItem[] = [];
    const globallySeenRelated = new Set<number>();

    for (const item of chain) {
      const node = byId.get(item.id);
      if (!node) continue;

      const related = (node.relationsFrom ?? [])
        .filter((r) => r.toId !== node.id)
        .filter((r) => !CHAIN_REL.has(r.relationType))
        .filter((r) => !chainIds.has(r.toId))
        .filter((r) => {
          if (globallySeenRelated.has(r.toId)) return false;
          globallySeenRelated.add(r.toId);
          return true;
        })
        .map((r): RelationItem | null => {
          const to = byId.get(r.toId);
          if (!to) return null;

          return {
            id: to.id,
            titleEn: to.titleEn,
            titleRo: to.titleRo,
            cover: to.cover,
            relationType: r.relationType,
            genres: to.genres.map((g) => g.name),
            tags: to.tags.map((t): RelationTag => ({
              id: t.tagId,
              name: t.name,
              rank: t.rank,
              isAdult: t.isAdult,
            })),
          };
        })
        .filter((value): value is RelationItem => value !== null);

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

  const result: RelationResponse = {
    ok: true,
    count: groups.length,
    groups,
  };

  cachedResult = result;
  cachedAt = Date.now();

  return result;
});
