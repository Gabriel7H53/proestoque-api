import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const getPrismaInstance = () => {
  const dbUrl = process.env.DATABASE_URL || "file:./dev.db";

  // Se a URL for do PostgreSQL (produção/Railway), inicia sem o adapter do SQLite
  if (dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://")) {
    return new PrismaClient({
      log: process.env.NODE_ENV === "development" ? ["query", "error"] : ["error"],
    });
  }

  // Se a URL for SQLite (desenvolvimento local), carrega o adapter do better-sqlite3
  // NOTA: Para rodar comandos localmente com SQLite (como prisma migrate/studio), 
  // o provider no schema.prisma deve estar configurado como "sqlite"
  const { PrismaBetterSqlite3 } = require("@prisma/adapter-better-sqlite3");
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
