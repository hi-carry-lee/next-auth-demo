import NextAuth from "next-auth";
import authConfig from "./auth.config";

import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";
import { getUserById } from "@/data/user";
import { getTwoFactorConfirmationByUserId } from "./data/two-factor-confirmation";
import { getAccountByUserId } from "./data/account";

// current authjs is 5.0.0-beta.25, the return value is unstable_update
// you can check the source code to determine the latest version
// location is: packages/next-auth/src/index.ts
export const { handlers, auth, signIn, signOut, unstable_update } = NextAuth({
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
    // when log in by github, create user and link user is done by authjs;
    // and the user logged in by github, its email doesn't need to be verified, so we set the emailVerified field here, in this event hook
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      });
    },
  },
  callbacks: {
    async signIn({ user, account }) {
      // allow OAuth without email verification
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

      // ADD 2FA check
      if (existingUser.isTwoFactorEnabled) {
        const twoFactorConfirmation = await getTwoFactorConfirmationByUserId(
          existingUser.id
        );
        if (!twoFactorConfirmation) return false;
        // delete two factor confirmation
        await db.twoFactorConfirmation.delete({
          where: { id: twoFactorConfirmation.id },
        });
      }

      return true;
    },

    async jwt({ token }) {
      console.log("auth.ts - callbacks - jwt");
      // if user not logged, do nothing
      if (!token.sub) {
        return token;
      }

      const existingUser = await getUserById(token.sub);
      if (!existingUser) {
        return token;
      }

      token.role = existingUser.role;
      token.isTwoFactorEnabled = existingUser.isTwoFactorEnabled;
      token.email = existingUser.email;
      token.name = existingUser.name;
      const account = await getAccountByUserId(existingUser.id);
      token.isAuth = !!account;

      return token;
    },

    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }

      if (token.role && session.user) {
        session.user.role = token.role;
      }

      if (session.user) {
        // no need to use "as boolean", we can extend the property in next-auth.d.ts
        session.user.isTwoFactorEnabled = token.isTwoFactorEnabled ?? false;
      }

      session.user.isOAuth = token.isAuth ?? false;
      // here no need to assign the name and email from token to session,
      // since these two values are inherit from token.
      // only those values not exist in token by default, should be assign explicitly
      return session;
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
