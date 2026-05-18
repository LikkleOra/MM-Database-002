# UGC Creator Performance Dashboard — PRD + Implementation Guide

**Project Name:** UGC Creator Performance Dashboard (working title: "Shah Management")  
**Status:** Pre-Alpha (Architecture + Foundation Phase)  
**Owner:** Thabiso Buthelezi  
**Tech Stack:** Next.js 15 + Convex + Clerk + Tailwind CSS v4  
**Deployment:** Vercel  
**Target Users:** UGC operation managers, team leads, growth operators  
**Scale Target:** 615+ concurrent users, real-time performance tracking  
**Last Updated:** May 13, 2026

---

## 1. Product Requirements Document (PRD)

### 1.1 Problem Statement

UGC (User-Generated Content) operations generate affiliate revenue at scale by coordinating content creators across platforms (TikTok, Instagram, YouTube) promoting products. Current tracking is fragmented — spreadsheets, Discord posts, manual notes — making it impossible to:

- See creator performance at a glance (wins vs. losses)
- Track which creators are making money (GMV — Gross Merchandise Value)
- Identify underperforming tiers or accounts quickly
- Measure adjustment impact in real time
- Scale management beyond 50-100 creators

**This dashboard is the single source of truth for one UGC operation managing 615+ creators, their platforms, products, and revenue.**

### 1.2 Goals

1. **Real-time Creator Visibility** — See all creators, their status, tier, platform accounts, and live performance metrics without page refresh
2. **Performance Tracking** — GMV (month-to-date + 7-day), post count, live stream count, engagement trajectory
3. **Win/Loss Recording** — Quick-log when a creator wins or underperforms, auto-attach timestamps and notes
4. **Tier Management** — Bronze → Silver → Gold system; assign, bulk-update, track tier eligibility
5. **Account Linking** — Multiple social accounts per creator; platform-specific tracking
6. **Adjustment Logging** — Record what changes (commission, payout structure, creative direction) and measure impact
7. **Discord Integration** — Pull/push creator data and performance alerts to Discord channel
8. **Scalability** — Handle 615+ creators now, 2000+ eventually, with real-time updates for all simultaneously

### 1.3 Core Use Cases

**Primary User: Operation Manager**
- Opens dashboard → sees all creators ranked by GMV 7D
- Clicks creator → opens detail view with all accounts, posts, recent wins/losses, adjustments
- Notes: "Achetr is trending on TikTok, boost commission"
- System logs timestamp, visible to team, can be filtered/reported

**Secondary: Manager Reviewing Team**
- Sees team-level rollup (total GMV, post volume, active creators)
- Filters by tier, status, performance bracket
- Exports CSV for weekly standup

**Advanced: Analytics/Growth Operator**
- Builds custom filters: "All Silver creators not posted in 7 days"
- Tracks tier-promotion eligible creators
- Runs simulations: "If we move all Bronze → Silver, revenue impact?"

### 1.4 MVP Feature Set (Phase 1)

**Must have:**
- [ ] Creator database table (name, Discord, tier, accounts, active status)
- [ ] Real-time GMV + post metrics (MTD, 7D)
- [ ] Creator detail page (single creator profile, all linked accounts, recent activity)
- [ ] Quick-add win/loss/adjustment notes (modal, timestamp auto-attached)
- [ ] Tier badges (visual indicator: Bronze, Silver, Gold)
- [ ] Status indicator (active/inactive green dot)
- [ ] Role-based access (admin sees all, manager sees team, creator sees self)
- [ ] Discord handle lookup (click → opens Discord profile)
- [ ] Search + filter (by name, Discord, tier, status, active %)
- [ ] Basic CSV export (creator data + metrics)

**Nice to have (Phase 2):**
- [ ] Timeline view (all wins/losses/adjustments in chronological feed)
- [ ] Bulk tier assignment
- [ ] AI-powered performance recommendations
- [ ] Discord channel syncing (post summaries daily)
- [ ] Webhook from tracking system (auto-ingest GMV updates)
- [ ] Mobile-responsive dashboard
- [ ] Dark mode
- [ ] Notification system (creator goes inactive, GMV spike, etc.)

**Out of scope (Phase 3+):**
- Platform analytics (Twitter/X posting)
- Ad spend tracking
- Payout reconciliation
- Custom CRM workflows

### 1.5 Success Metrics

| Metric | Target | Measurement |
|---|---|---|
| Page Load Time | <2s | Vercel analytics |
| Real-time Update Latency | <500ms | Convex subscription latency |
| Creator Count | 615+ | Database count query |
| Concurrent Users | 50+ | Vercel analytics |
| Uptime | 99.5% | Vercel SLA |
| Feature Adoption | 80% use win/loss logging weekly | Product analytics (Posthog) |

