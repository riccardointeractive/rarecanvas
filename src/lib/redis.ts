/**
 * Shared Redis Client
 * 
 * Provides a singleton Redis client for use across API routes.
 * Uses Upstash Redis REST API for Vercel Edge compatibility.
 */

import { Redis } from '@upstash/redis';

let redisClient: Redis | null = null;

/**
 * Get the Redis client instance (lazy initialization)
 */
export function getRedis(): Redis | null {
  if (redisClient) return redisClient;
  
  // Try direct REST credentials first (recommended)
  if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    return redisClient;
  }
  
  // Try Vercel KV format
  if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
    redisClient = new Redis({
      url: process.env.KV_REST_API_URL,
      token: process.env.KV_REST_API_TOKEN,
    });
    return redisClient;
  }
  
  // Parse from REDIS_URL (legacy format)
  const redisUrl = process.env.REDIS_URL || '';
  try {
    const url = new URL(redisUrl);
    const host = url.hostname;
    const token = url.password;
    
    if (host && token) {
      redisClient = new Redis({
        url: `https://${host}`,
        token: token,
      });
      return redisClient;
    }
  } catch {
    console.error('[Redis] Failed to parse REDIS_URL');
  }
  
  console.warn('[Redis] No Redis configuration found');
  return null;
}

/**
 * Check if Redis is available
 */
export function isRedisAvailable(): boolean {
  return getRedis() !== null;
}
