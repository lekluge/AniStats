import { beforeEach, describe, expect, it, vi } from "vitest"

function createEvent() {
  return {} as any
}

describe("api/auth/login.get", () => {
  beforeEach(() => {
    vi.resetModules()
    ;(globalThis as any).defineEventHandler = (handler: any) => handler
    ;(globalThis as any).useRuntimeConfig = () => ({
      anilistClientId: "client-123",
      anilistRedirectUri: "http://localhost:3000/api/auth/callback",
    })
    ;(globalThis as any).sendRedirect = vi.fn((_event: any, url: string) => url)
  })

  it("builds AniList oauth URL and redirects", async () => {
    const mod = await import("../server/api/auth/login.get")
    const out = await mod.default(createEvent())

    expect(out).toContain("https://anilist.co/api/v2/oauth/authorize")
    expect(out).toContain("client_id=client-123")
    expect(out).toContain(
      encodeURIComponent("http://localhost:3000/api/auth/callback")
    )
    expect(out).toContain("response_type=code")
  })
})

describe("api/auth/callback.get", () => {
  beforeEach(() => {
    vi.resetModules()
    ;(globalThis as any).defineEventHandler = (handler: any) => handler
    ;(globalThis as any).createError = vi.fn((input: any) => {
      const err = new Error(input.statusMessage) as any
      err.statusCode = input.statusCode
      err.statusMessage = input.statusMessage
      return err
    })
    ;(globalThis as any).useRuntimeConfig = () => ({
      anilistClientId: "client-123",
      anilistClientSecret: "secret-abc",
      anilistRedirectUri: "http://localhost:3000/api/auth/callback",
    })
    ;(globalThis as any).getQuery = vi.fn(() => ({}))
    ;(globalThis as any).setCookie = vi.fn()
    ;(globalThis as any).sendRedirect = vi.fn((_event: any, to: string) => to)
    ;(globalThis as any).$fetch = vi.fn()
  })

  it("throws 400 when code is missing", async () => {
    const mod = await import("../server/api/auth/callback.get")

    await expect(mod.default(createEvent())).rejects.toMatchObject({
      statusCode: 400,
      statusMessage: "Missing code",
    })
  })

  it("stores token and redirects on valid oauth exchange", async () => {
    ;(globalThis as any).getQuery = vi.fn(() => ({ code: "abc123" }))
    ;(globalThis as any).$fetch = vi.fn(async () => ({ access_token: "token-1" }))

    const mod = await import("../server/api/auth/callback.get")
    const out = await mod.default(createEvent())

    expect((globalThis as any).setCookie).toHaveBeenCalledWith(
      expect.anything(),
      "anilist_token",
      "token-1",
      expect.objectContaining({ httpOnly: true, path: "/" })
    )
    expect(out).toBe("/")
  })
})

describe("api/auth/logout.post", () => {
  beforeEach(() => {
    vi.resetModules()
    ;(globalThis as any).defineEventHandler = (handler: any) => handler
    ;(globalThis as any).deleteCookie = vi.fn()
    ;(globalThis as any).sendRedirect = vi.fn((_event: any, to: string) => to)
  })

  it("deletes auth cookie and redirects to home", async () => {
    const mod = await import("../server/api/auth/logout.post")
    const out = await mod.default(createEvent())

    expect((globalThis as any).deleteCookie).toHaveBeenCalledWith(
      expect.anything(),
      "anilist_token",
      { path: "/" }
    )
    expect(out).toBe("/")
  })
})

describe("api/auth/me.get", () => {
  beforeEach(() => {
    vi.resetModules()
    ;(globalThis as any).defineEventHandler = (handler: any) => handler
    ;(globalThis as any).getCookie = vi.fn(() => undefined)
    ;(globalThis as any).$fetch = vi.fn()
  })

  it("returns null user without token", async () => {
    const mod = await import("../server/api/auth/me.get")
    await expect(mod.default(createEvent())).resolves.toEqual({ user: null })
  })

  it("returns viewer name for valid token", async () => {
    ;(globalThis as any).getCookie = vi.fn(() => "token-abc")
    ;(globalThis as any).$fetch = vi.fn(async () => ({
      data: { Viewer: { name: "Leon" } },
    }))

    const mod = await import("../server/api/auth/me.get")
    await expect(mod.default(createEvent())).resolves.toEqual({
      user: { name: "Leon" },
    })
  })

  it("returns null user if AniList call fails", async () => {
    ;(globalThis as any).getCookie = vi.fn(() => "token-abc")
    ;(globalThis as any).$fetch = vi.fn(async () => {
      throw new Error("request failed")
    })

    const mod = await import("../server/api/auth/me.get")
    await expect(mod.default(createEvent())).resolves.toEqual({ user: null })
  })
})
