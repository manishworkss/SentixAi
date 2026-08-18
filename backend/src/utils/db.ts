import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import { createClient } from '@libsql/client';
import { env } from '../config/env';
import { logger } from './logger';

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
const libsql = createClient({ url: dbUrl });
const adapter = new PrismaLibSql(libsql);

// Prevent multiple instances of Prisma Client in development
// due to hot reloading (which can exhaust database connections)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const db =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
    log:
      env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = db;

// Graceful shutdown
process.on('beforeExit', async () => {
  logger.info('Disconnecting Prisma Client...');
  await db.$disconnect();
});
