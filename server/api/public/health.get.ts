import { prisma } from "../../../utils/prisma";

export default defineEventHandler(async (_event) => {
  const start = Date.now();
  let dbStatus: "ok" | "error" = "ok";

  try {
    // simple lightweight query to verify DB is reachable
    await prisma.anime.findFirst({ select: { id: true } });
  } catch {
    dbStatus = "error";
  }

  return {
    ok: dbStatus === "ok",
    time: new Date().toISOString(),
    latencyMs: Date.now() - start,
    database: dbStatus,
  };
});
