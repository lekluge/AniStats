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
 * - CLEAR_TARGET: true = AnimeRelation wird geleert (Default: true)
 */
const CLEAR_TARGET = (process.env.CLEAR_TARGET ?? "true") === "true"

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function exec(client: Client, sql: string, args: any[] = []) {
  return client.execute({ sql, args })
}

/* ----------------------------------
 * Schema (nur was benötigt wird)
 * ---------------------------------- */
async function ensureSchema(client: Client) {
  await exec(client, `PRAGMA foreign_keys = ON;`)

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
 * Speed Pragmas (Import)
 * ---------------------------------- */
async function enableFastImportMode(client: Client) {
  await exec(client, `PRAGMA foreign_keys = ON;`)

  try {
    await exec(client, `PRAGMA synchronous = NORMAL;`)
  } catch {
    /* ignored */
  }
}

/* ----------------------------------
 * Clear Target
 * ---------------------------------- */
async function clearTarget(client: Client) {
  await exec(client, `DELETE FROM AnimeRelation;`)
}

/* ----------------------------------
 * Helpers
 * ---------------------------------- */
function placeholders(rows: number, cols: number) {
  const one = `(${Array.from({ length: cols }).fill("?").join(",")})`
  return Array.from({ length: rows }).fill(one).join(",")
}

/* ----------------------------------
 * Import: AnimeRelation ONLY
 * ---------------------------------- */
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
    for (const r of batch) {
      args.push(
        r.fromId ?? null,
        r.toId ?? null,
        r.relationType ?? null
      )
    }

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

  console.log(`[turso] BEGIN TRANSACTION`)
  await exec(client, "BEGIN")

  try {
    if (CLEAR_TARGET) {
      console.log(`[turso] clear AnimeRelation...`)
      await clearTarget(client)
    }

    await importRelations(client, local)

    console.log(`[turso] COMMIT`)
    await exec(client, "COMMIT")
    console.log(`[done] AnimeRelation import finished ✅`)
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
