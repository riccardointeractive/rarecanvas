/**
 * useWalletBalances - Global Wallet Balances Hook
 * 
 * SINGLE SOURCE OF TRUTH for user wallet balances across the entire app.
 * Uses TanStack Query for caching and deduplication.
 * 
 * Replaces:
 * - /app/swap/hooks/useUserBalances.ts
 * - /app/dashboard/hooks/useTokenBalances.ts
 * - /app/staking/hooks/useTokenBalances.ts
 * 
 * @example
 * const { balances, getBalance, isLoading, refetch } = useWalletBalances();
 * const klvBalance = getBalance('KLV');
 * const dgkoBalance = getBalance('DGKO-CXVJ');
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useCallback } from 'react';
import { useKlever } from '@/context/KleverContext';
import { queryKeys } from '@/lib/queryKeys';
import { getTokenDecimals, getTokenPrecision } from '@/config/tokens';
import { NETWORK_TOKEN_CONFIG } from '@/config/network';
import { debugLog } from '@/utils/debugMode';

// ============================================================================
// Types
// ============================================================================

export interface WalletBalance {
  /** Full asset ID (e.g., "DGKO-CXVJ") */
  assetId: string;
  /** Symbol only (e.g., "DGKO") */
  symbol: string;
  /** Raw balance in smallest units */
  rawBalance: bigint;
  /** Formatted balance as number */
  balance: number;
  /** Available (unfrozen) balance */
  available: number;
  /** Staked/frozen balance */
  staked: number;
  /** Token decimals */
  decimals: number;
}

export interface WalletBalancesData {
  /** All balances indexed by assetId */
  balances: Record<string, WalletBalance>;
  /** Quick access to common tokens */
  klv: WalletBalance | null;
  dgko: WalletBalance | null;
  babydgko: WalletBalance | null;
  /** Raw account data */
  rawAccount: any;
  /** Timestamp of fetch */
  fetchedAt: number;
}

// ============================================================================
// Fetch Function (Pure - for TanStack Query)
// ============================================================================

async function fetchWalletBalances(
  address: string,
  network: 'mainnet' | 'testnet'
): Promise<WalletBalancesData> {
  const apiBaseUrl = network === 'testnet'
    ? 'https://api.testnet.klever.org'
    : 'https://api.mainnet.klever.org';

  debugLog(`🔄 [useWalletBalances] Fetching balances for ${address.slice(0, 12)}... on ${network}`);

  const response = await fetch(`${apiBaseUrl}/v1.0/address/${address}`);

  if (!response.ok) {
    throw new Error(`API returned ${response.status}`);
  }

  const accountData = await response.json();
  const account = accountData.data?.account;

  if (!account) {
    throw new Error('Invalid account data received');
  }

  const assetsObject = account.assets || {};
  const klvRawBalance = BigInt(account.balance || 0);

  // Build balances map
  const balances: Record<string, WalletBalance> = {};

  // Get network-specific asset IDs
  const dgkoAssetId = NETWORK_TOKEN_CONFIG[network].DGKO.assetId;
  const babydgkoAssetId = NETWORK_TOKEN_CONFIG[network].BABYDGKO.assetId;

  // Process KLV (native token - stored separately)
  const klvDecimals = getTokenDecimals('KLV');
  const klvPrecision = getTokenPrecision('KLV');
  const klvBalance: WalletBalance = {
    assetId: 'KLV',
    symbol: 'KLV',
    rawBalance: klvRawBalance,
    balance: Number(klvRawBalance) / klvPrecision,
    available: Number(klvRawBalance) / klvPrecision,
    staked: 0, // KLV staking is handled by delegation buckets
    decimals: klvDecimals,
  };
  balances['KLV'] = klvBalance;

  // Process all other assets
  for (const [assetId, assetData] of Object.entries(assetsObject)) {
    const data = assetData as any;
    const symbol = assetId.split('-')[0] || assetId;
    const decimals = getTokenDecimals(symbol);
    const precision = getTokenPrecision(symbol);

    const rawBalance = BigInt(data.balance || 0);
    const rawFrozen = BigInt(data.frozenBalance || 0);
    const totalRaw = rawBalance + rawFrozen;

    const walletBalance: WalletBalance = {
      assetId,
      symbol,
      rawBalance: totalRaw,
      balance: Number(totalRaw) / precision,
      available: Number(rawBalance) / precision,
      staked: Number(rawFrozen) / precision,
      decimals,
    };

    balances[assetId] = walletBalance;
    // Also index by symbol for convenience
    balances[symbol] = walletBalance;
  }

  // Find DGKO and BABYDGKO
  const dgko = balances[dgkoAssetId] || null;
  const babydgko = balances[babydgkoAssetId] || null;

  debugLog(`✅ [useWalletBalances] Found ${Object.keys(assetsObject).length + 1} tokens`);

  return {
    balances,
    klv: klvBalance,
    dgko,
    babydgko,
    rawAccount: account,
    fetchedAt: Date.now(),
  };
}

