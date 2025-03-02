import { DefaultSession } from "next-auth";
import { DefaultJWT } from "next-auth/jwt";
import { UserRole } from "@prisma/client";

// auth.ts there is a type error in session.user.role = token.role;
// this file is created to fix that issue
// 这个问题的本质是 TypeScript 的类型系统需要明确的类型定义，而 next-auth.d.ts 文件的作用正是通过 声明合并（Declaration Merging） 扩展 Auth.js 的默认类型
// Auth.js 的默认 Session.user 类型是 AdapterUser & User，而这两个接口的原始定义中都没有 role 属性：
// 当你尝试给 session.user.role 赋值时，TypeScript 会严格检查类型，发现 role 不存在于原始定义中，因此报错
// 通过创建 next-auth.d.ts 文件，你使用了 TypeScript 的 模块增强（Module Augmentation） 功能：
// 这里发生了 接口合并（Interface Merging）：
//   将自定义的 role 属性合并到 Auth.js 的 User 和 Session 接口中
//   & DefaultSession["user"] 保留了原始类型的所有属性（如 name, email 等）
declare module "next-auth" {
  interface User {
    id: string;
    role?: UserRole;
  }

  interface Session {
    user: {
      id: string;
      role?: UserRole;
    } & DefaultSession["user"];
  }
}

export type ExtendedUser = DefaultSession["user"] & {
  role: "ADMIN" | "USER";
};

// 由于你在代码中使用了 jwt 回调传递 role，还需要扩展 JWT 类型：
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: UserRole;
  }
}
