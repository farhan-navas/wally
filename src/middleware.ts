import { clerkMiddleware } from "@clerk/nextjs/server";

// const isProtectedRoute = createRouteMatcher(["/api/trpc/chat.createChat(.*)"]);

// export default clerkMiddleware(
//   async (auth, request) => {
//     console.log("Req URL: ", request.url);
//     console.log("isProtectedRoute(): ", isProtectedRoute(request));
//     if (isProtectedRoute(request)) {
//       await auth.protect();
//     }
//   },
//   { debug: false },
// );

export default clerkMiddleware();

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
