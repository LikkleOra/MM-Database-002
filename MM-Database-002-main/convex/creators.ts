import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const EMPTY_METRICS = { gmv: 0, posts: 0, lives: 0, orders: 0 };
const DEFAULT_METRICS = { mtd: EMPTY_METRICS, sevenDay: EMPTY_METRICS };

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const creators = await ctx.db.query("creators").collect();
    return Promise.all(
      creators.map(async (creator) => {
        const accounts = await ctx.db
          .query("social_accounts")
          .withIndex("by_creator", (q) => q.eq("creatorId", creator._id))
          .collect();
        return {
          id: creator._id as string,
          name: creator.name,
          discordHandle: creator.discordHandle,
          tier: creator.tier,
          isActive: creator.isActive,
          commissionRate: creator.commissionRate,
          managerId: creator.managerId,
          joinedAt: creator.joinedAt,
          metrics: creator.metrics ?? DEFAULT_METRICS,
          accounts: accounts.map((a) => ({
            platform: a.platform,
            handle: a.handle,
            url: a.url,
          })),
        };
      })
    );
  },
});

export const getById = query({
  args: { id: v.id("creators") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const creator = await ctx.db.get(args.id);
    if (!creator) return null;

    const accounts = await ctx.db
      .query("social_accounts")
      .withIndex("by_creator", (q) => q.eq("creatorId", creator._id))
      .collect();

    return {
      id: creator._id as string,
      name: creator.name,
      discordHandle: creator.discordHandle,
      tier: creator.tier,
      isActive: creator.isActive,
      commissionRate: creator.commissionRate,
      managerId: creator.managerId,
      joinedAt: creator.joinedAt,
      metrics: creator.metrics ?? DEFAULT_METRICS,
      accounts: accounts.map((a) => ({
        platform: a.platform,
        handle: a.handle,
        url: a.url,
      })),
    };
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    discordHandle: v.string(),
    tier: v.union(v.literal("Bronze"), v.literal("Silver"), v.literal("Gold"), v.literal("Platinum")),
    commissionRate: v.number(),
    managerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || user.role !== "admin") throw new Error("Unauthorized: admin only");

    return await ctx.db.insert("creators", {
      name: args.name,
      discordHandle: args.discordHandle,
      tier: args.tier,
      isActive: true,
      commissionRate: args.commissionRate,
      managerId: args.managerId,
      joinedAt: new Date().toISOString(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("creators"),
    tier: v.optional(v.union(v.literal("Bronze"), v.literal("Silver"), v.literal("Gold"), v.literal("Platinum"))),
    isActive: v.optional(v.boolean()),
    commissionRate: v.optional(v.number()),
    managerId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || (user.role !== "admin" && user.role !== "manager"))
      throw new Error("Unauthorized");

    const { id, ...updates } = args;
    const patch = Object.fromEntries(
      Object.entries(updates).filter(([, val]) => val !== undefined)
    );
    await ctx.db.patch(id, patch);
  },
});

// One-time seed: inserts mock creators if the table is empty.
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db.query("creators").first();
    if (existing) return;

    const mockCreators = [
      {
        name: "Achetr",
        discordHandle: "achterkamper97",
        tier: "Silver" as const,
        isActive: true,
        commissionRate: 1,
        joinedAt: "2026-01-15T10:00:00Z",
        metrics: {
          mtd: { gmv: 12540, posts: 12, lives: 2, orders: 450 },
          sevenDay: { gmv: 3420, posts: 4, lives: 1, orders: 120 },
        },
        accounts: [
          { platform: "TikTok" as const, handle: "achetr_ugc", url: "#" },
          { platform: "Instagram" as const, handle: "achetr.content", url: "#" },
        ],
      },
      {
        name: "SarahContent",
        discordHandle: "sarah_ugc_99",
        tier: "Gold" as const,
        isActive: true,
        commissionRate: 2,
        joinedAt: "2026-02-01T10:00:00Z",
        metrics: {
          mtd: { gmv: 45200, posts: 24, lives: 8, orders: 1800 },
          sevenDay: { gmv: 12400, posts: 6, lives: 2, orders: 520 },
        },
        accounts: [
          { platform: "TikTok" as const, handle: "sarah_skincare", url: "#" },
        ],
      },
      {
        name: "Mikey Creator",
        discordHandle: "mikey_vlog",
        tier: "Bronze" as const,
        isActive: false,
        commissionRate: 1,
        joinedAt: "2026-03-10T10:00:00Z",
        metrics: {
          mtd: { gmv: 1200, posts: 2, lives: 0, orders: 45 },
          sevenDay: { gmv: 0, posts: 0, lives: 0, orders: 0 },
        },
        accounts: [
          { platform: "YouTube" as const, handle: "mikeyvlogs", url: "#" },
        ],
      },
      {
        name: "Lila Grace",
        discordHandle: "lila_g",
        tier: "Platinum" as const,
        isActive: true,
        commissionRate: 3,
        joinedAt: "2025-11-20T10:00:00Z",
        metrics: {
          mtd: { gmv: 89000, posts: 30, lives: 12, orders: 3200 },
          sevenDay: { gmv: 21000, posts: 8, lives: 3, orders: 850 },
        },
        accounts: [
          { platform: "TikTok" as const, handle: "lila_fashion", url: "#" },
          { platform: "Instagram" as const, handle: "lila.grace", url: "#" },
        ],
      },
    ];

    for (const { accounts, ...creator } of mockCreators) {
      const creatorId = await ctx.db.insert("creators", creator);
      for (const account of accounts) {
        await ctx.db.insert("social_accounts", { creatorId, ...account });
      }
    }
  },
});
