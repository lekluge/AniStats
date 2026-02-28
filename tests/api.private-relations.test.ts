import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  cache: new Map<string, any>(),
}))

const prismaAnimeFindManyMock = vi.hoisted(() => vi.fn(async () => []))
const prismaAnimeGenreFindManyMock = vi.hoisted(() => vi.fn(async () => []))
const prismaAnimeTagFindManyMock = vi.hoisted(() => vi.fn(async () => []))
const prismaAnimeRelationFindManyMock = vi.hoisted(() => vi.fn(async () => []))
const setHeaderMock = vi.hoisted(() => vi.fn())
const setItemMock = vi.hoisted(() => vi.fn(async (_key: string, _value: any) => {}))

vi.mock("h3", () => ({
  defineEventHandler: (handler: any) => handler,
  setHeader: setHeaderMock,
}))

vi.mock("../utils/prisma", () => ({
  prisma: {
    anime: {
      findMany: prismaAnimeFindManyMock,
    },
    animeGenre: {
      findMany: prismaAnimeGenreFindManyMock,
    },
    animeTag: {
      findMany: prismaAnimeTagFindManyMock,
    },
    animeRelation: {
      findMany: prismaAnimeRelationFindManyMock,
    },
  },
}))

describe("api/private/relations.get", () => {
  beforeEach(() => {
    vi.resetModules()
    state.cache.clear()
    prismaAnimeFindManyMock.mockReset()
    prismaAnimeGenreFindManyMock.mockReset()
    prismaAnimeTagFindManyMock.mockReset()
    prismaAnimeRelationFindManyMock.mockReset()
    setHeaderMock.mockClear()
    setItemMock.mockReset()

    ;(globalThis as any).useStorage = () => ({
      getItem: async (key: string) => state.cache.get(key) ?? null,
      setItem: async (key: string, value: any) => {
        await setItemMock(key, value)
        state.cache.set(key, value)
      },
    })
  })

  it("returns grouped chains and related anime", async () => {
    prismaAnimeFindManyMock.mockResolvedValueOnce([
      {
        id: 1,
        titleEn: "A",
        titleRo: "A",
        cover: "a.jpg",
      },
      {
        id: 2,
        titleEn: "B",
        titleRo: "B",
        cover: "b.jpg",
      },
    ])
    prismaAnimeGenreFindManyMock.mockResolvedValueOnce([
      { animeId: 1, name: "Action" },
      { animeId: 2, name: "Action" },
    ])
    prismaAnimeTagFindManyMock.mockResolvedValueOnce([
      { animeId: 1, tagId: 1, name: "School", rank: 50, isAdult: false },
      { animeId: 2, tagId: 2, name: "Drama", rank: 60, isAdult: false },
    ])
    prismaAnimeRelationFindManyMock.mockResolvedValueOnce([
      { fromId: 1, toId: 2, relationType: "SEQUEL" },
      { fromId: 2, toId: 1, relationType: "PREQUEL" },
    ])

    const mod = await import("../server/api/private/relations.get")
    const out = await mod.default({} as any)

    expect(out.ok).toBe(true)
    expect(out.count).toBeGreaterThanOrEqual(1)
    expect(out.groups[0].chainLength).toBeGreaterThanOrEqual(1)
  })

  it("uses in-memory cache for subsequent calls", async () => {
    prismaAnimeFindManyMock.mockResolvedValueOnce([
      {
        id: 10,
        titleEn: "Single",
        titleRo: "Single",
        cover: "single.jpg",
      },
      {
        id: 11,
        titleEn: "Followup",
        titleRo: "Followup",
        cover: "followup.jpg",
      },
    ])
    prismaAnimeGenreFindManyMock.mockResolvedValueOnce([{ animeId: 10, name: "Action" }])
    prismaAnimeTagFindManyMock.mockResolvedValueOnce([])
    prismaAnimeRelationFindManyMock.mockResolvedValueOnce([
      { fromId: 10, toId: 11, relationType: "SEQUEL" },
    ])

    const mod = await import("../server/api/private/relations.get")
    await mod.default({} as any)
    await mod.default({} as any)

    expect(prismaAnimeFindManyMock).toHaveBeenCalledTimes(1)
  })

  it("writes relation cache to nested key to avoid fs directory collisions", async () => {
    prismaAnimeFindManyMock.mockResolvedValueOnce([
      {
        id: 11,
        titleEn: "Cache Key",
        titleRo: "Cache Key",
        cover: "cache.jpg",
      },
    ])
    prismaAnimeGenreFindManyMock.mockResolvedValueOnce([])
    prismaAnimeTagFindManyMock.mockResolvedValueOnce([])
    prismaAnimeRelationFindManyMock.mockResolvedValueOnce([])

    const mod = await import("../server/api/private/relations.get")
    await mod.default({} as any)

    expect(setItemMock).toHaveBeenCalled()
    expect(setItemMock).toHaveBeenCalledWith(
      "anime-relations-graph/v2",
      expect.objectContaining({
        nodes: expect.any(Array),
        edges: expect.any(Array),
      })
    )
  })
})
