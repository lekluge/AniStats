import { createError, defineEventHandler, getHeader } from "h3";
import { runHourlyAniListSync } from "../../../services/anilist/hourlySync.service";
import { prisma } from "../../../utils/prisma";

export default defineEventHandler(async (event) => {
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = getHeader(event, "authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }
  } else {
    console.warn("[cron] CRON_SECRET is not set – endpoint is unprotected");
  }

  const running = await prisma.syncState.findUnique({
    where: { key: "anilist_sync_running" },
  });

  if (running?.value === "1") {
    throw createError({
      statusCode: 409,
      statusMessage: "AniList sync already running",
    });
  }

  return runHourlyAniListSync();
});
