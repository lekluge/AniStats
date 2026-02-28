import { beforeEach, describe, expect, it, vi } from "vitest"

const h3State = {
  token: undefined as string | undefined,
}

const getCookieMock = vi.fn(() => h3State.token)
const deleteCookieMock = vi.fn()
const createErrorMock = vi.fn((input: { statusCode: number; statusMessage: string }) => {
  const err = new Error(input.statusMessage) as Error & {
    statusCode: number
    statusMessage: string
  }
  err.statusCode = input.statusCode
  err.statusMessage = input.statusMessage
  return err
})

vi.mock("h3", () => ({
  getCookie: getCookieMock,
  deleteCookie: deleteCookieMock,
  createError: createErrorMock,
}))

type CacheEntry = {
  value: boolean
  ttl: number
}

const cache = new Map<string, CacheEntry>()

const storageGetItemMock = vi.fn(async (key: string) => cache.get(key)?.value)
const storageSetItemMock = vi.fn(
  async (key: string, value: boolean, options: { ttl: number }) => {
    cache.set(key, { value, ttl: options.ttl })
  }
)

function createEvent(url: string) {
  return { node: { req: { url } } } as any
}

function installNuxtGlobals(fetchImpl: ReturnType<typeof vi.fn>) {
  ;(globalThis as any).defineEventHandler = (handler: any) => handler
  ;(globalThis as any).useStorage = vi.fn(() => ({
    getItem: storageGetItemMock,
    setItem: storageSetItemMock,
  }))
  ;(globalThis as any).$fetch = fetchImpl
}

async function loadHandler() {
  const mod = await import("../server/middleware/private-auth")
  return mod.default
}

describe("server/middleware/private-auth", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    cache.clear()
    h3State.token = undefined
  })

  it("ignores non-private routes", async () => {
    const fetchMock = vi.fn()
    installNuxtGlobals(fetchMock)
    const handler = await loadHandler()

    await expect(handler(createEvent("/api/public/health"))).resolves.toBeUndefined()
    expect(getCookieMock).not.toHaveBeenCalled()
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("rejects missing token on private routes", async () => {
    const fetchMock = vi.fn()
    installNuxtGlobals(fetchMock)
    const handler = await loadHandler()

    await expect(handler(createEvent("/api/private/recommendation"))).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: "Unauthorized",
    })
  })

  it("accepts valid token and writes verification cache", async () => {
    h3State.token = "valid-token"
    const fetchMock = vi.fn(async () => ({ data: { Viewer: { id: 123 } } }))
    installNuxtGlobals(fetchMock)
    const handler = await loadHandler()

    await expect(handler(createEvent("/api/private/recommendation"))).resolves.toBeUndefined()
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(storageSetItemMock).toHaveBeenCalledTimes(1)
    expect(deleteCookieMock).not.toHaveBeenCalled()
  })

  it("uses cache for subsequent requests with the same token", async () => {
    h3State.token = "cached-token"
    const fetchMock = vi.fn(async () => ({ data: { Viewer: { id: 77 } } }))
    installNuxtGlobals(fetchMock)
    const handler = await loadHandler()

    await handler(createEvent("/api/private/recommendation"))
    await handler(createEvent("/api/private/recommendation"))

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("rejects invalid tokens and deletes cookie", async () => {
    h3State.token = "invalid-token"
    const fetchMock = vi.fn(async () => ({ data: { Viewer: null } }))
    installNuxtGlobals(fetchMock)
    const handler = await loadHandler()

    await expect(handler(createEvent("/api/private/recommendation"))).rejects.toMatchObject({
      statusCode: 401,
      statusMessage: "Unauthorized",
    })
    expect(deleteCookieMock).toHaveBeenCalledTimes(1)
  })

  it("returns 503 when token verification fails unexpectedly", async () => {
    h3State.token = "maybe-valid"
    const fetchMock = vi.fn(async () => {
      throw new Error("network down")
    })
    installNuxtGlobals(fetchMock)
    const handler = await loadHandler()

    await expect(handler(createEvent("/api/private/recommendation"))).rejects.toMatchObject({
      statusCode: 503,
      statusMessage: "Authentication verification failed",
    })
  })
})
