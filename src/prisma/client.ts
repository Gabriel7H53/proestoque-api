import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const getPrismaInstance = () => {
  const dbUrl = process.env.DATABASE_URL || "file:./dev.db";
  // Remove "file:" prefix if present
  const relativePath = dbUrl.startsWith("file:") ? dbUrl.substring(5) : dbUrl;
  const dbPath = path.resolve(process.cwd(), relativePath);

  const adapter = new PrismaBetterSqlite3({
    url: `file:${dbPath}`
  });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
  });
};

export const prisma = globalForPrisma.prisma ?? getPrismaInstance();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
