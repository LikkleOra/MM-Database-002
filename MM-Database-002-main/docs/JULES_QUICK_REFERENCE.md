# Google Jules — Quick Reference

## What is Jules?

Google Jules is your **Async Operations Engine** — handles all the heavy lifting (API calls, data syncing, reporting) so your Next.js API stays fast.

## Quick Links

- **Full Guide:** [docs/JULES_IMPLEMENTATION_GUIDE.md](./JULES_IMPLEMENTATION_GUIDE.md)
- **Configuration:** [.env.julius](./../.env.julius)
- **Environment Reference:** [GOOGLE_JULES_ROLE_AND_PLAN.md](./GOOGLE_JULES_ROLE_AND_PLAN.md)

---

## Setup Checklist

```bash
# 1. Copy and fill env variables
cp .env.julius .env.local

# 2. Update Convex schema with new tables
# - Add fields: affiliateId, tiktokHandle, igBusinessAccountId to creators
# - Create performance table

# 3. Deploy Convex actions
npm install convex
npx convex dev

# 4. Create Discord webhooks
# Go to your server > Settings > Integrations > Webhooks
# Create 5 webhooks: updates, wins, alerts, escalations, reports

# 5. Set up scheduler
# Google Cloud Scheduler: gcloud scheduler jobs create ...
# Or use node-cron for local development

# 6. Test webhook endpoint
curl -X POST http://localhost:3000/api/webhooks/performance \
  -H "Content-Type: application/json" \
  -d '{"affiliateId":"test","gmv":500,"conversions":5,"orders":3}'
```

---

## Tasks at a Glance

| Task | Schedule | Duration | What It Does |
|------|----------|----------|--------------|
| Discord Sync | Every 15 min | 2-5s | Pulls latest members from Discord, creates/updates creators |
| TikTok 7d | Daily 6am UTC | 5-10s | Fetches last 7 days GMV and performance from TikTok API |
| TikTok MTD | Daily 6:30am UTC | 5-10s | Fetches month-to-date metrics from TikTok |
| Webhook Handler | Real-time | 1-2s | Processes incoming performance data webhooks |
| Risk Detection | Every 6h | 10-15s | Finds creators with no activity or declining GMV |
| Daily Report | Daily 9am UTC | 8-12s | Generates and posts performance summary to Discord |
| Instagram Sync | Daily 3am UTC | 20-30s | Fetches follower counts and engagement from Instagram |

---

## Discord Webhooks Explained

Jules posts different types of messages to different channels:

- **#updates** → Sync completions ("Discord sync complete: 615 members")
- **#wins** → Milestones ("🎉 @Creator: $500 GMV milestone!")
- **#alerts** → Anomalies ("⚠️ GMV spike detected for @Creator")
- **#escalations** → Errors ("❌ TikTok sync failed: timeout")
- **#reports** → Summaries ("📊 Daily: $15,000 total GMV")

---

## Common Tasks

### Test a specific action

```typescript
// In browser console or API route
import { triggerDiscordSync } from "@/convex/julius-utils";
await triggerDiscordSync();
```

### Check if everything is configured

```typescript
import { checkConfiguration } from "@/convex/julius-utils";
checkConfiguration(); // ✓ or ✗
```

### View the schedule

```typescript
import { printTaskSchedule } from "@/convex/julius-utils";
printTaskSchedule();
```

### Test the webhook

```bash
curl -X POST http://localhost:3000/api/webhooks/performance \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: test" \
  -d '{
    "affiliateId": "test_creator",
    "gmv": 450.50,
    "conversions": 5,
    "orders": 3,
    "timestamp": "2026-05-14T12:00:00Z"
  }'
```

---

## Cost

- **Current (615 creators):** <$1/month
- **At 10x scale:** <$10/month
- **Compared to alternatives:** 10x cheaper than traditional job queues

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Discord API error 403" | Bot missing intents. Enable in Discord Developer Portal |
| "Unknown affiliate ID in webhook" | Creator doesn't exist. Add to database first |
| "TikTok token refresh failed" | Check credentials in .env.local |
| "Webhook signature invalid" | Ensure WEBHOOK_SECRET matches what sender is using |

---

## Next Steps

1. ✅ Fill in `.env.local` with your credentials
2. ✅ Update Convex schema
3. ✅ Run `npx convex dev` to deploy actions
4. ✅ Set up 5 Discord webhooks
5. ✅ Configure scheduler (Google Cloud / node-cron)
6. ✅ Test with `/api/webhooks/performance` endpoint
7. ✅ Monitor `#escalations` channel for errors

---

**Status:** ✅ Ready to use  
**Created:** May 14, 2026
