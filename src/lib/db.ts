import { PrismaClient } from '@prisma/client';
import net from 'net';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | null | undefined;
  isDbReachable: boolean | undefined;
  lastCheckedTime: number | undefined;
};

export const hasDatabaseUrl = Boolean(
  process.env.DATABASE_URL && process.env.DATABASE_URL.trim() !== ''
);

/**
 * Rapidly probes if the database host:port is reachable via TCP.
 * Prevents Prisma from blocking for 5+ seconds and throwing console error dumps
 * when PostgreSQL is offline.
 */
export async function isDatabaseReachable(): Promise<boolean> {
  if (!hasDatabaseUrl) return false;

  const now = Date.now();
  // Cache connection reachability for 30 seconds to avoid repeated socket checks
  if (
    globalForPrisma.isDbReachable !== undefined &&
    globalForPrisma.lastCheckedTime &&
    now - globalForPrisma.lastCheckedTime < 30000
  ) {
    return globalForPrisma.isDbReachable;
  }

  try {
    const rawUrl = process.env.DATABASE_URL!;
    const parsed = new URL(rawUrl);
    const host = parsed.hostname || 'localhost';
    const port = parsed.port ? parseInt(parsed.port, 10) : 5432;

    const reachable = await new Promise<boolean>((resolve) => {
      const socket = new net.Socket();
      socket.setTimeout(1500); // 1.5s timeout for cloud databases

      socket.on('connect', () => {
        socket.destroy();
        resolve(true);
      });

      socket.on('timeout', () => {
        socket.destroy();
        resolve(false);
      });

      socket.on('error', () => {
        socket.destroy();
        resolve(false);
      });

      socket.connect(port, host);
    });

    globalForPrisma.isDbReachable = reachable;
    globalForPrisma.lastCheckedTime = now;
    return reachable;
  } catch {
    globalForPrisma.isDbReachable = false;
    globalForPrisma.lastCheckedTime = now;
    return false;
  }
}

export const prisma: PrismaClient | null = (() => {
  if (!hasDatabaseUrl) {
    return null;
  }
  try {
    return (
      globalForPrisma.prisma ??
      new PrismaClient({
        log: ['error'],
      })
    );
  } catch {
    return null;
  }
})();

if (process.env.NODE_ENV !== 'production' && prisma) {
  globalForPrisma.prisma = prisma;
}
