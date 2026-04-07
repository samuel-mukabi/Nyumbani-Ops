import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/properties(.*)',
  '/staff(.*)',
  '/compliance(.*)'
]);

export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    const session = await auth();
    
    // Enforce that users must join or create an organization
    if (session.userId && !session.orgId && request.nextUrl.pathname !== '/select-org') {
      return NextResponse.redirect(new URL('/select-org', request.url));
    }
    
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
