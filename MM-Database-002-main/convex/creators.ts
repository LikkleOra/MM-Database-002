import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return ctx.db.query("creators").collect();
  },
});

export const getById = query({
  args: { id: v.id("creators") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    discordHandle: v.string(),
    tier: v.union(v.literal("Bronze"), v.literal("Silver"), v.literal("Gold"), v.literal("Platinum")),
    commissionRate: v.number(),
    managerId: v.optional(v.string()),
    socialAccounts: v.optional(v.object({
      tiktok: v.optional(v.string()),
      instagram: v.optional(v.string()),
      youtube: v.optional(v.string()),
      facebook: v.optional(v.string()),
      twitch: v.optional(v.string()),
    })),
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
      socialAccounts: args.socialAccounts,
      joinedAt: new Date().toISOString(),
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("creators"),
    name: v.optional(v.string()),
    tier: v.optional(v.union(v.literal("Bronze"), v.literal("Silver"), v.literal("Gold"), v.literal("Platinum"))),
    isActive: v.optional(v.boolean()),
    commissionRate: v.optional(v.number()),
    managerId: v.optional(v.string()),
    socialAccounts: v.optional(v.object({
      tiktok: v.optional(v.string()),
      instagram: v.optional(v.string()),
      youtube: v.optional(v.string()),
      facebook: v.optional(v.string()),
      twitch: v.optional(v.string()),
    })),
    profile: v.optional(v.object({
      realName: v.optional(v.string()),
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      location: v.optional(v.string()),
      niche: v.optional(v.string()),
      contentFormat: v.optional(v.string()),
      toneVibe: v.optional(v.string()),
      postingFrequency: v.optional(v.string()),
    })),
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

export const remove = mutation({
  args: { id: v.id("creators") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || user.role !== "admin") throw new Error("Unauthorized: admin only");

    // Cascade delete activities and videos
    const [activities, videos] = await Promise.all([
      ctx.db.query("activities").withIndex("by_creator", (q) => q.eq("creatorId", args.id)).collect(),
      ctx.db.query("videos").withIndex("by_creator", (q) => q.eq("creatorId", args.id)).collect(),
    ]);
    for (const act of activities) await ctx.db.delete(act._id);
    for (const vid of videos) await ctx.db.delete(vid._id);
    await ctx.db.delete(args.id);
  },
});

const profileValidator = v.optional(v.object({
  realName: v.optional(v.string()),
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  location: v.optional(v.string()),
  niche: v.optional(v.string()),
  contentFormat: v.optional(v.string()),
  toneVibe: v.optional(v.string()),
  postingFrequency: v.optional(v.string()),
}));

export const bulkImport = mutation({
  args: {
    creators: v.array(v.object({
      discordHandle: v.string(),
      name: v.string(),
      profile: profileValidator,
      socialAccounts: v.optional(v.object({
        tiktok: v.optional(v.string()),
        instagram: v.optional(v.string()),
        youtube: v.optional(v.string()),
        facebook: v.optional(v.string()),
        twitch: v.optional(v.string()),
      })),
    })),
  },
  handler: async (ctx, { creators }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || (user.role !== "admin" && user.role !== "manager"))
      throw new Error("Unauthorized: admin or manager required");

    const existing = await ctx.db.query("creators").collect();
    const existingHandles = new Set(existing.map((c) => c.discordHandle.toLowerCase()));

    let created = 0;
    let skipped = 0;

    for (const c of creators) {
      if (existingHandles.has(c.discordHandle.toLowerCase())) {
        skipped++;
        continue;
      }

      await ctx.db.insert("creators", {
        name: c.name,
        discordHandle: c.discordHandle,
        tier: "Bronze",
        isActive: true,
        commissionRate: 1,
        joinedAt: new Date().toISOString(),
        profile: c.profile ?? undefined,
        socialAccounts: c.socialAccounts ?? undefined,
      });

      existingHandles.add(c.discordHandle.toLowerCase());
      created++;
    }

    return { created, skipped };
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

    // Only create default admin user on first setup, no mock creators
    // Creators should be imported via CSV or created manually through the UI
  },
});
