import { createError, defineEventHandler } from "h3";
import { runHourlyAniListSync } from "../../../services/anilist/hourlySync.service";
import { prisma } from "../../../utils/prisma";

export default defineEventHandler(async () => {
  const running = await prisma.syncState.findUnique({
    where: { key: "anilist_sync_running" },
  });

  if (running?.value) {
    const startedAt = Number(running.value);
    const TWO_HOURS_MS = 2 * 60 * 60 * 1000;
    if (!isNaN(startedAt) && Date.now() - startedAt < TWO_HOURS_MS) {
      throw createError({
        statusCode: 409,
        statusMessage: "AniList sync already running",
      });
    }
    if (!isNaN(startedAt)) {
      console.warn(
        `[AniList Sync] Stale lock detected (started ${new Date(startedAt).toISOString()}), proceeding anyway`
      );
    }
  }

  return runHourlyAniListSync();
});
