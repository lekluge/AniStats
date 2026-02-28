import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  cache: null as any,
}))

const setHeaderMock = vi.hoisted(() => vi.fn())
const genreFindManyMock = vi.hoisted(() => vi.fn(async () => []))
const tagFindManyMock = vi.hoisted(() => vi.fn(async () => []))

vi.mock("h3", () => ({
  defineEventHandler: (handler: any) => handler,
  setHeader: setHeaderMock,
}))

vi.mock("../utils/prisma", () => ({
  prisma: {
    genre: { findMany: genreFindManyMock },
    tag: { findMany: tagFindManyMock },
  },
}))

describe("api/private/genreTags.get", () => {
  beforeEach(() => {
    vi.resetModules()
    setHeaderMock.mockClear()
    genreFindManyMock.mockReset()
    tagFindManyMock.mockReset()
    state.cache = null

    ;(globalThis as any).useStorage = () => ({
      getItem: async () => state.cache,
      setItem: async (_key: string, value: any) => {
        state.cache = value
      },
    })
  })

  it("returns cached genre/tag data when available", async () => {
    state.cache = {
      genres: [{ name: "Action" }],
      tags: [{ id: 1, name: "School", category: "Theme", isAdult: false, rank: 70 }],
    }

    const mod = await import("../server/api/private/genreTags.get")
    const out = await mod.default({} as any)

    expect(out).toEqual({
      genres: ["Action"],
      tags: [{ id: 1, name: "School", category: "Theme", isAdult: false, rank: 70 }],
    })
    expect(genreFindManyMock).not.toHaveBeenCalled()
    expect(tagFindManyMock).not.toHaveBeenCalled()
  })

  it("loads from DB and returns mapped values when cache is empty", async () => {
    genreFindManyMock.mockResolvedValueOnce([{ name: "Drama" }])
    tagFindManyMock.mockResolvedValueOnce([
      { id: 2, name: "Work", category: "Theme", isAdult: false, rank: 50 },
    ])

    const mod = await import("../server/api/private/genreTags.get")
    const out = await mod.default({} as any)

    expect(out.genres).toEqual(["Drama"])
    expect(out.tags).toEqual([
      { id: 2, name: "Work", category: "Theme", isAdult: false, rank: 50 },
    ])
    expect(state.cache).toBeTruthy()
  })
})
