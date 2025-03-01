import NextAuth from "next-auth";
import authConfig from "./auth.config";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});

/*
this code is used to adapt for Edge runtime;
if no need to run on Edge runtime, then no need to use PrismaAdapter.
*/
