import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  cache: new Map<string, any>(),
}))

const prismaAnimeFindManyMock = vi.hoisted(() => vi.fn(async () => []))
const setHeaderMock = vi.hoisted(() => vi.fn())

vi.mock("h3", () => ({
  defineEventHandler: (handler: any) => handler,
  setHeader: setHeaderMock,
}))

vi.mock("../utils/prisma", () => ({
  prisma: {
    anime: {
      findMany: prismaAnimeFindManyMock,
    },
  },
}))

describe("api/private/relations.get", () => {
  beforeEach(() => {
    vi.resetModules()
    state.cache.clear()
    prismaAnimeFindManyMock.mockReset()
    setHeaderMock.mockClear()

    ;(globalThis as any).useStorage = () => ({
      getItem: async (key: string) => state.cache.get(key) ?? null,
      setItem: async (key: string, value: any) => {
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
        genres: [{ name: "Action" }],
        tags: [{ tagId: 1, name: "School", rank: 50, isAdult: false }],
        relationsTo: [],
        relationsFrom: [{ relationType: "SEQUEL", toId: 2 }],
      },
      {
        id: 2,
        titleEn: "B",
        titleRo: "B",
        cover: "b.jpg",
        genres: [{ name: "Action" }],
        tags: [{ tagId: 2, name: "Drama", rank: 60, isAdult: false }],
        relationsTo: [],
        relationsFrom: [{ relationType: "PREQUEL", toId: 1 }],
      },
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
        genres: [],
        tags: [],
        relationsTo: [],
        relationsFrom: [],
      },
    ])

    const mod = await import("../server/api/private/relations.get")
    await mod.default({} as any)
    await mod.default({} as any)

    expect(prismaAnimeFindManyMock).toHaveBeenCalledTimes(1)
  })
})
