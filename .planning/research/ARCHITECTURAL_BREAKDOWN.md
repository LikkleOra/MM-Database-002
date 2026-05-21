# Architectural & Systems Breakdown

## High‑Level Architecture
```
+----------------------+      +--------------------+      +----------------------+
|   Discord Bot (Node) |<---->|   Convex Backend   |<---->|   YouTube API (REST) |
+----------------------+      +--------------------+      +----------------------+
          ^                               ^
          |                               |
          v                               v
   Vercel Edge Functions          Vercel Serverless
          ^                               ^
          |                               |
          v                               v
+----------------------+      +--------------------+
|   React Front‑end    |<---->|   Public API (REST) |
+----------------------+      +--------------------+
```

### 1. Convex Backend (Serverless)
- **Language**: TypeScript (Node 18 runtime)
- **Data Store**: Convex’s built‑in document store (similar to MongoDB). Tables:
  - `creators` – YouTube channel metadata, latest stats, score.
  - `submissions` – Raw submissions from Discord bots, moderation status.
  - `payouts` – Monthly payout records per creator.
  - `social_accounts` – Discord, Twitter links, etc.
  - `users` – Discord user profile, role, preferences.
- **Generated Code**: `_generated` folder contains type‑safe client (`api.js`, `api.d.ts`) and server stubs (`server.js`).
- **Cron Jobs**:
  - `crons.ts` – hourly YouTube sync, daily payout calculation, weekly analytics aggregation.
- **Auth**: Convex uses JWT generated from Vercel’s serverless functions; Discord OAuth token stored in the session cookie.
- **Deployment**: `vercel.json` routes `/api/*` to Convex edge functions via `convex dev`/`convex upload`.

### 2. Discord Bot (Node.js)
- **Framework**: `discord.js` v14, `@sapphire/framework` for command handling.
- **Key Modules**:
  - `discord.ts` – registers slash commands (`/submit`, `/leaderboard`, `/payouts`).
  - `http.ts` – thin wrapper to call Convex public API endpoints.
  - `auth.config.js` – reads `DISCORD_CLIENT_ID/SECRET` from Vercel env.
- **Message Flow**:
  1. User issues `/submit <yt‑url>`.
  2. Bot validates, extracts channel ID, POSTs to Convex `/api/submissions`.
  3. Convex creates record, triggers moderation webhook → Discord notification.

### 3. Front‑end (React + Vite)
- **Bundler**: Vite (fast HMR).
- **UI Library**: TailwindCSS for rapid styling.
- **Pages**:
  - `/` – Public landing page with hero and “Connect Discord”.
  - `/leaderboard` – Table of top creators, filters (region, category).
  - `/payouts` – Current month payout breakdown (admin‑only view).
  - `/admin` – Moderation UI (pending submissions, user management).
- **Data Fetching**: `react‑query` (now `@tanstack/react-query`) caches Convex API responses.
- **Auth Guard**: Higher‑order component checks Discord OAuth session.

### 4. Integrations
| System | Integration Type | Endpoint / Library | Frequency |
|--------|------------------|--------------------|----------|
| YouTube Data API | Pull (REST) | `GET https://www.googleapis.com/youtube/v3/channels` | Hourly (cron) |
| Discord API | Push (slash commands) | `discord.js` library | Real‑time |
| Vercel Analytics | Observability | Vercel dashboard, optional Grafana scrape | Continuous |
| Webhooks (optional) | Push to external services | POST to configured URLs (Slack, etc.) | On events |

### 5. Deployment Pipeline
1. **CI** – GitHub Actions run `npm run lint && npm test` on PR.
2. **Build** – `npm run build` creates `dist/` for Vite and bundles Convex functions.
3. **Deploy** – `vercel --prod` uploads both frontend static assets and Convex serverless functions.
4. **Rollback** – Vercel keeps previous deployments; `vercel rollback <deployment>` restores.

### 6. Security & Compliance
- All secrets stored in Vercel Environment Variables (YouTube API key, Discord bot token).
- Input validation using `zod` schemas on every Convex mutation.
- Rate‑limit Discord commands per‑user (30/min) via `@sapphire/framework` built‑in throttling.
- CORS: only allow origin `https://<project>.vercel.app`.
- GDPR‑compliant data deletion endpoint (`DELETE /api/users/:id`).

### 7. Scaling Considerations
| Concern | Strategy |
|----------|----------|
| **High read traffic (leaderboard)** | Convex indexes on `score`; React‑Query cache + Vercel edge caching (static JSON for top 10). |
| **Write bursts (mass submissions)** | Queue writes via Convex mutations; Cron aggregates later for heavy calculations. |
| **YouTube quota** | Cache channel stats for 1 hour; fallback to last known values if quota exhausted. |
| **Bot rate limits** | Shard the bot across multiple processes when >10k guilds are served. |

---
*Prepared by the GSD research assistant – a complete technical map for developers and future maintainers.*