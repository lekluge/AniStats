// server/jobs/anilistSync.job.ts
import { AniListSyncService } from "services/anilistSync.service"

export default defineNitroPlugin(() => {
  const service = new AniListSyncService()

  // alle 6h
  setInterval(async () => {
    try {
      await service.runFullSync()
    } catch (e) {
      console.error("[AniList] Sync failed", e)
    }
  }, 6 * 60 * 60 * 1000)
})
