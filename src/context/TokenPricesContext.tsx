'use client';
import { debugLog } from '@/utils/debugMode';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useKlever } from '@/context/KleverContext';
import { TOKEN_REGISTRY } from '@/config/tokens';

/**
 * Token Prices Context - SINGLE SOURCE OF TRUTH
 * 
 * This context provides USD prices for ALL tokens in the Rare Canvas ecosystem.
 * 
 * HOW IT WORKS:
 * 1. Fetches prices from /api/prices (server-side cached in Redis)
 * 2. Falls back to direct fetching if API unavailable
 * 
 * USAGE:
 * - Wrap your app with <TokenPricesProvider>
 * - Use useTokenPrices() hook anywhere to get prices
 * - Prices auto-refresh every 60 seconds
 */

// ============================================================================
// Types
// ============================================================================

export interface TokenPriceData {
  assetId: string;
  symbol: string;
  name: string;
  priceUSD: number;
  priceKLV: number;
  /** 24h price change percentage (currently only KLV from CoinGecko) */
  priceChange24h?: number | null;
  source: 'cache' | 'fresh' | 'error';
  /** For derived prices, indicates the intermediate token used */
  derivedFrom?: 'KLV' | 'DGKO' | 'BABYDGKO';
  lastUpdate: string;
  poolData?: {
    pairId: string;
    pairName: string;
    baseReserve: number;
    quoteReserve: number;
    contractAddress: string;
  };
}

interface TokenPricesContextValue {
  // Data
  klvPrice: TokenPriceData | null;
  tokenPrices: TokenPriceData[];
  allPrices: TokenPriceData[];  // KLV + all tokens
  lastUpdate: string | null;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  refresh: () => Promise<void>;
  
  // Helpers
  getPrice: (assetId: string) => TokenPriceData | undefined;
  getPriceUSD: (assetId: string) => number;
  getPriceKLV: (assetId: string) => number;
  calculateUSD: (assetId: string, amount: number) => number;
}

// ============================================================================
// Context
// ============================================================================

const TokenPricesContext = createContext<TokenPricesContextValue | null>(null);

// ============================================================================
// Helper: Convert API response to TokenPriceData
// Uses TOKEN_REGISTRY from tokens.ts as single source of truth (RULE 51)
// ============================================================================

function apiToTokenPriceData(
  symbol: string,
  priceData: { priceUsd: number; priceKlv: number; pairId?: number; reserves?: { base: number; quote: number }; priceChange24h?: number | null },
  source: 'cache' | 'fresh',
  updatedAt: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): TokenPriceData {
  // Get info from centralized TOKEN_REGISTRY, fallback to symbol if unknown
  const tokenConfig = TOKEN_REGISTRY[symbol];
  const assetId = tokenConfig 
    ? (network === 'mainnet' ? tokenConfig.assetIdMainnet : tokenConfig.assetIdTestnet)
    : symbol;
  const name = tokenConfig?.name || symbol;
  
  return {
    assetId,
    symbol,
    name,
    priceUSD: priceData.priceUsd,
    priceKLV: priceData.priceKlv,
    priceChange24h: priceData.priceChange24h,
    source,
    lastUpdate: updatedAt,
    poolData: priceData.pairId ? {
      pairId: `pair-${priceData.pairId}`,
      pairName: `${symbol}/KLV`,
      baseReserve: priceData.reserves?.base || 0,
      quoteReserve: priceData.reserves?.quote || 0,
      contractAddress: 'klv1qqqqqqqqqqqqqpgq2jqc28xwmk82mng4kwpm3j9vkq3vyga8xw9qq85y6h',
    } : undefined,
  };
}

// ============================================================================
// Provider Component
// ============================================================================

interface TokenPricesProviderProps {
  children: React.ReactNode;
  autoRefresh?: number;  // ms, default 60000 (1 minute)
}

