# Testing

## Ziel
Diese Tests prüfen die Kernlogik der API-Routen, Middleware, Recommendation-Helfer und Frontend-Interaktionen auf:
- Eingabevalidierung
- Fehlercodes (`400`, `401`, `409`, `500`, `503`)
- Rückgabeformate
- Routing-/Auth-Verhalten
- Caching-Pfade (wo relevant)
- UI-Fehlerdarstellung ohne rohe Backend-Fehlercodes

Die meisten Tests sind Unit-Tests mit Mocks für externe Systeme (AniList, Prisma, Nuxt/H3-Globals).

## Befehle
- `npm test`: Vitest im Watch-Modus (Backend)
- `npm run test:run`: einmaliger Backend-Testlauf
- `npm run test:verbose`: einmaliger Backend-Testlauf mit detaillierter Ausgabe
- `npm run test:frontend`: Frontend-Tests im Watch-Modus (Nuxt Test Utils)
- `npm run test:frontend:run`: einmaliger Frontend-Testlauf
- `npm run test:frontend:verbose`: einmaliger Frontend-Testlauf mit detaillierter Ausgabe
- `npm run test:perf`: Performance-Messungen für API-Handler
- `npm run test:perf:live`: Performance-Messungen inkl. echtem AniList-Profil (`user: Tiggy`)

## Suite-Aufteilung
- `vitest.config.ts`: Backend (`tests/**`, ohne `tests/frontend/**` und `tests/perf/**`)
- `vitest.frontend.config.ts`: Frontend (`tests/frontend/**`, Nuxt-Umgebung)
- `vitest.perf.config.ts`: Performance (`tests/perf/**`)

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
  - gruppierte Chains werden erstellt
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

### Frontend
- `tests/frontend/use-locale.test.ts`
  - Sprachwechsel (`de`/`en`)
  - Translation-Lookup + Fallback auf Key
- `tests/frontend/default-layout.test.ts`
  - Settings-Dropdown öffnet per Profil-Button
  - Aktionen für Language/Theme/Logout werden ausgelöst
  - Dropdown schließt bei Klick außerhalb
- `tests/frontend/recommendation-errors.test.ts`
  - API nicht erreichbar (`Network Error`) wird als generischer Fehler angezeigt
  - HTTP-Fehler (z. B. `500`, `400`) werden nicht roh im UI ausgespielt

### Performance
- `tests/perf/api.handlers.perf.test.ts`
  - Laufzeitmessung `recommendation.get` mit großem Datensatz
  - Cold-vs-Warm Vergleich für `recommendation.get` (Cache-Effekt sichtbar)
  - optionaler Live-Perf-Pfad mit echtem AniList-Profil (`Tiggy`) und echter Recommendation-Logik
  - Laufzeitmessung `relations.get` mit großem Datensatz
  - Cold-vs-Warm Vergleich für `relations.get` (In-Memory/Storage-Cache)

## Browser Timing
- `GET /api/private/recommendation` liefert `Server-Timing` Header mit Segmenten:
  - `user`, `animeCache`, `animeDb`, `relationsCache`, `relationsDb`, `derived`, `scoring`, `total`
- In den DevTools unter Network -> Request -> Timing/Headers kannst du so Cold/Warm direkt vergleichen.

## Was aktuell nicht abgedeckt ist
- echte End-to-End HTTP-Tests gegen laufenden Nitro-Server
- reale AniList- und Datenbank-Integration (statt Mocks)
- Lighthouse/Web-Vitals für echte Browser-Render-Performance

## Nächste sinnvolle Ausbaustufen
1. Integrationstests mit Test-DB (SQLite) und HTTP-Requests gegen Nitro.
2. Contract-Tests für Response-Schemas pro Route.
3. Coverage-Report (`vitest --coverage`) plus Mindestgrenzen in CI.
4. Browser-basierte Frontend-Perf-Messung (z. B. Playwright + Trace).


