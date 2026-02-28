import { defineEventHandler, getQuery, createError } from "h3"
import type {
  AniGraphQLResponse,
  AniListCollection,
  AniUserStatusEntry,
} from "../../types/api/anilist"

/* ----------------------------------
 * Helpers
 * ---------------------------------- */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

interface NormalizedStatusEntry {
  mediaId: number
  status: string
}

interface NormalizedStatusList {
  entries: NormalizedStatusEntry[]
}

function isPresent<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined
}

function isNormalizedStatusEntry(
  value: AniUserStatusEntry | null | undefined
): value is NormalizedStatusEntry {
  return (
    isPresent(value) &&
    typeof value.mediaId === "number" &&
    typeof value.status === "string" &&
    value.status.length > 0
  )
}

function normalizeStatusLists(
  response: AniGraphQLResponse<AniListCollection<AniUserStatusEntry>>
): NormalizedStatusList[] {
  const lists =
    response.data && response.data.MediaListCollection
      ? response.data.MediaListCollection.lists ?? []
      : []

  return lists.filter(isPresent).map((list) => ({
    entries: (list.entries ?? []).filter(isNormalizedStatusEntry),
  }))
}

async function aniFetch(
  query: string,
  variables: Record<string, unknown>,
  attempt = 1
): Promise<AniGraphQLResponse<AniListCollection<AniUserStatusEntry>>> {
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

  const lists = normalizeStatusLists(res)

  // Map: animeId -> status
  const statusMap: Record<number, string> = {}

  for (const list of lists) {
    for (const entry of list.entries) {
      statusMap[entry.mediaId] = entry.status
    }
  }

  return {
    ok: true,
    user,
    count: Object.keys(statusMap).length,
    statusMap,
  }
})
