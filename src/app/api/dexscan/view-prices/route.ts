/**
 * DEXscan API Proxy - VIEW PRICES Map
 * 
 * GET /api/dexscan/view-prices - Get VIEW PRICES as a keyed map
 * 
 * Transforms the tokens overview into a convenient map structure
 * keyed by both full ticker and base symbol.
 * 
 * @example Response:
 * {
 *   "DGKO": { ticker: "DGKO-CXVJ", symbol: "DGKO", priceUsd: 0.000624, ... },
 *   "DGKO-CXVJ": { ... same as above ... },
 *   "KLV": { ticker: "KLV", symbol: "KLV", priceUsd: 0.00186, ... }
 * }
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
import type { TokensOverviewData, ViewPrice } from '@/types/dexscan';
import { debugLog } from '@/utils/debugMode';

const REDIS_KEY = `${DEXSCAN_REDIS_PREFIX}:view-prices`;

/**
 * Extract base symbol from ticker (e.g., "DGKO-CXVJ" -> "DGKO")
 */
function getBaseSymbol(ticker: string): string {
  return ticker.split('-')[0] || ticker;
}

/**
 * Transform overview data to VIEW PRICES map
 */
function toViewPricesMap(data: TokensOverviewData): Record<string, ViewPrice> {
  const map: Record<string, ViewPrice> = {};
  
  for (const token of data.tokens) {
    const viewPrice: ViewPrice = {
      ticker: token.ticker,
      symbol: getBaseSymbol(token.ticker),
      priceUsd: token.price.current,
      priceChange24h: token.price_changes.change_24h,
      volume24h: token.volume.usd_24h,
      tvlUsd: token.liquidity.tvl_usd,
      mcap: token.mcap,
      poolsCount: token.liquidity.pools_count,
      primaryDex: token.liquidity.primary_dex,
      lastUpdated: Date.now(),
      source: 'dexscan',
    };
    
    // Key by both full ticker and base symbol
    map[token.ticker] = viewPrice;
    map[viewPrice.symbol] = viewPrice;
  }
  
  // Add KLV
  map['KLV'] = {
    ticker: 'KLV',
    symbol: 'KLV',
    priceUsd: data.klv_price,
    priceChange24h: 0,
    volume24h: 0,
    tvlUsd: data.total_tvl,
    mcap: 0,
    poolsCount: 0,
    primaryDex: '',
    lastUpdated: Date.now(),
    source: 'dexscan',
  };
  
  return map;
}

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
        debugLog('[DEXscan API] Returning cached view-prices');
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
    debugLog('[DEXscan API] Fetching view-prices from DEXscan');
    
    const response = await fetch(
      `${DEXSCAN_API_URL}${DEXSCAN_ENDPOINTS.tokensOverview}`,
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

    const viewPrices = toViewPricesMap(result.data);

    // Cache in Redis
    if (redis) {
      try {
        await redis.set(REDIS_KEY, JSON.stringify(viewPrices), { 
          ex: DEXSCAN_CACHE_TTL 
        });
        debugLog('[DEXscan API] Cached view-prices in Redis');
      } catch (e) {
        console.error('[DEXscan API] Failed to cache:', e);
      }
    }

    return NextResponse.json(viewPrices, {
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
