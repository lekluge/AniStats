export default defineEventHandler(async (event) => {
  const { code } = getQuery(event)

  if (!code) {
    throw createError({ statusCode: 400, statusMessage: "Missing code" })
  }

  const config = useRuntimeConfig()

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.anilistClientId,
    client_secret: config.anilistClientSecret,
    redirect_uri: config.anilistRedirectUri,
    code: String(code),
  })

  const tokenRes: any = await $fetch("https://anilist.co/api/v2/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  })

  const token = tokenRes.access_token

  if (!token) {
    throw createError({ statusCode: 500, statusMessage: "No token received" })
  }

  setCookie(event, "anilist_token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  })

  return sendRedirect(event, "/")
})