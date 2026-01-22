/**
 * Token Price Service
 *
 * Simple service for fetching KLV price from CoinGecko.
 */

import { Network } from '@/types/klever';

// ============================================================================
// Types
// ============================================================================

export interface TokenPriceData {
  assetId: string;
  symbol: string;
  name: string;
  priceUSD: number;
  priceKLV: number;
  priceChange24h?: number | null;
  source: 'coingecko' | 'error';
  lastUpdate: string;
}

export interface AllTokenPricesResult {
  klv: TokenPriceData;
  tokens: TokenPriceData[];
  lastUpdate: string;
  network: Network;
}

// ============================================================================
// Constants
// ============================================================================

const COINGECKO_KLV_URL = 'https://api.coingecko.com/api/v3/simple/price?ids=klever&vs_currencies=usd&include_24hr_change=true';

// In-memory cache
let priceCache: {
  data: AllTokenPricesResult | null;
  timestamp: number;
} = { data: null, timestamp: 0 };

const CACHE_TTL = 30_000; // 30 seconds

// ============================================================================
// Core Functions
// ============================================================================

/**
 * Fetch KLV price from CoinGecko
 */
export async function fetchKLVPrice(): Promise<{
  price: number;
  priceChange24h: number | null;
}> {
  try {
    const response = await fetch(COINGECKO_KLV_URL, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      price: data?.klever?.usd || 0,
      priceChange24h: data?.klever?.usd_24h_change || null,
    };
  } catch (error) {
    console.error('Error fetching KLV price from CoinGecko:', error);
    return { price: 0, priceChange24h: null };
  }
}

/**
 * Fetch all token prices
 */
export async function fetchAllTokenPrices(
  network: Network = 'mainnet',
  forceRefresh: boolean = false
): Promise<AllTokenPricesResult> {
  const now = Date.now();

  // Return cached data if still valid
  if (!forceRefresh && priceCache.data && now - priceCache.timestamp < CACHE_TTL) {
    return priceCache.data;
  }

  // Fetch KLV price
  const { price: klvPriceUSD, priceChange24h } = await fetchKLVPrice();

  const klvPrice: TokenPriceData = {
    assetId: 'KLV',
    symbol: 'KLV',
    name: 'Klever',
    priceUSD: klvPriceUSD,
    priceKLV: 1,
    priceChange24h,
    source: klvPriceUSD > 0 ? 'coingecko' : 'error',
    lastUpdate: new Date().toISOString(),
  };

  const result: AllTokenPricesResult = {
    klv: klvPrice,
    tokens: [],
    lastUpdate: new Date().toISOString(),
    network,
  };

  // Update cache
  priceCache = { data: result, timestamp: now };

  return result;
}

/**
 * Get price for a specific token
 */
export async function fetchTokenPrice(
  assetId: string,
  network: Network = 'mainnet'
): Promise<TokenPriceData | null> {
  if (assetId === 'KLV') {
    const result = await fetchAllTokenPrices(network);
    return result.klv;
  }

  const result = await fetchAllTokenPrices(network);
  return result.tokens.find((t) => t.assetId === assetId) || null;
}

/**
 * Get all token prices as a simple map
 */
export async function getTokenPriceMap(
  network: Network = 'mainnet'
): Promise<Record<string, number>> {
  const result = await fetchAllTokenPrices(network);

  const map: Record<string, number> = {
    KLV: result.klv.priceUSD,
  };

  for (const token of result.tokens) {
    map[token.assetId] = token.priceUSD;
    map[token.symbol] = token.priceUSD;
  }

  return map;
}

/**
 * Calculate USD value for a token amount
 */
export async function calculateUSDValue(
  assetId: string,
  amount: number,
  network: Network = 'mainnet'
): Promise<number> {
  const price = await fetchTokenPrice(assetId, network);
  if (!price || price.priceUSD === 0) return 0;
  return amount * price.priceUSD;
}

/**
 * Clear the price cache
 */
export function clearPriceCache(): void {
  priceCache = { data: null, timestamp: 0 };
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  clearPriceCache();
}
