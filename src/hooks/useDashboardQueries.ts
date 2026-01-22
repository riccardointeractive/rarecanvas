/**
 * useDashboardQueries - Dashboard Data Query Hooks with TanStack Query
 * 
 * Fetches and caches dashboard-specific data (token balances, portfolio, transactions).
 * 
 * RULE 7: ALL data fetching hooks MUST use TanStack Query.
 * 
 * PRICING PRIORITY (from PROJECT_RULES.md):
 * 1. VIEW PRICES - DEXscan API (aggregated from Digiko, Swopus, SAME)
 * 2. RESERVE PRICES - Pool reserves (reserveA / reserveB) as fallback
 * 3. "not listed" - If both fail
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';
import { useKlever } from '@/context/KleverContext';
import { useNetworkTokens } from '@/context/NetworkTokensContext';
import { useTokenPricesContext } from '@/context/TokenPricesContext';
import { useViewPrices } from '@/hooks/useDexScan';
import { queryKeys } from '@/lib/queryKeys';
import { debugLog } from '@/utils/debugMode';
import { getTokenDecimals, getTokenPrecision } from '@/config/tokens';

// ============================================================================
// Types
// ============================================================================

export interface TokenBalance {
  assetId: string;
  balance: string;
  availableRaw: string;
  stakedRaw: string;
  balanceFormatted: string;
  availableFormatted: string;
  stakedFormatted: string;
  priceUSD: number;
  valueUSD: number;
  availableValueUSD: number;
  stakedValueUSD: number;
  decimals: number;
}

export interface PortfolioStats {
  totalValueUSD: number;
  availableValueUSD: number;
  stakedValueUSD: number;
  klvStakedValueUSD: number;
  change24h: number;
  change24hPercent: number;
  totalAssets: number;
  klvPrice: number;
}

export interface Transaction {
  hash: string;
  type: string;
  from: string;
  to: string;
  amount: string;
  assetId: string;
  timestamp: number;
  status: 'confirmed' | 'pending' | 'failed';
  fee: string;
}

// ============================================================================
// Helpers
// ============================================================================

function formatBalance(rawBalance: string | number, decimals: number): string {
  const raw = typeof rawBalance === 'string' ? parseInt(rawBalance) : rawBalance;
  if (isNaN(raw) || raw === 0) return '0';
  const value = raw / Math.pow(10, decimals);
  if (value >= 1000) return value.toFixed(2);
  if (value >= 1) return value.toFixed(4);
  return value.toFixed(decimals);
}

// ============================================================================
// Fetch Functions
// ============================================================================

async function fetchDashboardTokens(
  address: string,
  network: string,
  tokenPriority: Record<string, number>,
  getPriceUSD: (assetId: string) => number
): Promise<TokenBalance[]> {
  debugLog(`🔍 [useDashboardQueries] Fetching tokens for ${address.slice(0, 12)}...`);
  
  const response = await fetch(`/api/account?address=${address}&network=${network}`);
  if (!response.ok) throw new Error('Failed to fetch account data');
  
  const accountData = await response.json();
  const assets = accountData.data?.account?.assets || {};
  
  const tokenList: TokenBalance[] = Object.entries(assets).map(([assetId, assetData]: [string, any]) => {
    const baseSymbol = assetId.split('-')[0] || assetId;
    const decimals = getTokenDecimals(baseSymbol);
    
    const availableRaw = assetData.balance?.toString() || '0';
    const stakedRaw = assetData.frozenBalance?.toString() || '0';
    const availableNum = parseInt(availableRaw) || 0;
    const stakedNum = parseInt(stakedRaw) || 0;
    const totalRaw = (availableNum + stakedNum).toString();
    
    const balanceFormatted = formatBalance(totalRaw, decimals);
    const availableFormatted = formatBalance(availableRaw, decimals);
    const stakedFormatted = formatBalance(stakedRaw, decimals);
    
    const priceUSD = getPriceUSD(assetId);
    const totalValue = parseFloat(balanceFormatted) * priceUSD;
    const availableValue = parseFloat(availableFormatted) * priceUSD;
    const stakedValue = parseFloat(stakedFormatted) * priceUSD;

    return {
      assetId,
      balance: totalRaw,
      availableRaw,
      stakedRaw,
      balanceFormatted,
      availableFormatted,
      stakedFormatted,
      priceUSD,
      valueUSD: totalValue,
      availableValueUSD: availableValue,
      stakedValueUSD: stakedValue,
      decimals,
    };
  });

  // Sort by priority then value
  tokenList.sort((a, b) => {
    const priorityA = tokenPriority[a.assetId] ?? 100;
    const priorityB = tokenPriority[b.assetId] ?? 100;
    if (priorityA !== priorityB) return priorityA - priorityB;
    if (a.valueUSD !== b.valueUSD) return b.valueUSD - a.valueUSD;
    return parseFloat(b.balanceFormatted) - parseFloat(a.balanceFormatted);
  });

  debugLog(`✅ [useDashboardQueries] Processed ${tokenList.length} tokens`);
  return tokenList;
}

async function fetchKlvStaking(address: string): Promise<number> {
  const KLV_PRECISION = getTokenPrecision('KLV');
  const KLEVER_MAX_EPOCH = 4294967295;
  
  const response = await fetch(`https://api.mainnet.klever.org/v1.0/address/${address}`);
  if (!response.ok) return 0;

  const data = await response.json();
  const klvAsset = data.data?.account?.assets?.KLV;
  const buckets = klvAsset?.buckets || [];
  
  let totalKlvStaked = 0;
  
  if (Array.isArray(buckets)) {
    buckets.forEach((bucket: any) => {
      const unstakedEpoch = bucket.unstakedEpoch ?? KLEVER_MAX_EPOCH;
      const isActive = unstakedEpoch >= KLEVER_MAX_EPOCH;
      
      if (isActive && bucket.balance) {
        const amount = typeof bucket.balance === 'string' 
          ? parseInt(bucket.balance) 
          : bucket.balance;
        totalKlvStaked += amount || 0;
      }
    });
  }

  return totalKlvStaked / KLV_PRECISION;
}

async function fetchTransactionHistory(
  address: string,
  network: string,
  limit: number
): Promise<Transaction[]> {
  debugLog(`🔍 [useDashboardQueries] Fetching transactions for ${address.slice(0, 12)}...`);
  
  const baseUrl = `https://api.${network}.klever.org`;
  const response = await fetch(`${baseUrl}/v1.0/transaction/list/${address}?limit=${limit}`);
  
  if (response.status === 404) {
    return []; // No transactions - normal for new wallets
  }
  
  if (!response.ok) {
    throw new Error(`Failed to fetch transactions: ${response.status}`);
  }

  const data = await response.json();
  const txList = data.data?.transactions || [];

  const formattedTxs: Transaction[] = txList.map((tx: any) => {
    let type = 'Unknown';
    let amount = '0';
    let assetId = 'KLV';
    let to = tx.toAddress || '';

    if (tx.contract && tx.contract.length > 0) {
      const contract = tx.contract[0];
      
      switch (contract.type) {
        case 0:
          type = tx.sender === address ? 'Send' : 'Receive';
          amount = contract.parameter?.amount || '0';
          assetId = contract.parameter?.assetId || 'KLV';
          to = contract.parameter?.toAddress || '';
          break;
        case 6:
          type = 'Stake';
          amount = contract.parameter?.bucketID || '0';
          assetId = contract.parameter?.assetId || 'KLV';
          break;
        case 7:
          type = 'Unstake';
          amount = contract.parameter?.bucketID || '0';
          assetId = contract.parameter?.assetId || 'KLV';
          break;
        case 9:
          type = 'Claim';
          assetId = contract.parameter?.assetId || 'KLV';
          break;
        default:
          type = `Type ${contract.type}`;
      }
    }

    return {
      hash: tx.hash || '',
      type,
      from: tx.sender || '',
      to,
      amount: amount.toString(),
      assetId,
      timestamp: tx.timestamp || Date.now() / 1000,
      status: tx.status === 'success' ? 'confirmed' : 
             tx.status === 'pending' ? 'pending' : 'failed',
      fee: tx.kdaFee || '0',
    };
  });

  debugLog(`✅ [useDashboardQueries] Processed ${formattedTxs.length} transactions`);
  return formattedTxs;
}

// ============================================================================
// Main Hooks
// ============================================================================

/**
 * Query dashboard token balances with prices
 * 
 * PRICING PRIORITY (from PROJECT_RULES.md):
 * 1. VIEW PRICES - DEXscan API (aggregated from Digiko, Swopus, SAME)
 * 2. RESERVE PRICES - Pool reserves (reserveA / reserveB) as fallback
 * 3. Return 0 (displays as "not listed" in UI) if both fail
 */
