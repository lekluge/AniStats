import { defineEventHandler, setHeader } from "h3";
import { prisma } from "../../../utils/prisma";
import type {
  ChainItem,
  RelationGroup,
  RelationItem,
  RelationResponse,
  RelationTag,
} from "../../types/api/private";

interface RelationNode {
  id: number;
  titleEn: string | null;
  titleRo: string | null;
  cover: string | null;
  genres: string[];
  tags: RelationTag[];
}

interface RelationEdge {
  fromId: number;
  toId: number;
  relationType: string;
}

interface RelationDatasetCache {
  nodes: RelationNode[];
  edges: RelationEdge[];
}

const CHAIN_REL = new Set<string>(["PREQUEL", "SEQUEL"]);
const ROOT_REL = new Set<string>(["PREQUEL", "PARENT"]);
const RELATIONS_CACHE_KEY = "anime-relations-graph/v2";

function pickDeterministic<T extends { toId: number }>(edges: T[]) {
  let chosen: T | null = null;
  for (const edge of edges) {
    if (!chosen || edge.toId < chosen.toId) chosen = edge;
  }
  return chosen;
}

let cachedResult: RelationResponse | null = null;
let cachedAt = 0;
const CACHE_TTL_MS = 1000 * 60 * 60;

async function loadDatasetFromDb(): Promise<RelationDatasetCache> {
  const [edges, anime, genres, tags] = await Promise.all([
    prisma.animeRelation.findMany({
      select: {
        fromId: true,
        toId: true,
        relationType: true,
      },
    }),
    prisma.anime.findMany({
      select: {
        id: true,
        titleEn: true,
        titleRo: true,
        cover: true,
      },
    }),
    prisma.animeGenre.findMany({
      select: { animeId: true, name: true },
    }),
    prisma.animeTag.findMany({
      select: { animeId: true, tagId: true, name: true, rank: true, isAdult: true },
    }),
  ]);

  if (edges.length === 0) {
    return { nodes: [], edges: [] };
  }

  const relevantAnimeIds = new Set<number>();
  for (const edge of edges) {
    relevantAnimeIds.add(edge.fromId);
    relevantAnimeIds.add(edge.toId);
  }
  const relevantIds = [...relevantAnimeIds];

  if (relevantIds.length === 0) {
    return { nodes: [], edges };
  }

  const genresByAnimeId = new Map<number, string[]>();
  for (const genre of genres) {
    if (!relevantAnimeIds.has(genre.animeId)) continue;
    const list = genresByAnimeId.get(genre.animeId);
    if (list) list.push(genre.name);
    else genresByAnimeId.set(genre.animeId, [genre.name]);
  }

  const tagsByAnimeId = new Map<number, RelationTag[]>();
  for (const tag of tags) {
    if (!relevantAnimeIds.has(tag.animeId)) continue;
    const compact: RelationTag = {
      id: tag.tagId,
      name: tag.name,
      rank: tag.rank,
      isAdult: tag.isAdult,
    };
    const list = tagsByAnimeId.get(tag.animeId);
    if (list) list.push(compact);
    else tagsByAnimeId.set(tag.animeId, [compact]);
  }

  const nodes: RelationNode[] = anime
    .filter((item) => relevantAnimeIds.has(item.id))
    .map((item) => ({
      id: item.id,
      titleEn: item.titleEn,
      titleRo: item.titleRo,
      cover: item.cover,
      genres: genresByAnimeId.get(item.id) ?? [],
      tags: tagsByAnimeId.get(item.id) ?? [],
    }));

  return { nodes, edges };
}

