import NextAuth from "next-auth";
import authConfig from "./auth.config";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { getUserById } from "@/data/user";

export const { handlers, auth, signIn, signOut } = NextAuth({
  pages: {
    // 将 NextAuth.js 默认的登录页面，替换为你自己的自定义页面
    // 所有登录请求和重定向会被发送到此路径，而不是内置的 /api/auth/signin 页面
    signIn: "/auth/login",
    // 自定义认证过程中出现错误时显示的页面，替代 NextAuth.js 默认的错误页面
    error: "/auth/error",
  },
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  // the target of callbacks:
  // 1. it allow to customize the authentication flow
  // 2. add more
  callbacks: {
    // currently this callback is used to show that the power of callback
    // the function we defined in the following is that, is the emailVerified field is null
    // then prevent the user logging in.
    // async signIn({ user, account }) {
    //   // 添加类型守卫，用来解决下面 user.id 提示的类型问题
    //   if (!user?.id) {
    //     // 使用可选链避免运行时错误
    //     return false;
    //   }
    //   const existingUser = await getUserById(user.id);

    //   if (!existingUser || !existingUser.emailVerified) {
    //     return false;
    //   }
    //   return true;
    // },

    // target: OAuth登录（如Google、GitHub等第三方登录）：直接允许登录，不需要邮箱验证, Credentials登录（用户名密码登录）：要求邮箱必须已验证才能登录
    async signIn({ user, account }) {
      // allow oauth without email verification
      if (account?.provider !== "credentials") {
        return true;
      }

      // this check is for the "user.id" type check, since it show that:
      // Argument of type 'string | undefined' is not assignable to parameter of type 'string'.
      if (!user || !user.id) {
        return false;
      }
      const existingUser = await getUserById(user.id);
      if (!existingUser?.emailVerified) return false;

      // TODO ADD 2FA check

      return true;
    },
    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role;
      }
      return session;
    },
    // two callbacks: jwt and session, the data flowed from jwt to session
    // token contains userId, and we need to pass it to session, so we can use it in page;
    async jwt({ token }) {
      // if user not logged, do nothing
      if (!token.sub) return token;
      const existingUser = await getUserById(token.sub);
      if (!existingUser) return token;
      token.role = existingUser.role;
      return token;
    },
  },
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  ...authConfig,
});

/*
this code is used to adapt for Edge runtime;
if no need to run on Edge runtime, then no need to use PrismaAdapter.
*/
