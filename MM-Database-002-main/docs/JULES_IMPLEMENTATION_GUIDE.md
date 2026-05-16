# Jules Implementation Guide
# ==========================
## Google Jules Integration for UGC Creator Dashboard

**Created:** May 14, 2026  
**Status:** Ready for Implementation  
**Jules Version:** Operational  

---

## Overview

Google Jules is configured as your **Async Operations Engine & Task Orchestrator**. It handles all long-running operations that would normally block your API responses, keeping your Next.js server fast and responsive.

### Jules' Role

| Responsibility | Schedule | Duration | Cost |
|---|---|---|---|
| Discord member sync | Every 15 min | 2-5s | ~$0.10/mo |
| TikTok 7-day sync | Daily 6am UTC | 5-10s | ~$0.02/mo |
| TikTok MTD sync | Daily 6:30am UTC | 5-10s | ~$0.02/mo |
| Webhook processing | Real-time | 1-2s | ~$0.50/mo |
| At-risk detection | Every 6h | 10-15s | ~$0.05/mo |
| Daily summary report | Daily 9am UTC | 8-12s | ~$0.04/mo |
| Instagram sync | Daily 3am UTC | 20-30s | ~$0.08/mo |
| **TOTAL** | — | — | **<$1/mo** |

---

## File Structure

```
convex/
├── actions/                           # Jules action definitions
│   ├── sync-discord-members.ts       # 15-min Discord sync
│   ├── sync-tiktok-gmv.ts            # Daily TikTok metrics
│   ├── handle-performance-webhook.ts # Real-time webhook handler
│   ├── detect-at-risk-creators.ts    # Risk detection (6-hourly)
│   ├── generate-daily-summary.ts     # Daily report generation
│   └── sync-instagram-metrics.ts     # Instagram sync
│
├── lib/                               # Utilities & Services
│   ├── discord-service.ts            # Discord API helpers
│   ├── notification-service.ts       # Notification/Alert helpers
│   ├── webhook-verification.ts       # Webhook signature verification
│   └── external-apis.ts              # TikTok, Instagram API calls
│
├── config.ts                          # Configuration & validation
└── tasks.ts                           # Task schedule definitions

src/app/api/
└── webhooks/
    └── performance.ts                 # POST /api/webhooks/performance

docs/
└── JULES_IMPLEMENTATION_GUIDE.md      # This file
```

---

## Setup Instructions

### 1. Environment Variables

Copy the Jules configuration to your `.env.local`:

```bash
cp .env.jules .env.local
```

Then fill in your credentials:

```env
# Discord
DISCORD_GUILD_ID=123456789
DISCORD_BOT_TOKEN=MTk...
DISCORD_WEBHOOK_UPDATES=https://discordapp.com/api/webhooks/...

# TikTok
TIKTOK_CLIENT_ID=...
TIKTOK_CLIENT_SECRET=...
TIKTOK_REFRESH_TOKEN=...
TIKTOK_SHOP_ID=...

# Security
WEBHOOK_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
```

### 2. Database Schema Updates

Add these fields to your `creators` table in `convex/schema.ts`:

```typescript
creators: defineTable({
  // ... existing fields ...
  affiliateId: v.optional(v.string()),       // TikTok affiliate ID
  tiktokHandle: v.optional(v.string()),      // TikTok handle
  igBusinessAccountId: v.optional(v.string()), // Instagram business account ID
  updatedAt: v.number(),                      // Last update timestamp
})
.index("by_discord_id", ["discordId"])
.index("by_affiliate_id", ["affiliateId"]),
```

Add a `performance` table to track metrics:

```typescript
performance: defineTable({
  creatorId: v.id("creators"),
  period: v.union(v.literal("7d"), v.literal("30d"), v.literal("mtd")),
  gmv: v.number(),
  conversions: v.number(),
  orders: v.number(),
  engagementRate: v.number(),
  postCount: v.optional(v.number()),
  liveCount: v.optional(v.number()),
  lastUpdated: v.number(),
  source: v.string(), // "tiktok_api", "webhook", "instagram_api", etc.
})
.index("by_creator", ["creatorId"]),
```

### 3. Deploy Actions

Your Convex actions are ready to use. Run:

