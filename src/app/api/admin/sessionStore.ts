/**
 * Shared Session Store for Admin Authentication
 * 
 * Uses Upstash Redis for session persistence across serverless instances.
 * Falls back to in-memory storage if Redis is unavailable.
 * 
 * Redis Keys:
 * - digiko:session:{token} - Session data with TTL
 * - digiko:ratelimit:{key} - Rate limit counters with TTL
 */

import { getRedis } from '@/lib/redis';

export interface Session {
  createdAt: number;
  expiresAt: number;
  ip?: string;
  userAgent?: string;
}

/**
 * Get Redis key for session
 */
function getSessionKey(token: string): string {
  return `digiko:session:${token}`;
}

/**
 * Get Redis key for rate limit
 */
function getRateLimitKey(key: string): string {
  return `digiko:ratelimit:${key}`;
}

// ============================================================================
// In-memory fallback (for when Redis is unavailable)
// ============================================================================

const inMemorySessions = new Map<string, Session>();
const inMemoryRateLimits = new Map<string, { count: number; resetAt: number }>();

/**
 * Add a new session
 */
export async function addSession(token: string, session: Session): Promise<void> {
  const redis = getRedis();
  
  if (redis) {
    try {
      const ttl = Math.max(1, Math.floor((session.expiresAt - Date.now()) / 1000));
      await redis.set(getSessionKey(token), JSON.stringify(session), { ex: ttl });
      return;
    } catch (error) {
      console.error('[SessionStore] Redis error, falling back to memory:', error);
    }
  }
  
  // Fallback to in-memory
  inMemorySessions.set(token, session);
  cleanupExpiredInMemorySessions();
}

/**
 * Get a session by token
 */
export async function getSession(token: string): Promise<Session | undefined> {
  const redis = getRedis();
  
  if (redis) {
    try {
      const data = await redis.get(getSessionKey(token));
      if (data) {
        const session = typeof data === 'string' ? JSON.parse(data) : data as Session;
        // Redis TTL handles expiration, but double-check
        if (Date.now() <= session.expiresAt) {
          return session;
        }
        // Expired - clean up
        await redis.del(getSessionKey(token));
        return undefined;
      }
      return undefined;
    } catch (error) {
      console.error('[SessionStore] Redis error, falling back to memory:', error);
    }
  }
  
  // Fallback to in-memory
  const session = inMemorySessions.get(token);
  if (session && Date.now() > session.expiresAt) {
    inMemorySessions.delete(token);
    return undefined;
  }
  return session;
}

/**
 * Remove a session
 */
export async function removeSession(token: string): Promise<boolean> {
  const redis = getRedis();
  
  if (redis) {
    try {
      const result = await redis.del(getSessionKey(token));
      return result > 0;
    } catch (error) {
      console.error('[SessionStore] Redis error, falling back to memory:', error);
    }
  }
  
  // Fallback to in-memory
  return inMemorySessions.delete(token);
}

/**
 * Check if a session is valid
 */
export async function isValidSession(token: string): Promise<boolean> {
  const session = await getSession(token);
  return session !== undefined;
}

/**
 * Get session count (for monitoring) - approximate with Redis
 */
export async function getSessionCount(): Promise<number> {
  const redis = getRedis();
  
  if (redis) {
    try {
      // Note: KEYS is expensive on large datasets, use sparingly
      const keys = await redis.keys('digiko:session:*');
      return keys.length;
    } catch (error) {
      console.error('[SessionStore] Redis error:', error);
    }
  }
  
  // Fallback to in-memory
  cleanupExpiredInMemorySessions();
  return inMemorySessions.size;
}

/**
 * Clean up expired in-memory sessions (fallback only)
 */
function cleanupExpiredInMemorySessions(): void {
  const now = Date.now();
  const tokensToDelete: string[] = [];
  
  inMemorySessions.forEach((session, token) => {
    if (now > session.expiresAt) {
      tokensToDelete.push(token);
    }
  });
  
  tokensToDelete.forEach(token => inMemorySessions.delete(token));
}

/**
 * Clear all sessions (emergency use only)
 */
export async function clearAllSessions(): Promise<void> {
  const redis = getRedis();
  
  if (redis) {
    try {
      const keys = await redis.keys('digiko:session:*');
      if (keys.length > 0) {
        await Promise.all(keys.map(key => redis.del(key)));
      }
      return;
    } catch (error) {
      console.error('[SessionStore] Redis error:', error);
    }
  }
  
  // Fallback to in-memory
  inMemorySessions.clear();
}

// ============================================================================
// Rate Limiting
// ============================================================================

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs?: number;
}

export async function checkRateLimit(
  key: string,
  maxAttempts: number = 10,
  windowMs: number = 15 * 60 * 1000
): Promise<RateLimitResult> {
  const redis = getRedis();
  const now = Date.now();
  const windowSeconds = Math.floor(windowMs / 1000);
  
  if (redis) {
    try {
      const redisKey = getRateLimitKey(key);
      const current = await redis.get(redisKey);
      
      if (!current) {
        // First attempt - set counter with TTL
        await redis.set(redisKey, JSON.stringify({ count: 1, resetAt: now + windowMs }), { ex: windowSeconds });
        return { allowed: true, remaining: maxAttempts - 1 };
      }
      
      const entry = typeof current === 'string' ? JSON.parse(current) : current as { count: number; resetAt: number };
      
      // Check if window expired
      if (now > entry.resetAt) {
        await redis.set(redisKey, JSON.stringify({ count: 1, resetAt: now + windowMs }), { ex: windowSeconds });
        return { allowed: true, remaining: maxAttempts - 1 };
      }
      
      // Check if over limit
      if (entry.count >= maxAttempts) {
        return {
          allowed: false,
          remaining: 0,
          retryAfterMs: entry.resetAt - now
        };
      }
      
      // Increment counter
      entry.count++;
      const ttl = Math.max(1, Math.floor((entry.resetAt - now) / 1000));
      await redis.set(redisKey, JSON.stringify(entry), { ex: ttl });
      
      return { allowed: true, remaining: maxAttempts - entry.count };
    } catch (error) {
      console.error('[SessionStore] Redis rate limit error:', error);
    }
  }
  
  // Fallback to in-memory
  const entry = inMemoryRateLimits.get(key);
  
  // Clean up expired entry
  if (entry && now > entry.resetAt) {
    inMemoryRateLimits.delete(key);
  }
  
  const current = inMemoryRateLimits.get(key);
  
  if (!current) {
    inMemoryRateLimits.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1 };
  }
  
  if (current.count >= maxAttempts) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: current.resetAt - now
    };
  }
  
  current.count++;
  return { allowed: true, remaining: maxAttempts - current.count };
}

export async function resetRateLimit(key: string): Promise<void> {
  const redis = getRedis();
  
  if (redis) {
    try {
      await redis.del(getRateLimitKey(key));
      return;
    } catch (error) {
      console.error('[SessionStore] Redis error:', error);
    }
  }
  
  // Fallback to in-memory
  inMemoryRateLimits.delete(key);
}