export function useDashboardTokensQuery() {
  const { address, isConnected, network } = useKlever();
  const { getAssetId } = useNetworkTokens();
  
  // VIEW PRICES from DEXscan (primary source)
  const { data: viewPrices, isLoading: _viewPricesLoading } = useViewPrices();
  
  // RESERVE PRICES from pool reserves (fallback)
  const { getPriceUSD: getReservePriceUSD, loading: reservePricesLoading } = useTokenPricesContext();
  
  const queryClient = useQueryClient();
  
  const tokenPriority = useMemo(() => {
    const dgkoAssetId = getAssetId('DGKO');
    const babydgkoAssetId = getAssetId('BABYDGKO');
    return {
      [dgkoAssetId]: 1,
      [babydgkoAssetId]: 2,
      'KLV': 3,
    } as Record<string, number>;
  }, [getAssetId]);
  
  /**
   * Get price using VIEW PRICES first, then RESERVE PRICES fallback
   * Returns 0 if neither has a price (will show "not listed")
   */
  const getPriceUSD = useCallback((assetId: string): number => {
    const baseSymbol = assetId.split('-')[0] || assetId;
    
    // 1. Try VIEW PRICES first (DEXscan aggregated price)
    if (viewPrices) {
      // Try by full assetId first, then by symbol
      const viewPrice = viewPrices[assetId] || viewPrices[baseSymbol];
      if (viewPrice && viewPrice.priceUsd > 0) {
        debugLog(`💰 [Dashboard] ${baseSymbol}: $${viewPrice.priceUsd.toFixed(6)} (VIEW PRICE)`);
        return viewPrice.priceUsd;
      }
    }
    
    // 2. Fallback to RESERVE PRICES (pool reserves)
    const reservePrice = getReservePriceUSD(assetId);
    if (reservePrice > 0) {
      debugLog(`💰 [Dashboard] ${baseSymbol}: $${reservePrice.toFixed(6)} (RESERVE PRICE fallback)`);
      return reservePrice;
    }
    
    // 3. No price available - will show "not listed"
    debugLog(`⚠️ [Dashboard] ${baseSymbol}: no price available`);
    return 0;
  }, [viewPrices, getReservePriceUSD]);
  
  // Wait for at least reserve prices, view prices optional (best effort)
  const pricesReady = !reservePricesLoading;
  
  const {
    data: tokens,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: address 
      ? ['dashboard', 'tokens', address, network, !!viewPrices]
      : ['dashboard', 'tokens', 'disabled'],
    queryFn: () => fetchDashboardTokens(address!, network, tokenPriority, getPriceUSD),
    enabled: isConnected && !!address && pricesReady,
    staleTime: 2 * 60 * 1000, // 2 min fresh
    gcTime: 5 * 60 * 1000,
  });
  
  const invalidate = useCallback(() => {
    if (address) {
      queryClient.invalidateQueries({ 
        queryKey: ['dashboard', 'tokens', address, network] 
      });
    }
  }, [queryClient, address, network]);
  
  return {
    tokens: tokens ?? [],
    isLoading: isLoading || !pricesReady,
    isFetching,
    error: error ? String(error) : null,
    refetch: () => refetch(),
    invalidate,
  };
}

