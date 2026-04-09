import { createError, defineEventHandler } from "h3";
import { runHourlyAniListSync } from "../../../services/anilist/hourlySync.service";

export default defineEventHandler(async () => {
  if (process.env.NODE_ENV !== "development") {
    throw createError({ statusCode: 404, statusMessage: "Not Found" });
  }

  return runHourlyAniListSync();
});
