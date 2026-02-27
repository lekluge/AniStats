import { getCookie, createError } from "h3"

export default defineEventHandler((event) => {
  const url = event.node.req.url || ""

  // Nur private Routes schützen
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
})