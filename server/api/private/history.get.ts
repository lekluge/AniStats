import { prisma } from "../../../utils/prisma"
import { createError } from "h3"

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
  const viewerRes: any = await $fetch("https://graphql.anilist.co", {
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

  const userId = viewerRes?.data?.Viewer?.id

  if (!userId) {
    throw createError({
      statusCode: 500,
      statusMessage: "Could not fetch user ID",
    })
  }

  /* -----------------------------
   * 2. Pagination
   * ----------------------------- */
  type FuzzyDate = { year: number; month: number; day: number }

  let page = 1
  let hasNextPage = true

  const allEntries: {
    mediaId: number
    startedAt: FuzzyDate | null
    completedAt: FuzzyDate | null
  }[] = []

  while (hasNextPage) {
    const response: any = await $fetch("https://graphql.anilist.co", {
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
    })

    if (response.errors) {
      console.error(response.errors)
      throw createError({
        statusCode: 500,
        statusMessage: "AniList error",
      })
    }

    const pageData = response.data.Page

    allEntries.push(
      ...pageData.mediaList.map((e: any) => ({
        mediaId: e.mediaId,
        startedAt: e.startedAt ?? null,
        completedAt: e.completedAt ?? null,
      }))
    )

    hasNextPage = pageData.pageInfo.hasNextPage
    page++
  }

  if (!allEntries.length) {
    return []
  }

  /* -----------------------------
   * 3. DB Join
   * ----------------------------- */
  const uniqueIds = [...new Set(allEntries.map((e) => e.mediaId))]

  const animeRows = await prisma.anime.findMany({
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

      const activity = activityMap.get(id)

      return {
        ...anime,
        startedAt: activity?.startedAt ?? null,
        completedAt: activity?.completedAt ?? null,
      }
    })
    .filter(Boolean)

  return result
})