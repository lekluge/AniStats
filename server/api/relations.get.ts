import { defineEventHandler } from "h3"
import { prisma } from "../utils/prisma"

/* ----------------------------------
 * Config
 * ---------------------------------- */
const STORY_RELATIONS = new Set([
  "PREQUEL",
  "SEQUEL",
  "SIDE_STORY",
  "SPIN_OFF",
  "SUMMARY",
  "ADAPTATION",
  "ALTERNATIVE",
  "COMPILATION",
])

const TYPE_SCORE: Record<string, number> = {
  TV: 100,
  ONA: 80,
  OVA: 70,
  MOVIE: 60,
  SPECIAL: 50,
  MUSIC: 10,
}

/* ----------------------------------
 * Helpers
 * ---------------------------------- */
function relationLabel(type: string) {
  return type
    .replace("_", " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase())
}

function pickRoot(cluster: any[]) {
  return [...cluster].sort((a, b) => {
    const scoreA =
      (TYPE_SCORE[a.format] ?? 0) -
      ((a.relationsTo ?? []).some(
        (r) => r.relationType === "PREQUEL"
      )
        ? 20
        : 0)

    const scoreB =
      (TYPE_SCORE[b.format] ?? 0) -
      ((b.relationsTo ?? []).some(
        (r) => r.relationType === "PREQUEL"
      )
        ? 20
        : 0)

    return scoreB - scoreA
  })[0]
}

/* ----------------------------------
 * Handler
 * ---------------------------------- */
export default defineEventHandler(async () => {
  const anime = await prisma.anime.findMany({
    include: {
      relationsFrom: { include: { to: true } },
      relationsTo: { include: { from: true } },
    },
  })

  const visited = new Set<number>()
  const groups: any[] = []

  for (const start of anime) {
    if (visited.has(start.id)) continue

    /* ----------------------------------
     * BFS → Franchise-Cluster
     * ---------------------------------- */
    const queue = [start]
    const cluster: any[] = []

    visited.add(start.id)

    while (queue.length) {
      const current = queue.shift()!
      cluster.push(current)

      const neighbors = [
        ...(current.relationsFrom ?? [])
          .filter((r) => STORY_RELATIONS.has(r.relationType))
          .map((r) => r.to),
        ...(current.relationsTo ?? [])
          .filter((r) => STORY_RELATIONS.has(r.relationType))
          .map((r) => r.from),
      ]

      for (const n of neighbors) {
        if (!visited.has(n.id)) {
          visited.add(n.id)
          queue.push(n)
        }
      }
    }

    /* ----------------------------------
     * Root bestimmen (TV > OVA > Movie)
     * ---------------------------------- */
    const root = pickRoot(cluster)

    /* ----------------------------------
     * Chain = PREQUEL / SEQUEL
     * ---------------------------------- */
    const chain = cluster
      .filter((a) =>
        [...(a.relationsFrom ?? []), ...(a.relationsTo ?? [])].some(
          (r) =>
            r.relationType === "PREQUEL" ||
            r.relationType === "SEQUEL"
        )
      )
      .sort((a, b) => {
        // Hauptserie zuerst, dann grob stabil
        const sa = TYPE_SCORE[a.format] ?? 0
        const sb = TYPE_SCORE[b.format] ?? 0
        return sb - sa || a.id - b.id
      })

    /* ----------------------------------
     * Related = alles andere
     * ---------------------------------- */
    const related = cluster
      .filter((a) => a.id !== root.id && !chain.includes(a))
      .map((a) => {
        const rel =
          a.relationsFrom?.find((r) =>
            STORY_RELATIONS.has(r.relationType)
          ) ??
          a.relationsTo?.find((r) =>
            STORY_RELATIONS.has(r.relationType)
          )

        return {
          id: a.id,
          titleEn: a.titleEn,
          titleRo: a.titleRo,
          cover: a.cover,
          relationLabel: rel
            ? relationLabel(rel.relationType)
            : "Related",
        }
      })

    groups.push({
      rootId: root.id,
      rootTitleEn: root.titleEn,
      rootTitleRo: root.titleRo,
      rootCover: root.cover,

      chain: chain.map((a) => ({
        id: a.id,
        titleEn: a.titleEn,
        titleRo: a.titleRo,
        cover: a.cover,
      })),

      related,
    })
  }

  return {
    ok: true,
    count: groups.length,
    groups,
  }
})
