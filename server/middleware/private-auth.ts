import { createError } from "h3"
import crypto from "crypto"
import type { AniViewerIdResponse } from "../types/api/auth"
import {
  clearAniListAuthCookies,
  getAniListAccessToken,
  refreshAniListAccessToken,
} from "../utils/anilistAuth"

const VERIFY_TTL_SECONDS = 60 * 5

function hasViewerId(response: AniViewerIdResponse): boolean {
  if (!response.data || !response.data.Viewer) return false
  return typeof response.data.Viewer.id === "number"
}

async function verifyAniListToken(token: string): Promise<boolean> {
  const storage = useStorage("cache")
  const tokenHash = crypto.createHash("sha1").update(token).digest("hex")
  const cacheKey = `auth:anilist-token-valid:${tokenHash}`
  const cached = await storage.getItem<boolean>(cacheKey)

  if (cached === true) {
    return true
  }

  const res = await $fetch<AniViewerIdResponse>("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: {
      query: "query { Viewer { id } }",
    },
  })

  const isValid = hasViewerId(res)
  if (!isValid) return false

  await storage.setItem(cacheKey, true, { ttl: VERIFY_TTL_SECONDS })
  return true
}

export default defineEventHandler(async (event) => {
  const url = event.node.req.url || ""

  // Protect only private API routes.
  if (!url.startsWith("/api/private")) {
    return
  }

  try {
    let verifiedToken = await getAniListAccessToken(event)
    if (!verifiedToken) {
      console.warn("[auth] rejected request:", {
        url: event.node.req.url,
        reason: "no_token",
        timestamp: new Date().toISOString(),
      })
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      })
    }

    let isValid = await verifyAniListToken(verifiedToken)

    if (!isValid) {
      verifiedToken = await refreshAniListAccessToken(event)
      isValid = verifiedToken ? await verifyAniListToken(verifiedToken) : false
    }

    if (!isValid) {
      console.warn("[auth] rejected request:", {
        url: event.node.req.url,
        reason: "invalid_token",
        timestamp: new Date().toISOString(),
      })
      clearAniListAuthCookies(event)
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      })
    }
  } catch (err: unknown) {
    const statusCode =
      typeof err === "object" &&
      err !== null &&
      "statusCode" in err &&
      typeof (err as { statusCode?: unknown }).statusCode === "number"
        ? (err as { statusCode: number }).statusCode
        : null

    if (statusCode === 401) throw err

    throw createError({
      statusCode: 503,
      statusMessage: "Authentication verification failed",
    })
  }
})