// ============================================================================
// Main Hook
// ============================================================================

interface UseWalletBalancesReturn {
  /** All balances data */
  data: WalletBalancesData | undefined;
  /** Quick access: all balances map */
  balances: Record<string, WalletBalance>;
  /** Quick access: KLV balance */
  klvBalance: number;
  /** Quick access: DGKO balance */
  dgkoBalance: number;
  /** Quick access: BABYDGKO balance */
  babydgkoBalance: number;
  /** Get balance for any token by assetId or symbol */
  getBalance: (assetIdOrSymbol: string) => number;
  /** Get full balance info for any token */
  getBalanceInfo: (assetIdOrSymbol: string) => WalletBalance | null;
  /** Loading state */
  isLoading: boolean;
  /** Fetching in background */
  isFetching: boolean;
  /** Error message */
  error: string | null;
  /** Manually refetch */
  refetch: () => void;
  /** Invalidate cache (call after transactions) */
  invalidate: () => void;
}

export function useWalletBalances(): UseWalletBalancesReturn {
  const { address, isConnected, network } = useKlever();
  const queryClient = useQueryClient();

  // TanStack Query - cached globally
  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.wallet.balances(address || '', network),
    queryFn: () => fetchWalletBalances(address!, network),
    enabled: isConnected && !!address,
    // Balance data is fresh for 2 minutes
    staleTime: 2 * 60 * 1000,
    // Keep in cache for 5 minutes
    gcTime: 5 * 60 * 1000,
    // Retry once on failure
    retry: 1,
    retryDelay: 1000,
  });

  // Quick access to balances map
  const balances = useMemo(() => data?.balances || {}, [data]);

  // Get balance for any token
  const getBalance = useCallback((assetIdOrSymbol: string): number => {
    if (!balances) return 0;
    const balance = balances[assetIdOrSymbol];
    return balance?.balance || 0;
  }, [balances]);

  // Get full balance info
  const getBalanceInfo = useCallback((assetIdOrSymbol: string): WalletBalance | null => {
    if (!balances) return null;
    return balances[assetIdOrSymbol] || null;
  }, [balances]);

  // Invalidate cache (call after transactions)
  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.wallet.balances(address || '', network) 
    });
  }, [queryClient, address, network]);

  return {
    data,
    balances,
    klvBalance: data?.klv?.balance || 0,
    dgkoBalance: data?.dgko?.balance || 0,
    babydgkoBalance: data?.babydgko?.balance || 0,
    getBalance,
    getBalanceInfo,
    isLoading,
    isFetching,
    error: error ? String(error) : null,
    refetch: () => refetch(),
    invalidate,
  };
}

// ============================================================================
// Convenience Hook: Get specific token balance
// ============================================================================

/**
 * Get balance for a specific token
 * @example const dgkoBalance = useTokenBalance('DGKO-CXVJ');
 */
export function useTokenBalance(assetIdOrSymbol: string): number {
  const { getBalance } = useWalletBalances();
  return getBalance(assetIdOrSymbol);
}

// ============================================================================
// Invalidation Hook
// ============================================================================

/**
 * Hook for invalidating wallet data after transactions
 * @example
 * const { invalidateBalances } = useInvalidateWallet();
 * // After successful swap:
 * invalidateBalances();
 */
export function useInvalidateWallet() {
  const queryClient = useQueryClient();
  const { address, network } = useKlever();

  const invalidateBalances = useCallback(() => {
    if (address) {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.wallet.balances(address, network) 
      });
    }
  }, [queryClient, address, network]);

  const invalidateAccount = useCallback(() => {
    if (address) {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.wallet.account(address, network) 
      });
    }
  }, [queryClient, address, network]);

  const invalidateAll = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
  }, [queryClient]);

  return {
    invalidateBalances,
    invalidateAccount,
    invalidateAll,
  };
}

export default useWalletBalances;
