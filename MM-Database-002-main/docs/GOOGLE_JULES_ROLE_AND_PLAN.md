

# Google Jules Role Definition — UGC Creator Dashboard

**Project:** UGC Creator Performance Dashboard  
**Jules Integration Point:** Async task execution, webhook processing, scheduled jobs, API coordination  
**Document Status:** Operational Plan  
**Last Updated:** May 14, 2026

---

## 1. Executive Summary: Jules' Role

**Title:** Async Operations Engine & Task Orchestrator

**Core Responsibility:** Handle all long-running, background, and scheduled operations that would block the synchronous request/response cycle. Jules becomes the "worker" that runs the heavy lifting while your Next.js API stays fast and responsive.

**Why Jules Instead of Traditional Job Queues?**
- Google's managed service (no infrastructure overhead)
- Async-first design matches Convex's real-time updates perfectly
- Built-in retry logic and error handling
- No separate process to manage
- Costs scale with usage (pay only for execution)

**Key Principle:** If an operation takes >500ms or calls external APIs, it goes to Jules.

---

## 2. Jules Strengths & Why They Apply Here

### Strength 1: Long-Running Async Tasks
**What Jules Does:** Execute tasks in the background without blocking HTTP responses
**Your Use Case:** Syncing Discord member lists, fetching TikTok metrics, processing webhooks

**Example Flow:**
```
Request: POST /api/sync-creators
→ Immediately returns 202 "Sync started"
→ Jules handles: fetch 615 Discord members, validate, deduplicate, insert to Convex
→ When done, webhooks back to dashboard in real-time via Convex subscription
```

### Strength 2: Scheduled Jobs (Cron)
**What Jules Does:** Run tasks on a schedule (daily, hourly, etc.)
**Your Use Case:** Daily GMV syncs, weekly performance rollups, stale creator checks

**Examples:**
- **Daily 6am UTC:** Fetch GMV metrics from TikTok Shop API
- **Every 6 hours:** Check for inactive creators (no posts in 7 days)
- **Weekly Monday:** Generate performance summaries and email managers
- **Every 15 minutes:** Check Discord for new members and sync

### Strength 3: API Orchestration
**What Jules Does:** Coordinate multiple external API calls in sequence
**Your Use Case:** Complex data ingestion workflows

**Example:**
```
Single Jules job:
1. Fetch all creators from Convex
2. For each creator with Instagram handle:
   - Call Instagram Graph API
   - Extract follower_count, engagement_rate
   - Store in Convex performance table
3. Generate summary stats
4. Post to Discord #metrics channel
```

### Strength 4: Webhook Processing at Scale
**What Jules Does:** Handle spiky webhook traffic (multiple webhooks hitting at once)
**Your Use Case:** When TikTok Shop or PartnerStack sends batch conversions

**Example:**
```
Time: 3pm (peak shopping time)
Webhooks arrive: 50+ performance updates in 30 seconds
→ Traditional approach: Blocks your API server
→ Jules approach: 
   - Webhook handler queues to Jules
   - Immediately returns 202
   - Jules processes 50 in parallel
   - Each update syncs to Convex
   - Dashboard auto-updates via subscription
```

### Strength 5: Error Resilience & Retries
**What Jules Does:** Auto-retry failed operations with exponential backoff
**Your Use Case:** Flaky external APIs (Discord, TikTok can be slow)

**Built-in:**
- Retry up to 3 times on failure
- Exponential backoff (wait, then retry)
- Dead-letter handling (log permanent failures)
- Structured error reporting

---

## 3. Detailed Role: Jules' Responsibilities

### 3.1 Data Ingestion & Synchronization

**Job: `syncDiscordMembers`**

Runs on schedule (every 15 minutes) + manually triggered

