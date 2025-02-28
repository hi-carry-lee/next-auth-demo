import { PrismaClient } from "@prisma/client";

/*
两种方法都能实现在生产环境中每次创建新实例，在开发环境中重用同一个实例
*/
// 声明一个全局变量来存储 Prisma 实例，declare是TypeScript 中的一个特殊关键字，主要用于声明类型、变量或模块
// declare global {
//   let prisma: PrismaClient | undefined;
// }

// // 创建 Prisma 客户端的单例
// export const db =
//   (global as typeof globalThis & { prisma?: PrismaClient }).prisma ||
//   new PrismaClient();

// // 在开发环境中防止创建多个实例
// if (process.env.NODE_ENV !== "production") {
//   (global as typeof globalThis & { prisma?: PrismaClient }).prisma = db;
// }

// ==========================================================
// AI 说更推荐下面的配置
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    // 可以在这里添加一些配置
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
