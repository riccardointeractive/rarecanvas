/**
 * DEXscan API Proxy - Single Asset
 * 
 * GET /api/dexscan/asset/[ticker] - Get price for a single asset
 * GET /api/dexscan/asset/[ticker]?full=true - Get full asset data with pools
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

export async function GET(
  request: Request,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const { searchParams } = new URL(request.url);
  const full = searchParams.get('full') === 'true';

  if (!DEXSCAN_API_KEY) {
    return NextResponse.json(
      { error: 'DEXscan API key not configured' },
      { status: 500 }
    );
  }

  const redis = getRedis();
  const cacheKey = `${DEXSCAN_REDIS_PREFIX}:asset:${ticker}${full ? ':full' : ''}`;

  // Try Redis cache first
  if (redis) {
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        debugLog(`[DEXscan API] Returning cached asset: ${ticker}`);
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
    const endpoint = full 
      ? DEXSCAN_ENDPOINTS.assetFull(ticker)
      : DEXSCAN_ENDPOINTS.assetPrice(ticker);
    
    debugLog(`[DEXscan API] Fetching asset: ${ticker} (full=${full})`);
    
    const response = await fetch(`${DEXSCAN_API_URL}${endpoint}`, {
      headers: {
        'x-api-key': DEXSCAN_API_KEY,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: `Asset not found: ${ticker}` },
          { status: 404 }
        );
      }
      throw new Error(`DEXscan API error: ${response.status}`);
    }

    const result = await response.json();
    
    if (result.code !== 'successful') {
      throw new Error('DEXscan returned unsuccessful response');
    }

    // Cache in Redis
    if (redis) {
      try {
        await redis.set(cacheKey, JSON.stringify(result.data), { 
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
