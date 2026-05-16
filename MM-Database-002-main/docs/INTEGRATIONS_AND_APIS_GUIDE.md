# UGC Creator Dashboard — Integrations & APIs Guide

**Document Purpose:** Map all external services, APIs, webhooks, and integrations needed for the dashboard to work end-to-end.

**Audience:** Thabiso + technical team

---

## 1. Integration Priority Matrix

### Critical Path (MVP Phase 1)
These unlock core functionality. Without them, the dashboard is half-blind.

1. **Discord Bot API** — member list sync, real-time presence
2. **Clerk OAuth (Discord)** — creators sign in via Discord
3. **Convex + Clerk JWT** — authentication layer

### High Priority (MVP Phase 1-2)
These make the system actually useful. Data flows in automatically.

4. **TikTok Shop API** — GMV (Gross Merchandise Value) feeds
5. **Webhook Handler** — inbound performance data from tracking
6. **Discord Webhook (Outgoing)** — push alerts to Discord

### Medium Priority (Phase 2)
Nice-to-have, but not deal-breakers.

7. **Instagram Graph API** — creator account verification
8. **YouTube Data API** — video performance metrics
9. **Twitch API** — streamer metrics
10. **Zapier / Make.com** — no-code automation bridges

### Nice-to-Have (Phase 3+)
Polish and intelligence.

11. **OpenAI API** — AI-powered recommendations
12. **Sentry** — error tracking
13. **PostHog** — product analytics
14. **SendGrid / Resend** — email notifications
15. **Stripe** — payout management (future revenue share)

---

## 2. Critical Path Integrations (Phase 1)

### 2.1 Discord Bot API

**Why:** Pull 615 creators from Discord server, get their handles, roles, join dates, activity status.

**What you need:**
- Discord application created
- Bot token
- Guild ID (server ID)
- Required permissions: Read Members, Read Messages, Read Message History

**Setup:**
```
1. Go to https://discord.com/developers/applications
2. New Application → "Shah Performance Bot"
3. Bot tab → Add Bot → Copy Token
4. OAuth2 → URL Generator → select "bot" scope + permissions
5. Copy invite link, join bot to server
6. Get Guild ID: right-click server → Copy Server ID
```

**Environment variables:**
```bash
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN
DISCORD_GUILD_ID=YOUR_GUILD_ID
```

**Data you can extract:**
```
Members:
- username, discriminator
- user_id
- joined_at
- roles (if assigned in Discord)
- avatar URL
- status (online/offline/idle)

Channels:
- channel names, IDs
- category structure
- #performance, #winners, #alerts, etc.

Messages:
- performance posts
- creator updates
- timestamps
```

**Implementation example:**
```python
# bot.py (Python Discord bot)
import discord
from discord.ext import commands

bot = commands.Bot(command_prefix='!')

@bot.event
async def on_ready():
    print(f"Bot logged in as {bot.user}")
    
    # Fetch guild
    guild = bot.get_guild(int(os.getenv("DISCORD_GUILD_ID")))
    
    # Get all members
    members = []
    async for member in guild.fetch_members(limit=None):
        members.append({
            "username": member.name,
            "discord_id": member.id,
            "joined_at": member.joined_at.isoformat(),
            "avatar_url": member.avatar.url if member.avatar else None,
            "roles": [role.name for role in member.roles]
        })
    
    print(f"Fetched {len(members)} members")
    
    # Send to your Convex backend
    for member in members:
        await send_to_convex(member)
    
    await bot.close()

bot.run(os.getenv("DISCORD_BOT_TOKEN"))
```

**Cost:** Free

**Timeline:** 1-2 hours (setup + integration)

---

### 2.2 Clerk OAuth (Discord Provider)

**Why:** Creators log into dashboard using Discord account. No separate passwords.

**What it does:**
- Sign in with Discord button
- Auto-creates Clerk user linked to Discord ID
- Sync Discord username to dashboard user profile
- Role-based access (admin, manager, creator)

**Setup:**
```
1. Go to Clerk Dashboard → Authentications → Social Connections
2. Enable Discord OAuth
3. Paste Discord OAuth credentials from Developer Portal
4. Copy Clerk publishable key to Next.js env
```

