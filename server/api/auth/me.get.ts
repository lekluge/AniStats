import type { AniViewerNameResponse } from "../../types/api/auth"
import { getAniListAccessToken } from "../../utils/anilistAuth"

function getViewerName(response: AniViewerNameResponse): string | null {
  if (!response.data || !response.data.Viewer) return null;
  const name = response.data.Viewer.name;
  return typeof name === "string" && name.length > 0 ? name : null;
}

export default defineEventHandler(async (event) => {
  const token = await getAniListAccessToken(event);

  if (!token) {
    return { user: null };
  }

  try {
    const viewerRes = await $fetch<AniViewerNameResponse>(
      "https://graphql.anilist.co",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: {
          query: `query { Viewer { name } }`,
        },
      }
    );

    const name = getViewerName(viewerRes);
    return { user: name ? { name } : null };
  } catch {
    return { user: null };
  }
});
