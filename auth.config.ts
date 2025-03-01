import GitHub from "next-auth/providers/github";
import type { NextAuthConfig } from "next-auth";

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [GitHub],
} satisfies NextAuthConfig;

/*
🌻 the whole code comes from Auth.js Doc
this is used to fix Edge runtime issue, since Prisma can't run on Edge;
so this config auth is used in middleware, auth.ts is integrate with Prisma, it don't need to run on Edge;
*/
