# Integrations Guide

This document describes every external system the MM‑Database application talks to, the exact protocols, authentication methods, rate‑limit considerations, and step‑by‑step setup instructions.

---
## 1. YouTube Data API v3
| Item | Details |
|------|---------|
| **Base URL** | `https://www.googleapis.com/youtube/v3` |
| **Endpoints Used** | `channels.list` (to fetch subscriber count, view count, video list) <br> `search.list` (optional – to discover recent videos) |
| **Authentication** | API key passed as query param `key=YOUR_API_KEY`. The key must have **YouTube Data API v3** enabled in Google Cloud Console. |
| **Quota** | 10 000 units per day by default. `channels.list` with `statistics` part costs 1 unit per request. Plan for ~~200‑300 channel fetches per hour (≈7 200 per day) leaving margin. |
| **Rate‑limit handling** | Implement exponential back‑off (1s, 2s, 4s) on `403/quotaExceeded`. Cache results for 1 hour in Convex (store `lastFetched`). |
| **Setup Steps** | 1. Create a Google Cloud project. <br> 2. Enable *YouTube Data API v3*. <br> 3. Generate an API key. <br> 4. Add the key to Vercel env var `YOUTUBE_API_KEY`. |

---
## 2. Discord Bot API
| Item | Details |
|------|---------|
| **Library** | `discord.js` v14 with `@sapphire/framework` for command handling. |
| **Bot Token** | Stored in Vercel env var `DISCORD_BOT_TOKEN`. |
| **OAuth2 (login)** | Use Discord's standard OAuth2 flow (Authorization Code Grant). Scopes: `identify`, `guilds`, `guilds.join`. Redirect URI must be `https://<project>.vercel.app/api/auth/callback`. |
| **Slash Commands** | Defined in `convex/discord.ts`. Commands: `/submit`, `/leaderboard`, `/payouts`, `/login`. |
| **Rate Limits** | 50 requests per second per bot globally; per‑guild command limits are handled automatically by `@sapphire/framework`. Implement per‑user throttling (30 commands/min). |
| **Setup Steps** | 1. Create an application at <https://discord.com/developers/applications>. <br> 2. Enable **Bot** and copy the token. <br> 3. Add **Redirect URI** for OAuth. <br> 4. Invite bot to guilds with `applications.commands` and `bot` scopes. |

---
## 3. Vercel (Hosting & Edge Functions)
| Item | Details |
|------|---------|
| **Frontend** | Served as a static site from `/.vercel/output/static`. |
| **Backend** | Convex functions are deployed as Edge Functions via `vercel.json`:
```json
{ "functions": { "api/**/*.js": { "runtime": "edge" } } }
``` |
| **Environment Variables** | `DISCORD_BOT_TOKEN`, `DISCORD_CLIENT_ID`, `DISCORD_CLIENT_SECRET`, `YOUTUBE_API_KEY`, `CONVEX_DEPLOYMENT`. |
| **Build Command** | `npm run build && npm run convex:deploy` (custom script). |
| **Observability** | Vercel Analytics + logs accessible via Vercel dashboard. |

---
## 4. Optional Webhook Targets (Slack, Teams, etc.)
- **Payload**: JSON `{ event: string, data: object }` posted to user‑defined URL.
- **Headers**: `Content-Type: application/json` and optional `X‑Signature` HMAC (shared secret stored in env `WEBHOOK_SECRET`).
- **Retry**: Convex will retry up to 3 times with exponential back‑off.

---
## 5. Testing Stubs
- **Mock YouTube**: Use `nock` to stub `https://www.googleapis.com/youtube/v3/*` in unit tests.
- **Mock Discord**: `discord.js-testing` library provides a fake client for command unit tests.
- **Local Convex**: Run `npx convex dev` to spin up a local development server.

---
### Quick Checklist for a New Environment
1. Set Vercel env vars (`DISCORD_*`, `YOUTUBE_API_KEY`).
2. Create Discord application & invite bot.
3. Enable YouTube Data API and add the API key.
4. Run `npm ci && npm run build` locally.
5. Deploy with `vercel --prod`.
6. Verify: `/submit` works, leaderboard loads, payouts calculated.

*Prepared by the GSD research assistant – following the learn‑as‑you‑build skill to ensure every step is explainable and reproducible.*