/**
 * Simple rate limiter using Upstash Redis.
 * Falls back to allowing all requests if Redis is unavailable.
 */

const UPSTASH_URL = process.env.UPSTASH_REDIS_REST_URL;
const UPSTASH_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetIn: number;
}

/**
 * Check rate limit for a given key.
 * @param key - Unique identifier (e.g., IP, API key, user ID)
 * @param limit - Max requests allowed
 * @param windowSeconds - Time window in seconds
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): Promise<RateLimitResult> {
  if (!UPSTASH_URL || !UPSTASH_TOKEN) {
    // No Redis configured — allow all
    return { allowed: true, remaining: limit, resetIn: 0 };
  }

  try {
    const redisKey = `rate:${key}`;

    // INCR + TTL in a single pipeline
    const pipeline = [
      ["INCR", redisKey],
      ["TTL", redisKey],
    ];

    const res = await fetch(`${UPSTASH_URL}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${UPSTASH_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(pipeline),
    });

    if (!res.ok) {
      return { allowed: true, remaining: limit, resetIn: 0 };
    }

    const results = await res.json();
    const count = results[0]?.result || 1;
    const ttl = results[1]?.result || -1;

    // Set expiry on first request
    if (ttl === -1) {
      await fetch(`${UPSTASH_URL}/EXPIRE/${redisKey}/${windowSeconds}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${UPSTASH_TOKEN}` },
      });
    }

    return {
      allowed: count <= limit,
      remaining: Math.max(0, limit - count),
      resetIn: ttl > 0 ? ttl : windowSeconds,
    };
  } catch {
    // Redis error — fail open
    return { allowed: true, remaining: limit, resetIn: 0 };
  }
}