export default defineEventHandler(async (event) => {
  const totalStart = Date.now();
  const timings: Record<string, number> = {};
  const markStart = (name: string) => {
    const start = Date.now();
    return () => {
      timings[name] = (timings[name] ?? 0) + (Date.now() - start);
    };
  };

  setHeader(event, "Cache-Control", "public, max-age=300");

  const now = Date.now();
  if (cachedResult && now - cachedAt < CACHE_TTL_MS) {
    return cachedResult;
  }

  const storage = useStorage("cache");
  const doneCacheGet = markStart("cacheGet");
  let dataset = await storage.getItem<RelationDatasetCache>(RELATIONS_CACHE_KEY);
  doneCacheGet();
  if (!dataset) {
    const doneDb = markStart("db");
    dataset = await loadDatasetFromDb();
    doneDb();
    const doneCacheSet = markStart("cacheSet");
    await storage.setItem(RELATIONS_CACHE_KEY, dataset, { ttl: 60 * 60 * 8 });
    doneCacheSet();
  }

  const doneBuild = markStart("build");
  const byId = new Map(dataset.nodes.map((node) => [node.id, node]));
  const edgesFromById = new Map<number, RelationEdge[]>();
  for (const edge of dataset.edges) {
    const list = edgesFromById.get(edge.fromId);
    if (list) list.push(edge);
    else edgesFromById.set(edge.fromId, [edge]);
  }

  function findRoot(startId: number) {
    let currentId = startId;
    const visited = new Set<number>();

    while (true) {
      if (visited.has(currentId)) break;
      visited.add(currentId);

      const prequels = (edgesFromById.get(currentId) ?? [])
        .filter((r) => ROOT_REL.has(r.relationType))
        .filter((r) => r.toId !== currentId);

      const next = pickDeterministic(prequels);
      if (!next) break;
      if (!byId.has(next.toId)) break;

      currentId = next.toId;
    }

    return currentId;
  }

  const rootIds = new Set<number>();
  for (const node of dataset.nodes) {
    rootIds.add(findRoot(node.id));
  }

  const groups: RelationGroup[] = [];
  for (const rootId of rootIds) {
    const rootNode = byId.get(rootId);
    if (!rootNode) continue;

    let currentId = rootId;
    const chain: Omit<ChainItem, "related">[] = [];
    const fwdVisited = new Set<number>();

    while (true) {
      if (fwdVisited.has(currentId)) break;
      fwdVisited.add(currentId);

      const currentNode = byId.get(currentId);
      if (!currentNode) break;

      chain.push({
        id: currentNode.id,
        titleEn: currentNode.titleEn,
        titleRo: currentNode.titleRo,
        cover: currentNode.cover,
        genres: currentNode.genres,
        tags: currentNode.tags,
      });

      const sequels = (edgesFromById.get(currentId) ?? [])
        .filter((r) => r.relationType === "SEQUEL")
        .filter((r) => r.toId !== currentId);

      const next = pickDeterministic(sequels);
      if (!next) break;
      if (!byId.has(next.toId)) break;

      currentId = next.toId;
    }

    const chainIds = new Set(chain.map((c) => c.id));
    const globallySeenRelated = new Set<number>();
    const chainWithRelated: ChainItem[] = [];

    for (const item of chain) {
      const related = (edgesFromById.get(item.id) ?? [])
        .filter((r) => r.toId !== item.id)
        .filter((r) => !CHAIN_REL.has(r.relationType))
        .filter((r) => !chainIds.has(r.toId))
        .filter((r) => {
          if (globallySeenRelated.has(r.toId)) return false;
          globallySeenRelated.add(r.toId);
          return true;
        })
        .map((r): RelationItem | null => {
          const target = byId.get(r.toId);
          if (!target) return null;
          return {
            id: target.id,
            titleEn: target.titleEn,
            titleRo: target.titleRo,
            cover: target.cover,
            relationType: r.relationType,
            genres: target.genres,
            tags: target.tags,
          };
        })
        .filter((value): value is RelationItem => value !== null);

      chainWithRelated.push({
        ...item,
        related,
      });
    }

    groups.push({
      rootId: rootNode.id,
      chainLength: chainWithRelated.length,
      chain: chainWithRelated,
    });
  }
  doneBuild();

  const result: RelationResponse = {
    ok: true,
    count: groups.length,
    groups,
  };

  cachedResult = result;
  cachedAt = Date.now();

  timings.total = Date.now() - totalStart;
  const serverTiming = ["cacheGet", "db", "cacheSet", "build", "total"]
    .filter((name) => typeof timings[name] === "number")
    .map((name) => `${name};dur=${timings[name]}`);
  setHeader(event, "Server-Timing", serverTiming.join(", "));

  return result;
});
