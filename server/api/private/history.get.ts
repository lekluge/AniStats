import { prisma } from "../../../utils/prisma"
import { createError } from "h3"
import type {
  AniGraphQLResponse,
  AniHistoryPageData,
  FuzzyDate,
} from "../../types/api/anilist"
import type { AniViewerIdResponse } from "../../types/api/auth"
import type { AnimeWithGenresTags } from "../../types/api/private"

interface HistoryEntry {
  mediaId: number
  startedAt: FuzzyDate | null
  completedAt: FuzzyDate | null
}

function getViewerId(response: AniViewerIdResponse): number | null {
  if (!response.data || !response.data.Viewer) return null
  return typeof response.data.Viewer.id === "number" ? response.data.Viewer.id : null
}

function getPageEntries(
  response: AniGraphQLResponse<AniHistoryPageData>
): { hasNextPage: boolean; entries: HistoryEntry[] } {
  const page = response.data ? response.data.Page : null
  if (!page) {
    return { hasNextPage: false, entries: [] }
  }

  const entries: HistoryEntry[] = (page.mediaList ?? [])
    .filter((entry): entry is { mediaId: number; startedAt?: FuzzyDate | null; completedAt?: FuzzyDate | null } => typeof entry.mediaId === "number")
    .map((entry) => ({
      mediaId: entry.mediaId,
      startedAt: entry.startedAt ?? null,
      completedAt: entry.completedAt ?? null,
    }))

  return {
    hasNextPage: Boolean(page.pageInfo && page.pageInfo.hasNextPage),
    entries,
  }
}

export default defineEventHandler(async (event) => {
  const token = getCookie(event, "anilist_token")

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: "Not authenticated",
    })
  }

  const { start, end } = getQuery(event)

  if (!start || !end) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing date range",
    })
  }

  const toFuzzyDateInt = (dateStr: string) => parseInt(dateStr.replaceAll("-", ""))

  const startInt = toFuzzyDateInt(start as string)
  const endInt = toFuzzyDateInt(end as string)

  /* -----------------------------
   * 1. Viewer ID holen
   * ----------------------------- */
  const viewerRes = await $fetch<AniViewerIdResponse>("https://graphql.anilist.co", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: {
      query: `
        query {
          Viewer {
            id
          }
        }
      `,
    },
  })

  const userId = getViewerId(viewerRes)

  if (!userId) {
    throw createError({
      statusCode: 500,
      statusMessage: "Could not fetch user ID",
    })
  }

  /* -----------------------------
   * 2. Pagination
   * ----------------------------- */
  let page = 1
  let hasNextPage = true

  const allEntries: HistoryEntry[] = []

  while (hasNextPage) {
    const response = await $fetch<AniGraphQLResponse<AniHistoryPageData>>(
      "https://graphql.anilist.co",
      {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: {
        query: `
          query ($userId: Int, $start: FuzzyDateInt, $end: FuzzyDateInt, $page: Int) {
            Page(page: $page, perPage: 50) {
              pageInfo {
                hasNextPage
              }
              mediaList(
                userId: $userId
                type: ANIME
                status: COMPLETED
                completedAt_greater: $start
                completedAt_lesser: $end
              ) {
                mediaId
                startedAt {
                  year
                  month
                  day
                }
                completedAt {
                  year
                  month
                  day
                }
              }
            }
          }
        `,
        variables: {
          userId,
          start: startInt,
          end: endInt,
          page,
        },
      },
      }
    )

    if (response.errors && response.errors.length > 0) {
      console.error(response.errors)
      throw createError({
        statusCode: 500,
        statusMessage: "AniList error",
      })
    }

    const pageResult = getPageEntries(response)
    allEntries.push(...pageResult.entries)
    hasNextPage = pageResult.hasNextPage
    page++
  }

  if (!allEntries.length) {
    return []
  }

  /* -----------------------------
   * 3. DB Join
   * ----------------------------- */
  const uniqueIds = [...new Set(allEntries.map((e) => e.mediaId))]

  const animeRows: AnimeWithGenresTags[] = await prisma.anime.findMany({
    where: { id: { in: uniqueIds } },
    include: {
      genres: true,
      tags: true,
    },
  })

  const animeMap = new Map(animeRows.map((a) => [a.id, a]))
  const activityMap = new Map(allEntries.map((e) => [e.mediaId, e]))

  const result = uniqueIds
    .map((id) => {
      const anime = animeMap.get(id)
      if (!anime) return null

      const activity = activityMap.get(id) ?? null

      return {
        ...anime,
        startedAt: activity ? activity.startedAt : null,
        completedAt: activity ? activity.completedAt : null,
      }
    })
    .filter(Boolean)

  return result
})
