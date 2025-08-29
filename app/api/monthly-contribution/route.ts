import { api } from "@/convex/_generated/api";
import { ConvexHttpClient } from "convex/browser";
import { NextResponse } from "next/server";

// Initialize Convex client
const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function POST() {
  try {
    // Check if today is the 10th day of the month (TEMPORARILY CHANGED FOR TESTING)
    const today = new Date();
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();

    // TEMPORARY: Allow execution at 7:38 PM today for testing
    const isTestTime = currentHour === 19 && currentMinute === 38; // 7:38 PM
    const isTenthDay = today.getDate() === 10;

    // For production testing, check if it's the test time
    if (!isTenthDay && !isTestTime) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Monthly contribution increment only runs on the 10th day of each month (or during test time)",
          currentDate: today.toISOString(),
          isTenthDay: false,
          isTestTime: false,
          currentTime: `${currentHour}:${currentMinute}`,
        },
        { status: 200 }
      );
    }

    // Get all users from the database
    const allUsers = await convex.query(api.users.getAllUsers);

    if (!allUsers || allUsers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No users found in the database",
          usersProcessed: 0,
        },
        { status: 404 }
      );
    }

    const results = [];
    let successCount = 0;
    let errorCount = 0;

    // Process each user
    for (const user of allUsers) {
      try {
        // Calculate new total contribution
        const newTotalContribution =
          user.totalContribution + user.monthlyContribution;

        // Update the user's total contribution
        await convex.mutation(api.users.updateUser, {
          userId: user._id,
          totalContribution: newTotalContribution,
        });

        // Log the increment for audit purposes
        console.log(
          `[${today.toISOString()}] Monthly contribution increment for user ${user.name} (PIN: ${user.pin}): ${user.totalContribution} → ${newTotalContribution} (+${user.monthlyContribution})`
        );

        results.push({
          userId: user._id,
          userName: user.name,
          userPin: user.pin,
          previousTotal: user.totalContribution,
          newTotal: newTotalContribution,
          increment: user.monthlyContribution,
          success: true,
        });

        successCount++;
      } catch (error) {
        console.error(
          `Error updating user ${user.name} (PIN: ${user.pin}):`,
          error
        );

        results.push({
          userId: user._id,
          userName: user.name,
          userPin: user.pin,
          error: error instanceof Error ? error.message : "Unknown error",
          success: false,
        });

        errorCount++;
      }
    }

    // Create summary
    const summary = {
      date: today.toISOString(),
      totalUsers: allUsers.length,
      successfulUpdates: successCount,
      failedUpdates: errorCount,
      totalIncrementAmount: results
        .filter((r) => r.success)
        .reduce((sum, r) => sum + (r.increment || 0), 0),
    };

    console.log(
      `[${today.toISOString()}] Monthly contribution increment completed:`,
      summary
    );

    return NextResponse.json(
      {
        success: true,
        message: `Monthly contribution increment completed successfully on ${today.toDateString()}`,
        summary,
        results,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in monthly contribution increment:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error during monthly contribution increment",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Get all users to show current status
    const allUsers = await convex.query(api.users.getAllUsers);

    if (!allUsers || allUsers.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No users found in the database",
          usersCount: 0,
        },
        { status: 404 }
      );
    }

    const today = new Date();
    const currentHour = today.getHours();
    const currentMinute = today.getMinutes();
    const isTestTime = currentHour === 19 && currentMinute === 38; // 7:38 PM
    const isTenthDay = today.getDate() === 10;
    const nextTenthDay = new Date(
      today.getFullYear(),
      today.getMonth() + (today.getDate() >= 10 ? 1 : 0),
      10
    );

    const status = {
      currentDate: today.toISOString(),
      isTenthDay,
      isTestTime,
      currentTime: `${currentHour}:${currentMinute}`,
      nextTenthDay: nextTenthDay.toISOString(),
      daysUntilNextIncrement: Math.ceil(
        (nextTenthDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      ),
      totalUsers: allUsers.length,
      totalMonthlyContributions: allUsers.reduce(
        (sum, user) => sum + user.monthlyContribution,
        0
      ),
      totalCurrentContributions: allUsers.reduce(
        (sum, user) => sum + user.totalContribution,
        0
      ),
      users: allUsers.map((user) => ({
        id: user._id,
        name: user.name,
        pin: user.pin,
        monthlyContribution: user.monthlyContribution,
        totalContribution: user.totalContribution,
        nextIncrement: user.monthlyContribution,
      })),
    };

    return NextResponse.json(
      {
        success: true,
        message: "Monthly contribution status retrieved successfully",
        status,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error retrieving monthly contribution status:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error while retrieving status",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
