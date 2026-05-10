import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Provide a dummy URL if the environment variable is missing or invalid to prevent crash on startup
let dbUrl = process.env.DATABASE_URL;
if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://'))) {
  dbUrl = 'postgresql://dummy:dummy@localhost:5432/dummy';
  process.env.DATABASE_URL = dbUrl;
}

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    datasources: {
      db: {
        url: dbUrl,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