```bash
npm install convex
npx convex dev
```

This will sync your actions to Convex automatically.

### 4. Set Up Webhooks

Your endpoint is available at:
```
https://yourdomain.com/api/webhooks/performance
```

Configure this in your third-party services:
- **TikTok Shop API:** Add webhook endpoint in TikTok Business Center
- **PartnerStack:** Add webhook in dashboard settings
- **Custom tracking:** POST to endpoint with signature header

### 5. Schedule Tasks

Jules requires a scheduler to trigger actions on schedule. You have options:

#### Option A: Google Cloud Scheduler (Recommended)

```bash
gcloud scheduler jobs create app-engine \
  "sync-discord-members" \
  --schedule="*/15 * * * *" \
  --http-method=POST \
  --uri="https://yourdomain.com/api/jobs/sync-discord-members" \
  --message-body='{}'
```

#### Option B: Node-cron (Development)

```typescript
// lib/scheduler.ts
import cron from "node-cron";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Schedule Discord sync every 15 minutes
cron.schedule("*/15 * * * *", async () => {
  console.log("[Scheduler] Running syncDiscordMembers...");
  await convex.action(api.actions.syncDiscordMembers, {});
});
```

#### Option C: AWS EventBridge, Azure Timer, etc.

All work with your API endpoint or Convex HTTP API.

---

## API Reference

### Actions

#### `syncDiscordMembers`
Sync Discord guild members to creators table.
- **Schedule:** Every 15 minutes
- **Args:** `{ forceFullSync?: boolean }`
- **Returns:** `{ totalMembers, newCreators, updatedCreators, inactiveCreators }`

#### `syncTikTokGMV`
Fetch TikTok Shop performance metrics.
- **Schedule:** Daily at 6am & 6:30am UTC
- **Args:** `{ period: "7d" | "30d" | "mtd" }`
- **Returns:** `{ period, updated, skipped, milestones }`

#### `handlePerformanceWebhook`
Process incoming performance webhook (called via API).
- **Trigger:** Real-time webhook
- **Args:** `{ payload, signature? }`
- **Returns:** `{ status, creatorId? }`

#### `detectAtRiskCreators`
Identify creators at risk of decline.
- **Schedule:** Every 6 hours
- **Returns:** `{ atRiskCount, atRiskList }`

#### `generateDailyPerformanceSummary`
Create daily performance report.
- **Schedule:** Daily at 9am UTC
- **Returns:** `{ date, totalGMV, totalCreators, activeCreators, avgGMVPerCreator }`

#### `syncInstagramMetrics`
Fetch Instagram follower/engagement data.
- **Schedule:** Daily at 3am UTC
- **Returns:** `{ synced, skipped }`

### Webhooks

#### POST `/api/webhooks/performance`
Accept performance data from third-party services.

**Request:**
```json
{
  "affiliateId": "tiktok_123",
  "gmv": 450.50,
  "conversions": 5,
  "orders": 3,
  "timestamp": "2026-05-14T12:30:00Z",
  "source": "tiktok"
}
```

**Response:** `202 Accepted`
```json
{
  "status": "success",
  "creatorId": "...",
  "performanceId": "..."
}
```

---

## Discord Notifications

Jules sends notifications to different Discord channels based on event type:

### Channels

- **#updates** (DISCORD_WEBHOOK_UPDATES) — Sync completions, job summaries
- **#wins** (DISCORD_WEBHOOK_WINS) — Milestone achievements, GMV records
- **#alerts** (DISCORD_WEBHOOK_ALERTS) — Anomalies, unusual activity
- **#escalations** (DISCORD_WEBHOOK_ESCALATIONS) — Errors, failures, at-risk flagging
- **#reports** (DISCORD_WEBHOOK_REPORTS) — Daily/weekly summaries

### Example Notifications

✅ Success
```
✅ syncDiscordMembers Complete
Synced 615 members, 3 new creators
```

🎉 Milestone
```
🎉 Milestone Reached
@CreatorName has achieved a new milestone!
Milestone: $500 GMV
Value: $523.45
```

⚠️ Warning
```
⚠️ Performance Anomaly
@CreatorName: GMV spike detected.
Current: $1,200
Average: $450
Deviation: 267%
```