```typescript
// Define in convex/actions/jules/syncDiscordMembers.ts

export const syncDiscordMembers = action({
  args: {
    forceFullSync: v.optional(v.boolean()), // manual override
  },
  async handler(ctx, args) {
    console.log("[Jules] Starting Discord member sync...");
    
    try {
      // 1. Fetch all members from Discord
      const discordMembers = await fetchDiscordMembers({
        guildId: process.env.DISCORD_GUILD_ID!,
        token: process.env.DISCORD_BOT_TOKEN!,
        limit: 1000,
      });
      
      console.log(`[Jules] Fetched ${discordMembers.length} members from Discord`);
      
      // 2. For each member, check if creator exists in Convex
      for (const member of discordMembers) {
        // Skip bots
        if (member.user.bot) continue;
        
        // Check if already exists
        const existing = await ctx.db
          .query("creators")
          .withIndex("by_discord_id", q => q.eq("discordId", member.user.id))
          .first();
        
        if (existing) {
          // Update last_seen, check if rejoined after inactive
          await ctx.db.patch(existing._id, {
            lastSeenAt: Date.now(),
            isActive: true,
          });
        } else {
          // New member — create as potential creator
          const newCreatorId = await ctx.db.insert("creators", {
            name: member.user.username,
            discordHandle: member.user.username,
            discordId: member.user.id,
            discordAvatar: member.user.avatar,
            tier: "bronze", // default tier
            isActive: true,
            joinedAt: new Date(member.joined_at).getTime(),
            managerId: process.env.DEFAULT_MANAGER_ID as Id<"users">, // TBD
            notes: "Auto-synced from Discord",
            tags: ["new", "pending-review"],
          });
          
          // Log this as an activity
          await ctx.db.insert("activities", {
            creatorId: newCreatorId,
            type: "observation",
            title: "New member joined",
            description: `${member.user.username} joined Discord server`,
            recordedBy: process.env.SYSTEM_USER_ID as Id<"users">,
            recordedAt: Date.now(),
          });
        }
      }
      
      // 3. Check for members who left (not in Discord anymore)
      const activeCreators = await ctx.db
        .query("creators")
        .filter(q => q.eq(q.field("isActive"), true))
        .collect();
      
      const discordIds = new Set(discordMembers.map(m => m.user.id));
      
      for (const creator of activeCreators) {
        if (creator.discordId && !discordIds.has(creator.discordId)) {
          // Member left — mark inactive
          await ctx.db.patch(creator._id, {
            isActive: false,
            lastSeenAt: Date.now(),
          });
          
          await ctx.db.insert("activities", {
            creatorId: creator._id,
            type: "observation",
            title: "Member left Discord",
            description: `${creator.name} is no longer in the server`,
            recordedBy: process.env.SYSTEM_USER_ID as Id<"users">,
            recordedAt: Date.now(),
          });
        }
      }
      
      // 4. Report success
      const summary = {
        synced: discordMembers.length,
        newCreators: discordMembers.filter(m => !m.existing).length,
        inactiveCreators: activeCreators.filter(c => 
          c.discordId && !discordIds.has(c.discordId)
        ).length,
        timestamp: new Date().toISOString(),
      };
      
      console.log("[Jules] Discord sync complete:", summary);
      
      // 5. Notify team via Discord
      await notifyDiscordWebhook(
        process.env.DISCORD_WEBHOOK_ALERTS!,
        {
          title: "✅ Discord Sync Complete",
          description: `Synced ${summary.synced} members, ${summary.newCreators} new`,
          color: 0x00ff00,
        }
      );
      
      return summary;
      
    } catch (error) {
      console.error("[Jules] Discord sync failed:", error);
      
      // Log failure
      await notifyDiscordWebhook(
        process.env.DISCORD_WEBHOOK_ESCALATIONS!,
        {
          title: "❌ Discord Sync Failed",
          description: `Error: ${error.message}`,
          color: 0xff0000,
        }
      );
      
      throw error; // Jules will retry
    }
  }
});
```

---

**Job: `syncTikTokGMV`**

Runs daily at 6am UTC + manually triggered

