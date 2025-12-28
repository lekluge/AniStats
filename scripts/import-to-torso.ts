// scripts/import-to-turso.ts
import "dotenv/config"
import Database from "better-sqlite3"
import { createClient, type Client } from "@libsql/client"

const LOCAL_DB_PATH = process.env.LOCAL_DB_PATH ?? "./tmp/dev.db"
const TURSO_URL = process.env.DATABASE_URL
const TURSO_TOKEN = process.env.DATABASE_AUTH_TOKEN

if (!TURSO_URL) throw new Error("Missing DATABASE_URL")
if (!TURSO_TOKEN) throw new Error("Missing DATABASE_AUTH_TOKEN")

/**
 * Controls
 * - CLEAR_TARGET: true = target tables werden geleert (Default: true)
 * - ONLY: optional "anime" | "genres" | "tags" | "relations" | "all" (Default: all)
 */
const CLEAR_TARGET = (process.env.CLEAR_TARGET ?? "true") === "true"
const ONLY = (process.env.ONLY ?? "all").toLowerCase()

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function exec(client: Client, sql: string, args: any[] = []) {
  return client.execute({ sql, args })
}

/* ----------------------------------
 * Schema (minimal passend zu Prisma)
 * ---------------------------------- */
async function ensureSchema(client: Client) {
  await exec(client, `PRAGMA foreign_keys = ON;`)

  await exec(
    client,
    `
CREATE TABLE IF NOT EXISTS Anime (
  id        INTEGER PRIMARY KEY,
  titleEn   TEXT,
  titleRo   TEXT,
  cover     TEXT,
  format    TEXT,
  createdAt TEXT DEFAULT (datetime('now')),
  updatedAt TEXT DEFAULT (datetime('now')),
  dataHash  TEXT
);
`.trim()
  )

  await exec(
    client,
    `
CREATE TABLE IF NOT EXISTS AnimeGenre (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  animeId INTEGER NOT NULL,
  name    TEXT NOT NULL,
  FOREIGN KEY (animeId) REFERENCES Anime(id) ON DELETE CASCADE,
  UNIQUE (animeId, name)
);
`.trim()
  )

  await exec(
    client,
    `
CREATE TABLE IF NOT EXISTS AnimeTag (
  id      INTEGER PRIMARY KEY AUTOINCREMENT,
  animeId INTEGER NOT NULL,
  tagId   INTEGER NOT NULL,
  name    TEXT NOT NULL,
  rank    INTEGER,
  isAdult INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (animeId) REFERENCES Anime(id) ON DELETE CASCADE,
  UNIQUE (animeId, tagId)
);
`.trim()
  )

  await exec(
    client,
    `
CREATE TABLE IF NOT EXISTS AnimeRelation (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  fromId       INTEGER NOT NULL,
  toId         INTEGER NOT NULL,
  relationType TEXT NOT NULL,
  FOREIGN KEY (fromId) REFERENCES Anime(id) ON DELETE CASCADE,
  FOREIGN KEY (toId)   REFERENCES Anime(id) ON DELETE CASCADE,
  UNIQUE (fromId, toId, relationType)
);
`.trim()
  )
}

/* ----------------------------------
 * Speed Pragmas (nur für Import)
 * ---------------------------------- */
async function enableFastImportMode(client: Client) {
  // foreign_keys ist ok
  await exec(client, `PRAGMA foreign_keys = ON;`)

  // OPTIONAL – wenn du willst, kannst du das try/catchen
  try {
    await exec(client, `PRAGMA synchronous = NORMAL;`)
  } catch {
    /* ignored – some Turso plans block it */
  }

  // ❌ NICHT verwenden bei Turso:
  // PRAGMA journal_mode
  // PRAGMA temp_store
  // PRAGMA cache_size
}

/* ----------------------------------
 * Clear Target
 * ---------------------------------- */
async function clearTarget(client: Client) {
  // Reihenfolge wegen FK
  await exec(client, `DELETE FROM AnimeRelation;`)
  await exec(client, `DELETE FROM AnimeTag;`)
  await exec(client, `DELETE FROM AnimeGenre;`)
  await exec(client, `DELETE FROM Anime;`)
}

/* ----------------------------------
 * Multi-row insert helpers
 * ---------------------------------- */
function placeholders(rows: number, cols: number) {
  const one = `(${Array.from({ length: cols }).fill("?").join(",")})`
  return Array.from({ length: rows }).fill(one).join(",")
}

/* ----------------------------------
 * Imports (Batched Multi-Row)
 * ---------------------------------- */
