import { describe, expect, it } from "vitest"
import { buildChainMap, isFirstUnseenInChain } from "../server/recommend/chain"

describe("recommend/chain", () => {
  it("buildChainMap builds linear sequel chains from prequel roots", () => {
    const relations = [
      {
        id: 1,
        relationsFrom: [{ relationType: "SEQUEL", toId: 2 }],
      },
      {
        id: 2,
        relationsFrom: [
          { relationType: "PREQUEL", toId: 1 },
          { relationType: "SEQUEL", toId: 3 },
        ],
      },
      {
        id: 3,
        relationsFrom: [{ relationType: "PREQUEL", toId: 2 }],
      },
    ]

    const chainMap = buildChainMap(relations)

    expect(chainMap.get(1)).toEqual([1, 2, 3])
    expect(chainMap.get(2)).toEqual([1, 2, 3])
    expect(chainMap.get(3)).toEqual([1, 2, 3])
  })

  it("isFirstUnseenInChain allows only the first unseen entry", () => {
    const chainMap = new Map<number, number[]>([
      [1, [1, 2, 3]],
      [2, [1, 2, 3]],
      [3, [1, 2, 3]],
    ])

    expect(isFirstUnseenInChain(2, chainMap, new Set([1]))).toBe(true)
    expect(isFirstUnseenInChain(3, chainMap, new Set([1]))).toBe(false)
    expect(isFirstUnseenInChain(1, chainMap, new Set([1, 2, 3]))).toBe(false)
    expect(isFirstUnseenInChain(99, chainMap, new Set())).toBe(true)
  })
})
