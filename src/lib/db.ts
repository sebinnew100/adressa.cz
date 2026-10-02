import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({ log: ['error'] });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Neon's serverless Postgres suspends idle instances; the first query after
// a cold cron run can hit it mid-wakeup and throw P1001 ("can't reach
// database server"). Retrying after a short pause almost always succeeds
// once the instance has finished waking up — wrap each cron's first query
// in this so a cold start doesn't fail the whole run.
export async function withRetry<T>(fn: () => Promise<T>, attempts = 3, delayMs = 2000): Promise<T> {
  let lastErr: unknown;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (i < attempts - 1) await new Promise(r => setTimeout(r, delayMs * (i + 1)));
    }
  }
  throw lastErr;
}
