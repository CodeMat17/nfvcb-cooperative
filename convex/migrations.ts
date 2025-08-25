import { mutation } from "./_generated/server";

export const removeStatusFromUsers = mutation({
  handler: async (ctx) => {
    // Get all users
    const users = await ctx.db.query("users").collect();

    let updatedCount = 0;

    for (const user of users) {
      // Check if user has status field before trying to remove it
      if ("status" in user) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { status, ...userWithoutStatus } = user as typeof user & {
          status: unknown;
        };
        await ctx.db.patch(user._id, userWithoutStatus);
        updatedCount++;
      }
    }

    return {
      success: true,
      message: `Removed status field from ${updatedCount} users`,
      updatedCount,
    };
  },
});

export const cleanupUserData = mutation({
  handler: async (ctx) => {
    // Get all users
    const users = await ctx.db.query("users").collect();

    let updatedCount = 0;

    for (const user of users) {
      // Check if user has extra fields before trying to remove them
      const userAny = user as typeof user & {
        status?: unknown;
        createdAt?: unknown;
        updatedAt?: unknown;
      };
      const cleanUser: Record<string, unknown> = {};

      // Only keep the fields that should be in the users table
      if ("name" in userAny) cleanUser.name = userAny.name;
      if ("dateJoined" in userAny) cleanUser.dateJoined = userAny.dateJoined;
      if ("ippis" in userAny) cleanUser.ippis = userAny.ippis;
      if ("pin" in userAny) cleanUser.pin = userAny.pin;
      if ("monthlyContribution" in userAny)
        cleanUser.monthlyContribution = userAny.monthlyContribution;
      if ("totalContribution" in userAny)
        cleanUser.totalContribution = userAny.totalContribution;

      // Update the user record with only the correct fields
      await ctx.db.patch(user._id, cleanUser);
      updatedCount++;
    }

    return {
      success: true,
      message: `Cleaned up ${updatedCount} user records`,
      updatedCount,
    };
  },
});

export const migrateLoansToQuickLoans = mutation({
  handler: async (ctx) => {
    // Get all loans from the old loans table
    const oldLoans = await ctx.db.query("loans").collect();

    let migratedCount = 0;
    let skippedCount = 0;

    for (const oldLoan of oldLoans) {
      try {
        // Check if this loan already exists in quickLoans
        const existingQuickLoan = await ctx.db
          .query("quickLoans")
          .withIndex("by_user", (q) => q.eq("userId", oldLoan.userId))
          .filter((q) => q.eq(q.field("dateApplied"), oldLoan.dateApplied))
          .first();

        if (existingQuickLoan) {
          skippedCount++;
          continue; // Skip if already migrated
        }

        // Map old loan fields to new quickLoan structure
        const interestRate = 0.05; // 5% interest rate
        const interestAmount = oldLoan.amount * interestRate;
        const totalRepayment = oldLoan.amount + interestAmount;

        const newQuickLoan = {
          userId: oldLoan.userId,
          amount: oldLoan.amount,
          status: oldLoan.status, // 'processing', 'approved', 'cleared' - all valid in quickLoans
          dateApplied: oldLoan.dateApplied,
          dateApproved: oldLoan.approvedDate || undefined,
          expiryDate: oldLoan.dueDate || undefined,
          clearedDate:
            oldLoan.status === "cleared"
              ? oldLoan.dueDate || undefined
              : undefined,
          interestRate: interestRate, // 5% interest rate
          totalRepayment: totalRepayment, // amount + 5% interest
        };

        // Insert into quickLoans table
        await ctx.db.insert("quickLoans", newQuickLoan);
        migratedCount++;

        // Delete the old loan record
        await ctx.db.delete(oldLoan._id);
      } catch (error) {
        console.error(`Failed to migrate loan ${oldLoan._id}:`, error);
        skippedCount++;
      }
    }

    return {
      success: true,
      message: `Migrated ${migratedCount} loans to quickLoans, skipped ${skippedCount}`,
      migratedCount,
      skippedCount,
    };
  },
});
