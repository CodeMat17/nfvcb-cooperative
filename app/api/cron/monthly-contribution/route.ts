import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Verify the request is from a legitimate cron service
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;

    console.log("=== CRON DEBUG INFO ===");
    console.log("Cron endpoint called");
    console.log("Auth header:", authHeader);
    console.log("Cron secret exists:", !!cronSecret);
    console.log("Cron secret value:", cronSecret);
    console.log("Expected format: Bearer", cronSecret);
    console.log(
      "Auth header matches expected:",
      authHeader === `Bearer ${cronSecret}`
    );
    console.log("=== END DEBUG INFO ===");

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized access",
        },
        { status: 401 }
      );
    }

    // Call the monthly contribution increment API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/monthly-contribution`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    // Check if the response indicates it's not the 10th day
    if (
      result.success === false &&
      result.message &&
      result.message.includes("10th day")
    ) {
      console.log("Cron job skipped - not the 10th day:", result);
      return NextResponse.json(
        {
          success: true,
          message:
            "Cron job executed successfully - no increment needed (not 10th day)",
          result,
        },
        { status: 200 }
      );
    }

    if (response.ok && result.success) {
      console.log("Cron job executed successfully:", result);
      return NextResponse.json(
        {
          success: true,
          message: "Cron job executed successfully",
          result,
        },
        { status: 200 }
      );
    } else {
      console.error("Cron job failed:", result);
      return NextResponse.json(
        {
          success: false,
          message: "Cron job failed",
          error: result,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in cron job:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Internal server error in cron job",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