/**
 * Query portfolio stats (uses token query internally)
 */
export function usePortfolioStatsQuery() {
  const { address, isConnected, network } = useKlever();
  const { tokens, isLoading: tokensLoading } = useDashboardTokensQuery();
  const queryClient = useQueryClient();
  
  // Query KLV staking separately
  const {
    data: klvStakedAmount,
    isLoading: klvLoading,
  } = useQuery({
    queryKey: address 
      ? ['dashboard', 'klvStaking', address]
      : ['dashboard', 'klvStaking', 'disabled'],
    queryFn: () => fetchKlvStaking(address!),
    enabled: isConnected && !!address,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
  
  // Calculate stats from tokens + KLV staking
  const stats: PortfolioStats = useMemo(() => {
    const nonZeroTokens = tokens.filter(t => parseFloat(t.balanceFormatted) > 0);
    
    let totalValueUSD = 0;
    let availableValueUSD = 0;
    let stakedValueUSD = 0;
    let klvPrice = 0;

    nonZeroTokens.forEach(token => {
      totalValueUSD += token.valueUSD || 0;
      availableValueUSD += token.availableValueUSD || 0;
      stakedValueUSD += token.stakedValueUSD || 0;
      
      if (token.assetId === 'KLV' && token.priceUSD > 0) {
        klvPrice = token.priceUSD;
      }
    });

    const klvStaked = klvStakedAmount ?? 0;
    const klvStakedValueUSD = klvStaked * klvPrice;
    
    totalValueUSD += klvStakedValueUSD;
    stakedValueUSD += klvStakedValueUSD;

    return {
      totalValueUSD,
      availableValueUSD,
      stakedValueUSD,
      klvStakedValueUSD,
      change24h: 0,
      change24hPercent: 0,
      totalAssets: nonZeroTokens.length,
      klvPrice,
    };
  }, [tokens, klvStakedAmount]);
  
  const invalidate = useCallback(() => {
    if (address) {
      queryClient.invalidateQueries({ 
        queryKey: ['dashboard', 'tokens', address, network] 
      });
      queryClient.invalidateQueries({ 
        queryKey: ['dashboard', 'klvStaking', address] 
      });
    }
  }, [queryClient, address, network]);
  
  return {
    stats,
    klvStakedAmount: klvStakedAmount ?? 0,
    isLoading: tokensLoading || klvLoading,
    refetch: invalidate,
    invalidate,
  };
}

/**
 * Query transaction history
 */
export function useTransactionHistoryQuery(limit: number = 10) {
  const { address, isConnected, network } = useKlever();
  const queryClient = useQueryClient();
  
  const {
    data: transactions,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: address 
      ? queryKeys.transactions.history(address, network, limit)
      : ['transactions', 'disabled'],
    queryFn: () => fetchTransactionHistory(address!, network, limit),
    enabled: isConnected && !!address,
    staleTime: 60 * 1000, // 1 min fresh
    gcTime: 5 * 60 * 1000,
  });
  
  const invalidate = useCallback(() => {
    if (address) {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.transactions.history(address, network, limit) 
      });
    }
  }, [queryClient, address, network, limit]);
  
  return {
    transactions: transactions ?? [],
    isLoading,
    isFetching,
    error: error ? String(error) : null,
    refetch: () => refetch(),
    invalidate,
  };
}

export default useDashboardTokensQuery;
