import { beforeEach, describe, expect, it, vi } from "vitest"

const runHourlyAniListSyncMock = vi.hoisted(() => vi.fn(async () => ({ ok: true })))

vi.mock("../services/anilist/hourlySync.service", () => ({
  runHourlyAniListSync: runHourlyAniListSyncMock,
}))

describe("api/private/test-anilist-sync.post", () => {
  beforeEach(() => {
    vi.resetModules()
    ;(globalThis as any).defineEventHandler = (handler: any) => handler
    runHourlyAniListSyncMock.mockClear()
  })

  it("delegates to runHourlyAniListSync", async () => {
    runHourlyAniListSyncMock.mockResolvedValueOnce({ synced: 3 })
    const mod = await import("../server/api/private/test-anilist-sync.post")

    await expect(mod.default()).resolves.toEqual({ synced: 3 })
    expect(runHourlyAniListSyncMock).toHaveBeenCalledTimes(1)
  })
})