---

## 2. Architecture & System Design

### 2.1 System Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                     CLIENT (Next.js 15)                         │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Pages:                                                  │   │
│  │  - /dashboard (main creator table)                      │   │
│  │  - /creators/[id] (single creator detail)              │   │
│  │  - /settings (role/access management)                  │   │
│  │  - /reports (export + analytics)                       │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ Components:                                             │   │
│  │  - CreatorTable (real-time list)                       │   │
│  │  - CreatorCard (mini detail)                           │   │
│  │  - WinLossModal (quick log)                            │   │
│  │  - TierBadge, StatusDot (visual indicators)            │   │
│  │  - SocialAccountCard (linked accounts)                 │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │ (Clerk Auth)
                              │ (Real-time subscription)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│            BACKEND (Convex + TypeScript)                        │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ Database Tables:                                        │   │
│  │  - creators                                             │   │
│  │  - tiers                                                │   │
│  │  - accounts (social handles, linked to creators)       │   │
│  │  - performance (GMV, posts, lives, period snapshots)   │   │
│  │  - activities (wins, losses, adjustments, notes)       │   │
│  │  - users (managers, access control)                    │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ Queries:                                                │   │
│  │  - listCreators (filtered, paginated)                  │   │
│  │  - getCreator (single + all linked data)              │   │
│  │  - listActivities (by creator or timeline)            │   │
│  │  - getTeamRollup (manager's team stats)               │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │ Mutations:                                              │   │
│  │  - addCreator / updateCreator                          │   │
│  │  - linkAccount / unlinkAccount                         │   │
│  │  - recordActivity (win/loss/adjustment)               │   │
│  │  - updatePerformance (GMV, posts, lives)              │   │
│  │  - assignTier / bulkUpdateTiers                        │   │
│  │  - syncDiscordData (webhook handler)                   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
            ┌──────────────────────────────────┐
            │   External Services (Phase 2+)   │
            │  - Discord API (profile lookup)  │
            │  - TikTok Shop API (GMV feed)    │
            │  - Webhook (GMV ingest)          │
            └──────────────────────────────────┘
```

### 2.2 Data Model (Convex Schema)

#### Creators Table
```typescript
// Core creator record
{
  _id: Id<"creators">,
  name: string,                    // "Achetr"
  discordHandle: string,           // "achterkamper97"
  discordId?: string,              // "123456789" (cached from API)
  tier: "bronze" | "silver" | "gold",
  isActive: boolean,               // green dot = true
  joinedAt: number,                // timestamp
  notes?: string,                  // freeform notes
  managerId: Id<"users">,          // who oversees this creator
  tags?: string[],                 // ["trending", "consistent", "flagged"]
  _creationTime: number,
}
```

#### Accounts Table (Social Handles)
```typescript
// Linked social accounts per creator
{
  _id: Id<"accounts">,
  creatorId: Id<"creators">,
  platform: "tiktok" | "instagram" | "youtube" | "twitch",
  handle: string,                  // "achterkamper97"
  profileUrl?: string,             // "https://tiktok.com/@..."
  isActive: boolean,               // tracking account or not
  linkedAt: number,
  _creationTime: number,
}
```

#### Performance Table
```typescript
// Metrics snapshot, keyed by creator + period
{
  _id: Id<"performance">,
  creatorId: Id<"creators">,
  period: "mtd" | "7d" | "30d",    // month-to-date, 7-day, 30-day
  gmv: number,                     // $82 (Gross Merchandise Value)
  postCount: number,               // 8 posts
  liveCount: number,               // 0 lives
  engagementRate?: number,         // % (calculated)
  lastUpdated: number,             // when metrics were synced
  source?: "manual" | "api" | "webhook",
  _creationTime: number,
}
```

#### Activities Table (Win/Loss/Adjustment Logs)
```typescript
// All recorded activities per creator
{
  _id: Id<"activities">,
  creatorId: Id<"creators">,
  type: "win" | "loss" | "adjustment" | "observation",
  title: string,                   // "boost commission"
  description: string,             // freeform notes
  tags?: string[],                 // ["tiktok", "trending"]
  recordedBy: Id<"users">,         // who logged this
  recordedAt: number,              // auto timestamp
  impact?: "high" | "medium" | "low",
  _creationTime: number,
}
```

#### Tiers Table
```typescript
// Tier definitions
{
  _id: Id<"tiers">,
  name: "bronze" | "silver" | "gold",
  displayName: string,             // "Bronze"
  badge: string,                   // emoji or icon
  commissionRate: number,          // 0.05 = 5%
  minGmvEligible: number,          // $500 to qualify
  description?: string,
  _creationTime: number,
}
```

#### Users Table (Access Control)
```typescript
// Team members with access to dashboard
{
  _id: Id<"users">,
  clerkId: string,                 // from Clerk auth
  email: string,
  name: string,
  role: "admin" | "manager" | "creator" | "viewer",
  managerTeamIds?: Id<"creators">[],  // creators this manager oversees
  creatorId?: Id<"creators">,      // if role == "creator"
  _creationTime: number,
}
```

### 2.3 Query & Mutation Patterns

#### Key Queries (Real-time, auto-subscribing)

```typescript
// List all creators with latest performance
query listCreators(
  filters?: {
    tier?: "bronze" | "silver" | "gold",
    isActive?: boolean,
    managerTeamOnly?: boolean,  // if manager, only their team
    search?: string,             // name or discord handle
  },
  limit?: number = 50,
  cursor?: string  // for pagination
)
-> {
  creators: Creator[],
  performance: { [creatorId]: PerformanceMetrics },
  total: number,
  nextCursor?: string
}

// Single creator with all related data
query getCreator(creatorId: Id<"creators">)
-> {
  creator: Creator,
  accounts: Account[],
  performance: PerformanceMetrics,
  recentActivities: Activity[],  // last 20
  teamRollup?: TeamStats  // if has team members
}

// Timeline of activities (wins, losses, adjustments)
query listActivities(
  filters?: {
    creatorId?: Id<"creators">,
    type?: "win" | "loss" | "adjustment" | "observation",
    dateRange?: { from: number, to: number },
  },
  limit?: number = 100,
  cursor?: string
)
-> {
  activities: Activity[],
  total: number,
  nextCursor?: string
}

// Team-level performance rollup (for managers)
query getTeamRollup(managerId: Id<"users">)
-> {
  teamSize: number,
  activeCreators: number,
  totalGmvMtd: number,
  totalGmv7d: number,
  totalPostsMtd: number,
  avgGmvPerCreator: number,
  tierBreakdown: { bronze: number, silver: number, gold: number },
  recentWins: Activity[],
  atRiskCreators: Creator[]  // no posts in 7 days, etc.
}
```

#### Key Mutations

```typescript
// Create or update creator
mutation upsertCreator(input: {
  creatorId?: Id<"creators">,
  name: string,
  discordHandle: string,
  tier: "bronze" | "silver" | "gold",
  isActive: boolean,
  notes?: string,
})
-> Creator

// Link a social account to creator
mutation linkAccount(input: {
  creatorId: Id<"creators">,
  platform: "tiktok" | "instagram" | "youtube",
  handle: string,
})
-> Account

// Record a win, loss, or adjustment
mutation recordActivity(input: {
  creatorId: Id<"creators">,
  type: "win" | "loss" | "adjustment" | "observation",
  title: string,
  description: string,
  tags?: string[],
  impact?: "high" | "medium" | "low",
})
-> Activity

// Bulk update tier
mutation bulkUpdateTiers(input: {
  creatorIds: Id<"creators">[],
  newTier: "bronze" | "silver" | "gold",
})
-> { updated: number, failed: number }

// Ingest performance data (from API or webhook)
mutation updatePerformance(input: {
  creatorId: Id<"creators">,
  period: "mtd" | "7d" | "30d",
  gmv: number,
  postCount: number,
  liveCount: number,
  source: "manual" | "api" | "webhook",
})
-> PerformanceMetrics
```

---

## 3. Tech Stack & Dependencies

### 3.1 Core Stack

| Layer | Tool | Version | Why |
|---|---|---|---|
| **Framework** | Next.js | 15+ | App router, SSR, built-in optimization |
| **Language** | TypeScript | 5.x | Type safety, IDE support |
| **Database** | Convex | Latest | Real-time, zero-config, scales to 615+ users |
| **Auth** | Clerk | Latest | Built-in OAuth, role management, Convex integration |
| **Styling** | Tailwind CSS | v4 | Utility-first, zero runtime, DX |
| **UI Components** | shadcn/ui | Latest | Copy-paste, unstyled, full control |
| **Deploy** | Vercel | — | Next.js native, 1-click env sync |
| **Real-time** | Convex subscriptions | Built-in | Auto-subscribe to query results |

### 3.2 Package Dependencies

```json
{
  "dependencies": {
    "next": "15.0.0",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "typescript": "5.x",
    "convex": "latest",
    "@clerk/nextjs": "latest",
    "@clerk/clerk-react": "latest",
    "tailwindcss": "4.x",
    "autoprefixer": "latest",
    "postcss": "latest",
    "@radix-ui/react-dialog": "latest",
    "@radix-ui/react-select": "latest",
    "@radix-ui/react-tabs": "latest",
    "@radix-ui/react-dropdown-menu": "latest",
    "lucide-react": "latest",
    "zod": "latest",
    "clsx": "latest",
    "tailwind-merge": "latest"
  },
  "devDependencies": {
    "@types/react": "latest",
    "@types/react-dom": "latest",
    "@types/node": "latest"
  }
}
```

### 3.3 Environment Variables

```bash
# .env.local (frontend)
NEXT_PUBLIC_CONVEX_URL=https://YOUR_DEPLOYMENT.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...

# Convex environment variables (set in Convex dashboard)
CLERK_JWT_ISSUER_DOMAIN=https://YOUR_FRONTEND_API.clerk.accounts.dev

# Optional (Phase 2+)
# DISCORD_BOT_TOKEN=...
# TIKTOK_SHOP_API_KEY=...
```

---

## 4. Implementation Plan

### 4.1 Phase 1: MVP (Foundation) — Weeks 1-3

**Goal:** Core creator database + real-time table + detail view + win/loss logging

**Deliverables:**

1. **Project Setup** (Day 1)
   - [ ] Clone Convex + Next.js 15 template
   - [ ] Set up Clerk OAuth (GitHub for dev, email+password for team)
   - [ ] Configure Vercel environment variables
   - [ ] Deploy blank app to Vercel

2. **Convex Schema** (Day 2)
   - [ ] Define and deploy tables: creators, accounts, performance, activities, tiers, users
   - [ ] Write seed data (10 test creators with metrics)
   - [ ] Set up Clerk JWT integration in Convex

3. **Backend Queries & Mutations** (Days 3-4)
   - [ ] Implement listCreators with filtering + pagination
   - [ ] Implement getCreator (single creator + related data)
   - [ ] Implement listActivities (timeline)
   - [ ] Implement recordActivity mutation
   - [ ] Add basic auth checks (managers see only their team)

4. **Frontend Pages** (Days 5-7)
   - [ ] Create `/dashboard` page with CreatorTable component
   - [ ] Real-time subscription to listCreators query
   - [ ] Create `/creators/[id]` detail page
   - [ ] Build WinLossModal (quick activity logging)
   - [ ] Add search + filter UI

5. **UI Components** (Days 8-10)
   - [ ] TierBadge (Bronze/Silver/Gold visual)
   - [ ] StatusDot (Active/Inactive indicator)
   - [ ] SocialAccountCard (linked accounts)
   - [ ] ActivityFeed (recent wins/losses)
   - [ ] MetricsCard (GMV, posts, lives display)

6. **Testing & Refinement** (Days 11-15)
   - [ ] Manual testing: add creator → see on dashboard → record win → see on detail page
   - [ ] Load test with 50+ concurrent users (Convex dashboard)
   - [ ] Fix UI glitches, polish tables
   - [ ] Write deployment guide for team

### 4.2 Phase 2: Enhanced Features — Weeks 4-6

- [ ] Discord integration (sync handles, profile lookup)
- [ ] Tier management (bulk update, eligibility rules)
- [ ] CSV export (creator data + metrics)
- [ ] Team rollup view (manager dashboard)
- [ ] Webhook handler for GMV ingestion
- [ ] Mobile responsive design

### 4.3 Phase 3: Scaling & Intelligence — Weeks 7+

- [ ] AI-powered insights (trending creators, risk flags)
- [ ] Discord channel syncing (daily summaries)
- [ ] Advanced filtering (custom saved views)
- [ ] Payout simulation
- [ ] Custom CRM workflows

---

## 5. Core Foundation Code

This section includes the baseline code needed to launch Phase 1. Copy-paste these and customize.

### 5.1 Convex Schema (`convex/schema.ts`)

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  creators: defineTable({
    name: v.string(),
    discordHandle: v.string(),
    discordId: v.optional(v.string()),
    tier: v.union(v.literal("bronze"), v.literal("silver"), v.literal("gold")),
    isActive: v.boolean(),
    joinedAt: v.number(),
    notes: v.optional(v.string()),
    reputationScore: v.optional(v.number()), // For Gamification
    managerId: v.id("users"),
    tags: v.optional(v.array(v.string())),
  })
    .index("by_manager", ["managerId"])
    .index("by_tier", ["tier"])
    .index("by_active", ["isActive"]),

  accounts: defineTable({
    creatorId: v.id("creators"),
    platform: v.union(
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("youtube"),
      v.literal("twitch")
    ),
    handle: v.string(),
    profileUrl: v.optional(v.string()),
    isActive: v.boolean(),
    linkedAt: v.number(),
  }).index("by_creator", ["creatorId"]),

  performance: defineTable({
    creatorId: v.id("creators"),
    period: v.union(v.literal("mtd"), v.literal("7d"), v.literal("30d")),
    gmv: v.number(),
    postCount: v.number(),
    liveCount: v.number(),
    engagementRate: v.optional(v.number()),
    viralityScore: v.optional(v.number()), // For Leaderboards
    lastUpdated: v.number(),
    source: v.union(v.literal("manual"), v.literal("api"), v.literal("webhook")),
  }).index("by_creator", ["creatorId"]),

  submissions: defineTable({
    creatorId: v.id("creators"),
    url: v.string(),
    platform: v.string(),
    hookType: v.optional(v.string()), // e.g. "Rage Bait"
    patternType: v.optional(v.string()), // e.g. "Storytelling"
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("flagged")),
    submittedAt: v.number(),
  }).index("by_creator", ["creatorId"]),

  activities: defineTable({
    creatorId: v.id("creators"),
    type: v.union(
      v.literal("win"),
      v.literal("loss"),
      v.literal("adjustment"),
      v.literal("observation")
    ),
    title: v.string(),
    description: v.string(),
    tags: v.optional(v.array(v.string())),
    recordedBy: v.id("users"),
    recordedAt: v.number(),
    impact: v.optional(v.union(v.literal("high"), v.literal("medium"), v.literal("low"))),
  })
    .index("by_creator", ["creatorId"])
    .index("by_type", ["type"]),

  tiers: defineTable({
    name: v.union(v.literal("bronze"), v.literal("silver"), v.literal("gold")),
    displayName: v.string(),
    badge: v.string(),
    commissionRate: v.number(),
    minGmvEligible: v.number(),
    description: v.optional(v.string()),
  }),

  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(
      v.literal("admin"),
      v.literal("manager"),
      v.literal("creator"),
      v.literal("viewer")
    ),
    managerTeamIds: v.optional(v.array(v.id("creators"))),
    creatorId: v.optional(v.id("creators")),
  }).index("by_clerk", ["clerkId"]),
});
```

### 5.2 Core Queries (`convex/queries.ts`)

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const listCreators = query({
  args: {
    tier: v.optional(v.union(v.literal("bronze"), v.literal("silver"), v.literal("gold"))),
    isActive: v.optional(v.boolean()),
    search: v.optional(v.string()),
    limit: v.optional(v.number()),
    cursor: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.sub))
      .first();

    if (!user) throw new Error("User not found");

    let query = ctx.db.query("creators");

    // Filtering
    if (args.tier) {
      query = query.filter((q) => q.eq(q.field("tier"), args.tier));
    }
    if (args.isActive !== undefined) {
      query = query.filter((q) => q.eq(q.field("isActive"), args.isActive));
    }

    let creators = await query.collect();

    // Search filter (name or discord handle)
    if (args.search) {
      const searchLower = args.search.toLowerCase();
      creators = creators.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.discordHandle.toLowerCase().includes(searchLower)
      );
    }

    // Manager filter (show only their team if not admin)
    if (user.role !== "admin") {
      creators = creators.filter((c) => c.managerId === user._id);
    }

    // Fetch performance for each creator
    const creatorIds = creators.map((c) => c._id);
    const performances = await ctx.db.query("performance").collect();
    const performanceMap = new Map();

    for (const perf of performances) {
      const key = `${perf.creatorId}_mtd`;
      if (!performanceMap.has(key)) {
        performanceMap.set(key, perf);
      }
    }

    // Pagination
    const limit = args.limit || 50;
    const start = args.cursor ? parseInt(args.cursor) : 0;
    const paginatedCreators = creators.slice(start, start + limit);

    return {
      creators: paginatedCreators,
      performance: performanceMap,
      total: creators.length,
      nextCursor:
        start + limit < creators.length ? (start + limit).toString() : undefined,
    };
  },
});

