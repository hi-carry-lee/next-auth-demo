import { DefaultSession } from "next-auth";
import { UserRole } from "@prisma/client";

/*
Authjs的官方文档-Getting Started-Typescript中提到了：Module Augmentation:
  1. Authjs默认提供了所需的类型；
  2. 我们可以通过 TypeScript’s Module Augmentation 去扩展已有的类型；
  3. DefaultJWT是Authjs定义的 基础结构的接口，对它进行扩展也可以
*/

// Module Augmentation:
// 当前还是beta版本，扩展的是"next-auth"，未来稳定版可能会使用:"@auth/core"
declare module "next-auth" {
  interface User {
    id: string;
    role?: UserRole;
    isTwoFactorEnabled?: boolean;
  }

  interface Session {
    user: {
      id: string;
      role?: UserRole;
      isTwoFactorEnabled?: boolean;
      isOAuth: boolean;
    } & DefaultSession["user"];
  }
}

// 基于Authjs已有的类型，自定义一个👉👉新的类型👈👈；
// 因为是独立于authjs之外，所以使用时需要手动导入才能使用，而上面的类型扩展，则是全局生效；
// 这里的扩展的user用在需要显式使用user类型的地方
export type ExtendedUser = DefaultSession["user"] & {
  id: string;
  role?: UserRole;
  isTwoFactorEnabled?: boolean; // 添加此属性
  isOAuth: boolean;
};

// 由于你在代码中使用了 jwt 回调传递 role，还需要扩展 JWT 类型：
/*
  如果扩展JWT类型，那么ESlint会告警：JWT定义但未被使用，这个告警不影响使用，解决方案：
  1. 引入 import { DefaultJWT } from "next-auth/jwt"; 然后定义JWT类型继承它，扩展它；
  2. 使用ESLint注释禁用该行的规则: // eslint-disable-next-line @typescript-eslint/no-unused-vars 
*/
import { DefaultJWT } from "next-auth/jwt";
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    role?: UserRole;
    isTwoFactorEnabled?: boolean;
    isAuth?: boolean;
  }
}