```typescript
export const syncTikTokGMV = action({
  args: {
    period: v.union(v.literal("7d"), v.literal("30d"), v.literal("mtd")),
  },
  async handler(ctx, args) {
    console.log(`[Jules] Starting TikTok GMV sync for ${args.period}...`);
    
    try {
      // 1. Refresh TikTok access token if needed
      const token = await refreshTikTokToken();
      
      // 2. Fetch affiliate performance data
      const response = await fetch(
        "https://open-api.tiktok.com/v1/affiliate/performance",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            shop_id: process.env.TIKTOK_SHOP_ID,
            start_date: calculateStartDate(args.period),
            end_date: new Date().toISOString().split('T')[0],
            metrics: [
              "gmv",
              "conversions",
              "orders",
              "post_count",
              "engagement_rate"
            ],
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error(`TikTok API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // 3. Process each affiliate
      let updated = 0;
      let skipped = 0;
      const topPerformers = [];
      
      for (const affiliate of data.data.affiliates) {
        // Find creator by TikTok handle
        const creator = await ctx.db
          .query("accounts")
          .withIndex("by_handle", q => 
            q.eq("handle", affiliate.tiktok_handle)
          )
          .first();
        
        if (!creator) {
          skipped++;
          console.log(`[Jules] Skipped unknown TikTok handle: ${affiliate.tiktok_handle}`);
          continue;
        }
        
        const creatorId = creator.creatorId;
        
        // Update performance metrics
        const perfId = await ctx.db.insert("performance", {
          creatorId,
          period: args.period,
          gmv: affiliate.gmv,
          postCount: affiliate.post_count,
          liveCount: 0, // TikTok doesn't provide this
          engagementRate: affiliate.engagement_rate,
          lastUpdated: Date.now(),
          source: "api", // TikTok API
        });
        
        // Check for GMV milestone (e.g., $500, $1000)
        const previousPerf = await ctx.db
          .query("performance")
          .withIndex("by_creator", q => q.eq("creatorId", creatorId))
          .filter(q => q.neq(q.field("_id"), perfId))
          .order("desc")
          .first();
        
        if (affiliate.gmv >= 500 && (!previousPerf || previousPerf.gmv < 500)) {
          // Milestone reached!
          topPerformers.push({
            creatorId,
            handle: affiliate.tiktok_handle,
            gmv: affiliate.gmv,
          });
          
          // Record as activity
          await ctx.db.insert("activities", {
            creatorId,
            type: "win",
            title: `Milestone: $${affiliate.gmv} GMV`,
            description: `Reached $${affiliate.gmv} GMV in ${args.period}`,
            recordedBy: process.env.SYSTEM_USER_ID as Id<"users">,
            recordedAt: Date.now(),
            impact: "high",
          });
        }
        
        updated++;
      }
      
      // 4. Report results
      const summary = {
        updated,
        skipped,
        milestones: topPerformers.length,
        timestamp: new Date().toISOString(),
      };
      
      console.log("[Jules] TikTok GMV sync complete:", summary);
      
      // 5. Notify team
      if (topPerformers.length > 0) {
        await notifyDiscordWebhook(
          process.env.DISCORD_WEBHOOK_WINS!,
          {
            title: "🎉 GMV Milestones Reached",
            description: topPerformers
              .map(p => `${p.handle}: $${p.gmv}`)
              .join("\n"),
            color: 0x00ff00,
          }
        );
      }
      
      return summary;
      
    } catch (error) {
      console.error("[Jules] TikTok GMV sync failed:", error);
      await notifyDiscordWebhook(
        process.env.DISCORD_WEBHOOK_ESCALATIONS!,
        {
          title: "❌ TikTok GMV Sync Failed",
          description: `Error: ${error.message}`,
          color: 0xff0000,
        }
      );
      throw error;
    }
  }
});
```

---

### 3.2 Webhook & Event Processing

**Handler: `handlePerformanceWebhook`**

Called by TikTok Shop / PartnerStack / tracking service

```typescript
export const handlePerformanceWebhook = action({
  args: {
    payload: v.object({
      affiliate_id: v.string(),
      gmv: v.number(),
      conversions: v.number(),
      orders: v.number(),
      timestamp: v.string(),
      source: v.enum("tiktok", "partnertack", "impact"),
    }),
    signature: v.string(), // for verification
  },
  async handler(ctx, args) {
    console.log("[Jules] Processing performance webhook:", args.payload.affiliate_id);
    
    try {
      // 1. Verify webhook signature (security)
      if (!verifyWebhookSignature(args.payload, args.signature)) {
        throw new Error("Invalid webhook signature");
      }
      
      // 2. Find creator by affiliate ID
      const creator = await ctx.db
        .query("creators")
        .filter(q => q.eq(q.field("affiliateId"), args.payload.affiliate_id))
        .first();
      
      if (!creator) {
        console.warn(`[Jules] Unknown affiliate ID: ${args.payload.affiliate_id}`);
        // Don't fail — log and skip
        return { status: "skipped", reason: "unknown_affiliate" };
      }
      
      // 3. Update performance
      await ctx.db.insert("performance", {
        creatorId: creator._id,
        period: "7d",
        gmv: args.payload.gmv,
        postCount: 0, // webhook doesn't include this
        liveCount: 0,
        lastUpdated: Date.now(),
        source: "webhook",
      });
      
      // 4. Record activity
      await ctx.db.insert("activities", {
        creatorId: creator._id,
        type: "observation",
        title: `Webhook: +$${args.payload.gmv}`,
        description: `${args.payload.conversions} conversions, ${args.payload.orders} orders`,
        recordedBy: process.env.SYSTEM_USER_ID as Id<"users">,
        recordedAt: Date.now(),
        tags: [args.payload.source],
      });
      
      // 5. Check for anomalies (unusual spike)
      const avgPerformance = await getAverageCreatorPerformance(creator._id);
      
      if (args.payload.gmv > avgPerformance * 2.5) {
        // Anomaly detected — notify
        await notifyDiscordWebhook(
          process.env.DISCORD_WEBHOOK_ALERTS!,
          {
            title: "📊 Anomaly Detected",
            description: `${creator.name}: GMV spike $${args.payload.gmv} (avg: $${avgPerformance})`,
            color: 0xffff00,
          }
        );
      }
      
      console.log(`[Jules] Webhook processed for ${creator.name}`);
      return { status: "success", creatorId: creator._id };
      
    } catch (error) {
      console.error("[Jules] Webhook processing failed:", error);
      // Jules will retry automatically
      throw error;
    }
  }
});
```

---

### 3.3 Scheduled Intelligence Tasks

**Job: `detectAtRiskCreators`**

Runs every 6 hours

```typescript
export const detectAtRiskCreators = action({
  args: {},
  async handler(ctx) {
    console.log("[Jules] Starting at-risk creator detection...");
    
    try {
      // 1. Find creators who haven't posted in 7+ days
      const allCreators = await ctx.db.query("creators").collect();
      const atRisk = [];
      
      for (const creator of allCreators) {
        if (!creator.isActive) continue;
        
        // Get recent activities
        const recentPosts = await ctx.db
          .query("activities")
          .withIndex("by_creator", q => q.eq("creatorId", creator._id))
          .filter(q => q.eq(q.field("type"), "observation"))
          .order("desc")
          .take(5);
        
        // Check if any posts in last 7 days
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        const recentPostExists = recentPosts.some(p => p.recordedAt > sevenDaysAgo);
        
        if (!recentPostExists) {
          atRisk.push({
            creatorId: creator._id,
            name: creator.name,
            reason: "no_posts_7d",
            lastActivity: recentPosts[0]?.recordedAt || creator.joinedAt,
          });
        }
      }
      
      // 2. Find creators with declining GMV trend
      for (const creator of allCreators) {
        const perfs = await ctx.db
          .query("performance")
          .withIndex("by_creator", q => q.eq("creatorId", creator._id))
          .order("desc")
          .take(4); // Last 4 periods
        
        if (perfs.length >= 3) {
          const trend = [perfs[0].gmv, perfs[1].gmv, perfs[2].gmv];
          const isDecling = trend[0] < trend[1] && trend[1] < trend[2];
          
          if (isDecling && trend[0] < 100) {
            // Consistent decline + low GMV
            atRisk.push({
              creatorId: creator._id,
              name: creator.name,
              reason: "declining_gmv",
              trend: trend,
            });
          }
        }
      }
      
      // 3. Create or update risk flags
      for (const risk of atRisk) {
        await ctx.db.insert("activities", {
          creatorId: risk.creatorId,
          type: "loss",
          title: `⚠️ At-Risk Flag: ${risk.reason}`,
          description: JSON.stringify(risk),
          recordedBy: process.env.SYSTEM_USER_ID as Id<"users">,
          recordedAt: Date.now(),
          impact: "high",
        });
      }
      
      // 4. Send summary to management
      if (atRisk.length > 0) {
        await notifyDiscordWebhook(
          process.env.DISCORD_WEBHOOK_ESCALATIONS!,
          {
            title: `⚠️ ${atRisk.length} Creators At Risk`,
            description: atRisk
              .map(r => `• ${r.name}: ${r.reason}`)
              .join("\n"),
            color: 0xff6600,
          }
        );
      }
      
      console.log(`[Jules] At-risk detection complete: ${atRisk.length} creators`);
      return { atRiskCount: atRisk.length };
      
    } catch (error) {
      console.error("[Jules] At-risk detection failed:", error);
      throw error;
    }
  }
});
```

---

### 3.4 Data Generation & Reporting

**Job: `generateDailyPerformanceSummary`**

Runs daily at 9am UTC

```typescript
export const generateDailyPerformanceSummary = action({
  args: {},
  async handler(ctx) {
    console.log("[Jules] Generating daily performance summary...");
    
    try {
      // 1. Get yesterday's data
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const startOfDay = new Date(yesterday);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(yesterday);
      endOfDay.setHours(23, 59, 59, 999);
      
      // 2. Aggregate metrics
      const allCreators = await ctx.db.query("creators").collect();
      
      let totalGMV = 0;
      let totalConversions = 0;
      let newWins = [];
      let topPerformers = [];
      
      for (const creator of allCreators) {
        const perf = await ctx.db
          .query("performance")
          .withIndex("by_creator", q => q.eq("creatorId", creator._id))
          .order("desc")
          .first();
        
        if (perf) {
          totalGMV += perf.gmv;
        }
        
        // Get today's wins
        const wins = await ctx.db
          .query("activities")
          .withIndex("by_creator", q => q.eq("creatorId", creator._id))
          .filter(q => 
            q.and(
              q.eq(q.field("type"), "win"),
              q.gte(q.field("recordedAt"), startOfDay.getTime()),
              q.lte(q.field("recordedAt"), endOfDay.getTime())
            )
          )
          .collect();
        
        if (wins.length > 0) {
          newWins.push({
            creatorName: creator.name,
            count: wins.length,
            titles: wins.map(w => w.title),
          });
        }
      }
      
      // 3. Find top 5 performers
      const creators = await ctx.db.query("creators").collect();
      const withGMV = await Promise.all(
        creators.map(async c => {
          const perf = await ctx.db
            .query("performance")
            .withIndex("by_creator", q => q.eq("creatorId", c._id))
            .order("desc")
            .first();
          return { creator: c, gmv: perf?.gmv || 0 };
        })
      );
      
      topPerformers = withGMV
        .sort((a, b) => b.gmv - a.gmv)
        .slice(0, 5)
        .map(item => ({
          name: item.creator.name,
          gmv: item.gmv,
        }));
      
      // 4. Generate report
      const report = {
        date: yesterday.toISOString().split('T')[0],
        totalGMV: Math.round(totalGMV * 100) / 100,
        totalCreators: allCreators.length,
        activeCreators: allCreators.filter(c => c.isActive).length,
        newWins: newWins.length,
        topPerformers,
      };
      
      // 5. Post to Discord
      await notifyDiscordWebhook(
        process.env.DISCORD_WEBHOOK_REPORTS!,
        {
          title: `📊 Daily Summary — ${report.date}`,
          description: [
            `Total GMV: $${report.totalGMV}`,
            `Active Creators: ${report.activeCreators}/${report.totalCreators}`,
            `New Wins: ${report.newWins}`,
            "",
            "🏆 Top 5 Performers:",
            ...topPerformers.map((p, i) => `${i+1}. ${p.name}: $${p.gmv}`),
          ].join("\n"),
          color: 0x0099ff,
        }
      );
      
      // 6. Email managers (optional)
      const managers = await ctx.db
        .query("users")
        .filter(q => q.eq(q.field("role"), "manager"))
        .collect();
      
      for (const manager of managers) {
        await sendEmail({
          to: manager.email,
          subject: `Daily Performance Summary — ${report.date}`,
          html: generateReportHTML(report),
        });
      }
      
      console.log("[Jules] Daily summary complete");
      return report;
      
    } catch (error) {
      console.error("[Jules] Daily summary generation failed:", error);
      throw error;
    }
  }
});
```

---

### 3.5 External Service Integration

**Job: `syncInstagramMetrics`**

Runs every 24 hours

```typescript
export const syncInstagramMetrics = action({
  args: {},
  async handler(ctx) {
    console.log("[Jules] Starting Instagram metrics sync...");
    
    try {
      // 1. Find all Instagram accounts linked to creators
      const accounts = await ctx.db
        .query("accounts")
        .filter(q => q.eq(q.field("platform"), "instagram"))
        .collect();
      
      const token = process.env.INSTAGRAM_ACCESS_TOKEN;
      
      // 2. Fetch metrics for each account
      for (const account of accounts) {
        try {
          const response = await fetch(
            `https://graph.instagram.com/v19.0/${account.igBusinessAccountId}?fields=followers_count,media_count,profile_picture_url,biography,ig_username`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          );
          
          if (!response.ok) continue;
          
          const data = await response.json();
          
          // 3. Store engagement metrics
          await ctx.db.insert("performance", {
            creatorId: account.creatorId,
            period: "mtd",
            gmv: 0, // Instagram doesn't provide GMV
            postCount: data.media_count,
            liveCount: 0,
            engagementRate: data.followers_count * 0.02, // estimated
            lastUpdated: Date.now(),
            source: "api", // Instagram
          });
        } catch (e) {
          console.error(`[Jules] Failed to fetch Instagram for ${account.handle}:`, e);
          // Continue to next account
        }
      }
      
      console.log(`[Jules] Instagram sync complete: ${accounts.length} accounts`);
      return { synced: accounts.length };
      
    } catch (error) {
      console.error("[Jules] Instagram sync failed:", error);
      throw error;
    }
  }
});
```

---

## 4. Jules Scheduling Plan

### Cron Schedule Definition

```typescript
// Define in convex/tasks.ts or Jules config

