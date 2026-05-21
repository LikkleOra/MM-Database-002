# Minimum Viable Product (MVP) Scope

## Objective
Deliver a functional, self‑contained version of the **MM‑Database** platform that can be:
1. Deployed to Vercel with a single `vercel --prod`.
2. Operated via Discord bot commands for creator submission and leaderboard lookup.
3. Hosted a public web dashboard showing the top creators and payout information.

## Must‑Have Features (Included in MVP)
| Feature | User Story | Acceptance Criteria |
|---------|------------|---------------------|
| **YouTube Data Sync** | *As a system, I need fresh channel stats* | Cron runs every hour, updates `creators` table; API returns latest subscriber count.
| **Discord `/submit`** | *As a creator, I can submit my channel* | Bot validates URL, stores a `submissions` record, returns a confirmation message.
| **Leaderboard API** | *As a user, I want to see the top creators* | `GET /api/leaderboard` returns JSON sorted by composite score; frontend renders top 20.
| **Payout Calculation** | *As an admin, I can view monthly payouts* | Monthly job creates `payouts` entries; `/payouts` command lists payouts for the current month.
| **Auth via Discord OAuth** | *As a user, I log in with Discord* | OAuth flow stores `discordUserId` in session; protected routes reject unauthenticated requests.
| **Admin Dashboard** | *As a moderator, I approve submissions* | Simple UI table with pending submissions; Approve/Reject buttons update status.
| **Error Handling & Retries** | *As a developer, I want resilience* | Failed YouTube API calls are retried up to 3 times with exponential back‑off.

## Nice‑to‑Have (Post‑MVP) Features
- Slack/Telegram webhook notifications.
- Advanced scoring algorithm (watch‑time, comments).
- Tiered sponsorship & premium creator badges.
- Multi‑region deployment for global latency.
- Data export CSV endpoint.

## Out‑of‑Scope for MVP
- Full analytics dashboard (heatmaps, cohort analysis).
- AI‑generated content recommendations.
- Monetisation beyond simple payouts.
- Internationalisation (i18n) beyond English.

## Timeline (Estimated) – 6 weeks
| Week | Deliverable |
|------|-------------|
| 1 | Project scaffolding, repo setup, CI pipeline. |
| 2 | Convex schema, YouTube sync cron, basic Discord bot commands. |
| 3 | Leaderboard API + React dashboard (Vite). |
| 4 | Payout job, `/payouts` command, auth flow. |
| 5 | Admin UI, moderation workflow, testing & lint. |
| 6 | Documentation, final QA, Vercel production deploy. |

---
*Prepared by the GSD research assistant – serves as the blueprint for sprint planning.*