import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString =
  process.env.DATABASE_URL ||
  'postgresql://postgres:postgres@localhost:5432/mghal_content_os?schema=public';

export const pool = new Pool({
  connectionString,
  connectionTimeoutMillis: 1000,
});

// Suppress unhandled error events when PostgreSQL server is offline
pool.on('error', () => {
  // Silent handler for background pool connection drops
});

const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  isDbAvailable: boolean | undefined;
  dbCheckedAt: number | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    // Only log Prisma query errors if explicitly requested via DEBUG_PRISMA,
    // preventing log pollution during tests, builds, or when running in local fallback mode.
    log: process.env.DEBUG_PRISMA === 'true' ? ['error', 'warn'] : [],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

const CHECK_INTERVAL_MS = 60000;

/**
 * Cleanly checks if the PostgreSQL database is reachable without emitting noisy Prisma stack traces.
 * Automatically returns false during tests and production build phase.
 */
export async function isDatabaseAvailable(): Promise<boolean> {
  // Skip live PostgreSQL during tests, Next.js build prerendering, or explicit local mode
  if (
    process.env.NODE_ENV === 'test' ||
    process.env.VITEST ||
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.USE_LOCAL_STORAGE === 'true'
  ) {
    return false;
  }

  // If no DATABASE_URL configured in environment, skip pool connection attempts immediately
  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.includes('placeholder') || process.env.DATABASE_URL.includes('your-')) {
    return false;
  }

  const now = Date.now();
  if (
    globalForPrisma.isDbAvailable !== undefined &&
    globalForPrisma.dbCheckedAt &&
    now - globalForPrisma.dbCheckedAt < CHECK_INTERVAL_MS
  ) {
    return globalForPrisma.isDbAvailable;
  }

  try {
    const client = await Promise.race([
      pool.connect(),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('PostgreSQL connection timeout')), 600)
      ),
    ]);
    client.release();
    globalForPrisma.isDbAvailable = true;
    globalForPrisma.dbCheckedAt = now;
    return true;
  } catch {
    if (globalForPrisma.isDbAvailable === undefined) {
      console.info(
        '[Storage] PostgreSQL is not reachable. Operating in Persistent Local JSON Mode (data/local-store.json).'
      );
    }
    globalForPrisma.isDbAvailable = false;
    globalForPrisma.dbCheckedAt = now;
    return false;
  }
}

export default prisma;
