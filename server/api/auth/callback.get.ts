import type { AniOAuthTokenResponse } from "../../types/api/auth"
import { setAniListAuthCookies } from "../../utils/anilistAuth"

export default defineEventHandler(async (event) => {
  const { code } = getQuery(event);
  const authCode = typeof code === "string" ? code : null;

  if (!authCode) {
    throw createError({ statusCode: 400, statusMessage: "Missing code" });
  }

  const config = useRuntimeConfig();

  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: config.anilistClientId,
    client_secret: config.anilistClientSecret,
    redirect_uri: config.anilistRedirectUri,
    code: authCode,
  });

  const tokenRes = await $fetch<AniOAuthTokenResponse>(
    "https://anilist.co/api/v2/oauth/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    }
  );
  console.log("Received AniList token response:", tokenRes);
  setAniListAuthCookies(event, tokenRes);

  return sendRedirect(event, "/");
});
