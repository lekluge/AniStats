import { defineEventHandler } from "h3";
import { runHourlyAniListSync } from "../../../services/anilist/hourlySync.service";

export default defineEventHandler(async () => {
  return runHourlyAniListSync();
});