export const getCreator = query({
  args: { creatorId: v.id("creators") },
  async handler(ctx, args) {
    const creator = await ctx.db.get(args.creatorId);
    if (!creator) throw new Error("Creator not found");

    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .collect();

    const performance = await ctx.db
      .query("performance")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .collect();

    const activities = await ctx.db
      .query("activities")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .order("desc")
      .take(20);

    return {
      creator,
      accounts,
      performance,
      activities,
    };
  },
});

export const listActivities = query({
  args: {
    creatorId: v.optional(v.id("creators")),
    type: v.optional(
      v.union(
        v.literal("win"),
        v.literal("loss"),
        v.literal("adjustment"),
        v.literal("observation")
      )
    ),
    limit: v.optional(v.number()),
  },
  async handler(ctx, args) {
    let query = ctx.db.query("activities");

    if (args.creatorId) {
      query = query.withIndex("by_creator", (q) =>
        q.eq("creatorId", args.creatorId)
      );
    }

    let activities = await query.order("desc").take(args.limit || 100);

    if (args.type) {
      activities = activities.filter((a) => a.type === args.type);
    }

    return activities;
  },
});
```

### 5.3 Core Mutations (`convex/mutations.ts`)

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const upsertCreator = mutation({
  args: {
    creatorId: v.optional(v.id("creators")),
    name: v.string(),
    discordHandle: v.string(),
    tier: v.union(v.literal("bronze"), v.literal("silver"), v.literal("gold")),
    isActive: v.boolean(),
    notes: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.sub))
      .first();

    if (!user) throw new Error("User not found");

    if (args.creatorId) {
      // Update
      await ctx.db.patch(args.creatorId, {
        name: args.name,
        discordHandle: args.discordHandle,
        tier: args.tier,
        isActive: args.isActive,
        notes: args.notes,
      });
      return ctx.db.get(args.creatorId);
    } else {
      // Create
      const creatorId = await ctx.db.insert("creators", {
        name: args.name,
        discordHandle: args.discordHandle,
        tier: args.tier,
        isActive: args.isActive,
        notes: args.notes,
        managerId: user._id,
        joinedAt: Date.now(),
      });
      return ctx.db.get(creatorId);
    }
  },
});

export const recordActivity = mutation({
  args: {
    creatorId: v.id("creators"),
    type: v.union(
      v.literal("win"),
      v.literal("loss"),
      v.literal("adjustment"),
      v.literal("observation")
    ),
    title: v.string(),
    description: v.string(),
    tags: v.optional(v.array(v.string())),
    impact: v.optional(v.union(v.literal("high"), v.literal("medium"), v.literal("low"))),
  },
  async handler(ctx, args) {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.sub))
      .first();

    if (!user) throw new Error("User not found");

    const activityId = await ctx.db.insert("activities", {
      creatorId: args.creatorId,
      type: args.type,
      title: args.title,
      description: args.description,
      tags: args.tags,
      recordedBy: user._id,
      recordedAt: Date.now(),
      impact: args.impact,
    });

    return ctx.db.get(activityId);
  },
});

export const linkAccount = mutation({
  args: {
    creatorId: v.id("creators"),
    platform: v.union(
      v.literal("tiktok"),
      v.literal("instagram"),
      v.literal("youtube"),
      v.literal("twitch")
    ),
    handle: v.string(),
    profileUrl: v.optional(v.string()),
  },
  async handler(ctx, args) {
    const accountId = await ctx.db.insert("accounts", {
      creatorId: args.creatorId,
      platform: args.platform,
      handle: args.handle,
      profileUrl: args.profileUrl,
      isActive: true,
      linkedAt: Date.now(),
    });

    return ctx.db.get(accountId);
  },
});

export const updatePerformance = mutation({
  args: {
    creatorId: v.id("creators"),
    period: v.union(v.literal("mtd"), v.literal("7d"), v.literal("30d")),
    gmv: v.number(),
    postCount: v.number(),
    liveCount: v.number(),
    source: v.optional(
      v.union(v.literal("manual"), v.literal("api"), v.literal("webhook"))
    ),
  },
  async handler(ctx, args) {
    // Check if performance record already exists for this creator + period
    const existing = await ctx.db
      .query("performance")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .filter((q) => q.eq(q.field("period"), args.period))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        gmv: args.gmv,
        postCount: args.postCount,
        liveCount: args.liveCount,
        lastUpdated: Date.now(),
        source: args.source || "manual",
      });
      return ctx.db.get(existing._id);
    } else {
      const perfId = await ctx.db.insert("performance", {
        creatorId: args.creatorId,
        period: args.period,
        gmv: args.gmv,
        postCount: args.postCount,
        liveCount: args.liveCount,
        lastUpdated: Date.now(),
        source: args.source || "manual",
      });
      return ctx.db.get(perfId);
    }
  },
});
```

