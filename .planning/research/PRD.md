# Product Requirements Document (PRD)

## 1. Vision & Purpose
- **Goal**: Provide a community‑driven platform that aggregates, ranks, and rewards video creators (primarily on YouTube) based on engagement, subscriber growth, and quality metrics.
- **Target Users**:
  - Content creators seeking visibility & analytics.
  - Fans who want to discover rising creators.
  - Community moderators and Discord server admins.
- **Business Value**:
  - Drives engagement on Discord community.
  - Opens potential for sponsorships, premium features, and data‑licensing.

## 2. Core Problem
Creators struggle to gain exposure beyond platform algorithms. Discord communities lack a systematic way to surface high‑quality creators and reward community participation.

## 3. Solution Overview
A **full‑stack web app** powered by **Convex** (backend) and **Vite/React** (frontend) that:
1. Syncs YouTube channel data via YouTube API.
2. Stores creator metadata, submissions, payouts, and social accounts in Convex.
3. Provides Discord bot commands to fetch leaderboards, submit video links, and award points.
4. Renders a public dashboard where users can browse creators, rankings, and payouts.

## 4. Functional Requirements
| # | Feature | Description | Owner |
|---|---------|-------------|-------|
| 1 | **YouTube Sync** | Periodic cron pulls channel statistics (subscribers, views, recent videos) and updates Convex `creators` table. | Backend Engineer |
| 2 | **Creator Submission** | Discord command `/submit <YouTube URL>` validates the URL, extracts channel ID, creates a `submissions` record, and triggers moderation workflow. | Bot Dev |
| 3 | **Leaderboard** | Aggregates creator scores (views + community votes) and exposes via API `/leaderboard`. Frontend shows top N creators with filters. | Full‑stack |
| 4 | **Payout System** | Calculates monthly payouts based on creator rank; stores in `payouts` table; Discord command `/payouts` shows distribution. | Backend |
| 5 | **Auth & Permissions** | OAuth2 with Discord; role‑based access for moderators, admins, and regular users. | Security Lead |
| 6 | **Admin Dashboard** | UI for moderators to approve/reject submissions, adjust scores, and view analytics. | Frontend |
| 7 | **Webhooks** | Emit events on new submissions, score changes, and payouts for external integrations (e.g., Slack). | DevOps |

## 5. Non‑Functional Requirements
- **Scalability**: Must handle ~10k daily Discord interactions and ~5k concurrent API calls.
- **Reliability**: 99.5 % uptime; automatic retry for failed YouTube API calls.
- **Security**: Store secrets in Vercel environment variables; validate all external input.
- **Performance**: API latency < 200 ms for leaderboard queries.
- **Observability**: Logs via Vercel Edge Functions; metrics exported to a Grafana dashboard.

## 6. Success Metrics
- 5 k unique Discord users in first 30 days.
- 1 k creator submissions per month.
- Average leaderboard page load < 150 ms.
- Zero critical security incidents.

## 7. Constraints & Assumptions
- Uses **Convex** as the primary data store (serverless, TypeScript‑first).
- YouTube Data API v3 quota is sufficient for hourly syncs.
- Deployment targeted to **Vercel** (Edge Functions for API, static site for frontend).
- All code written in TypeScript (Node 18 runtime).

---
*Prepared by the GSD research assistant – ready for inclusion in the project repository.*