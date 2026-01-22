/**
 * DEXscan TanStack Query Hooks
 * 
 * Client-side hooks for fetching VIEW PRICES from DEXscan.
 * Uses TanStack Query for caching, deduplication, and background refetching.
 * 
 * IMPORTANT: These return VIEW PRICES for display purposes.
 * For swap execution, use RESERVE PRICES from usePoolReserves.
 * 
 * @example
 *   // Get all tokens overview
 *   const { data, isLoading } = useDexScanOverview();
 *   
 *   // Get single token
 *   const { data: dgko } = useDexScanToken('DGKO-CXVJ');
 *   
 *   // Get VIEW PRICES map
 *   const { data: prices } = useViewPrices();
 *   console.log(prices?.DGKO?.priceUsd);
 * 
 * RULE 7: ALL data fetching hooks MUST use TanStack Query
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { DEXSCAN_CACHE_TTL } from '@/config/dexscan';

import type {
  TokensOverviewData,
  AssetPriceData,
  AssetFullData,
  LiquidityOverviewData,
  PoolDetailData,
  ViewPrice,
} from '@/types/dexscan';

// =============================================================================
// INTERNAL FETCH FUNCTIONS (for client-side)
// =============================================================================

/**
 * Fetch from our API route (avoids exposing API key to client)
 */
