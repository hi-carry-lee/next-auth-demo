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

const { auth } = NextAuth(authConfig);
// 🌻here the req is not Nextjs req, it's req from Authjs instead;
// so we can use 'req.auth'
export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // the order of validate is important

  // for example: api/auth/provider, do nothing on it;
  if (isApiAuthRoute) {
    return NextResponse.next();
  }

  // for example: /auth/login, or /auth/register
  // if user has logged in, then redirect to default page;
  // if not logged in, do nothing about it;
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
性能优化：静态资源直接提供，不经过中间件处理，减少不必要的开销
安全控制：确保所有页面和API请求都经过中间件（可用于认证、授权等），然后在上面的auth函数内，判断哪些请求需要被放行，哪些需要登录才可以使用
所有API请求（/api/*路径）总是经过中间件处理
所有tRPC请求（/trpc/*路径）总是经过中间件处理
*/
export const config = {
  // this comes from Clerk, it's said to be a better matcher
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    // 否定断言(?!...)用来实现排除，即排除这些路径，不需要经过middleware；
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
