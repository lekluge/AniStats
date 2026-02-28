import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  query: {} as Record<string, any>,
  cache: new Map<string, any>(),
}))

const prismaFindManyMock = vi.hoisted(
  () => vi.fn<() => Promise<any[]>>(async () => [])
)
const anilistRequestMock = vi.hoisted(
  () => vi.fn<() => Promise<any>>(async () => ({}))
)

vi.mock("h3", () => ({
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
      findMany: prismaFindManyMock,
    },
  },
}))

vi.mock("../services/anilist/anilistClient", () => ({
  anilistRequest: anilistRequestMock,
}))

describe("api/private/anilist.post", () => {
  beforeEach(() => {
    vi.resetModules()
    state.query = {}
    state.cache.clear()
    prismaFindManyMock.mockReset()
    anilistRequestMock.mockReset()

    ;(globalThis as any).defineEventHandler = (handler: any) => handler
    ;(globalThis as any).getQuery = () => state.query
    ;(globalThis as any).useStorage = () => ({
      getItem: async (key: string) => state.cache.get(key) ?? null,
      setItem: async (key: string, value: any) => {
        state.cache.set(key, value)
      },
    })
  })

  it("throws 400 when user is missing", async () => {
    const mod = await import("../server/api/private/anilist.post")
    await expect(mod.default({} as any)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: "Missing ?user=",
    })
  })

  it("returns enriched AniList collection", async () => {
    state.query = { user: "Leon" }
    anilistRequestMock.mockResolvedValueOnce({
      MediaListCollection: {
        lists: [
          {
            entries: [
              {
                media: {
                  id: 1,
                  season: "SPRING",
                  seasonYear: 2024,
                  duration: 24,
                  episodes: 12,
                },
                status: "COMPLETED",
              },
            ],
          },
        ],
      },
    })

    prismaFindManyMock.mockResolvedValueOnce([
      {
        id: 1,
        titleRo: "Titel RO",
        titleEn: "Title EN",
        cover: "https://img/anime.jpg",
        format: "TV",
        genres: [{ name: "Action" }],
        tags: [{ name: "School", rank: 70 }],
      },
    ])

    const mod = await import("../server/api/private/anilist.post")
    const out = await mod.default({} as any)

    expect(out.data.MediaListCollection.lists[0].entries[0].media.title.english).toBe(
      "Title EN"
    )
    expect(out.data.MediaListCollection.lists[0].entries[0].media.genres).toEqual([
      "Action",
    ])
    expect(prismaFindManyMock).toHaveBeenCalledTimes(1)
  })
})