export function TokenPricesProvider({ 
  children, 
  autoRefresh = 60000 
}: TokenPricesProviderProps) {
  // Network for testnet/mainnet support
  const { network } = useKlever();
  
  const [klvPrice, setKlvPrice] = useState<TokenPriceData | null>(null);
  const [tokenPrices, setTokenPrices] = useState<TokenPriceData[]>([]);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch prices from API
  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/prices');
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const { prices, updatedAt, source } = data;
      
      // Parse KLV price
      if (prices.KLV) {
        setKlvPrice(apiToTokenPriceData('KLV', prices.KLV, source, updatedAt, network));
        debugLog(`💰 KLV price: $${prices.KLV.priceUsd}`);
      }

      // Parse token prices
      const tokens: TokenPriceData[] = [];
      for (const [symbol, priceData] of Object.entries(prices)) {
        if (symbol === 'KLV') continue;
        tokens.push(apiToTokenPriceData(symbol, priceData as { priceUsd: number; priceKlv: number }, source, updatedAt, network));
        debugLog(`✅ ${symbol}: $${(priceData as { priceUsd: number }).priceUsd.toFixed(6)}`);
      }
      
      setTokenPrices(tokens);
      setLastUpdate(updatedAt);
      
      debugLog(`✅ Token prices updated from ${source}: KLV + ${tokens.length} tokens`);
    } catch (err) {
      console.error('❌ Error fetching token prices:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setLoading(false);
    }
  }, [network]);

  // Initial fetch
  useEffect(() => {
    refresh();
  }, [refresh]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefresh <= 0) return;
    
    const interval = setInterval(refresh, autoRefresh);
    return () => clearInterval(interval);
  }, [refresh, autoRefresh]);

  // Combine all prices for easy lookup
  const allPrices = useMemo(() => {
    if (!klvPrice) return tokenPrices;
    return [klvPrice, ...tokenPrices];
  }, [klvPrice, tokenPrices]);

  // Helper: Get price data for specific asset
  const getPrice = useCallback((assetId: string): TokenPriceData | undefined => {
    if (assetId === 'KLV') return klvPrice || undefined;
    
    // Try exact match first
    const price = tokenPrices.find(p => p.assetId === assetId);
    if (price) return price;
    
    // Try by symbol (without asset ID suffix)
    const symbol = assetId.split('-')[0];
    return tokenPrices.find(p => p.symbol === symbol);
  }, [klvPrice, tokenPrices]);

  // Helper: Get USD price (0 if not found)
  const getPriceUSD = useCallback((assetId: string): number => {
    return getPrice(assetId)?.priceUSD || 0;
  }, [getPrice]);

  // Helper: Get KLV price (0 if not found)
  const getPriceKLV = useCallback((assetId: string): number => {
    return getPrice(assetId)?.priceKLV || 0;
  }, [getPrice]);

  // Helper: Calculate USD value
  const calculateUSD = useCallback((assetId: string, amount: number): number => {
    return getPriceUSD(assetId) * amount;
  }, [getPriceUSD]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo<TokenPricesContextValue>(() => ({
    klvPrice,
    tokenPrices,
    allPrices,
    lastUpdate,
    loading,
    error,
    refresh,
    getPrice,
    getPriceUSD,
    getPriceKLV,
    calculateUSD,
  }), [klvPrice, tokenPrices, allPrices, lastUpdate, loading, error, refresh, getPrice, getPriceUSD, getPriceKLV, calculateUSD]);

  return (
    <TokenPricesContext.Provider value={value}>
      {children}
    </TokenPricesContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useTokenPrices(): TokenPricesContextValue {
  const context = useContext(TokenPricesContext);
  if (!context) {
    throw new Error('useTokenPrices must be used within TokenPricesProvider');
  }
  return context;
}

// ============================================================================
// Convenience Hooks
// ============================================================================

/**
 * Get price for a specific token
 */
export function useTokenPrice(assetId: string): TokenPriceData | undefined {
  const { getPrice } = useTokenPrices();
  return getPrice(assetId);
}

/**
 * Get USD price for a specific token
 */
export function useTokenPriceUSD(assetId: string): number {
  const { getPriceUSD } = useTokenPrices();
  return getPriceUSD(assetId);
}

/**
 * Calculate USD value for an amount of tokens
 */
export function useCalculateUSD(assetId: string, amount: number): number {
  const { calculateUSD } = useTokenPrices();
  return calculateUSD(assetId, amount);
}

/**
 * Get KLV price specifically
 */
export function useKlvPrice(): TokenPriceData | null {
  const { klvPrice } = useTokenPrices();
  return klvPrice;
}

// ============================================================================
// Backward Compatibility Aliases
// ============================================================================

/**
 * Alias for useTokenPrices (legacy name)
 */
export const useTokenPricesContext = useTokenPrices;

/**
 * Alias for useTokenPrices (legacy name)
 */
export const useAllTokenPrices = useTokenPrices;

/**
 * Alias for useKlvPrice (different casing)
 */
export const useKLVPrice = useKlvPrice;
