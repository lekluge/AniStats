import { beforeEach, describe, expect, it, vi } from "vitest"

const state = vi.hoisted(() => ({
  runningValue: null as null | string,
}))

const runHourlyAniListSyncMock = vi.hoisted(
  () => vi.fn<() => Promise<any>>(async () => ({ ok: true }))
)

vi.mock("../utils/prisma", () => ({
  prisma: {
    syncState: {
      findUnique: vi.fn(async () =>
        state.runningValue === null ? null : { value: state.runningValue }
      ),
    },
  },
}))

vi.mock("../services/anilist/hourlySync.service", () => ({
  runHourlyAniListSync: runHourlyAniListSyncMock,
}))

describe("api/cron/anilist-sync.get", () => {
  beforeEach(() => {
    vi.resetModules()
    runHourlyAniListSyncMock.mockClear()
    state.runningValue = null
  })

  it("returns 409 when sync is already running", async () => {
    state.runningValue = "1"
    const mod = await import("../server/api/cron/anilist-sync.get")

    await expect(mod.default({} as any)).rejects.toMatchObject({
      statusCode: 409,
      statusMessage: "AniList sync already running",
    })
    expect(runHourlyAniListSyncMock).not.toHaveBeenCalled()
  })

  it("runs sync when no active lock exists", async () => {
    state.runningValue = "0"
    runHourlyAniListSyncMock.mockResolvedValueOnce({ synced: 12 })

    const mod = await import("../server/api/cron/anilist-sync.get")
    await expect(mod.default({} as any)).resolves.toEqual({ synced: 12 })
    expect(runHourlyAniListSyncMock).toHaveBeenCalledTimes(1)
  })
})
