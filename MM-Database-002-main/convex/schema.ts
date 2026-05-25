import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    clerkId: v.string(),
    role: v.union(v.literal("admin"), v.literal("manager"), v.literal("viewer")),
  }).index("by_clerk", ["clerkId"]),

  creators: defineTable({
    name: v.string(),
    discordHandle: v.string(),
    tier: v.union(v.literal("Bronze"), v.literal("Silver"), v.literal("Gold"), v.literal("Platinum")),
    isActive: v.boolean(),
    commissionRate: v.number(),
    managerId: v.optional(v.string()),
    joinedAt: v.string(),
    // Social account handles for each platform
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
  }).index("by_discord", ["discordHandle"]),

  videos: defineTable({
    creatorId: v.id("creators"),
    platform: v.union(v.literal("TikTok"), v.literal("Instagram"), v.literal("YouTube"), v.literal("Facebook")),
    externalId: v.string(),
    title: v.string(),
    contentUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
    views: v.number(),
    likes: v.optional(v.number()),
    shares: v.optional(v.number()),
    comments: v.optional(v.number()),
    revenue: v.optional(v.number()),
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("rejected"), v.literal("published")),
    recordedAt: v.string(),
    statsRefreshedAt: v.optional(v.string()),
    approvedAt: v.optional(v.string()),
    approvedBy: v.optional(v.string()),
  })
    .index("by_creator", ["creatorId"])
    .index("by_platform", ["platform"])
    .index("by_status", ["status"]),

  activities: defineTable({
    creatorId: v.id("creators"),
    type: v.union(v.literal("win"), v.literal("loss"), v.literal("observation"), v.literal("adjustment")),
    title: v.string(),
    description: v.string(),
    recordedBy: v.string(), // clerkId
    recordedAt: v.string(),
    impact: v.optional(v.union(v.literal("high"), v.literal("medium"), v.literal("low"))),
  }).index("by_creator", ["creatorId"]),

  payouts: defineTable({
    creatorId: v.id("creators"),
    amount: v.number(),
    period: v.string(), // "YYYY-MM"
    calculatedFrom: v.optional(v.array(v.id("videos"))), // video IDs used to calculate this payout
    status: v.union(v.literal("pending"), v.literal("approved"), v.literal("paid"), v.literal("denied")),
    notes: v.optional(v.string()),
    createdAt: v.string(),
    processedAt: v.optional(v.string()),
    createdBy: v.string(), // clerkId
  })
    .index("by_creator", ["creatorId"])
    .index("by_status", ["status"]),

  // Google Sheets sync tracking
  sheetsSync: defineTable({
    creatorId: v.optional(v.id("creators")), // null = full database sync
    lastSyncAt: v.string(),
    sheetName: v.string(),
    sheetUrl: v.optional(v.string()),
    rowsCount: v.number(),
    status: v.union(v.literal("success"), v.literal("error")),
    errorMessage: v.optional(v.string()),
  }).index("by_creator", ["creatorId"]),
});
