// /server/api/dev/anilist-sync.get.ts
import { runHourlyAniListSync } from "../../../services/anilist/hourlySync.service"

export default defineEventHandler(async () => {
  return await runHourlyAniListSync()
})
