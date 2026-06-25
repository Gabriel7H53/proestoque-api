import { PrismaClient } from "@prisma/client";
import path from "path";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const getPrismaInstance = () => {
  const dbUrl = process.env.DATABASE_URL || "file:./dev.db";

  const isProduction = process.env.NODE_ENV === "production" || dbUrl.startsWith("postgresql://") || dbUrl.startsWith("postgres://");

  // Se estiver em produção ou a URL for do PostgreSQL, inicia usando o adapter do PostgreSQL (@prisma/adapter-pg)
  if (isProduction) {
    const { Pool } = require("pg");
    const { PrismaPg } = require("@prisma/adapter-pg");

    const pool = new Pool({
      connectionString: dbUrl.startsWith("file:") ? undefined : dbUrl,
    });

    const adapter = new PrismaPg(pool);

    return new PrismaClient({
      adapter,
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
