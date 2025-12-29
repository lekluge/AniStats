import { defineEventHandler, createError } from "h3"
import { runHourlyAniListSync } from "../../../services/anilist/hourlySync.service"
import { prisma } from "../../../utils/prisma"

export default defineEventHandler(async () => {
  // 🔒 Schutz: nur ein Sync gleichzeitig
  const running = await prisma.syncState.findUnique({
    where: { key: "anilist_sync_running" },
  })

  if (running?.value === "1") {
    throw createError({
      statusCode: 409,
      statusMessage: "AniList sync already running",
    })
  }

  return await runHourlyAniListSync()
})
