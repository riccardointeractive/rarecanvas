/**
 * DEXscan API Client
 * 
 * Fetches VIEW PRICES from DEXscan - aggregated market data from multiple DEXes.
 * 
 * IMPORTANT: This is for display purposes only. For swap execution,
 * always use RESERVE PRICES from our pools.
 * 
 * Usage:
 *   // Server-side (API routes)
 *   import { fetchTokensOverview, fetchAssetPrice } from '@/lib/dexscan';
 * 
 *   // Client-side (React components)
 *   import { useDexScanOverview, useDexScanToken } from '@/hooks/useDexScan';
 * 
 * @see /src/config/dexscan.ts for configuration
 * @see /src/types/dexscan.ts for type definitions
 */

import { 
  DEXSCAN_API_URL, 
  DEXSCAN_API_KEY,
  DEXSCAN_ENDPOINTS,
  DEXSCAN_MIN_RELIABLE_TVL,
  PRICE_DISCREPANCY_THRESHOLDS,
} from '@/config/dexscan';

import type {
  DexScanResponse,
  AssetPriceData,
  AssetFullData,
  TokensOverviewData,
  TokenOverviewItem,
  LiquidityOverviewData,
  PoolDetailData,
  ViewPrice,
  PriceComparison,
  DexScanError,
} from '@/types/dexscan';

import { getBaseSymbol, isPriceReliable } from '@/types/dexscan';
import { debugLog } from '@/utils/debugMode';

// =============================================================================
// CORE FETCH UTILITY
// =============================================================================

/**
 * Make an authenticated request to DEXscan API
 */
async function dexscanFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<DexScanResponse<T>> {
  const url = `${DEXSCAN_API_URL}${endpoint}`;
  
  debugLog(`[DEXscan] Fetching: ${url}`);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'x-api-key': DEXSCAN_API_KEY,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error: DexScanError = {
      code: 'error',
      message: `DEXscan API error: ${response.status} ${response.statusText}`,
      status: response.status,
    };
    throw error;
  }

  const data = await response.json();
  
  if (data.code !== 'successful') {
    throw {
      code: 'error',
      message: data.message || 'DEXscan API returned unsuccessful response',
    } as DexScanError;
  }

  return data;
}

// =============================================================================
// ASSET ENDPOINTS
// =============================================================================

/**
 * Get current price for a single asset
 * 
 * @example
 *   const { data } = await fetchAssetPrice('KLV');
 *   console.log(data.price); // "0.00186300"
 */
export async function fetchAssetPrice(ticker: string): Promise<AssetPriceData> {
  const response = await dexscanFetch<AssetPriceData>(
    DEXSCAN_ENDPOINTS.assetPrice(ticker)
  );
  return response.data;
}

/**
 * Get full asset data including liquidity pools and 24h volume
 * 
 * @example
 *   const { data } = await fetchAssetFull('KLV');
 *   console.log(data.pools); // All pools with this token
 *   console.log(data.volume_24h); // 24h volume
 */
export async function fetchAssetFull(ticker: string): Promise<AssetFullData> {
  const response = await dexscanFetch<AssetFullData>(
    DEXSCAN_ENDPOINTS.assetFull(ticker)
  );
  return response.data;
}

// =============================================================================
// TOKENS OVERVIEW
// =============================================================================

/**
 * Get overview of all tracked tokens with stats
 * 
 * This is the primary endpoint for VIEW PRICES - returns price, volume,
 * TVL, price changes, and activity for all tokens.
 * 
 * @example
 *   const data = await fetchTokensOverview();
 *   const dgko = data.tokens.find(t => t.ticker.startsWith('DGKO'));
 *   console.log(dgko?.price.current); // Current USD price
 */
export async function fetchTokensOverview(): Promise<TokensOverviewData> {
  const response = await dexscanFetch<TokensOverviewData>(
    DEXSCAN_ENDPOINTS.tokensOverview
  );
  return response.data;
}

/**
 * Get a specific token from the overview
 * More efficient than fetchAssetPrice when you need multiple tokens
 */
export async function fetchTokenFromOverview(
  ticker: string
): Promise<TokenOverviewItem | null> {
  const data = await fetchTokensOverview();
  return data.tokens.find(t => 
    t.ticker === ticker || t.ticker.startsWith(ticker.split('-')[0] + '-')
  ) || null;
}

// =============================================================================
// LIQUIDITY ENDPOINTS
// =============================================================================

/**
 * Get overview of all liquidity pools across DEXes
 */
export async function fetchLiquidityOverview(): Promise<LiquidityOverviewData> {
  const response = await dexscanFetch<LiquidityOverviewData>(
    DEXSCAN_ENDPOINTS.liquidityOverview
  );
  return response.data;
}

/**
 * Get detailed info for a specific pool
 */
