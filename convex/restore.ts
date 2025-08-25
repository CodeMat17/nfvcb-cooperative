import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const restoreUsers = mutation({
  args: {
    users: v.array(
      v.object({
        name: v.string(),
        dateJoined: v.string(),
        ippis: v.string(),
        pin: v.string(),
        monthlyContributions: v.number(),
        totalContributions: v.number(),
      })
    ),
  },
  handler: async (ctx, args) => {
    const userIds = [];
    for (const user of args.users) {
      const userId = await ctx.db.insert("users", user);
      userIds.push(userId);
    }
    return { success: true, count: userIds.length, userIds };
  },
});

export const restoreQuickLoans = mutation({
  args: {
    quickLoans: v.array(
      v.object({
        userId: v.string(), // This will be the old user ID from backup
        amount: v.number(),
        status: v.union(
          v.literal("processing"),
          v.literal("approved"),
          v.literal("rejected"),
          v.literal("cleared")
        ),
        dateApplied: v.string(),
        dateApproved: v.optional(v.string()),
        expiryDate: v.optional(v.string()),
        clearedDate: v.optional(v.string()),
        interestRate: v.number(),
        totalRepayment: v.optional(v.number()),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    ),
    userIdMapping: v.record(v.string(), v.string()), // old ID -> new ID mapping
  },
  handler: async (ctx, args) => {
    const loanIds = [];
    for (const loan of args.quickLoans) {
      // Map the old user ID to the new user ID
      const newUserId = args.userIdMapping[loan.userId];
      if (!newUserId) {
        console.warn(`No mapping found for user ID: ${loan.userId}`);
        continue;
      }

      const loanId = await ctx.db.insert("quickLoans", {
        ...loan,
        userId: newUserId as any,
      });
      loanIds.push(loanId);
    }
    return { success: true, count: loanIds.length, loanIds };
  },
});

export const restoreCoreLoans = mutation({
  args: {
    coreLoans: v.array(
      v.object({
        userId: v.string(), // This will be the old user ID from backup
        loanDate: v.string(),
        mobileNumber: v.string(),
        amountRequested: v.number(),
        accountNumber: v.string(),
        accountName: v.string(),
        bank: v.string(),
        existingLoan: v.string(),
        guarantor1Name: v.string(),
        guarantor1Phone: v.string(),
        guarantor2Name: v.string(),
        guarantor2Phone: v.string(),
        status: v.union(
          v.literal("processing"),
          v.literal("approved"),
          v.literal("rejected"),
          v.literal("cleared")
        ),
        dateApplied: v.string(),
        dateApproved: v.optional(v.string()),
        expiryDate: v.optional(v.string()),
        clearedDate: v.optional(v.string()),
        createdAt: v.number(),
        updatedAt: v.number(),
      })
    ),
    userIdMapping: v.record(v.string(), v.string()), // old ID -> new ID mapping
  },
  handler: async (ctx, args) => {
    const loanIds = [];
    for (const loan of args.coreLoans) {
      // Map the old user ID to the new user ID
      const newUserId = args.userIdMapping[loan.userId];
      if (!newUserId) {
        console.warn(`No mapping found for user ID: ${loan.userId}`);
        continue;
      }

      const loanId = await ctx.db.insert("coreLoans", {
        ...loan,
        userId: newUserId as any,
      });
      loanIds.push(loanId);
    }
    return { success: true, count: loanIds.length, loanIds };
  },
});

export const restoreActivityHistory = mutation({
  args: {
    activityHistory: v.array(
      v.object({
        userId: v.string(), // This will be the old user ID from backup
        loanType: v.union(v.literal("quick"), v.literal("core")),
        loanId: v.string(), // This will be the old loan ID from backup
        action: v.string(),
        status: v.union(
          v.literal("processing"),
          v.literal("approved"),
          v.literal("rejected"),
          v.literal("cleared")
        ),
        date: v.string(),
        createdAt: v.number(),
      })
    ),
    userIdMapping: v.record(v.string(), v.string()), // old ID -> new ID mapping
    loanIdMapping: v.record(v.string(), v.string()), // old loan ID -> new loan ID mapping
  },
  handler: async (ctx, args) => {
    const activityIds = [];
    for (const activity of args.activityHistory) {
      // Map the old user ID to the new user ID
      const newUserId = args.userIdMapping[activity.userId];
      if (!newUserId) {
        console.warn(`No mapping found for user ID: ${activity.userId}`);
        continue;
      }

      // Map the old loan ID to the new loan ID
      const newLoanId = args.loanIdMapping[activity.loanId];
      if (!newLoanId) {
        console.warn(`No mapping found for loan ID: ${activity.loanId}`);
        continue;
      }

      const activityId = await ctx.db.insert("activityHistory", {
        ...activity,
        userId: newUserId as any,
        loanId: newLoanId as any,
      });
      activityIds.push(activityId);
    }
    return { success: true, count: activityIds.length, activityIds };
  },
});




