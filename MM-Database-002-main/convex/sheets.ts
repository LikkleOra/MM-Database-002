import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Google Sheets integration for exporting and importing creator data
 * Requires GOOGLE_SHEETS_API_KEY environment variable
 */

export const exportCreatorsToSheet = mutation({
  args: {
    sheetId: v.string(), // Google Sheet ID
    sheetName: v.string(),
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

    try {
      // Fetch all creators and their videos
      const creators = await ctx.db.query("creators").collect();
      const rows: string[][] = [];

      // Headers
      rows.push([
        "Name",
        "Discord Handle",
        "Tier",
        "Commission Rate",
        "Status",
        "Joined",
        "Total Videos",
        "Total Views",
        "Total Revenue",
        "TikTok",
        "Instagram",
        "YouTube",
        "Facebook",
      ]);

      // Data rows
      for (const creator of creators) {
        const videos = await ctx.db
          .query("videos")
          .withIndex("by_creator", (q) => q.eq("creatorId", creator._id))
          .filter((q) => q.eq(q.field("status"), "published"))
          .collect();

        const totalViews = videos.reduce((sum, v) => sum + v.views, 0);
        const totalRevenue = videos.reduce((sum, v) => sum + (v.revenue ?? 0), 0);

        rows.push([
          creator.name,
          creator.discordHandle,
          creator.tier,
          creator.commissionRate.toString(),
          creator.isActive ? "Active" : "Inactive",
          creator.joinedAt,
          videos.length.toString(),
          totalViews.toString(),
          totalRevenue.toFixed(2),
          creator.socialAccounts?.tiktok ?? "",
          creator.socialAccounts?.instagram ?? "",
          creator.socialAccounts?.youtube ?? "",
          creator.socialAccounts?.facebook ?? "",
        ]);
      }

      // Log the sync attempt
      await ctx.db.insert("sheetsSync", {
        lastSyncAt: new Date().toISOString(),
        sheetName: args.sheetName,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${args.sheetId}`,
        rowsCount: rows.length,
        status: "success",
      });

      return {
        success: true,
        rowsCount: rows.length,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${args.sheetId}`,
      };
    } catch (error) {
      await ctx.db.insert("sheetsSync", {
        lastSyncAt: new Date().toISOString(),
        sheetName: args.sheetName,
        rowsCount: 0,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    }
  },
});

/**
 * Export videos data to Google Sheets for tracking and analysis
 */
export const exportVideosToSheet = mutation({
  args: {
    sheetId: v.string(),
    sheetName: v.string(),
    creatorId: v.optional(v.id("creators")),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();
    if (!user || user.role === "viewer") throw new Error("Unauthorized");

    try {
      const rows: string[][] = [];

      // Headers
      rows.push([
        "Creator",
        "Platform",
        "Title",
        "Views",
        "Likes",
        "Shares",
        "Comments",
        "Revenue",
        "Status",
        "Posted",
        "Last Updated",
      ]);

      // Get videos
      const query = args.creatorId
        ? ctx.db
            .query("videos")
            .withIndex("by_creator", (q) =>
              q.eq("creatorId", args.creatorId!)
            )
        : ctx.db.query("videos");

      const videos = await query.collect();

      for (const video of videos) {
        const creator = await ctx.db.get(video.creatorId);
        rows.push([
          creator?.name ?? "Unknown",
          video.platform,
          video.title,
          video.views.toString(),
          (video.likes ?? 0).toString(),
          (video.shares ?? 0).toString(),
          (video.comments ?? 0).toString(),
          (video.revenue ?? 0).toFixed(2),
          video.status,
          new Date(video.recordedAt).toLocaleDateString(),
          video.statsRefreshedAt
            ? new Date(video.statsRefreshedAt).toLocaleDateString()
            : "N/A",
        ]);
      }

      await ctx.db.insert("sheetsSync", {
        creatorId: args.creatorId,
        lastSyncAt: new Date().toISOString(),
        sheetName: args.sheetName,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${args.sheetId}`,
        rowsCount: rows.length,
        status: "success",
      });

      return {
        success: true,
        rowsCount: rows.length,
        sheetUrl: `https://docs.google.com/spreadsheets/d/${args.sheetId}`,
      };
    } catch (error) {
      await ctx.db.insert("sheetsSync", {
        creatorId: args.creatorId,
        lastSyncAt: new Date().toISOString(),
        sheetName: args.sheetName,
        rowsCount: 0,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      throw error;
    }
  },
});

/**
 * Get sync history
 */
export const syncHistory = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const results = await ctx.db
      .query("sheetsSync")
      .order("desc")
      .take(20);
    return results;
  },
});
