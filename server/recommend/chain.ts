const ROOT_REL = new Set(["PREQUEL", "PARENT"]);
const SEQUEL_REL = "SEQUEL";

function pickDeterministic<T extends { toId: number }>(edges: T[]) {
  return [...edges].sort((a, b) => a.toId - b.toId)[0] ?? null;
}


export function buildChainMap(relations: any[]) {
  const byId = new Map<number, any>();
  relations.forEach((a) => byId.set(a.id, a));

  function findRoot(start: any) {
    let current = start;
    const visited = new Set<number>();
    while (true) {
      if (visited.has(current.id)) break;
      visited.add(current.id);

      const prequels = (current.relationsFrom ?? [])
        .filter((r: any) => ROOT_REL.has(r.relationType))
        .filter((r: any) => r.toId !== current.id);

      const next = pickDeterministic(prequels);
      if (!next) break;

      const node = byId.get(next.toId);
      if (!node) break;
      current = node;
    }
    return current;
  }

  const chainByAnimeId = new Map<number, number[]>();

  for (const a of relations) {
    const root = findRoot(a);
    let current = root;
    const chain: number[] = [];
    const visited = new Set<number>();

    while (true) {
      if (visited.has(current.id)) break;
      visited.add(current.id);
      chain.push(current.id);

      const sequels = (current.relationsFrom ?? [])
        .filter((r: any) => r.relationType === SEQUEL_REL)
        .filter((r: any) => r.toId !== current.id);

      const next = pickDeterministic(sequels);
      if (!next) break;

      const node = byId.get(next.toId);
      if (!node) break;
      current = node;
    }

    for (const id of chain) {
      chainByAnimeId.set(id, chain);
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