export async function fetchPoolDetail(
  dex: string,
  tokenA: string,
  tokenB: string
): Promise<PoolDetailData> {
  const response = await dexscanFetch<PoolDetailData>(
    DEXSCAN_ENDPOINTS.poolDetail(dex, tokenA, tokenB)
  );
  return response.data;
}

// =============================================================================
// PROCESSED DATA HELPERS
// =============================================================================

/**
 * Convert TokenOverviewItem to simplified ViewPrice
 * 
 * @example
 *   const overview = await fetchTokensOverview();
 *   const viewPrices = overview.tokens.map(toViewPrice);
 */
export function toViewPrice(token: TokenOverviewItem): ViewPrice {
  return {
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
}

/**
 * Get all VIEW PRICES as a map keyed by symbol
 * 
 * @example
 *   const prices = await fetchViewPricesMap();
 *   console.log(prices['DGKO']?.priceUsd);
 */
export async function fetchViewPricesMap(): Promise<Record<string, ViewPrice>> {
  const data = await fetchTokensOverview();
  const map: Record<string, ViewPrice> = {};
  
  for (const token of data.tokens) {
    const viewPrice = toViewPrice(token);
    // Key by both full ticker and base symbol for easy lookup
    map[token.ticker] = viewPrice;
    map[viewPrice.symbol] = viewPrice;
  }
  
  // Add KLV price
  map['KLV'] = {
    ticker: 'KLV',
    symbol: 'KLV',
    priceUsd: data.klv_price,
    priceChange24h: 0, // Not provided in overview
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

// =============================================================================
// PRICE COMPARISON UTILITIES
// =============================================================================

/**
 * Compare VIEW PRICE (DEXscan) with RESERVE PRICE (our pools)
 * 
 * Returns analysis of the price gap with trading signal
 * 
 * @param token - Token symbol
 * @param viewPrice - DEXscan aggregated price (USD)
 * @param reservePrice - Our pool reserve-derived price (USD)
 * @param reservePair - Which pair the reserve price is from
 * @param tvlUsd - TVL of our pool (for confidence)
 */
export function comparePrices(
  token: string,
  viewPrice: number,
  reservePrice: number,
  reservePair: string,
  tvlUsd: number
): PriceComparison {
  const gapPercent = viewPrice > 0 
    ? ((reservePrice - viewPrice) / viewPrice) * 100 
    : 0;
  
  const absGap = Math.abs(gapPercent);
  
  // Determine gap direction
  let gapDirection: PriceComparison['gapDirection'];
  if (absGap < PRICE_DISCREPANCY_THRESHOLDS.LOW) {
    gapDirection = 'aligned';
  } else if (gapPercent > 0) {
    gapDirection = 'above';
  } else {
    gapDirection = 'below';
  }
  
  // Determine signal
  let signal: PriceComparison['signal'];
  if (gapDirection === 'aligned') {
    signal = 'neutral';
  } else if (gapDirection === 'below') {
    // Our price is lower than market = good buy opportunity
    signal = 'buy';
  } else {
    // Our price is higher than market = good sell opportunity
    signal = 'sell';
  }
  
  // Determine confidence based on TVL and gap size
  let confidence: PriceComparison['confidence'];
  if (!isPriceReliable(tvlUsd, DEXSCAN_MIN_RELIABLE_TVL)) {
    confidence = 'low';
  } else if (absGap > PRICE_DISCREPANCY_THRESHOLDS.HIGH) {
    // Very large gaps might indicate manipulation or stale data
    confidence = 'medium';
  } else {
    confidence = 'high';
  }
  
  // Generate reason
  let reason: string;
  if (gapDirection === 'aligned') {
    reason = `Price is aligned with market (${absGap.toFixed(1)}% difference)`;
  } else if (signal === 'buy') {
    reason = `Trading ${absGap.toFixed(1)}% below market price on Digiko`;
  } else {
    reason = `Trading ${absGap.toFixed(1)}% above market price on Digiko`;
  }
  
  if (confidence === 'low') {
    reason += ' (low liquidity - use caution)';
  }
  
  return {
    token,
    viewPrice,
    reservePrice,
    reservePair,
    gapPercent,
    gapDirection,
    signal,
    confidence,
    reason,
  };
}

/**
 * Check if API key is configured
 */
export function isDexScanConfigured(): boolean {
  return DEXSCAN_API_KEY.length > 0;
}

/**
 * Health check for DEXscan API
 */
export async function checkDexScanHealth(): Promise<{
  ok: boolean;
  latency: number;
  error?: string;
}> {
  const start = Date.now();
  
  try {
    if (!isDexScanConfigured()) {
      return { ok: false, latency: 0, error: 'API key not configured' };
    }
    
    await fetchAssetPrice('KLV');
    return { ok: true, latency: Date.now() - start };
  } catch (e) {
    return { 
      ok: false, 
      latency: Date.now() - start,
      error: e instanceof Error ? e.message : 'Unknown error',
    };
  }
}
