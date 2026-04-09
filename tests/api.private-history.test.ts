import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  token: undefined as string | undefined,
  query: {} as Record<string, any>,
}))

const prismaFindManyMock = vi.hoisted(() => vi.fn(async () => []))

vi.mock("h3", async (importOriginal) => {
  const actual = await importOriginal<typeof import("h3")>()

  return {
    ...actual,
    createError: (input: { statusCode: number; statusMessage: string }) => {
      const err = new Error(input.statusMessage) as any
      err.statusCode = input.statusCode
      err.statusMessage = input.statusMessage
      return err
    },
    defineEventHandler: (handler: any) => handler,
    getCookie: (_event: any, _name: string) => state.token,
    getQuery: () => state.query,
    setHeader: vi.fn(),
  }
})

vi.mock("../utils/prisma", () => ({
  prisma: {
    anime: {
      findMany: prismaFindManyMock,
    },
  },
}))

describe("api/private/history.get", () => {
  beforeEach(() => {
    vi.resetModules()
    state.token = undefined
    state.query = {}
    prismaFindManyMock.mockReset()
    ;(globalThis as any).defineEventHandler = (handler: any) => handler
    ;(globalThis as any).getCookie = (_event: any, _name: string) => state.token
    ;(globalThis as any).getQuery = () => state.query
    ;(globalThis as any).setHeader = vi.fn()
    ;(globalThis as any).deleteCookie = vi.fn()
    ;(globalThis as any).setCookie = vi.fn()
    ;(globalThis as any).useRuntimeConfig = () => ({
      anilistClientId: "client-123",
      anilistClientSecret: "secret-abc",
    })
    ;(globalThis as any).useStorage = vi.fn(() => ({
      getItem: vi.fn(async () => undefined),
      setItem: vi.fn(async () => undefined),
    }))
    ;(globalThis as any).$fetch = vi.fn()
    ;(globalThis as any).fetch = vi.fn()
  })

  it("returns 401 when auth token is missing", async () => {
    const mod = await import("../server/api/private/history.get")
    await expect(mod.default({} as any)).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: "Not authenticated",
    })
  })

  it("returns 400 when date range is missing", async () => {
    state.token = "token-1"
    const mod = await import("../server/api/private/history.get")

    await expect(mod.default({} as any)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: "Missing date range",
    })
  })

  it("returns merged history items", async () => {
    state.token = "token-1"
    state.query = { start: "2025-01-01", end: "2025-12-31" }

    const makeJsonResponse = (data: unknown) => ({
      ok: true,
      status: 200,
      headers: { get: () => null },
      json: async () => data,
      text: async () => "",
    })

    ;(globalThis as any).fetch = vi
      .fn()
      .mockResolvedValueOnce(makeJsonResponse({ data: { Viewer: { id: 7 } } }))
      .mockResolvedValueOnce(makeJsonResponse({
        data: {
          Page: {
            pageInfo: { hasNextPage: false },
            mediaList: [
              {
                mediaId: 10,
                startedAt: { year: 2025, month: 1, day: 1 },
                completedAt: { year: 2025, month: 2, day: 1 },
              },
            ],
          },
        },
      }))

    prismaFindManyMock.mockResolvedValueOnce([
      {
        id: 10,
        titleEn: "Title",
        genres: [],
        tags: [],
      },
    ])

    const mod = await import("../server/api/private/history.get")
    const out = await mod.default({} as any)

    expect(out).toHaveLength(1)
    expect(out[0]).toMatchObject({
      id: 10,
      titleEn: "Title",
      completedAt: { year: 2025, month: 2, day: 1 },
    })
  })
})
