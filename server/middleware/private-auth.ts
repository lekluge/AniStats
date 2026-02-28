import { getCookie, createError, deleteCookie } from "h3"
import crypto from "crypto"

const VERIFY_TTL_SECONDS = 60 * 5

async function verifyAniListToken(token: string): Promise<boolean> {
  const storage = useStorage("cache")
  const tokenHash = crypto.createHash("sha1").update(token).digest("hex")
  const cacheKey = `auth:anilist-token-valid:${tokenHash}`
  const cached = await storage.getItem<boolean>(cacheKey)

  if (cached === true) {
    return true
  }

  const res: any = await $fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: {
      query: "query { Viewer { id } }",
    },
  })

  const isValid = Boolean(res?.data?.Viewer?.id)
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

  const token = getCookie(event, "anilist_token")
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    })
  }

  try {
    const isValid = await verifyAniListToken(token)

    if (!isValid) {
      deleteCookie(event, "anilist_token", { path: "/" })
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized",
      })
    }
  } catch (err: any) {
    if (err?.statusCode === 401) throw err

    throw createError({
      statusCode: 503,
      statusMessage: "Authentication verification failed",
    })
  }
})
