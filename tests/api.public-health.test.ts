import { beforeEach, describe, expect, it } from "vitest"

describe("api/public/health.get", () => {
  beforeEach(() => {
    ;(globalThis as any).defineEventHandler = (handler: any) => handler
  })

  it("returns ok and an ISO timestamp", async () => {
    const mod = await import("../server/api/public/health.get")
    const out = await mod.default()

    expect(out.ok).toBe(true)
    expect(typeof out.time).toBe("string")
    expect(new Date(out.time).toString()).not.toBe("Invalid Date")
  })
})
