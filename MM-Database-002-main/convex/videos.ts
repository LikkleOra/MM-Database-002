import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("published"),
    )),
  },
  handler: async (ctx, { status }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const query = ctx.db.query("videos");
    const filtered = status
      ? query.withIndex("by_status", (q) => q.eq("status", status))
      : query;

    return Promise.all(
      (await filtered.order("desc").collect()).map(async (video) => {
        const creator = await ctx.db.get(video.creatorId);
        return {
          id: video._id as string,
          creatorId: video.creatorId as string,
          creatorName: creator?.name ?? "Unknown",
          creatorTier: creator?.tier ?? "Bronze",
          platform: video.platform,
          externalId: video.externalId,
          title: video.title,
          contentUrl: video.contentUrl,
          thumbnailUrl: video.thumbnailUrl,
          views: video.views,
          likes: video.likes ?? 0,
          shares: video.shares ?? 0,
          comments: video.comments ?? 0,
          revenue: video.revenue ?? 0,
          status: video.status,
          recordedAt: video.recordedAt,
          statsRefreshedAt: video.statsRefreshedAt,
          approvedAt: video.approvedAt,
          approvedBy: video.approvedBy,
        };
      })
    );
  },
});

export const listByCreator = query({
  args: { creatorId: v.id("creators") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return ctx.db
      .query("videos")
      .withIndex("by_creator", (q) => q.eq("creatorId", args.creatorId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    creatorId: v.id("creators"),
    platform: v.union(
      v.literal("TikTok"),
      v.literal("Instagram"),
      v.literal("YouTube"),
      v.literal("Facebook")
    ),
    title: v.string(),
    contentUrl: v.string(),
    views: v.number(),
    likes: v.optional(v.number()),
    shares: v.optional(v.number()),
    comments: v.optional(v.number()),
    revenue: v.optional(v.number()),
    thumbnailUrl: v.optional(v.string()),
    externalId: v.optional(v.string()),
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

    return await ctx.db.insert("videos", {
      creatorId: args.creatorId,
      platform: args.platform,
      externalId: args.externalId ?? `manual_${Date.now()}`,
      title: args.title,
      contentUrl: args.contentUrl,
      views: args.views,
      likes: args.likes,
      shares: args.shares,
      comments: args.comments,
      revenue: args.revenue,
      thumbnailUrl: args.thumbnailUrl,
      status: "pending",
      recordedAt: new Date().toISOString(),
    });
  },
});

export const updateStatus = mutation({
  args: {
    videoId: v.id("videos"),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("published"),
    ),
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

    const patch: { status: typeof args.status; approvedAt?: string; approvedBy?: string } = {
      status: args.status,
    };
    if (args.status === "approved") {
      patch.approvedAt = new Date().toISOString();
      patch.approvedBy = identity.subject;
    }

    await ctx.db.patch(args.videoId, patch);
  },
});

export const updateStats = mutation({
  args: {
    videoId: v.id("videos"),
    views: v.optional(v.number()),
    likes: v.optional(v.number()),
    shares: v.optional(v.number()),
    comments: v.optional(v.number()),
    revenue: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const { videoId, ...updates } = args;
    const filteredEntries = Object.entries(updates)
      .filter(([, val]) => val !== undefined);
    
    const patch: Record<string, unknown> = Object.fromEntries(filteredEntries);
    patch.statsRefreshedAt = new Date().toISOString();

    await ctx.db.patch(videoId, patch);
  },
});
