import { beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("../utils/prisma", () => ({
  prisma: {
    anime: {
      findFirst: vi.fn(async () => ({ id: 1 })),
    },
  },
}))

describe("api/public/health.get", () => {
  beforeEach(() => {
    vi.resetModules()
    ;(globalThis as any).defineEventHandler = (handler: any) => handler
  })

  it("returns ok and an ISO timestamp when DB is reachable", async () => {
    const mod = await import("../server/api/public/health.get")
    const out = await mod.default()

    expect(out.ok).toBe(true)
    expect(out.database).toBe("ok")
    expect(typeof out.time).toBe("string")
    expect(new Date(out.time).toString()).not.toBe("Invalid Date")
    expect(typeof out.latencyMs).toBe("number")
  })

  it("returns ok=false when DB is unreachable", async () => {
    const { prisma } = await import("../utils/prisma")
    vi.mocked(prisma.anime.findFirst).mockRejectedValueOnce(new Error("connection refused"))

    const mod = await import("../server/api/public/health.get")
    const out = await mod.default()

    expect(out.ok).toBe(false)
    expect(out.database).toBe("error")
  })
})
