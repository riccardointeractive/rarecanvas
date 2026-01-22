/**
 * DEXscan API Configuration
 * 
 * DEXscan provides aggregated VIEW PRICES from multiple Klever DEXes:
 * - Rare Canvas Dex (our data)
 * - Swopus
 * - SAME Dex
 * 
 * IMPORTANT: These are VIEW PRICES for display purposes only.
 * For actual swap execution, use RESERVE PRICES from our pools.
 * 
 * @see /docs/PRICE_SYSTEM.md for the two-price architecture
 */

// API endpoint - no trailing slash
export const DEXSCAN_API_URL = 'https://api.dexscan.me';

// API key is stored in environment variable for security
// Set DEXSCAN_API_KEY in .env.local or Vercel environment
export const DEXSCAN_API_KEY = process.env.DEXSCAN_API_KEY || '';

// Cache TTL in seconds (how long to cache VIEW PRICES)
export const DEXSCAN_CACHE_TTL = 60; // 1 minute - balance freshness vs rate limiting

// Redis key prefix for DEXscan data
export const DEXSCAN_REDIS_PREFIX = 'dexscan';

// Minimum TVL to consider a price "reliable"
// Pools with less TVL may have distorted prices
export const DEXSCAN_MIN_RELIABLE_TVL = 500; // $500 USD

// Price discrepancy thresholds for warnings
export const PRICE_DISCREPANCY_THRESHOLDS = {
  /** Below this %, prices are considered aligned */
  LOW: 3,
  /** Above this %, show a warning */
  MEDIUM: 10,
  /** Above this %, show a strong warning */
  HIGH: 20,
} as const;

/**
 * DEXscan endpoint paths
 */
export const DEXSCAN_ENDPOINTS = {
  /** Get current price for a single asset */
  assetPrice: (ticker: string) => `/asset/${ticker}`,
  
  /** Get full asset data including pools and volume */
  assetFull: (ticker: string) => `/asset/${ticker}/full`,
  
  /** Get overview of all tokens with stats */
  tokensOverview: '/tokens/overview',
  
  /** Get overview of all liquidity pools */
  liquidityOverview: '/liquidity/overview',
  
  /** Get details for a specific pool */
  poolDetail: (dex: string, tokenA: string, tokenB: string) => 
    `/pool/${dex}/${tokenA}/${tokenB}`,
  
  /** Batch lookup for multiple assets */
  assetsBatch: '/assets/batch',
} as const;

/**
 * Known DEX identifiers in DEXscan
 */
export const DEXSCAN_DEX_NAMES = {
  RARECANVAS: 'Rare Canvas Dex',
  SWOPUS: 'Swopus',
  SAME: 'SAME Dex',
} as const;

export type DexName = typeof DEXSCAN_DEX_NAMES[keyof typeof DEXSCAN_DEX_NAMES];
