import { defineEventHandler, getQuery, createError } from "h3"

/* ----------------------------------
 * Helpers
 * ---------------------------------- */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function aniFetch(
  query: string,
  variables: any,
  attempt = 1
): Promise<any> {
  const res = await fetch("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ query, variables }),
  })

  if (res.status === 429) {
    if (attempt >= 5) {
      throw createError({
        statusCode: 429,
        statusMessage: "AniList rate limit exceeded",
      })
    }

    const retryAfter = res.headers.get("retry-after")
    const waitMs = retryAfter
      ? Number(retryAfter) * 1000
      : 1000 * Math.pow(2, attempt)

    console.warn(`[AniList] 429 – retry ${attempt}/5 in ${waitMs}ms`)
    await sleep(waitMs)
    return aniFetch(query, variables, attempt + 1)
  }

  if (!res.ok) {
    throw createError({
      statusCode: res.status,
      statusMessage: await res.text(),
    })
  }

  return res.json()
}

/* ----------------------------------
 * Query – User list (IDs + status)
 * ---------------------------------- */
const USER_LIST_QUERY = `
  query ($user: String!) {
    MediaListCollection(userName: $user, type: ANIME) {
      lists {
        entries {
          mediaId
          status
        }
      }
    }
  }
`

/* ----------------------------------
 * Handler
 * ---------------------------------- */
export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const user = String(q.user ?? "").trim()

  if (!user) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing query param: user",
    })
  }

  // kleiner Delay, damit du nicht direkt bei Spammen reinläufst
  await sleep(300)

  const res = await aniFetch(USER_LIST_QUERY, { user })

  const lists = res?.data?.MediaListCollection?.lists ?? []

  // Map: animeId -> status
  const statusMap: Record<number, string> = {}

  for (const list of lists) {
    const entries = list?.entries ?? []
    for (const e of entries) {
      const id = e?.mediaId
      const status = e?.status
      if (!id || !status) continue
      statusMap[id] = status
    }
  }

  return {
    ok: true,
    user,
    count: Object.keys(statusMap).length,
    statusMap,
  }
})
