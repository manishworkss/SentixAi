import { PrismaClient } from "@prisma/client";
import { env } from "../config/env";
import { logger } from "./logger";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (env.NODE_ENV !== "production") globalForPrisma.prisma = db;

process.on("SIGINT", async () => {
  logger.info("Disconnecting Prisma Client...");
  await db.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Disconnecting Prisma Client...");
  await db.$disconnect();
  process.exit(0);
});
