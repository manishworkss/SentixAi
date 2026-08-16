import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { env } from '../config/env';
import { logger } from './logger';

// Prevent multiple instances of Prisma Client in development
// due to hot reloading (which can exhaust database connections)
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Initialize Mariadb adapter
const adapter = new PrismaMariaDb(env.DATABASE_URL!);

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