export const julesSchedule = {
  // Every 15 minutes
  "*/15 * * * *": {
    name: "syncDiscordMembers",
    timeout: "5m",
    maxRetries: 3,
  },
  
  // Every 6 hours
  "0 */6 * * *": {
    name: "detectAtRiskCreators",
    timeout: "10m",
    maxRetries: 2,
  },
  
  // Daily at 6am UTC
  "0 6 * * *": {
    name: "syncTikTokGMV",
    args: { period: "7d" },
    timeout: "15m",
    maxRetries: 3,
  },
  
  // Daily at 6:30am UTC (30 min after TikTok)
  "30 6 * * *": {
    name: "syncTikTokGMV",
    args: { period: "mtd" },
    timeout: "15m",
    maxRetries: 3,
  },
  
  // Daily at 9am UTC
  "0 9 * * *": {
    name: "generateDailyPerformanceSummary",
    timeout: "10m",
    maxRetries: 1,
  },
  
  // Every 24 hours at 3am UTC
  "0 3 * * *": {
    name: "syncInstagramMetrics",
    timeout: "20m",
    maxRetries: 2,
  },
  
  // Weekly Monday at 12am UTC
  "0 0 * * 1": {
    name: "generateWeeklyReport",
    timeout: "15m",
    maxRetries: 1,
  },
};
```

---

## 5. Integration with Convex & Next.js

### How Jules Fits Into Your Architecture

```
┌─────────────────────────────────────────────────┐
│          Next.js API Routes / Pages             │
│  (Request/Response Cycle - <500ms target)       │
└─────────────────────────────────────────────────┘
              ↓ (offload long tasks)
