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
          // consider this situation: user logged in with Google or Github, so there is no password
          // in this case, we don't let them log in;
          if (!user || !user.password) return null;

          const passwordMatch = await bcrypt.compare(password, user.password);
          if (passwordMatch) {
            // the returned user will flow to jwt in callbacks, then continue to session
            return user;
          }
        }
        return null;
      },
      // async authorize() {
      //   // 这个函数在middleware中不会被调用，仅作为结构占位符
      //   return null;
      // }
    }),
  ],
} satisfies NextAuthConfig;

/*
AI的解释，因为这里的 authorize 函数中有使用到Prisma，当部署到Vercel中时，会因为有DB的操作而失败，
如果没有失败，那么在请求时也会因为Edge环境不支持DB的执行，而报错；
待测试：按照原有的代码部署到Vercel上，看是否部署成功，
假如部署成功，那么在运行时检查middleware的日志，看是否有报错；
或者在Vercel的控制台，找到"Function Logs"标签，实时观察用户访问时产生的错误
*/
