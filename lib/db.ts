import { PrismaClient } from "@prisma/client";

/*
两种方法都能实现：避免在开发环境中，每次热重载创建新实例
*/
// VERSION 1
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const db = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalThis.prisma = db;

// ==========================================================
// VERSION 2
// const globalForPrisma = global as unknown as { prisma: PrismaClient };

// export const db =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     // 可以在这里添加一些配置
//     log:
//       process.env.NODE_ENV === "development"
//         ? ["query", "error", "warn"]
//         : ["error"],
//   });

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = db;
// }
