import { mutation, query } from "./_generated/server";

// Syncs the signed-in Clerk user into the Convex users table.
// Call this once on first sign-in from the frontend.
export const upsert = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        name: identity.name ?? existing.name,
        email: identity.email ?? existing.email,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: identity.subject,
      name: identity.name ?? "Unknown",
      email: identity.email ?? "",
      role: "viewer",
    });
  },
});

// Returns the current user's record from the users table.
export const me = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    return ctx.db
      .query("users")
      .withIndex("by_clerk", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

// Returns all users (clerkId + name) so the timeline can resolve logged-by names.
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const users = await ctx.db.query("users").collect();
    return users.map((u) => ({ clerkId: u.clerkId, name: u.name }));
  },
});
