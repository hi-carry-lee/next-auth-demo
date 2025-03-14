import NextAuth from "next-auth";
import authConfig from "./auth.config";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { getUserById } from "@/data/user";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 },
  ...authConfig,
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
  callbacks: {
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
  // 重写Credentials provider，提供真正的实现
  // providers: [
  //   ...authConfig.providers.filter(
  //     (provider) => provider.id !== "credentials"
  //   ),
  //   // 替换为完整实现的Credentials
  //   {
  //     id: "credentials",
  //     name: "Credentials",
  //     type: "credentials",
  //     credentials: {},
  //     async authorize(credentials) {
  //       const validatedFields = LoginSchema.safeParse(credentials);

  //       if (validatedFields.success) {
  //         const { email, password } = validatedFields.data;

  //         const user = await getUserByEmail(email);
  //         if (!user || !user.password) return null;

  //         const passwordMatch = await bcrypt.compare(password, user.password);
  //         if (passwordMatch) {
  //           return user;
  //         }
  //       }
  //       return null;
  //     },
  //   },
  // ],
});
