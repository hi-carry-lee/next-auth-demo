import NextAuth from "next-auth";
import authConfig from "@/auth.config";
// this is used for fix type issue, return NextResponse.next() instead of return null;
import { NextResponse } from "next/server";

// this part is after config basic auth.js functiion
import {
  publicRoutes,
  authRoutes,
  apiAuthPrefix,
  DEFAULT_LOGIN_REDIRECT,
} from "@/route";

// since Prisma doesn't work on Edge runtime, so we sperate the auth.ts to auth.config.ts
// then use auth.config.ts in middleware instead of auth.ts
const { auth } = NextAuth(authConfig);
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // the order of validate is important

  // if the user accrss api routes, do nothing about it;
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // prevent logged in user to access login or register routes again
  // if the url matches this situation, then redirect to default url,
  // here 'nextUrl' is just used to construct absolute path, since default url here is a relative path
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl));
    }
    return NextResponse.next();
  }

  // if not logged in user and not access public url, then bring them to login page;
  if (!isLoggedIn && !isPublicRoute) {
    return NextResponse.redirect(new URL("/auth/login", nextUrl));
  }

  // it means we will allow every other routes
  return NextResponse.next();
});

/*
description of this config:
the hard code url or url by regex, they mean if the url in the address bar of browser,
then it will execute the above code: auth()
*/
export const config = {
  // this comes from Clerk, it's said to be a better matcher
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