async function fetchFromApi<T>(endpoint: string): Promise<T> {
  const response = await fetch(`/api/dexscan${endpoint}`);
  
  if (!response.ok) {
    throw new Error(`DEXscan API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
}

// =============================================================================
// PRIMARY HOOKS
// =============================================================================

/**
 * Fetch all tokens overview from DEXscan
 * 
 * This is the main hook for VIEW PRICES - returns price, volume,
 * TVL, price changes, and activity for all tokens.
 * 
 * @param options - TanStack Query options
 */
export function useDexScanOverview(options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) {
  return useQuery({
    queryKey: queryKeys.dexscan.overview(),
    queryFn: () => fetchFromApi<TokensOverviewData>('/overview'),
    staleTime: DEXSCAN_CACHE_TTL * 1000,
    refetchInterval: options?.refetchInterval,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Get a specific token from the overview
 * 
 * Uses the overview query (more efficient than individual calls)
 * and filters client-side.
 * 
 * @param ticker - Token ticker (e.g., 'DGKO-CXVJ' or 'DGKO')
 */
export function useDexScanToken(ticker: string, options?: {
  enabled?: boolean;
}) {
  const { data: overview, ...rest } = useDexScanOverview({
    enabled: options?.enabled,
  });
  
  const token = overview?.tokens.find(t => 
    t.ticker === ticker || 
    t.ticker.startsWith(ticker.split('-')[0] + '-') ||
    t.ticker.split('-')[0] === ticker
  );
  
  return {
    data: token,
    ...rest,
  };
}

/**
 * Get VIEW PRICES as a map keyed by symbol
 * 
 * Transforms the overview data into an easy-to-use price map.
 * 
 * @example
 *   const { data: prices } = useViewPrices();
 *   const dgkoPrice = prices?.DGKO?.priceUsd;
 */
export function useViewPrices(options?: {
  enabled?: boolean;
  refetchInterval?: number;
}) {
  return useQuery({
    queryKey: queryKeys.dexscan.viewPrices(),
    queryFn: () => fetchFromApi<Record<string, ViewPrice>>('/view-prices'),
    staleTime: DEXSCAN_CACHE_TTL * 1000,
    refetchInterval: options?.refetchInterval,
    enabled: options?.enabled ?? true,
  });
}

// =============================================================================
// INDIVIDUAL ASSET HOOKS
// =============================================================================

/**
 * Fetch simple price for a single asset
 */
export function useDexScanAssetPrice(ticker: string, options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.dexscan.asset(ticker),
    queryFn: () => fetchFromApi<AssetPriceData>(`/asset/${ticker}`),
    staleTime: DEXSCAN_CACHE_TTL * 1000,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Fetch full asset data including pools and volume
 */
export function useDexScanAssetFull(ticker: string, options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.dexscan.assetFull(ticker),
    queryFn: () => fetchFromApi<AssetFullData>(`/asset/${ticker}/full`),
    staleTime: DEXSCAN_CACHE_TTL * 1000,
    enabled: options?.enabled ?? true,
  });
}

// =============================================================================
// LIQUIDITY HOOKS
// =============================================================================

/**
 * Fetch liquidity overview of all pools
 */
export function useDexScanLiquidity(options?: {
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: queryKeys.dexscan.liquidity(),
    queryFn: () => fetchFromApi<LiquidityOverviewData>('/liquidity'),
    staleTime: DEXSCAN_CACHE_TTL * 1000,
    enabled: options?.enabled ?? true,
  });
}

/**
 * Fetch specific pool detail
 */
export function useDexScanPool(
  dex: string,
  tokenA: string,
  tokenB: string,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.dexscan.pool(dex, tokenA, tokenB),
    queryFn: () => fetchFromApi<PoolDetailData>(`/pool/${dex}/${tokenA}/${tokenB}`),
    staleTime: DEXSCAN_CACHE_TTL * 1000,
    enabled: options?.enabled ?? true,
  });
}

// =============================================================================
// CACHE INVALIDATION
// =============================================================================

/**
 * Hook to invalidate DEXscan cache
 */
export function useInvalidateDexScan() {
  const queryClient = useQueryClient();
  
  return {
    /** Invalidate all DEXscan data */
    invalidateAll: () => 
      queryClient.invalidateQueries({ queryKey: queryKeys.dexscan.all }),
    
    /** Invalidate overview and view prices */
    invalidateOverview: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dexscan.overview() });
      queryClient.invalidateQueries({ queryKey: queryKeys.dexscan.viewPrices() });
    },
    
    /** Invalidate specific asset */
    invalidateAsset: (ticker: string) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.dexscan.asset(ticker) });
      queryClient.invalidateQueries({ queryKey: queryKeys.dexscan.assetFull(ticker) });
    },
  };
}

// =============================================================================
// UTILITY HOOKS
// =============================================================================

/**
 * Get KLV price from DEXscan
 */
export function useKlvViewPrice() {
  const { data } = useDexScanOverview();
  return data?.klv_price ?? null;
}

/**
 * Check if a token is tracked by DEXscan
 */
export function useIsTokenTracked(ticker: string) {
  const { data: token, isLoading } = useDexScanToken(ticker);
  return {
    isTracked: !!token,
    isLoading,
  };
}

/**
 * Get tokens sorted by a specific metric
 */
export function useDexScanTokensSorted(
  sortBy: 'tvl' | 'volume' | 'mcap' | 'change24h' = 'tvl',
  order: 'asc' | 'desc' = 'desc'
) {
  const { data: overview, ...rest } = useDexScanOverview();
  
  const sorted = overview?.tokens.slice().sort((a, b) => {
    let valueA: number;
    let valueB: number;
    
    switch (sortBy) {
      case 'tvl':
        valueA = a.liquidity.tvl_usd;
        valueB = b.liquidity.tvl_usd;
        break;
      case 'volume':
        valueA = a.volume.usd_24h;
        valueB = b.volume.usd_24h;
        break;
      case 'mcap':
        valueA = a.mcap;
        valueB = b.mcap;
        break;
      case 'change24h':
        valueA = a.price_changes.change_24h;
        valueB = b.price_changes.change_24h;
        break;
    }
    
    return order === 'desc' ? valueB - valueA : valueA - valueB;
  });
  
  return {
    data: sorted,
    ...rest,
  };
}

/**
 * Get tokens filtered by primary DEX
 */
export function useDexScanTokensByDex(dex: string) {
  const { data: overview, ...rest } = useDexScanOverview();
  
  const filtered = overview?.tokens.filter(t => 
    t.liquidity.primary_dex === dex
  );
  
  return {
    data: filtered,
    ...rest,
  };
}
