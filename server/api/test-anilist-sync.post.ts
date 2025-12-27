import { AniListSyncService } from "../../services/anilistSync.service"

export default defineEventHandler(async () => {
  const service = new AniListSyncService()

  // 🔥 Background starten
  service.runFullSync().catch((err) => {
    console.error("[AniList] Sync failed", err)
  })

  // ⏳ Kurz warten auf erste ETA (max 3s)
  const timeoutMs = 3000
  const start = Date.now()

  while (!service.getInitialEta()) {
    if (Date.now() - start > timeoutMs) break
    await new Promise((r) => setTimeout(r, 100))
  }

  return {
    ok: true,
    status: "started",
    phase: 1,
    eta: service.getInitialEta() ?? "calculating…",
  }
})
