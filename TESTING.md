# Testing

## Ziel
Diese Tests prüfen die Kernlogik der API-Routen und Recommendation-Helfer auf:
- Eingabevalidierung
- Fehlercodes (`400`, `401`, `409`, `500`, `503`)
- Rückgabeformate
- Routing-/Auth-Verhalten
- Caching-Pfade (wo relevant)

Die meisten Tests sind Unit-Tests mit Mocks für externe Systeme (AniList, Prisma, Nuxt/H3-Globals).

## Befehle
- `npm test`: Vitest im Watch-Modus
- `npm run test:run`: einmaliger Testlauf
- `npm run test:verbose`: einmaliger Testlauf mit detaillierter Ausgabe je Testfall

## Abdeckung

### API-Routen
- `server/api/auth/login.get.ts`
  - OAuth-Redirect-URL wird korrekt gebaut
- `server/api/auth/callback.get.ts`
  - `code` Pflichtfeld
  - Token-Austausch
  - Cookie setzen + Redirect
- `server/api/auth/logout.post.ts`
  - Auth-Cookie wird gelöscht
  - Redirect nach `/`
- `server/api/auth/me.get.ts`
  - Kein Token => `user: null`
  - Gültiger Viewer => `user` vorhanden
  - Fehler bei AniList => `user: null`

- `server/api/public/health.get.ts`
  - `ok: true`
  - valider ISO-Timestamp

- `server/api/cron/anilist-sync.get.ts`
  - laufender Sync => `409`
  - sonst Delegation an Sync-Service

- `server/api/private/test-anilist-sync.post.ts`
  - Delegation an Sync-Service

- `server/api/private/anilist-user-list.get.ts`
  - fehlender `user` => `400`
  - Mapping `mediaId -> status`

- `server/api/private/anilist.post.ts`
  - fehlender `user` => `400`
  - Enrichment der AniList-Daten aus DB

- `server/api/private/genreTags.get.ts`
  - Cache-Hit-Pfad
  - DB-Fallback + Mapping

- `server/api/private/history.get.ts`
  - fehlender Token => `401`
  - fehlender Zeitraum => `400`
  - Merge aus AniList + DB

- `server/api/private/recommendation.get.ts`
  - fehlender `user` => `400`
  - Ausgabe in `items.TV`/`items.MOVIE`

- `server/api/private/relations.get.ts`
  - Gruppierte Chains werden erstellt
  - In-Memory-Cache-Pfad

### Middleware / Recommendation-Module
- `server/middleware/private-auth.ts`
  - Schutz nur für `/api/private/*`
  - ungültiges/fehlendes Token wird geblockt
  - gültige Token-Verifikation + Cache
  - Fehlerpfad => `503`

- `server/recommend/filters.ts`
  - `parseNumber`, `parseList`, `hasStartDate`, `isReleased`

- `server/recommend/chain.ts`
  - `buildChainMap`
  - `isFirstUnseenInChain`

## Was aktuell nicht abgedeckt ist
- Echte End-to-end HTTP-Tests gegen laufenden Nitro-Server
- Reale AniList- und Datenbank-Integration (statt Mocks)
- Frontend-Komponenten-/UI-Interaktion
- Performance- und Lasttests

## Nächste sinnvolle Ausbaustufen
1. Integrationstests mit Test-DB (SQLite) und HTTP-Requests gegen Nitro.
2. Contract-Tests für Response-Schemas pro Route.
3. Coverage-Report (`vitest --coverage`) plus Mindestgrenzen in CI.