### 5.4 Frontend Setup (`app/layout.tsx`)

```typescript
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export const metadata = {
  title: "UGC Creator Dashboard",
  description: "Real-time performance tracking for UGC operations",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <ConvexProvider client={convex}>
        <html lang="en">
          <body>{children}</body>
        </html>
      </ConvexProvider>
    </ClerkProvider>
  );
}
```

### 5.5 Dashboard Page (`app/dashboard/page.tsx`)

```typescript
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { CreatorTable } from "@/components/CreatorTable";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function DashboardPage() {
  const { user } = useUser();
  const [tier, setTier] = useState<string>();
  const [search, setSearch] = useState<string>();

  const creatorsData = useQuery(api.queries.listCreators, {
    tier: tier as "bronze" | "silver" | "gold" | undefined,
    search,
  });

  if (!creatorsData) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-3xl font-bold">Creator Dashboard</h1>
        <p className="text-gray-600">Real-time performance tracking</p>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search creators..."
          value={search || ""}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded border px-4 py-2"
        />
        <select
          value={tier || ""}
          onChange={(e) => setTier(e.target.value || undefined)}
          className="rounded border px-4 py-2"
        >
          <option value="">All Tiers</option>
          <option value="bronze">Bronze</option>
          <option value="silver">Silver</option>
          <option value="gold">Gold</option>
        </select>
      </div>

      <CreatorTable creators={creatorsData.creators} />
    </div>
  );
}
```

