import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // Protect all routes starting with `/admin`
  if (isAdminRoute(req)) {
    const session = await auth();
    const userRole = session.sessionClaims?.metadata?.role;

    // Debug: Log the role (remove this in production)
    console.log("User role:", userRole);

    if (userRole !== "admin") {
      const url = new URL("/not-admin", req.url);
      return NextResponse.redirect(url);
    }
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