┌─────────────────────────────────────────────────┐
│       Google Jules (Async Worker)               │
│  - Discord Bot Sync                             │
│  - TikTok API Polling                           │
│  - Webhook Processing                           │
│  - Intelligence Tasks (anomaly detection)       │
│  - Report Generation                            │
│  - Email Notifications                          │
└─────────────────────────────────────────────────┘
              ↓ (updates database)
┌─────────────────────────────────────────────────┐
│            Convex Database                      │
│  (Real-time subscriptions auto-update)          │
└─────────────────────────────────────────────────┘
              ↓ (real-time pushes)
┌─────────────────────────────────────────────────┐
│         React Dashboard (Next.js Client)        │
│  (Auto-updates when Jules completes tasks)      │
└─────────────────────────────────────────────────┘
```

### Example: Full Data Flow

```
Time: 3:00 PM

1. Creator posts on TikTok
2. Conversion tracked by TikTok Shop
3. 3:01 PM — Webhook arrives: POST /api/webhooks/performance
4. Handler queues job to Jules: handlePerformanceWebhook
5. Returns 202 immediately (fast response)
6. Jules processes:
   - Validates signature
   - Updates Convex performance table
   - Checks for anomalies
   - Posts to Discord #wins if milestone
7. Convex subscription triggers on dashboard
8. React component re-renders with new GMV
9. Manager sees update instantly (no page refresh)

