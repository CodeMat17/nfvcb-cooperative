import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { query } from "./_generated/server";

export const getUserActivityHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
 

    const activities = await ctx.db
      .query("activityHistory")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();


    // Fetch loan details for each activity
    const activitiesWithLoanDetails = await Promise.all(
      activities.map(async (activity) => {
        let loanAmount: number | undefined;

        try {
          if (activity.loanType === "quick") {
            const quickLoan = await ctx.db.get(
              activity.loanId as Id<"quickLoans">
            );
            if (quickLoan) {
              loanAmount = quickLoan.amount;
            } else {
              // Loan was deleted, try to extract amount from action text
              const amountMatch = activity.action.match(/₦?([0-9,]+)/);
              if (amountMatch) {
                loanAmount = parseInt(amountMatch[1].replace(/,/g, ""));
              }
            }
          } else if (activity.loanType === "core") {
            const coreLoan = await ctx.db.get(
              activity.loanId as Id<"coreLoans">
            );
            if (coreLoan) {
              loanAmount = coreLoan.amountRequested;
            } else {
              // Loan was deleted, try to extract amount from action text
              const amountMatch = activity.action.match(/₦?([0-9,]+)/);
              if (amountMatch) {
                loanAmount = parseInt(amountMatch[1].replace(/,/g, ""));
              }
            }
          }
        } catch (error) {
          console.error("Error fetching loan details:", error);
        }

        return {
          ...activity,
          loanAmount,
        };
      })
    );

    return activitiesWithLoanDetails.sort((a, b) => b.createdAt - a.createdAt);
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