### 5.6 Creator Table Component (`components/CreatorTable.tsx`)

```typescript
"use client";

import { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";
import { TierBadge } from "./TierBadge";
import { StatusDot } from "./StatusDot";

interface CreatorTableProps {
  creators: Doc<"creators">[];
}

export function CreatorTable({ creators }: CreatorTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Discord</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Tier</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
          </tr>
        </thead>
        <tbody>
          {creators.map((creator) => (
            <tr key={creator._id} className="border-t hover:bg-gray-50">
              <td className="px-6 py-4 text-sm font-medium">{creator.name}</td>
              <td className="px-6 py-4 text-sm text-gray-600">
                @{creator.discordHandle}
              </td>
              <td className="px-6 py-4 text-sm">
                <TierBadge tier={creator.tier} />
              </td>
              <td className="px-6 py-4">
                <StatusDot isActive={creator.isActive} />
              </td>
              <td className="px-6 py-4 text-sm">
                <Link
                  href={`/creators/${creator._id}`}
                  className="text-blue-600 hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 5.7 Utility Components

```typescript
// components/TierBadge.tsx
export function TierBadge({ tier }: { tier: "bronze" | "silver" | "gold" }) {
  const colors = {
    bronze: "bg-amber-100 text-amber-800",
    silver: "bg-gray-100 text-gray-800",
    gold: "bg-yellow-100 text-yellow-800",
  };

  const badges = {
    bronze: "🥉 Bronze",
    silver: "🥈 Silver",
    gold: "🥇 Gold",
  };

  return (
    <span className={`inline-block rounded-full px-3 py-1 text-sm font-medium ${colors[tier]}`}>
      {badges[tier]}
    </span>
  );
}