**Environment variables:**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
```

**Frontend code:**
```typescript
// app/page.tsx
import { SignInButton } from "@clerk/nextjs";

export default function SignIn() {
  return (
    <div>
      <h1>Sign in to Creator Dashboard</h1>
      <SignInButton />
    </div>
  );
}
```

**Cost:** Free (Convex integration at no cost)

**Timeline:** 30 minutes

---

### 2.3 Convex + Clerk JWT Integration

**Why:** Convex needs to know who the user is (from Clerk) to enforce access control.

**What it does:**
- Convex validates Clerk JWT tokens
- Queries automatically filtered by user role
- Manager can only see their team
- Creator can only see themselves

**Setup:**
```
1. In Clerk Dashboard → API Keys → Copy JWT template
2. In Convex → Settings → Authentication → Add Clerk JWT issuer
3. Paste issuer domain: https://YOUR_FRONTEND_API.clerk.accounts.dev
4. Copy JWKS Endpoint
```

**Convex code:**
```typescript
// convex/_generated/server.ts (auto-generated, but configure auth)
import { auth } from "@clerk/nextjs";

// In your queries/mutations:
export const listCreators = query({
  async handler(ctx) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", q => q.eq("clerkId", identity.sub))
      .first();
    
    // Only return creators this user manages
    if (user.role === "manager") {
      return creators.filter(c => c.managerId === user._id);
    }
    
    return creators; // admin sees all
  }
});
```

**Cost:** Free

**Timeline:** 1 hour (with schema setup)

---

## 3. High Priority Integrations (Phase 1-2)

### 3.1 TikTok Shop API

**Why:** Real-time GMV (Gross Merchandise Value) data — the core metric you're tracking.

**What you need:**
- TikTok Shop seller account
- TikTok Affiliate API credentials
- Your shop ID

**Data available:**
```
Per creator/affiliate:
- total_gmv (gross merchandise value)
- total_orders
- total_conversions
- commission_earned
- performance_period (daily, weekly, monthly)
- product breakdown
- traffic source breakdown
```

**How it works:**
```
TikTok Shop → Affiliate API → Your server → Convex → Dashboard
```

**Setup:**
```
1. Go to https://seller.tiktok.com/ → Developer Settings
2. Create API app → get Client ID + Client Secret
3. Request affiliate data access
4. Generate access token (OAuth flow)
5. Use access token to fetch metrics
```

**Environment variables:**
```bash
TIKTOK_CLIENT_ID=your_client_id
TIKTOK_CLIENT_SECRET=your_client_secret
TIKTOK_SHOP_ID=your_shop_id
TIKTOK_ACCESS_TOKEN=your_access_token (refresh periodically)
```

**Implementation:**
```typescript
// convex/actions/syncTikTokGMV.ts
import { action } from "./_generated/server";

export const syncTikTokGMV = action({
  args: {},
  async handler(ctx) {
    const accessToken = process.env.TIKTOK_ACCESS_TOKEN;
    
    // Fetch affiliate performance data
    const response = await fetch(
      "https://open-api.tiktok.com/v1/affiliate/performance",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          shop_id: process.env.TIKTOK_SHOP_ID,
          start_date: "2026-05-01",
          end_date: "2026-05-13",
          metrics: ["gmv", "conversions", "orders"]
        })
      }
    );
    
    const data = await response.json();
    
    // data.data.affiliates[] contains per-creator metrics
    for (const affiliate of data.data.affiliates) {
      await ctx.runMutation(api.mutations.updatePerformance, {
        creatorId: affiliate.affiliate_id,
        period: "7d",
        gmv: affiliate.gmv_7d,
        postCount: affiliate.post_count,
        source: "api"
      });
    }
    
    return { synced: data.data.affiliates.length };
  }
});
```

**Cost:** Free (revenue share, typically 5-20%)

**Timeline:** 3-4 hours (API docs can be slow)

**Note:** TikTok Shop API is rate-limited. Sync once per hour or daily depending on your volume.

---

### 3.2 Webhook Handler (Inbound)

**Why:** External tracking systems push performance data to your dashboard in real-time.

**Example flow:**
```
Creator posts on TikTok
→ TikTok Shop tracks conversion
→ Third-party tracking service (e.g., Impact, PartnerStack) logs it
→ Sends webhook to your server
→ Your server updates Convex
→ Dashboard refreshes in real-time
```

**What you need:**
- Webhook endpoint on your Next.js app
- Authentication (verify webhook signature)
- Parser for webhook payload
- Error handling + retry logic

**Setup:**
```
1. In your tracking system (TikTok, PartnerStack, etc):
   - Settings → Webhooks → Add
   - URL: https://yourdomain.com/api/webhooks/performance
   - Events: "conversion", "order", "return"