Total time: <500ms for API response, <2s for dashboard update
```

---

## 6. Error Handling & Monitoring

### Jules Error Strategies

#### Strategy 1: Retry with Exponential Backoff
```typescript
// Default behavior (built into Jules)
Attempt 1: Immediate
Attempt 2: Wait 5s
Attempt 3: Wait 25s
Attempt 4: Fail, log to Discord
```

#### Strategy 2: Graceful Degradation
```typescript
// If TikTok API is down, Discord still gets notified
// But with "partial data" flag
await notifyDiscordWebhook({
  title: "⚠️ TikTok API Unavailable",
  description: "GMV sync skipped. Will retry in 6 hours.",
  color: 0xffff00,
});
```

#### Strategy 3: Dead Letter Queue
```typescript
// Failed jobs logged to database
await ctx.db.insert("failed_jobs", {
  jobName: "syncTikTokGMV",
  error: error.message,
  timestamp: Date.now(),
  retryCount: 3,
});
```

### Monitoring & Alerts

**Dashboard metrics to track:**
- Last successful sync time for each job
- Failure count (last 24h)
- Average execution time per job
- Queue depth (jobs waiting)

**Discord alerts:**
- Job fails 3x in a row → #escalations channel
- Job takes >2x normal execution time → #alerts
- Webhook processing errors → #alerts

---

## 7. Security Considerations

### API Key Management
```typescript
// Never expose keys in code
const token = process.env.TIKTOK_ACCESS_TOKEN; // ✓
const token = "sk_live_123..."; // ✗

