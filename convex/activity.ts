import { v } from "convex/values";
import { query } from "./_generated/server";

export const getUserActivityHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("activityHistory")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    return activities.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getAllActivityHistory = query({
  handler: async (ctx) => {
    const activities = await ctx.db.query("activityHistory").collect();
    return activities.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getActivityHistoryByLoanType = query({
  args: { loanType: v.union(v.literal("quick"), v.literal("core")) },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("activityHistory")
      .withIndex("by_loan_type", (q) => q.eq("loanType", args.loanType))
      .collect();

    return activities.sort((a, b) => b.createdAt - a.createdAt);
  },
});