2. Copy webhook secret (for signature verification)
3. Receive and parse payload
```

**Implementation:**
```typescript
// app/api/webhooks/performance/route.ts
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST(req: NextRequest) {
  try {
    // 1. Verify webhook signature
    const signature = req.headers.get("x-webhook-signature");
    const body = await req.text();
    
    const expectedSignature = crypto
      .createHmac("sha256", process.env.WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");
    
    if (signature !== expectedSignature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }
    
    // 2. Parse payload
    const payload = JSON.parse(body);
    
    // 3. Extract data (varies by service)
    const { affiliate_id, gmv, conversions, timestamp } = payload;
    
    // 4. Update Convex
    await client.mutation(api.mutations.updatePerformance, {
      creatorId: affiliate_id,
      gmv,
      postCount: 0, // or extract if available
      liveCount: 0,
      period: "7d",
      source: "webhook"
    });
    
    // 5. Log activity (optional)
    await client.mutation(api.mutations.recordActivity, {
      creatorId: affiliate_id,
      type: "observation",
      title: `Webhook: +${gmv} GMV`,
      description: `Conversion recorded: ${conversions} orders`,
      source: "webhook"
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}
```

**Cost:** Free (depends on your tracking service)

**Timeline:** 2-3 hours

---

### 3.3 Discord Webhook (Outgoing)

**Why:** Push performance updates, alerts, wins to Discord automatically.

**Example flows:**
```
Win/Loss recorded in dashboard
→ Triggers webhook
→ Posts to #wins or #alerts channel
→ Team sees it instantly in Discord

Creator hits GMV milestone
→ Automatically post celebration message

Underperforming creator flagged
→ Alert to #escalations channel
```

**Setup:**
```
1. In Discord → server settings → Integrations → Webhooks
2. Create webhook for #wins, #alerts, #escalations channels
3. Copy webhook URLs
4. Store in env vars
```

**Environment variables:**
```bash
DISCORD_WEBHOOK_WINS=https://discordapp.com/api/webhooks/...
DISCORD_WEBHOOK_ALERTS=https://discordapp.com/api/webhooks/...
DISCORD_WEBHOOK_ESCALATIONS=https://discordapp.com/api/webhooks/...
```

**Implementation:**
```typescript
// convex/actions/notifyDiscord.ts
import { action } from "./_generated/server";

export const notifyDiscordWin = action({
  args: {
    creatorName: v.string(),
    gmvAmount: v.number(),
    impact: v.string() // "high", "medium", "low"
  },
  async handler(ctx, args) {
    const webhook = process.env.DISCORD_WEBHOOK_WINS;
    
    const embed = {
      title: `🎉 ${args.creatorName} — WIN`,
      description: `+$${args.gmvAmount} GMV recorded`,
      color: args.impact === "high" ? 0x00ff00 : 0xffff00,
      timestamp: new Date().toISOString()
    };
    
    await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        embeds: [embed],
        content: `@here ${args.creatorName} just won!`
      })
    });
  }
});

// Call from frontend after recording activity
await recordActivity({
  creatorId: "...",
  type: "win",
  title: "GMV spike",
  description: "+$82 in 24 hours"
});

