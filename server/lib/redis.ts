import Redis from "ioredis";
import NodeCache from "node-cache";

// Standard local in-memory cache fallback for high-availability environment
const fallbackCache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

let redis: Redis | null = null;
let isRedisConnected = false;

const REDIS_URL = process.env.REDIS_URL;

if (REDIS_URL) {
  try {
    redis = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      retryStrategy(times) {
        if (times > 3) {
          console.warn("[REDIS CRITICAL] Redis cluster unreachable. Gracefully switching to In-Memory backup layers.");
          return null; // Halt automated retries
        }
        return Math.min(times * 200, 2000);
      }
    });

    redis.on("connect", () => {
      isRedisConnected = true;
      console.log("[REDIS MODULE] Successfully established channel with Redis Server.");
    });

    redis.on("error", (err) => {
      isRedisConnected = false;
      console.warn("[REDIS WARNING] Lost connection or error encountered:", err.message);
    });
  } catch (error) {
    console.error("[REDIS ERROR] Failed to initialize Redis IO context:", error);
  }
} else {
  console.log("[REDIS MODULE] REDIS_URL env variable not supplied. Running local In-Memory engine.");
}

export const getRedisClient = (): Redis | null => {
  return isRedisConnected ? redis : null;
};

export const checkIsRedisActive = (): boolean => {
  return isRedisConnected;
};

/**
 * Enhanced async key GET with robust JSON parsing.
 */
export async function getCache<T>(key: string): Promise<T | undefined> {
  if (isRedisConnected && redis) {
    try {
      const data = await redis.get(key);
      if (data === null) return undefined;
      return JSON.parse(data) as T;
    } catch (err) {
      console.error(`[REDIS] GET failed for key: "${key}"`, err);
    }
  }
  return fallbackCache.get<T>(key);
}

/**
 * Enhanced async key SET with standard TTL options.
 */
export async function setCache(key: string, value: any, ttlSeconds?: number): Promise<void> {
  if (isRedisConnected && redis) {
    try {
      const payload = JSON.stringify(value);
      if (ttlSeconds) {
        await redis.set(key, payload, "EX", ttlSeconds);
      } else {
        await redis.set(key, payload);
      }
      return;
    } catch (err) {
      console.error(`[REDIS] SET failed for key: "${key}"`, err);
    }
  }
  fallbackCache.set(key, value, ttlSeconds || 300);
}

/**
 * Key removal handler.
 */
export async function deleteCache(key: string): Promise<void> {
  if (isRedisConnected && redis) {
    try {
      await redis.del(key);
      return;
    } catch (err) {
      console.error(`[REDIS] DEL failed for key: "${key}"`, err);
    }
  }
  fallbackCache.del(key);
}
