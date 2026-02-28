import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  query: {} as Record<string, any>,
  cache: new Map<string, any>(),
}))

const prismaAnimeFindManyMock = vi.hoisted(() => vi.fn(async () => []))
const loadUserEntriesMock = vi.hoisted(() => vi.fn(async () => []))
const loadGlobalStatsMock = vi.hoisted(() => vi.fn(async () => ({ totalAnime: 1, genreCount: new Map(), tagCount: new Map() })))
const buildTasteProfileMock = vi.hoisted(() => vi.fn(() => ({ unseenGenres: new Set<string>() })))
const scoreAnimeMock = vi.hoisted(() =>
  vi.fn((anime: any) => ({
    score: anime.id === 2 ? 0.91 : 0.73,
    matchedGenres: ["Action"],
    matchedTags: ["School"],
  }))
)
const buildChainMapMock = vi.hoisted(() => vi.fn(() => new Map<number, number[]>()))
const isFirstUnseenInChainMock = vi.hoisted(() => vi.fn(() => true))

vi.mock("h3", () => ({
  defineEventHandler: (handler: any) => handler,
  getQuery: () => state.query,
  setHeader: vi.fn(),
  createError: (input: { statusCode: number; statusMessage: string }) => {
    const err = new Error(input.statusMessage) as any
    err.statusCode = input.statusCode
    err.statusMessage = input.statusMessage
    return err
  },
}))

vi.mock("../utils/prisma", () => ({
  prisma: {
    anime: {
      findMany: prismaAnimeFindManyMock,
    },
  },
}))

vi.mock("../server/recommend/anilist", () => ({
  loadUserAnilistEntries: loadUserEntriesMock,
}))

vi.mock("../server/recommend/globalStats", () => ({
  loadGlobalStats: loadGlobalStatsMock,
}))

vi.mock("../server/recommend/tasteProfile", () => ({
  buildTasteProfile: buildTasteProfileMock,
}))

vi.mock("../server/recommend/scoring", () => ({
  scoreAnime: scoreAnimeMock,
}))

vi.mock("../server/recommend/chain", () => ({
  buildChainMap: buildChainMapMock,
  isFirstUnseenInChain: isFirstUnseenInChainMock,
}))

describe("api/private/recommendation.get", () => {
  beforeEach(() => {
    vi.resetModules()
    state.query = {}
    state.cache.clear()
    prismaAnimeFindManyMock.mockReset()
    loadUserEntriesMock.mockReset()
    loadGlobalStatsMock.mockClear()
    buildTasteProfileMock.mockClear()
    scoreAnimeMock.mockClear()
    buildChainMapMock.mockClear()
    isFirstUnseenInChainMock.mockClear()

    ;(globalThis as any).useStorage = () => ({
      getItem: async (key: string) => state.cache.get(key) ?? null,
      setItem: async (key: string, value: any) => {
        state.cache.set(key, value)
      },
    })
  })

  it("throws 400 when user query is missing", async () => {
    const mod = await import("../server/api/private/recommendation.get")
    await expect(mod.default({} as any)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: "Missing user",
    })
  })

  it("returns grouped recommendations for TV and MOVIE", async () => {
    state.query = { user: "Leon", includeUpcoming: "true" }
    loadUserEntriesMock.mockResolvedValueOnce([
      { mediaId: 1, status: "COMPLETED", score: 8 },
    ])
    prismaAnimeFindManyMock
      .mockResolvedValueOnce([
        {
          id: 2,
          titleEn: "TV Title",
          titleRo: "TV Ro",
          cover: "tv.jpg",
          format: "TV",
          averageScore: 80,
          season: "SPRING",
          startYear: 2024,
          episodes: 12,
          genres: [{ name: "Action" }],
          tags: [{ name: "School" }],
        },
        {
          id: 3,
          titleEn: "Movie Title",
          titleRo: "Movie Ro",
          cover: "movie.jpg",
          format: "MOVIE",
          averageScore: 78,
          season: "WINTER",
          startYear: 2023,
          episodes: 1,
          genres: [{ name: "Action" }],
          tags: [{ name: "School" }],
        },
      ])
      .mockResolvedValueOnce([{ id: 2, relationsFrom: [], relationsTo: [] }])

    const mod = await import("../server/api/private/recommendation.get")
    const out = await mod.default({} as any)

    expect(out.user).toBe("Leon")
    expect(out.total).toBe(2)
    expect(out.items.TV).toHaveLength(1)
    expect(out.items.MOVIE).toHaveLength(1)
    expect(out.items.TV[0].id).toBe(2)
  })
})
