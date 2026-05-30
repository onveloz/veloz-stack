/**
 * Upstash Redis — serverless-friendly Redis over HTTPS.
 * Safe for Workers, Vercel Edge, and bun/node. No TCP connection pool
 * to manage.
 */
import { Redis } from "@upstash/redis";

const url = process.env.UPSTASH_REDIS_URL;
const token = process.env.UPSTASH_REDIS_TOKEN;
if (!url || !token) {
  throw new Error("UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN are required");
}

/** @internal Scaffold export. */
export const redis = new Redis({ url, token });

/** JSON wrapper: serialise on set, deserialise on get. */
export const json = {
  async get<T>(key: string): Promise<T | null> {
    return (await redis.get<T>(key)) ?? null;
  },
  async set<T>(key: string, value: T, opts?: { ex?: number }): Promise<void> {
    await redis.set(key, value, opts?.ex ? { ex: opts.ex } : undefined);
  },
  async del(key: string): Promise<void> {
    await redis.del(key);
  },
};

