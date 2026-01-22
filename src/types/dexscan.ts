/**
 * DEXscan API Types
 * 
 * These types represent VIEW PRICES - aggregated market data for display.
 * Not to be confused with RESERVE PRICES used for swap execution.
 * 
 * @see /src/config/dexscan.ts for configuration
 */

// =============================================================================
// BASE RESPONSE TYPES
// =============================================================================

/** Standard DEXscan API response wrapper */
export interface DexScanResponse<T> {
  data: T;
  code: 'successful' | 'error';
}

// =============================================================================
// ASSET ENDPOINTS
// =============================================================================

/** Simple asset price response from GET /asset/{ticker} */
export interface AssetPriceData {
  time: number;      // Unix timestamp in milliseconds
  ticker: string;    // e.g., "KLV", "DGKO-CXVJ"
  price: string;     // Price in USD as string (e.g., "0.00186300")
}

/** Pool info within full asset data */
export interface AssetPoolInfo {
  dex: string;           // e.g., "Digiko Dex", "Swopus"
  pair: string;          // e.g., "KLV/DGKO-CXVJ"
  reserves: [string, string]; // Raw reserve amounts as strings
  tvl_usd: number;       // Pool TVL in USD
  apr: number | null;    // APR if available
}

/** Full asset data response from GET /asset/{ticker}/full */
export interface AssetFullData {
  time: number;
  ticker: string;
  price: string;
  liquidity_usd: number;    // Total liquidity across all pools
  tvl: number;              // Total value locked
  apr: number | null;
  volume_24h: number;       // 24h trading volume in USD
  pools: AssetPoolInfo[];   // All pools this token is in
}

// =============================================================================
// TOKENS OVERVIEW
// =============================================================================

/** Price info within token overview */
export interface TokenPriceInfo {
  current: number;
  high_24h: number;
  low_24h: number;
}

/** Price changes within token overview */
export interface TokenPriceChanges {
  change_30m: number;
  change_1h: number;
  change_4h: number;
  change_24h: number;
}

/** Volume info within token overview */
export interface TokenVolumeInfo {
  usd_24h: number;
  tokens_24h: number;
}

/** Activity info within token overview */
export interface TokenActivityInfo {
  txns_24h: number;
  makers_24h: number;  // Unique addresses
}

/** Liquidity info within token overview */
export interface TokenLiquidityInfo {
  tvl_usd: number;
  pools_count: number;
  primary_dex: string;  // Which DEX has most liquidity
}

/** Single token in overview response */
export interface TokenOverviewItem {
  ticker: string;
  price: TokenPriceInfo;
  price_changes: TokenPriceChanges;
  volume: TokenVolumeInfo;
  activity: TokenActivityInfo;
  liquidity: TokenLiquidityInfo;
  mcap: number;  // Market cap in USD
}

/** Full tokens overview response from GET /tokens/overview */
export interface TokensOverviewData {
  tokens: TokenOverviewItem[];
  total_tvl: number;      // Total TVL across all tokens
  total_tokens: number;   // Number of tracked tokens
  klv_price: number;      // KLV price for reference
}

// =============================================================================
// LIQUIDITY ENDPOINTS
// =============================================================================

/** Pool info in liquidity overview */
export interface LiquidityPoolInfo {
  dex: string;
  pair: string;
  token_a: string;
  token_b: string;
  reserves_a: number;
  reserves_b: number;
  tvl_usd: number;
  volume_24h: number;
  apr: number | null;
}

/** Liquidity overview response from GET /liquidity/overview */
export interface LiquidityOverviewData {
  pools: LiquidityPoolInfo[];
  total_tvl: number;
  total_pools: number;
}

/** Detailed pool info from GET /pool/{dex}/{token_a}/{token_b} */
export interface PoolDetailData {
  dex: string;
  pair: string;
  token_a: string;
  token_b: string;
  reserves: [string, string];
  tvl_usd: number;
  volume_24h: number;
  volume_7d: number;
  fees_24h: number;
  apr: number | null;
  price_token_a: number;
  price_token_b: number;
}

// =============================================================================
// PROCESSED/DERIVED TYPES (For Digiko use)
// =============================================================================

/**
 * Simplified VIEW PRICE for a token
 * Processed from DEXscan data for easy consumption
 */
export interface ViewPrice {
  ticker: string;
  symbol: string;           // Base symbol without suffix (e.g., "DGKO")
  priceUsd: number;
  priceChange24h: number;
  priceChange7d?: number;   // May not always be available
  volume24h: number;
  tvlUsd: number;
  mcap: number;
  poolsCount: number;
  primaryDex: string;
  lastUpdated: number;      // Unix timestamp
  source: 'dexscan';
}

/**
 * Price comparison between VIEW PRICE and RESERVE PRICE
 * Used for arbitrage detection and user warnings
 */
export interface PriceComparison {
  token: string;
  viewPrice: number;        // DEXscan aggregated price
  reservePrice: number;     // Our pool reserve-derived price
  reservePair: string;      // Which pair the reserve price is from
  gapPercent: number;       // (reserve - view) / view * 100
  gapDirection: 'above' | 'below' | 'aligned';
  signal: 'buy' | 'sell' | 'neutral';
  confidence: 'high' | 'medium' | 'low';
  reason: string;           // Human-readable explanation
}

/**
 * DEXscan API error response
 */
export interface DexScanError {
  code: 'error';
  message?: string;
  status?: number;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/** Extract base symbol from full ticker (e.g., "DGKO-CXVJ" -> "DGKO") */
export function getBaseSymbol(ticker: string): string {
  return ticker.split('-')[0] || ticker;
}

/** Check if a price is considered reliable based on TVL */
export function isPriceReliable(tvlUsd: number, minTvl: number = 500): boolean {
  return tvlUsd >= minTvl;
}
