// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error'],
  });

// ⛔ PAS de disconnect ici avec beforeExit dans un contexte Serverless → à retirer

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
