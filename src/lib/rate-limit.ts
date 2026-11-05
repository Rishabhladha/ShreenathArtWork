type RateLimitRecord = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitRecord>();
const MAX_STORE_SIZE = 5000;
let lastCleanup = Date.now();

function cleanupExpired(now: number) {
  for (const [k, record] of store.entries()) {
    if (now > record.resetAt) {
      store.delete(k);
    }
  }
}

// Simple, effective bounded in-memory token bucket rate limiter
export function checkRateLimit(
  key: string,
  limit: number,
  windowSeconds: number
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();

  // Periodically cleanup every 30 seconds or if map exceeds limit
  if (now - lastCleanup > 30000 || store.size >= MAX_STORE_SIZE) {
    cleanupExpired(now);
    lastCleanup = now;
    if (store.size >= MAX_STORE_SIZE) {
      const keysToDelete = Array.from(store.keys()).slice(0, Math.floor(MAX_STORE_SIZE * 0.2));
      for (const k of keysToDelete) {
        store.delete(k);
      }
    }
  }

  const record = store.get(key);

  if (!record || now > record.resetAt) {
    const resetAt = now + windowSeconds * 1000;
    store.set(key, { count: 1, resetAt });
    return { success: true, remaining: limit - 1, resetAt };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count, resetAt: record.resetAt };
}