// components/StatusDot.tsx
export function StatusDot({ isActive }: { isActive: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`h-3 w-3 rounded-full ${
          isActive ? "bg-green-500" : "bg-gray-400"
        }`}
      />
      <span className="text-sm">{isActive ? "Active" : "Inactive"}</span>
    </div>
  );
}

// components/SocialAccountCard.tsx
export function SocialAccountCard({ account }: { account: any }) {
  const platformColors = {
    tiktok: "text-black",
    instagram: "text-pink-600",
    youtube: "text-red-600",
    twitch: "text-purple-600",
  };

  return (
    <div className="flex items-center gap-3 rounded border p-3">
      <span className={`text-lg ${platformColors[account.platform]}`}>
        {account.platform === "tiktok" && "🎵"}
        {account.platform === "instagram" && "📷"}
        {account.platform === "youtube" && "▶️"}
        {account.platform === "twitch" && "🎮"}
      </span>
      <div>
        <p className="font-medium">@{account.handle}</p>
        <p className="text-xs text-gray-600 capitalize">{account.platform}</p>
      </div>
    </div>
  );
}
```

### 5.8 Tailwind Config (`tailwind.config.ts`)

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette (optional)
        primary: "hsl(var(--primary))",
        secondary: "hsl(var(--secondary))",
      },
    },
  },
  plugins: [],
};

export default config;
```

