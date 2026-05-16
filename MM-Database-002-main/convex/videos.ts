import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const videos = await ctx.db.query("videos").order("desc").collect();
    return Promise.all(
      videos.map(async (video) => {
        const creator = await ctx.db.get(video.creatorId);
        return {
          id: video._id as string,
          title: video.title,
          creatorName: creator?.name ?? "Unknown",
          platform: video.platform,
          views: video.views,
          revenue: video.revenue ?? 0,
          status: video.status,
          thumbnailUrl: video.thumbnailUrl,
          recordedAt: video.recordedAt,
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