// Then trigger webhook
await notifyDiscordWin({
  creatorName: "Achetr",
  gmvAmount: 82,
  impact: "high"
});
```

**Cost:** Free

**Timeline:** 1 hour

---

## 4. Medium Priority Integrations (Phase 2)

### 4.1 Instagram Graph API

**Why:** Verify creator accounts, track follower count, engagement rate.

**Data available:**
```
Per account:
- follower_count
- media_count
- biography
- profile_picture_url
- website_url
- ig_id (for linking to creator)
- insights (impressions, reach, engagement — requires business account)
```

**Setup:**
```
1. Go to https://developers.facebook.com/apps/
2. Create app → Select "Business"
3. Add "Instagram Graph API" product
4. Request access to Instagram Business Account
5. Create test token or user token
6. Get Instagram Business Account ID
```

**Environment variables:**
```bash
INSTAGRAM_ACCESS_TOKEN=your_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_account_id
```

**Implementation:**
```typescript
// convex/actions/syncInstagramAccounts.ts
export const syncInstagramAccounts = action({
  async handler(ctx) {
    const token = process.env.INSTAGRAM_ACCESS_TOKEN;
    const accountId = process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID;
    
    // Get all connected creator accounts
    const response = await fetch(
      `https://graph.instagram.com/v19.0/${accountId}/ig_users`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    const accounts = await response.json();
    
    for (const account of accounts.data) {
      // Update or create account in Convex
      await ctx.runMutation(api.mutations.linkAccount, {
        creatorId: account.ig_id,
        platform: "instagram",
        handle: account.username,
        profileUrl: `https://instagram.com/${account.username}`
      });
    }
  }
});
```

**Cost:** Free (Meta's APIs are free for business use)

**Timeline:** 2-3 hours

---

### 4.2 YouTube Data API

**Why:** Track YouTube Shorts performance, subscriber growth, engagement.

**Data available:**
```
Per channel:
- subscriber_count
- video_count
- view_count
- upload_status
- customUrl

Per video:
- view_count
- like_count
- comment_count
- engagement_rate
```

**Setup:**
```
1. Go to https://console.cloud.google.com/
2. Create project → enable YouTube Data API v3
3. Create OAuth 2.0 credentials (or API key)
4. Get creator's channel ID
```

**Implementation:**
```typescript
export const syncYouTubeMetrics = action({
  async handler(ctx) {
    const apiKey = process.env.YOUTUBE_API_KEY;
    
    // Get channel stats
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/channels?part=statistics&forUsername=CREATOR_USERNAME&key=${apiKey}`
    );
    
    const data = await response.json();
    
    // data.items[0].statistics contains viewCount, subscriberCount, etc.
  }
});
```

**Cost:** Free (10k quota per day)

**Timeline:** 2 hours

---

### 4.3 Twitch API

**Why:** Track Twitch streamers' metrics (concurrent viewers, followers, engagement).

**Data available:**
```
Per channel:
- follower_count
- view_count
- broadcaster_language
- game_name

Live streams:
- viewer_count (live only)
- started_at
- title
- game_name
```

**Setup:**
```
1. Go to https://dev.twitch.tv/console/apps
2. Register application
3. Get Client ID + OAuth Token
4. Generate access token (OAuth flow)
```

**Cost:** Free

**Timeline:** 2 hours

---

## 5. Nice-to-Have Integrations (Phase 3+)

### 5.1 OpenAI API (GPT-4)

**Why:** AI-powered insights, recommendations, anomaly detection.

**Use cases:**
```
1. Performance summary generation
   Input: "Summarize Achetr's week"
   Output: "Achetr had strong TikTok performance but low Instagram engagement.
            Recommend: post Reels 2x daily"

2. Anomaly detection
   Input: Creator with 0 posts in 10 days
   Output: "At-risk creator, recommend outreach"

3. Recommendation engine
   Input: Creator tier + GMV + posts
   Output: "Ready for tier upgrade to Silver based on metrics"
```

**Implementation:**
```typescript
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const generateInsight = action({
  args: { creatorId: v.id("creators") },
  async handler(ctx, args) {
    const creator = await ctx.db.get(args.creatorId);
    const activities = await getRecentActivities(creator._id);
    
    const prompt = `
      Creator: ${creator.name}
      Tier: ${creator.tier}
      Recent activities: ${activities.map(a => a.description).join(", ")}
      
      Provide 1-2 actionable recommendations to boost performance.
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 200
    });
    
    return response.choices[0].message.content;
  }
});
```

**Cost:** ~$0.01-0.10 per request

**Timeline:** 2-3 hours

---

### 5.2 Sentry (Error Tracking)

**Why:** Know when things break (queries fail, webhooks error, etc.).

**Setup:**
```
1. Go to https://sentry.io
2. Create project → select "Next.js"
3. Copy DSN
4. Install SDK: npm install @sentry/nextjs
5. Configure in next.config.js
```

**Cost:** Free (up to 5k errors/month)

---

### 5.3 PostHog (Product Analytics)

**Why:** Track user behavior (which creators do managers look at most, what features are used).

**Setup:**
```
1. Go to https://posthog.com
2. Create account → copy API key
3. npm install posthog-js
4. Initialize in app/layout.tsx
```

**Cost:** Free (up to 1M events/month)

---

### 5.4 Resend / SendGrid (Email)

**Why:** Email notifications to creators about performance milestones.

**Use case:**
```
Creator hits $500 GMV:
→ Send email: "Congrats! You've unlocked Silver tier"
→ Include payout info, next milestone
```

**Implementation:**
```typescript
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMilestoneEmail = action({
  args: { creatorEmail: v.string(), gmv: v.number() },
  async handler(ctx, args) {
    await resend.emails.send({
      from: "noreply@creator-dashboard.com",
      to: args.creatorEmail,
      subject: `Milestone: You've earned $${args.gmv}!`,
      html: `<h1>Great work!</h1><p>You've reached $${args.gmv} GMV this month.</p>`
    });
  }
});
```

**Cost:** Free (Resend up to 100 emails/day)

---

### 5.5 Stripe (Payout Management — Future)

**Why:** When you start paying creators from the dashboard (automated payouts).

**Data flow:**
```
Creator hits threshold ($500)
→ Automatically transfer commission via Stripe
→ Send payout notification
→ Log in activity: "Payout: $X processed"
```

**Setup:** Later (Phase 4+)

---

## 6. Integration Checklist & Timeline

### Week 1 (Foundation)
- [ ] Discord Bot API (member sync)
- [ ] Clerk OAuth (Discord sign-in)
- [ ] Convex JWT auth
- [ ] Basic webhook handler (manual testing)

**Outcome:** Dashboard has creator list, auth works, data flows in

### Week 2-3 (Automation)
- [ ] TikTok Shop API (auto GMV sync)
- [ ] Discord webhook (outgoing alerts)
- [ ] Webhook refinement (production-ready)
- [ ] Error handling + retries

**Outcome:** Performance updates flow automatically, team gets Discord alerts

### Week 4+ (Enhancement)
- [ ] Instagram verification
- [ ] YouTube metrics
- [ ] AI insights (OpenAI)
- [ ] Analytics (PostHog)
- [ ] Email notifications (Resend)

**Outcome:** Full 360° creator visibility

---

## 7. Data Flow Diagram

```
SOURCES (External)
├── Discord (member list)
├── TikTok Shop (GMV)
├── Instagram (followers)
├── YouTube (views)
└── Twitch (concurrent viewers)
        ↓
