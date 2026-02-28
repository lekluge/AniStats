import type { RecommendationAnimeWithRelations, RelationEdge } from "./types/entities";

const ROOT_REL = new Set(["PREQUEL", "PARENT"]);
const SEQUEL_REL = "SEQUEL";

export interface ChainRelationEdge {
  fromId: number;
  toId: number;
  relationType: string;
}

function pickDeterministic<T extends { toId: number }>(edges: T[]) {
  return [...edges].sort((a, b) => a.toId - b.toId)[0] ?? null;
}

export function buildChainMap(relations: RecommendationAnimeWithRelations[]) {
  const edges: ChainRelationEdge[] = [];
  for (const anime of relations) {
    for (const edge of anime.relationsFrom ?? []) {
      edges.push({
        fromId: anime.id,
        toId: edge.toId,
        relationType: edge.relationType,
      });
    }
  }
  return buildChainMapFromEdges(edges, relations.map((a) => a.id));
}

export function buildChainMapFromEdges(
  edges: ChainRelationEdge[],
  explicitNodeIds: number[] = []
) {
  const byFromId = new Map<number, RelationEdge[]>();
  const allNodeIds = new Set<number>(explicitNodeIds);

  for (const edge of edges) {
    allNodeIds.add(edge.fromId);
    allNodeIds.add(edge.toId);

    const list = byFromId.get(edge.fromId);
    const compact: RelationEdge = {
      toId: edge.toId,
      relationType: edge.relationType,
    };
    if (list) {
      list.push(compact);
    } else {
      byFromId.set(edge.fromId, [compact]);
    }
  }

  function findRoot(startId: number) {
    let currentId = startId;
    const visited = new Set<number>();
    while (true) {
      if (visited.has(currentId)) break;
      visited.add(currentId);

      const prequels = (byFromId.get(currentId) ?? [])
        .filter((r: RelationEdge) => ROOT_REL.has(r.relationType))
        .filter((r: RelationEdge) => r.toId !== currentId);

      const next = pickDeterministic(prequels);
      if (!next) break;
      currentId = next.toId;
    }
    return currentId;
  }

  const chainByAnimeId = new Map<number, number[]>();

  for (const id of allNodeIds) {
    const rootId = findRoot(id);
    let currentId = rootId;
    const chain: number[] = [];
    const visited = new Set<number>();

    while (true) {
      if (visited.has(currentId)) break;
      visited.add(currentId);
      chain.push(currentId);

      const sequels = (byFromId.get(currentId) ?? [])
        .filter((r: RelationEdge) => r.relationType === SEQUEL_REL)
        .filter((r: RelationEdge) => r.toId !== currentId);

      const next = pickDeterministic(sequels);
      if (!next) break;
      currentId = next.toId;
    }

    for (const chainId of chain) {
      chainByAnimeId.set(chainId, chain);
    }
  }

  return chainByAnimeId;
}

export function isFirstUnseenInChain(
  animeId: number,
  chainMap: Map<number, number[]>,
  excludedIds: Set<number>
) {
  const chain = chainMap.get(animeId);
  if (!chain) return true;

  for (const id of chain) {
    if (!excludedIds.has(id)) {
      return id === animeId;
    }
  }
  return false;
}
