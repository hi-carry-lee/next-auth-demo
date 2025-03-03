import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { LoginSchema } from "@/schemas";
import { getUserByEmail } from "./data/user";

// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    }),
    // this function is for validate whether users' input is valid
    Credentials({
      // the names of function and parameter can't be other names;
      async authorize(credentials) {
        const validatedFields = LoginSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;

          const user = await getUserByEmail(email);
          if (!user || !user.password) return null;

          const passwordMatch = await bcrypt.compare(password, user.password);
          if (passwordMatch) {
            // the returned user will flow to jwt in callbacks, then continue to session
            return user;
          }
        }
        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;

/*
🌻 the whole code comes from Auth.js Doc
this is used to fix Edge runtime issue, since Prisma can't run on Edge;
so this config auth is used in middleware, auth.ts is integrate with Prisma, it don't need to run on Edge;
*/