INGESTION (Your Server)
├── Discord Bot (pull)
├── TikTok API (pull)
├── Webhooks (push)
├── Zapier/Make (no-code bridges)
        ↓
PROCESSING (Next.js)
├── Normalize data
├── Verify/validate
├── Deduplicate
        ↓
STORAGE (Convex)
├── creators table
├── performance table
├── activities table
├── accounts table
        ↓
DASHBOARD (React)
├── Real-time queries
├── Charts/tables
├── Alerts
        ↓
OUTPUT (Back to External)
├── Discord webhooks
├── Email notifications
├── CSV exports
```

---

## 8. Environment Variables (Complete List)

```bash
# === CONVEX ===
NEXT_PUBLIC_CONVEX_URL=https://YOUR_DEPLOYMENT.convex.cloud

# === CLERK AUTH ===
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# === DISCORD ===
DISCORD_BOT_TOKEN=YOUR_BOT_TOKEN
DISCORD_GUILD_ID=YOUR_GUILD_ID
DISCORD_WEBHOOK_WINS=https://discordapp.com/api/webhooks/...
DISCORD_WEBHOOK_ALERTS=https://discordapp.com/api/webhooks/...
DISCORD_WEBHOOK_ESCALATIONS=https://discordapp.com/api/webhooks/...

