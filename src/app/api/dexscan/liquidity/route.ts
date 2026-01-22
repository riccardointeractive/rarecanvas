/**
 * DEXscan API Proxy - Liquidity Overview
 * 
 * GET /api/dexscan/liquidity - Get overview of all liquidity pools
 */

import { NextResponse } from 'next/server';
import { getRedis } from '@/lib/redis';
import { 
  DEXSCAN_API_URL, 
  DEXSCAN_API_KEY, 
  DEXSCAN_ENDPOINTS,
  DEXSCAN_CACHE_TTL,
  DEXSCAN_REDIS_PREFIX,
} from '@/config/dexscan';
import { debugLog } from '@/utils/debugMode';

const REDIS_KEY = `${DEXSCAN_REDIS_PREFIX}:liquidity`;

export async function GET() {
  if (!DEXSCAN_API_KEY) {
    return NextResponse.json(
      { error: 'DEXscan API key not configured' },
      { status: 500 }
    );
  }

  const redis = getRedis();

  // Try Redis cache first
  if (redis) {
    try {
      const cached = await redis.get(REDIS_KEY);
      if (cached) {
        debugLog('[DEXscan API] Returning cached liquidity');
        const data = typeof cached === 'string' ? JSON.parse(cached) : cached;
        return NextResponse.json(data, {
          headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
            'X-Cache': 'HIT',
          },
        });
      }
    } catch (e) {
      console.error('[DEXscan API] Redis error:', e);
    }
  }

  // Fetch fresh data
  try {
    debugLog('[DEXscan API] Fetching liquidity overview from DEXscan');
    
    const response = await fetch(
      `${DEXSCAN_API_URL}${DEXSCAN_ENDPOINTS.liquidityOverview}`,
      {
        headers: {
          'x-api-key': DEXSCAN_API_KEY,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`DEXscan API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.code !== 'successful') {
      throw new Error('DEXscan returned unsuccessful response');
    }

    // Cache in Redis
    if (redis) {
      try {
        await redis.set(REDIS_KEY, JSON.stringify(result.data), { 
          ex: DEXSCAN_CACHE_TTL 
        });
      } catch (e) {
        console.error('[DEXscan API] Failed to cache:', e);
      }
    }

    return NextResponse.json(result.data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        'X-Cache': 'MISS',
      },
    });
  } catch (error) {
    console.error('[DEXscan API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