---

## Troubleshooting

### Discord Sync Issues

**Problem:** "Discord API error: 403"  
**Solution:** Ensure your Discord bot has these intents:
- Server Members Intent
- Message Content Intent

In Discord Developer Portal: Applications > Your App > Bot > Intents

**Problem:** "Duplicate creators being created"  
**Solution:** The script checks `by_discord_id` index. Ensure it exists in schema:
```typescript
creators: defineTable({
  // ...
}).index("by_discord_id", ["discordId"]),
```

### TikTok Sync Issues

**Problem:** "TikTok token refresh failed"  
**Solution:**
1. Verify `TIKTOK_REFRESH_TOKEN` is valid
2. Check `TIKTOK_CLIENT_ID` and `TIKTOK_CLIENT_SECRET`
3. Ensure client secret hasn't been rotated in TikTok admin

**Problem:** "No affiliate data returned"  
**Solution:**
1. Verify `TIKTOK_SHOP_ID` is correct
2. Check that shop has active affiliates
3. Confirm date range has data (not in future)

### Webhook Issues

**Problem:** "Invalid webhook signature"  
**Solution:**
1. Verify `WEBHOOK_SECRET` matches what you generated
2. Ensure request body hasn't been modified
3. Check signature header is `x-webhook-signature`

**Problem:** "Unknown affiliate ID"  
**Solution:**
1. Ensure creator exists in database with matching `affiliateId`
2. Check that webhook is sending correct affiliate ID
3. Manually verify creator in dashboard

---

## Monitoring

### Check Task Status

View logs for each action:

```bash
# Local development
npx convex logs

# Production (via Google Cloud)
gcloud logging read "resource.type=cloud_function" --limit=50
```

### Metrics to Track

- **Sync Success Rate:** Target 99.5%
- **Latency:** Discord <5s, TikTok <10s, webhooks <2s
- **Coverage:** 100% of creators synced
- **Data Freshness:** <5 min for webhooks, <1 day for periodic syncs

### Discord Alerts

Monitor `#escalations` channel for:
- Failed syncs (job fails 3x in a row)
- API rate limits
- Authentication failures
- Anomaly detections

---

## Scaling & Optimization

### For Large Creator Bases (1000+)

If you exceed 1000 creators:

1. **Pagination:** Batch Discord fetches (currently limited to 1000)
   ```typescript
   // Current: fetchDiscordMembers({ limit: 1000 })
   // Update: Support pagination with "after" cursor
   ```

2. **Batch Processing:** Split TikTok syncs by creator tier
   ```typescript
   // Instead of fetching all affiliates at once,
   // fetch gold/silver/bronze separately with timestamps
   ```

3. **Caching:** Cache frequently accessed queries
   ```typescript
   // Redis or Convex query caching for performance lookups
   ```

### Cost Optimization

- Discord syncs are cheapest (~$0.10/mo) — can run more frequently
- TikTok API calls are slow (~10s) — batch them efficiently
- Webhook processing is fast (~1s) — auto-scales

Current monthly cost: **<$1**  
Projected cost at 10x scale: **<$10**

---

## Next Steps

1. ✅ **Review** this guide and the attached GOOGLE_JULES_ROLE_AND_PLAN.md
2. ✅ **Configure** environment variables in `.env.local`
3. ✅ **Update** schema to add `affiliateId`, `tiktokHandle`, `performance` tables
4. ✅ **Deploy** actions: `npx convex dev && npx convex deploy`
5. ✅ **Set up** scheduler (Google Cloud Scheduler recommended)
6. ✅ **Configure** webhooks in TikTok, PartnerStack, etc.
7. ✅ **Test** with manual job triggers
8. ✅ **Monitor** Discord #escalations channel for errors
9. ✅ **Celebrate** — Jules is now handling all your async work!

---

## Support Resources

- [Google Jules Documentation](https://cloud.google.com/jules/docs)
- [Discord.py Documentation](https://discordpy.readthedocs.io/)
- [TikTok Business Suite API](https://developers.tiktok.com/)
- [Convex Documentation](https://docs.convex.dev/)

---

**Document Version:** 1.0  
**Created:** May 14, 2026  
**Status:** Operational