# === TIKTOK SHOP ===
TIKTOK_CLIENT_ID=your_client_id
TIKTOK_CLIENT_SECRET=your_client_secret
TIKTOK_SHOP_ID=your_shop_id
TIKTOK_ACCESS_TOKEN=your_access_token

# === WEBHOOKS ===
WEBHOOK_SECRET=your_webhook_signing_secret

# === INSTAGRAM ===
INSTAGRAM_ACCESS_TOKEN=your_token
INSTAGRAM_BUSINESS_ACCOUNT_ID=your_account_id

# === YOUTUBE ===
YOUTUBE_API_KEY=your_api_key

# === TWITCH ===
TWITCH_CLIENT_ID=your_client_id
TWITCH_ACCESS_TOKEN=your_access_token

# === AI / ANALYTICS (Phase 3+) ===
OPENAI_API_KEY=sk-...
POSTHOG_API_KEY=phc_...
SENTRY_DSN=https://...
RESEND_API_KEY=re_...

# === DATABASE BACKUPS (Phase 2) ===
S3_BUCKET=creator-dashboard-backups
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
```

---

## 9. FAQ: Which API Should I Set Up First?

**Q: I have limited time. What's the minimum?**

A: Discord Bot + Clerk OAuth + Convex JWT
- Get all creators into the system
- Lock down auth
- This is 2-3 hours of work

**Q: I want GMV in the dashboard immediately.**

A: Add TikTok Shop API after Discord Bot
- This is your core metric
- Once running, you have real-time performance data
- Another 3-4 hours

**Q: I want the team to see updates in Discord.**

A: Discord webhook (outgoing)
- Post wins/losses automatically to #wins channel
- 1 hour to set up
- Keeps team synchronized

**Q: Everything feels overwhelming.**

A: Start with Discord Bot only.
- Get it working end-to-end
- Deploy to production
- Celebrate
- Then add TikTok
- Then webhooks
- One integration at a time.

---

## 10. Integration Deployment Checklist

For each integration, before marking "done":

- [ ] API credentials stored in env vars (not hardcoded)
- [ ] Error handling implemented (try/catch, logging)
- [ ] Rate limiting respected (respect API quotas)
- [ ] Data validation (check response format before storing)
- [ ] Tested with real data from 5+ sources
- [ ] Monitored for 24 hours (no errors in logs)
- [ ] Fallback behavior if API is down (graceful degradation)
- [ ] Team knows how to debug if it breaks
- [ ] Documented in README (which API, how to refresh tokens, etc.)

---

## 11. Quick Reference: API Credentials by Service

| Service | Credential Type | Where to Get | Refresh? | Cost |
|---|---|---|---|---|
| Discord Bot | Token | Developer Portal | No | Free |
| Clerk | API Key + Secret | Clerk Dashboard | Auto | Free |
| TikTok Shop | OAuth Token | Seller Dashboard | Yes (monthly) | Free |
| Instagram | Access Token | Meta App Dashboard | Yes (monthly) | Free |
| YouTube | API Key | Google Cloud Console | No | Free |
| Twitch | OAuth Token | Twitch Dev Console | Yes (monthly) | Free |
| OpenAI | API Key | OpenAI Dashboard | No | Paid ($) |
| Sentry | DSN | Sentry Dashboard | No | Free tier |

**Note:** OAuth tokens typically expire monthly and need refresh logic. Keep this in your mutation handlers.

---

## Summary

**Critical (Do This Week):**
1. Discord Bot API
2. Clerk OAuth
3. Convex JWT

**High Priority (Next Week):**
4. TikTok Shop API
5. Webhook Handler
6. Discord Webhooks

**Medium Priority (Following Weeks):**
7. Instagram Graph API
8. YouTube Data API
9. Twitch API

**Nice-to-Have (Later):**
10. OpenAI (insights)
11. Sentry (monitoring)
12. PostHog (analytics)
13. Resend (email)
14. Stripe (payouts, future)

You don't need all of these day 1. Start with Discord + Clerk, get 615 creators in the system, then add TikTok to see real GMV data. Everything else follows naturally from there.

---

**Document Version:** 1.0  
**Status:** Ready for Implementation  
**Last Updated:** May 14, 2026
