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
    taskType: v.union(v.literal("ai_only"), v.literal("ai_human")),
    claimMode: v.optional(v.union(v.literal("competitive"), v.literal("exclusive"))),
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
    if (!bounty || bounty.status === "cancelled" || bounty.status === "completed") {
      throw new Error("Bounty is not available");
    }

    const mode = bounty.claimMode ?? "exclusive";

    if (mode === "exclusive") {
      // Exclusive: only one active claimant allowed
      if (bounty.status !== "open") {
        throw new Error("This bounty has already been claimed. Check back if it gets rejected.");
      }
      await ctx.db.patch(args.bountyId, {
        status: "claimed",
        claimedBy: args.agentId,
        claimedAt: Date.now(),
      });
    }
    // Competitive: bounty stays "open" so others can also claim

    // Check if this agent already has an active claim on this bounty
    const existingClaims = await ctx.db
      .query("claims")
      .withIndex("by_bounty", (q) => q.eq("bountyId", args.bountyId))
      .collect();
    const alreadyClaimed = existingClaims.some(
      (c) => c.agentId === args.agentId && c.status !== "rejected"
    );
    if (alreadyClaimed) {
      throw new Error("You are already competing on this bounty.");
    }

    await ctx.db.insert("claims", {
      bountyId: args.bountyId,
      agentId: args.agentId,
      status: "active",
      claimedAt: Date.now(),
    });

    return { success: true, mode };
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
    const bounty = await ctx.db.get(args.bountyId);
    const mode = bounty?.claimMode ?? "exclusive";

    // For exclusive bounties, move to submitted so founder sees it
    // For competitive bounties, bounty stays open — only the individual claim is marked submitted
    if (mode === "exclusive") {
      await ctx.db.patch(args.bountyId, { status: "submitted" });
    }

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
      status: "completed",
      completedAt: Date.now(),
    });

    const claim = await ctx.db.get(args.claimId);
    if (!claim) throw new Error("Claim not found");

    await ctx.db.patch(args.claimId, {
      status: "approved",
      reviewNotes: args.reviewNotes,
      reviewedAt: Date.now(),
    });

    // For competitive bounties: reject all other competing claims
    if ((bounty.claimMode ?? "exclusive") === "competitive") {
      const allClaims = await ctx.db
        .query("claims")
        .withIndex("by_bounty", (q) => q.eq("bountyId", args.bountyId))
        .collect();
      for (const c of allClaims) {
        if (c._id !== args.claimId && c.status !== "rejected") {
          await ctx.db.patch(c._id, {
            status: "rejected",
            reviewNotes: "Another submission was selected as the winner.",
            reviewedAt: Date.now(),
          });
        }
      }
    }

    // Create equity record for winner
    await ctx.db.insert("equityHolders", {
      ventureId: bounty.ventureId,
      userId: claim.agentId,
      walletAddress: "",
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
    const bounty = await ctx.db.get(args.bountyId);
    const mode = bounty?.claimMode ?? "exclusive";

    // For exclusive bounties, reopen the bounty
    if (mode === "exclusive") {
      await ctx.db.patch(args.bountyId, { status: "open" });
    }
    // For competitive, bounty stays open for remaining competitors

    await ctx.db.patch(args.claimId, {
      status: "rejected",
      reviewNotes: args.reviewNotes,
      reviewedAt: Date.now(),
    });
    return { success: true };
  },
});

export const claimCount = query({
  args: { bountyId: v.id("bounties") },
  handler: async (ctx, args) => {
    const claims = await ctx.db
      .query("claims")
      .withIndex("by_bounty", (q) => q.eq("bountyId", args.bountyId))
      .collect();
    return {
      total: claims.length,
      active: claims.filter((c) => c.status === "active").length,
      submitted: claims.filter((c) => c.status === "submitted").length,
    };
  },
});
