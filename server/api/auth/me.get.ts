export default defineEventHandler(async (event) => {
  const token = getCookie(event, "anilist_token")

  if (!token) {
    return { user: null }
  }

  // Minimal: Viewer abfragen (oder du hast bereits user in DB)
  try {
    const viewerRes: any = await $fetch("https://graphql.anilist.co", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: {
        query: `query { Viewer { name } }`,
      },
    })

    const name = viewerRes?.data?.Viewer?.name
    return { user: name ? { name } : null }
  } catch {
    return { user: null }
  }
})