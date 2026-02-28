import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  query: {} as Record<string, any>,
}))

vi.mock("h3", () => ({
  defineEventHandler: (handler: any) => handler,
  getQuery: () => state.query,
  createError: (input: { statusCode: number; statusMessage: string }) => {
    const err = new Error(input.statusMessage) as any
    err.statusCode = input.statusCode
    err.statusMessage = input.statusMessage
    return err
  },
}))

describe("api/private/anilist-user-list.get", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.useFakeTimers()
    state.query = {}
    ;(globalThis as any).fetch = vi.fn()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("throws 400 when user query is missing", async () => {
    const mod = await import("../server/api/private/anilist-user-list.get")
    await expect(mod.default({} as any)).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: "Missing query param: user",
    })
  })

  it("returns status map for AniList entries", async () => {
    state.query = { user: "Leon" }
    ;(globalThis as any).fetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        data: {
          MediaListCollection: {
            lists: [
              {
                entries: [
                  { mediaId: 1, status: "COMPLETED" },
                  { mediaId: 2, status: "WATCHING" },
                ],
              },
            ],
          },
        },
      }),
    }))

    const mod = await import("../server/api/private/anilist-user-list.get")
    const p = mod.default({} as any)
    await vi.advanceTimersByTimeAsync(350)
    const out = await p

    expect(out).toEqual({
      ok: true,
      user: "Leon",
      count: 2,
      statusMap: {
        1: "COMPLETED",
        2: "WATCHING",
      },
    })
  })
})
