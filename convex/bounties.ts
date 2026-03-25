import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    ventureId: v.optional(v.id("ventures")),
    status: v.optional(v.union(v.literal("open"), v.literal("claimed"), v.literal("submitted"), v.literal("completed"), v.literal("cancelled"))),
    agentType: v.optional(v.union(v.literal("claude"), v.literal("openclaw"), v.literal("human"), v.literal("any"))),
  },
  handler: async (ctx, args) => {
    let bounties;
    if (args.ventureId) {
      bounties = await ctx.db
        .query("bounties")
        .withIndex("by_venture", (q) => q.eq("ventureId", args.ventureId!))
        .order("desc")
        .take(100);
    } else if (args.status) {
      bounties = await ctx.db
        .query("bounties")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .take(100);
    } else {
      bounties = await ctx.db.query("bounties").order("desc").take(100);
    }

    // Filter by agentType if specified
    if (args.agentType && args.agentType !== "any") {
      bounties = bounties.filter(
        (b) => b.agentType === args.agentType || b.agentType === "any"
      );
    }

    return bounties;
  },
});

export const get = query({
  args: { id: v.id("bounties") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const create = mutation({
  args: {
    ventureId: v.id("ventures"),
    title: v.string(),
    description: v.string(),
    equityStake: v.number(),
    agentType: v.union(v.literal("claude"), v.literal("openclaw"), v.literal("human"), v.literal("any")),
    requirements: v.array(v.string()),
    deliverables: v.array(v.string()),
    tags: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("bounties", {
      ...args,
      status: "open",
      createdAt: Date.now(),
    });
  },
});

export const claim = mutation({
  args: {
    bountyId: v.id("bounties"),
    agentId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const bounty = await ctx.db.get(args.bountyId);
    if (!bounty || bounty.status !== "open") {
      throw new Error("Bounty is not available to claim");
    }
    await ctx.db.patch(args.bountyId, {
      status: "claimed",
      claimedBy: args.agentId,
      claimedAt: Date.now(),
    });
    await ctx.db.insert("claims", {
      bountyId: args.bountyId,
      agentId: args.agentId,
      status: "active",
      claimedAt: Date.now(),
    });
    return { success: true };
  },
});

export const submit = mutation({
  args: {
    bountyId: v.id("bounties"),
    claimId: v.id("claims"),
    submissionUrl: v.string(),
    submissionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bountyId, { status: "submitted" });
    await ctx.db.patch(args.claimId, {
      status: "submitted",
      submissionUrl: args.submissionUrl,
      submissionNotes: args.submissionNotes,
      submittedAt: Date.now(),
    });
    return { success: true };
  },
});

export const approve = mutation({
  args: {
    bountyId: v.id("bounties"),
    claimId: v.id("claims"),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const bounty = await ctx.db.get(args.bountyId);
    if (!bounty) throw new Error("Bounty not found");

    await ctx.db.patch(args.bountyId, {
      status: "completed" as const,
      completedAt: Date.now(),
    });

    const claim = await ctx.db.get(args.claimId);
    if (!claim) throw new Error("Claim not found");

    await ctx.db.patch(args.claimId, {
      status: "approved",
      reviewNotes: args.reviewNotes,
      reviewedAt: Date.now(),
    });

    // Create equity record
    await ctx.db.insert("equityHolders", {
      ventureId: bounty.ventureId,
      userId: claim.agentId,
      equityPercent: bounty.equityStake,
      contributionType: "bounty",
      bountyId: args.bountyId,
      vestedAt: Date.now(),
      createdAt: Date.now(),
    });

    // Update venture equity allocated
    const venture = await ctx.db.get(bounty.ventureId);
    if (venture) {
      await ctx.db.patch(bounty.ventureId, {
        totalEquityAllocated: venture.totalEquityAllocated + bounty.equityStake,
      });
    }

    return { success: true };
  },
});

export const reject = mutation({
  args: {
    bountyId: v.id("bounties"),
    claimId: v.id("claims"),
    reviewNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Reopen the bounty so it can be claimed again
    await ctx.db.patch(args.bountyId, { status: "open" });
    await ctx.db.patch(args.claimId, {
      status: "rejected",
      reviewNotes: args.reviewNotes,
      reviewedAt: Date.now(),
    });
    return { success: true };
  },
});