### 5.9 Environment Setup (`.env.local`)

```bash
# Convex
NEXT_PUBLIC_CONVEX_URL=https://YOUR_DEPLOYMENT.convex.cloud

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

---

## 6. Deployment & Rollout

### 6.1 Pre-Launch Checklist

- [ ] Convex deployment configured
- [ ] Clerk OAuth setup (GitHub + email)
- [ ] Vercel project linked to GitHub
- [ ] Environment variables synced
- [ ] Seed data loaded (test creators)
- [ ] Auth tests pass (admin, manager, creator roles)
- [ ] Table queries tested with 50+ creators
- [ ] Win/loss logging tested end-to-end
- [ ] Mobile browser tested
- [ ] Performance: <2s page load, <500ms query latency

### 6.2 Launch Steps

1. **Soft Launch** (Internal team)
   - Deploy to staging branch
   - 5-10 team members test for 2 days
   - Gather feedback, fix bugs

2. **Beta Launch** (Operations team)
   - Deploy to production
   - 50 creators + 5 managers
   - Monitor Convex queries, Vercel analytics
   - Daily standup on issues

3. **Full Launch** (All 615 creators)
   - Gradually enable dashboard access
   - Monitor real-time load (Convex subscriber count)
   - Support channel in Discord for issues

---

## 7. Maintenance & Monitoring

### 7.1 Ongoing Tasks

| Task | Frequency | Owner |
|---|---|---|
| Monitor Convex storage/query stats | Daily | Thabiso |
| Review error logs (Sentry, if added) | Daily | Thabiso |
| Backup creator data | Weekly | Thabiso |
| Review feature requests | Weekly | Team |
| Deploy bug fixes | As needed | Thabiso |

### 7.2 Metrics to Track

- Page load time (target: <2s)
- Query latency (target: <500ms)
- Creator table size (target: handle 2000+)
- Concurrent users (target: handle 100+)
- Win/loss logging adoption (target: 80% weekly)
- Uptime (target: 99.5%)

---

## 8. References & Resources

- **Convex Docs**: https://docs.convex.dev
- **Next.js 15**: https://nextjs.org/docs
- **Clerk**: https://clerk.com/docs
- **Tailwind CSS v4**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **TypeScript Handbook**: https://www.typescriptlang.org/docs

---

## 9. Questions & Decision Log

### Open Decisions

1. **Discord Integration Timing** — Phase 1 MVP or Phase 2?
   - **Decision**: Phase 2 (not critical for MVP)
   - **Rationale**: Discord lookups can be manual for now; automate later when data is flowing

2. **API Source for GMV** — TikTok Shop API, webhook, or manual entry?
   - **Decision**: Manual entry + webhook handler (Phase 2)
   - **Rationale**: Fast MVP, real integration once process is validated

3. **Role-Based Access** — How granular?
   - **Decision**: Admin (all), Manager (team only), Creator (self only), Viewer (read-only)
   - **Rationale**: Balance security with UX; can expand later

---

## Appendix: Terminology

| Term | Definition |
|---|---|
| **GMV** | Gross Merchandise Value — total product sales attributed to a creator's content |
| **MTD** | Month-to-date |
| **7D** | Last 7 days |
| **Tier** | Creator ranking (Bronze/Silver/Gold) based on performance |
| **UGC** | User-Generated Content — content created by users/creators promoting products |
| **Win/Loss** | Activity log entry for significant performance event |
| **Adjustment** | Change to creator's commission, payout, or creative direction |

---

**Document Version:** 1.0  
**Last Updated:** May 13, 2026  
**Status:** Ready for Implementation

Let me read the skill first, then analyze the video.It's a video file — I can't play or watch MP4s directly. Let me extract frames from it to analyze what's on screen.Okay, I've seen enough. I can read the whole thing clearly. Here's the breakdown:

---

## What This Is

It's called **Shah Management** — deployed at `shah-dash.vercel.app/admin`. It's a UGC creator management dashboard, exactly the kind of thing you need to build. And yes, it's vibe coded — clean enough to work, but clearly built fast with AI.

---

## What I Can See

**The Creator Database table has these columns:**

| Column | What it means |
|---|---|
| Name | Creator's real name |
| Discord | Their Discord handle |
| Tier | Bronze / Silver (tier system for creator ranking) |
| Accounts | Their TikTok/social handles (multiple per creator) |
| Active | Green dot = active, grey = inactive |
| 1% | Unknown — probably a commission or cut flag |
| GMV MTD | Gross Merchandise Value, month-to-date (revenue generated) |
| GMV 7D | GMV last 7 days |
| Posts MTD | Number of posts this month |
| Posts 7D | Posts last 7 days |
| Lives MTD | Number of live streams this month |

**Left sidebar navigation:**
- Timeline
- Creator Database ← currently open
- Videos
- Tracker
- Discord Tracking
- YouTube
- GMV Max Tests
- Account Analysis
- Simulator
- Reports
- Webinar Dashboard
- Pipeline (section below)

---

## What This Tells You

This is a **TikTok Shop affiliate / UGC marketing operation.** GMV is the core metric — how much product is being sold through creator content. The tier system (Bronze/Silver) is how they rank and probably pay creators differently.

The sidebar shows this isn't just a creator list — there's a full pipeline, a tracker, Discord tracking, a simulator, and reports. It's more built out than it looks on the surface.

---

## Your Build Plan Based on This

Your Convex schema should mirror this exactly:

```typescript
// creators table
{ name, discordHandle, tier, socialAccounts[], isActive, createdAt }

// performance table  
{ creatorId, gmvMTD, gmv7D, postsMTD, posts7D, livesMTD, period }

// tiers table
{ name } // Bronze, Silver, Gold etc.
```