// Rotate periodically
schedule: "0 0 1 * *" // 1st of month
job: "rotateExternalTokens"
```

### Webhook Verification
```typescript
// Verify all incoming webhooks
function verifyWebhookSignature(payload, signature) {
  const hash = crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(JSON.stringify(payload))
    .digest("hex");
  
  return hash === signature; // ✓ Safe
}
```

### Rate Limiting
```typescript
// Respect API quotas
const discordFetch = new RateLimiter({
  maxRequests: 50,
  windowMs: 60000, // 50 per minute
});
```

---

## 8. Cost Analysis

### Jules Execution Costs

**Pricing Model:** Pay per task execution (based on duration)

| Job | Frequency | Duration | Est. Monthly Cost |
|---|---|---|---|
| syncDiscordMembers | Every 15m | 2s | $0.10 |
| syncTikTokGMV (7d) | Daily | 5s | $0.02 |
| syncTikTokGMV (mtd) | Daily | 5s | $0.02 |
| handlePerformanceWebhook | Per webhook (varies) | 1s | ~$0.50 |
| detectAtRiskCreators | Every 6h | 10s | $0.05 |
| generateDailyPerformanceSummary | Daily | 8s | $0.04 |
| syncInstagramMetrics | Daily | 15s | $0.08 |
| **TOTAL** | — | — | **~$0.81/mo** |

**Comparison:**
- Traditional job queue (Bull, RQ): $5-50/mo infrastructure
- Serverless (Lambda + SQS): $2-10/mo
- **Jules: <$1/mo** (best value for your scale)

---

## 9. Implementation Timeline

### Phase 1: Foundation (Week 1)
- [ ] Set up Jules environment
- [ ] Implement `syncDiscordMembers` job
- [ ] Test with 10 test Discord members
- [ ] Deploy and monitor

### Phase 2: Core Data (Week 2)
- [ ] Implement `syncTikTokGMV` job
- [ ] Implement webhook handler
- [ ] Test with mock TikTok data
- [ ] Set up Discord notifications

### Phase 3: Intelligence (Week 3)
- [ ] Implement `detectAtRiskCreators` job
- [ ] Implement `generateDailyPerformanceSummary`
- [ ] Add email reporting
- [ ] Fine-tune alerting

### Phase 4: Enhancement (Week 4+)
- [ ] Instagram/YouTube syncs
- [ ] Advanced anomaly detection
- [ ] Predictive recommendations (AI integration)
- [ ] Custom report generation

---

## 10. Success Criteria

| Metric | Target | Measurement |
|---|---|---|
| **Sync Reliability** | 99.5% success rate | Jules execution logs |
| **Latency** | <2s per API call | Jules dashboard metrics |
| **Discord Update Speed** | <5s from event to notification | Timestamps in Discord |
| **Dashboard Freshness** | <1min stale data | Convex query timestamps |
| **Cost** | <$2/mo | Google Cloud billing |
| **Coverage** | 100% of creators synced | Database count queries |

---

## 11. Jules Configuration (Example)

```typescript
// google/configuration.ts

