import { query } from "./_generated/server";
import { v } from "convex/values";

export const rankings = query({
  args: {
    period: v.union(v.literal("7d"), v.literal("30d"), v.literal("all")),
    metric: v.union(v.literal("views"), v.literal("revenue"), v.literal("videos")),
  },
  handler: async (ctx, { period, metric }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    // Get all creators
    const creators = await ctx.db
      .query("creators")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Calculate metrics for each creator based on published videos
    const entries = await Promise.all(
      creators.map(async (creator) => {
        const videos = await ctx.db
          .query("videos")
          .withIndex("by_creator", (q) => q.eq("creatorId", creator._id))
          .filter((q) => q.eq(q.field("status"), "published"))
          .collect();

        // Filter by period
        const now = new Date();
        const filteredVideos = videos.filter((v) => {
          if (period === "all") return true;

          const daysDiff = (now.getTime() - new Date(v.recordedAt).getTime()) / (1000 * 60 * 60 * 24);
          return daysDiff <= (period === "7d" ? 7 : 30);
        });

        const totalViews = filteredVideos.reduce((sum, v) => sum + v.views, 0);
        const totalRevenue = filteredVideos.reduce((sum, v) => sum + (v.revenue ?? 0), 0);
        const videoCount = filteredVideos.length;

        return {
          id: creator._id as string,
          name: creator.name,
          discordHandle: creator.discordHandle,
          tier: creator.tier,
          views: totalViews,
          revenue: totalRevenue,
          videos: videoCount,
        };
      })
    );

    // Sort by selected metric
    const sorted = entries.sort((a, b) => {
      if (metric === "views") return b.views - a.views;
      if (metric === "revenue") return b.revenue - a.revenue;
      return b.videos - a.videos;
    });

    return sorted.map((e, i) => ({ ...e, rank: i + 1 }));
  },
});

export const topPerformers = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const creators = await ctx.db
      .query("creators")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Calculate metrics for each creator
    const entries = await Promise.all(
      creators.map(async (creator) => {
        const videos = await ctx.db
          .query("videos")
          .withIndex("by_creator", (q) => q.eq("creatorId", creator._id))
          .filter((q) => q.eq(q.field("status"), "published"))
          .collect();

        // Last 30 days
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

        const recentVideos = videos.filter(
          (v) => new Date(v.recordedAt) >= thirtyDaysAgo
        );

        const mtdViews = recentVideos.reduce((sum, v) => sum + v.views, 0);
        const mtdRevenue = recentVideos.reduce((sum, v) => sum + (v.revenue ?? 0), 0);

        return {
          id: creator._id as string,
          name: creator.name,
          tier: creator.tier,
          mtdViews,
          mtdRevenue,
          mtdVideos: recentVideos.length,
        };
      })
    );

    return entries
      .sort((a, b) => b.mtdRevenue - a.mtdRevenue)
      .slice(0, 10)
      .map((e, i) => ({ ...e, rank: i + 1 }));
  },
});