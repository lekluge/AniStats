import { beforeEach, describe, expect, it, vi } from "vitest"

const runHourlyAniListSyncMock = vi.hoisted(() => vi.fn(async () => ({ ok: true })))

vi.mock("../services/anilist/hourlySync.service", () => ({
  runHourlyAniListSync: runHourlyAniListSyncMock,
}))

describe("api/private/test-anilist-sync.post", () => {
  const originalNodeEnv = process.env.NODE_ENV

  beforeEach(() => {
    vi.resetModules()
    ;(globalThis as any).defineEventHandler = (handler: any) => handler
    runHourlyAniListSyncMock.mockClear()
    process.env.NODE_ENV = "development"
  })

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv
  })

  it("delegates to runHourlyAniListSync", async () => {
    runHourlyAniListSyncMock.mockResolvedValueOnce({ synced: 3 })
    const mod = await import("../server/api/private/test-anilist-sync.post")

    await expect(mod.default()).resolves.toEqual({ synced: 3 })
    expect(runHourlyAniListSyncMock).toHaveBeenCalledTimes(1)
  })

  it("returns 404 outside development", async () => {
    process.env.NODE_ENV = "production"
    const mod = await import("../server/api/private/test-anilist-sync.post")
    await expect(mod.default()).rejects.toMatchObject({ statusCode: 404 })
  })
})
