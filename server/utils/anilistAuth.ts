import type { H3Event } from "h3"
import type { AniOAuthTokenResponse } from "../types/api/auth"

const ACCESS_TOKEN_COOKIE = "anilist_token"
const REFRESH_TOKEN_COOKIE = "anilist_refresh_token"
const EXPIRES_AT_COOKIE = "anilist_token_expires_at"
const REFRESH_SKEW_SECONDS = 60
const DEFAULT_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 365

function getCookieOptions(maxAgeSeconds = DEFAULT_COOKIE_MAX_AGE_SECONDS) {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: maxAgeSeconds,
    expires: new Date(Date.now() + maxAgeSeconds * 1000),
  }
}

export function clearAniListAuthCookies(event: H3Event) {
  deleteCookie(event, ACCESS_TOKEN_COOKIE, { path: "/" })
  deleteCookie(event, REFRESH_TOKEN_COOKIE, { path: "/" })
  deleteCookie(event, EXPIRES_AT_COOKIE, { path: "/" })
}

export function setAniListAuthCookies(event: H3Event, tokenResponse: AniOAuthTokenResponse) {
  const { access_token, refresh_token, expires_in } = tokenResponse
  const cookieMaxAge = typeof expires_in === "number" && Number.isFinite(expires_in)
    ? expires_in
    : DEFAULT_COOKIE_MAX_AGE_SECONDS

  if (!access_token) {
    throw createError({ statusCode: 500, statusMessage: "No access token received" })
  }

  setCookie(event, ACCESS_TOKEN_COOKIE, access_token, getCookieOptions(cookieMaxAge))

  if (refresh_token) {
    setCookie(event, REFRESH_TOKEN_COOKIE, refresh_token, getCookieOptions(DEFAULT_COOKIE_MAX_AGE_SECONDS))
  }

  if (typeof expires_in === "number" && Number.isFinite(expires_in)) {
    const expiresAt = Date.now() + expires_in * 1000
    setCookie(event, EXPIRES_AT_COOKIE, String(expiresAt), getCookieOptions(cookieMaxAge))
  } else {
    deleteCookie(event, EXPIRES_AT_COOKIE, { path: "/" })
  }
}

export function getAniListAccessTokenFromCookies(event: H3Event): string | null {
  const token = getCookie(event, ACCESS_TOKEN_COOKIE)
  return typeof token === "string" && token.length > 0 ? token : null
}

function getAniListRefreshTokenFromCookies(event: H3Event): string | null {
  const token = getCookie(event, REFRESH_TOKEN_COOKIE)
  return typeof token === "string" && token.length > 0 ? token : null
}

function getAniListExpiresAt(event: H3Event): number | null {
  const value = getCookie(event, EXPIRES_AT_COOKIE)
  if (!value) return null

  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

function shouldRefreshAccessToken(event: H3Event): boolean {
  const expiresAt = getAniListExpiresAt(event)
  if (!expiresAt) return false

  return Date.now() >= expiresAt - REFRESH_SKEW_SECONDS * 1000
}

export async function refreshAniListAccessToken(event: H3Event): Promise<string | null> {
  const refreshToken = getAniListRefreshTokenFromCookies(event)

  if (!refreshToken) {
    return null
  }

  const config = useRuntimeConfig()
  const params = new URLSearchParams({
    grant_type: "refresh_token",
    client_id: config.anilistClientId,
    client_secret: config.anilistClientSecret,
    refresh_token: refreshToken,
  })

  try {
    const tokenRes = await $fetch<AniOAuthTokenResponse>(
      "https://anilist.co/api/v2/oauth/token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      }
    )

    setAniListAuthCookies(event, tokenRes)
    return tokenRes.access_token ?? null
  } catch {
    clearAniListAuthCookies(event)
    return null
  }
}

export async function getAniListAccessToken(event: H3Event): Promise<string | null> {
  const accessToken = getAniListAccessTokenFromCookies(event)

  if (!accessToken) {
    return await refreshAniListAccessToken(event)
  }

  if (!shouldRefreshAccessToken(event)) {
    return accessToken
  }

  return (await refreshAniListAccessToken(event)) ?? accessToken
}