export const julesConfig = {
  projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  apiKey: process.env.GOOGLE_JULES_API_KEY,
  
  // Execution settings
  timeout: {
    default: 60000, // 1 min
    long: 600000, // 10 min
  },
  
  retryPolicy: {
    maxAttempts: 3,
    backoffMultiplier: 5,
    initialBackoffMs: 1000,
  },
  
  // Monitoring
  errorReporting: {
    slackWebhook: process.env.SLACK_WEBHOOK,
    discordWebhook: process.env.DISCORD_WEBHOOK_ESCALATIONS,
  },
  
  // Rate limiting (per service)
  rateLimits: {
    discord: { rpm: 120 },
    tiktok: { rph: 200 },
    instagram: { rpm: 50 },
  },
};
```

---

## 12. Quick Reference: Jules vs Alternatives

| Aspect | Jules | Traditional Queue | Serverless (Lambda) |
|---|---|---|---|
| **Setup Time** | 30 min | 2-3 hours | 1-2 hours |
| **Monitoring** | Built-in | Manual | Built-in |
| **Scaling** | Auto | Manual | Auto |
| **Cost** | <$1/mo | $10-50/mo | $2-10/mo |
| **Best For** | Low-volume async | High-volume background jobs | Bursty workloads |
| **Learning Curve** | Shallow | Moderate | Deep |

**For your project?** Jules is optimal. Low cost, low complexity, auto-scaling, perfect for 615 creators.

---

## Appendix: Code Snippet Library

### Utility: Verify Webhook
```typescript
function verifyWebhookSignature(payload: any, signature: string): boolean {
  const secret = process.env.WEBHOOK_SECRET!;
  const hash = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(payload))
    .digest("hex");
  
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(signature)
  );
}
```

### Utility: Notify Discord
```typescript
async function notifyDiscordWebhook(
  webhookUrl: string,
  embed: {
    title: string;
    description: string;
    color: number;
  }
): Promise<void> {
  await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      embeds: [{ ...embed, timestamp: new Date().toISOString() }],
    }),
  });
}
```

### Utility: Fetch Discord Members
```typescript
async function fetchDiscordMembers({
  guildId,
  token,
  limit = 1000,
}: {
  guildId: string;
  token: string;
  limit?: number;
}): Promise<any[]> {
  const members = [];
  let after: string | undefined;
  
  while (true) {
    const response = await fetch(
      `https://discord.com/api/v10/guilds/${guildId}/members?limit=1000${
        after ? `&after=${after}` : ""
      }`,
      {
        headers: { Authorization: `Bot ${token}` },
      }
    );
    
    const batch = await response.json();
    if (!batch.length) break;
    
    members.push(...batch);
    after = batch[batch.length - 1].user.id;
    
    if (members.length >= limit) return members.slice(0, limit);
  }
  
  return members;
}
```

---

## Summary: Jules Role

**Title:** Async Operations Engine & Task Orchestrator

**Responsibilities:**
1. ✓ Discord member synchronization (15-min intervals)
2. ✓ TikTok GMV syncing (daily)
3. ✓ Webhook processing at scale (real-time)
4. ✓ Anomaly detection (6-hourly)
5. ✓ Performance reporting (daily)
6. ✓ External API coordination (multi-step workflows)
7. ✓ Intelligent task execution with retry logic
8. ✓ Error handling and alerting

**Key Benefit:** Keeps your Next.js API fast (<500ms) while handling heavy lifting asynchronously. Dashboard stays responsive while Jules orchestrates data flow.

**Cost:** <$1/mo

**Implementation:** 2-3 weeks (phased approach)

---

**Document Version:** 1.0  
**Status:** Ready for Implementation  
**Last Updated:** May 14, 2026