async function importAnime(client: Client, db: Database.Database) {
  const rows = db.prepare(`SELECT * FROM Anime`).all() as any[]
  console.log(`[import] Anime: ${rows.length}`)

  const BATCH = 2000
  for (const batch of chunk(rows, BATCH)) {
    const sql = `
INSERT INTO Anime (id, titleEn, titleRo, cover, format, createdAt, updatedAt, dataHash)
VALUES ${placeholders(batch.length, 8)}
ON CONFLICT(id) DO UPDATE SET
  titleEn=excluded.titleEn,
  titleRo=excluded.titleRo,
  cover=excluded.cover,
  format=excluded.format,
  createdAt=excluded.createdAt,
  updatedAt=excluded.updatedAt,
  dataHash=excluded.dataHash;
`.trim()

    const args: any[] = []
    for (const r of batch) {
      args.push(
        r.id ?? null,
        r.titleEn ?? null,
        r.titleRo ?? null,
        r.cover ?? null,
        r.format ?? null,
        r.createdAt ?? null,
        r.updatedAt ?? null,
        r.dataHash ?? null
      )
    }

    await exec(client, sql, args)
  }
}

async function importGenres(client: Client, db: Database.Database) {
  const rows = db.prepare(`SELECT animeId, name FROM AnimeGenre`).all() as any[]
  console.log(`[import] AnimeGenre: ${rows.length}`)

  const BATCH = 1000
  for (const batch of chunk(rows, BATCH)) {
    const sql = `
INSERT INTO AnimeGenre (animeId, name)
VALUES ${placeholders(batch.length, 2)}
ON CONFLICT(animeId, name) DO NOTHING;
`.trim()

    const args: any[] = []
    for (const r of batch) args.push(r.animeId ?? null, r.name ?? null)
    await exec(client, sql, args)
  }
}

async function importTags(client: Client, db: Database.Database) {
  const rows = db
    .prepare(`SELECT animeId, tagId, name, rank, isAdult FROM AnimeTag`)
    .all() as any[]
  console.log(`[import] AnimeTag: ${rows.length}`)

  const BATCH = 1000
  for (const batch of chunk(rows, BATCH)) {
    const sql = `
INSERT INTO AnimeTag (animeId, tagId, name, rank, isAdult)
VALUES ${placeholders(batch.length, 5)}
ON CONFLICT(animeId, tagId) DO UPDATE SET
  name=excluded.name,
  rank=excluded.rank,
  isAdult=excluded.isAdult;
`.trim()

    const args: any[] = []
    for (const r of batch) {
      args.push(
        r.animeId ?? null,
        r.tagId ?? null,
        r.name ?? null,
        r.rank ?? null,
        r.isAdult ? 1 : 0
      )
    }
    await exec(client, sql, args)
  }
}

async function importRelations(client: Client, db: Database.Database) {
  const rows = db
    .prepare(`SELECT fromId, toId, relationType FROM AnimeRelation`)
    .all() as any[]
  console.log(`[import] AnimeRelation: ${rows.length}`)

  const BATCH = 1000
  for (const batch of chunk(rows, BATCH)) {
    const sql = `
INSERT INTO AnimeRelation (fromId, toId, relationType)
VALUES ${placeholders(batch.length, 3)}
ON CONFLICT(fromId, toId, relationType) DO NOTHING;
`.trim()

    const args: any[] = []
    for (const r of batch) args.push(r.fromId ?? null, r.toId ?? null, r.relationType ?? null)
    await exec(client, sql, args)
  }
}

/* ----------------------------------
 * Main
 * ---------------------------------- */
async function main() {
  const local = new Database(LOCAL_DB_PATH, { readonly: true })
  console.log(`[local] opened ${LOCAL_DB_PATH}`)

  const client = createClient({
    url: TURSO_URL!,
    authToken: TURSO_TOKEN!,
  })

  console.log(`[turso] ensure schema...`)
  await ensureSchema(client)

  console.log(`[turso] fast import mode...`)
  await enableFastImportMode(client)

  // Alles in eine Transaction = MASSIV schneller
  console.log(`[turso] BEGIN TRANSACTION`)
  await exec(client, "BEGIN")

  try {
    if (CLEAR_TARGET) {
      console.log(`[turso] clear target tables...`)
      await clearTarget(client)
    }

    const doAll = ONLY === "all"
    if (doAll || ONLY === "anime") await importAnime(client, local)
    if (doAll || ONLY === "genres") await importGenres(client, local)
    if (doAll || ONLY === "tags") await importTags(client, local)
    if (doAll || ONLY === "relations") await importRelations(client, local)

    console.log(`[turso] COMMIT`)
    await exec(client, "COMMIT")
    console.log(`[done] import finished ✅`)
  } catch (e) {
    console.error(`[turso] ROLLBACK because error:`)
    console.error(e)
    await exec(client, "ROLLBACK")
    throw e
  } finally {
    local.close()
    client.close()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
