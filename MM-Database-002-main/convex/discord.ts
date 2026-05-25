import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const VALID_PLATFORMS = ["TikTok", "Instagram", "YouTube", "Facebook"] as const;
type VideoPlatform = typeof VALID_PLATFORMS[number];

/**
 * Called by the Discord bot via the Convex HTTP action.
 * Creates a pending video submission for the creator.
 */
export const processVideoSubmission = mutation({
  args: {
    discordUserId: v.string(),
    discordUsername: v.string(),
    platform: v.string(),
    videoUrl: v.string(),
    videoId: v.string(),
    messageId: v.string(),
    channelId: v.string(),
    guildId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find creator by Discord handle
    const creator = await ctx.db
      .query("creators")
      .withIndex("by_discord", (q) => q.eq("discordHandle", args.discordUsername))
      .unique();

    if (!creator) {
      return {
        success: false,
        error: `No creator found with Discord handle "${args.discordUsername}". Ask an admin to check your profile.`,
      };
    }

    const platform = VALID_PLATFORMS.includes(args.platform as VideoPlatform)
      ? (args.platform as VideoPlatform)
      : null;

    if (!platform) {
      return {
        success: false,
        error: `Unsupported platform "${args.platform}". Supported: TikTok, Instagram, YouTube, Facebook.`,
      };
    }

    // Check for duplicate submissions of same video
    const existing = await ctx.db
      .query("videos")
      .withIndex("by_creator", (q) => q.eq("creatorId", creator._id))
      .filter((q) => q.eq(q.field("externalId"), args.videoId))
      .first();

    if (existing) {
      return { success: true, creatorName: creator.name, duplicate: true };
    }

    // Create pending video record
    await ctx.db.insert("videos", {
      creatorId: creator._id,
      platform,
      externalId: args.videoId,
      title: `${platform} - ${new Date().toLocaleDateString("en-ZA")}`,
      contentUrl: args.videoUrl,
      views: 0,
      status: "pending",
      recordedAt: new Date().toISOString(),
    });

    return { success: true, creatorName: creator.name, duplicate: false };
  },
});

/**
 * Get recent submissions for review
 */
export const listPendingSubmissions = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    return ctx.db
      .query("videos")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .order("desc")
      .take(50);
  },
});
