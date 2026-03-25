import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();
  },
});

export const upsert = mutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("founder"), v.literal("agent"), v.literal("admin")),
    avatarUrl: v.optional(v.string()),
    agentType: v.optional(v.union(v.literal("claude"), v.literal("openclaw"), v.literal("human"))),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      ...args,
      equityTotal: 0,
      createdAt: Date.now(),
    });
  },
});

export const updateRole = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("founder"), v.literal("agent"), v.literal("admin")),
    agentType: v.optional(v.union(v.literal("claude"), v.literal("openclaw"), v.literal("human"))),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userId, {
      role: args.role,
      agentType: args.agentType,
    });
  },
});
