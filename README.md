<p align="center">
  <img src="https://raw.githubusercontent.com/lekluge/AniStats/refs/heads/main/public/logo.png" alt="AniStats Logo" width="160" />
</p>

<h1 align="center">AniStats</h1>

<p align="center">
  Advanced AniList analytics dashboard with sync, relations, history and recommendations.
</p>

<p align="center"><a href="https://github.com/lekluge/AniStats/stargazers"><img src="https://img.shields.io/github/stars/lekluge/AniStats?style=for-the-badge" alt="Stars"></a>&nbsp;<a href="https://github.com/lekluge/AniStats/issues"><img src="https://img.shields.io/github/issues/lekluge/AniStats?style=for-the-badge" alt="Issues"></a>&nbsp;<a href="https://github.com/lekluge/AniStats/releases"><img src="https://img.shields.io/github/v/release/lekluge/AniStats?style=for-the-badge" alt="Release"></a>&nbsp;<a href="https://github.com/lekluge/AniStats/commits"><img src="https://img.shields.io/github/last-commit/lekluge/AniStats?style=for-the-badge" alt="Last Commit"></a></p>

<p align="center">
  <a href="https://github.com/lekluge/AniStats/issues/new/choose">Bug Tracker</a>
  |
  <a href="https://github.com/lekluge/AniStats/stargazers">Give a Star</a>
  |
  <a href="https://github.com/lekluge/AniStats/releases">Releases</a>
</p>

## Overview

AniStats is a production-focused web app for analyzing AniList profile data.  
It combines clean visual dashboards with scheduled background sync and private analytics APIs.

## Features

- AniList OAuth login flow
- Personalized analytics pages for authenticated users
- Genre and tag exploration
- Anime relation analysis
- History and recommendation workflows
- Scheduled sync job for data refresh
- Public health endpoint and SEO baseline

## Tech Stack

- Nuxt 4 + Vue 3
- Nitro server routes
- Prisma Client
- AniList OAuth and GraphQL APIs
- Vercel Cron for scheduled sync

## Production Endpoints

- `GET /` public landing page
- `GET /api/public/health` uptime/liveness endpoint
- `GET /api/cron/anilist-sync` scheduled sync trigger
- `GET /robots.txt` robots rules
- `GET /sitemap.xml` sitemap

Most analytics routes are intentionally private and require authentication.

## Required Environment Variables

- `NUXT_PUBLIC_SITE_URL`
- `ANILIST_CLIENT_ID`
- `ANILIST_CLIENT_SECRET`
- `ANILIST_REDIRECT_URI`
- `DATABASE_URL`
- `DATABASE_AUTH_TOKEN`
- `DEBUG` (optional)

## Release Workflow

1. Bump version in `package.json`.
2. Run verification checks:
   `npm run test:run`
   `npm run test:frontend:run`
   `npm run test:perf` (if part of your release gate)
3. Build artifact: `npm run build`.
4. Deploy to staging and verify:
   login, dashboards, sync endpoint, `/api/public/health`, `/robots.txt`, `/sitemap.xml`.
5. Deploy to production.
6. Publish release notes.

## Operations Notes

- Cron schedule is defined in `vercel.json`.
- Current cron: `0 3 * * *` (03:00 UTC) on `/api/cron/anilist-sync`.
- Monitor health endpoint and cron execution failures.

## SEO and Privacy

- Canonical, OpenGraph and Twitter meta tags are configured.
- `robots.txt` blocks private pages and `/api/`.
- `sitemap.xml` lists public pages.
- OAuth token is stored as HTTP-only cookie.

## Support

- Report bugs: <https://github.com/lekluge/AniStats/issues/new/choose>
- Request features: <https://github.com/lekluge/AniStats/issues>
