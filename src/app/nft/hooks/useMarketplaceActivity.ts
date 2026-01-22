/**
 * useMarketplaceActivity Hook
 *
 * Fetches NFT marketplace activity (sales, listings, cancellations)
 * from Klever blockchain transaction history.
 * Uses TanStack Query for caching and request deduplication.
 *
 * Transaction types:
 * - Type 17: Buy (NFT purchase)
 * - Type 18: Sell (NFT listing)
 * - Type 19: Cancel Market Order
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useNetworkConfig } from '@/hooks/useNetworkConfig';
import { debugLog, debugWarn } from '@/utils/debugMode';

// =============================================================================
// Types
// =============================================================================

export type ActivityType = 'sale' | 'listing' | 'cancel' | 'all';

export interface MarketplaceActivity {
  id: string;
  type: ActivityType;
  txHash: string;
  timestamp: number;
  // NFT info
  collectionId: string;
  nftId: string;
  nftName?: string;
  nftImage?: string;
  // Transaction info
  price?: number;
  currency?: string;
  seller?: string;
  buyer?: string;
  // Order info
  orderId?: string;
}

interface KleverTransaction {
  hash: string;
  timestamp: number;
  sender: string;
  contract: Array<{
    type: number;
    typeString: string;
    parameter: {
      // Buy (type 17)
      buyType?: number;
      id?: string;
      currencyId?: string;
      amount?: number;
      // Sell (type 18)
      marketType?: number;
      marketplaceId?: string;
      assetId?: string;
      price?: number;
      endTime?: number;
      // Cancel (type 19)
      claimType?: number;
      orderId?: string;
    };
  }>;
  receipts?: Array<{
    type: number;
    typeString: string;
    assetId?: string;
    from?: string;
    to?: string;
    value?: number;
  }>;
}

interface TransactionListResponse {
  data: {
    transactions: KleverTransaction[];
  };
  error?: string;
  pagination?: {
    self: number;
    next: number;
    previous: number;
    perPage: number;
    totalPages: number;
    totalRecords: number;
  };
}

interface ActivityData {
  activities: MarketplaceActivity[];
  total: number;
  hasMore: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const TX_TYPE_BUY = 17;
const TX_TYPE_SELL = 18;
const TX_TYPE_CANCEL = 19;

// =============================================================================
// Helper Functions
// =============================================================================

function parseNftIdFromAssetId(assetId: string): { collectionId: string; nftId: string } {
  // Format: "COLLECTION-XXXX/42" or just "COLLECTION-XXXX"
  const parts = assetId.split('/');
  return {
    collectionId: parts[0] || assetId,
    nftId: parts[1] || '0',
  };
}

function transactionToActivity(tx: KleverTransaction): MarketplaceActivity | null {
  if (!tx.contract || tx.contract.length === 0) return null;

  const contract = tx.contract[0];
  if (!contract) return null;

  const param = contract.parameter;

  switch (contract.type) {
    case TX_TYPE_BUY: {
      // Buy transaction - extract from receipts if available
      const receipt = tx.receipts?.find(r => r.assetId && r.assetId.includes('/'));
      const { collectionId, nftId } = receipt?.assetId
        ? parseNftIdFromAssetId(receipt.assetId)
        : { collectionId: param.id || '', nftId: '0' };

      return {
        id: tx.hash,
        type: 'sale',
        txHash: tx.hash,
        timestamp: tx.timestamp,
        collectionId,
        nftId,
        price: param.amount,
        currency: param.currencyId || 'KLV',
        buyer: tx.sender,
        seller: receipt?.from,
        orderId: param.id,
      };
    }

    case TX_TYPE_SELL: {
      // Sell/List transaction
      const { collectionId, nftId } = param.assetId
        ? parseNftIdFromAssetId(param.assetId)
        : { collectionId: '', nftId: '0' };

      return {
        id: tx.hash,
        type: 'listing',
        txHash: tx.hash,
        timestamp: tx.timestamp,
        collectionId,
        nftId,
        price: param.price,
        currency: param.currencyId || 'KLV',
        seller: tx.sender,
        orderId: undefined, // Order ID created after tx
      };
    }

    case TX_TYPE_CANCEL: {
      // Cancel transaction
      return {
        id: tx.hash,
        type: 'cancel',
        txHash: tx.hash,
        timestamp: tx.timestamp,
        collectionId: '',
        nftId: '',
        seller: tx.sender,
        orderId: param.orderId || param.id,
      };
    }

    default:
      return null;
  }
}

// =============================================================================
// Fetch Function
// =============================================================================

async function fetchMarketplaceActivity(
  network: string,
  activityType: ActivityType,
  page: number = 1,
  limit: number = 20
): Promise<ActivityData> {
  const activities: MarketplaceActivity[] = [];

  // Determine which transaction types to fetch
  const typesToFetch: number[] = activityType === 'all'
    ? [TX_TYPE_BUY, TX_TYPE_SELL]
    : activityType === 'sale'
      ? [TX_TYPE_BUY]
      : activityType === 'listing'
        ? [TX_TYPE_SELL]
        : [TX_TYPE_CANCEL];

  // Fetch transactions for each type
  const fetchPromises = typesToFetch.map(async (type) => {
    const params = new URLSearchParams({
      action: 'transactions',
      type: type.toString(),
      page: page.toString(),
      limit: limit.toString(),
      status: 'success',
      network,
    });

    try {
      const response = await fetch(`/api/marketplace?${params}`);
      if (!response.ok) {
        debugWarn(`[Activity] Failed to fetch type ${type}: ${response.status}`);
        return { transactions: [], pagination: null };
      }

      const data: TransactionListResponse = await response.json();
      return {
        transactions: data.data?.transactions || [],
        pagination: data.pagination,
      };
    } catch (error) {
      debugWarn(`[Activity] Error fetching type ${type}:`, error);
      return { transactions: [], pagination: null };
    }
  });

  const results = await Promise.all(fetchPromises);

  // Process all transactions
  let totalRecords = 0;
  let hasMore = false;

  for (const result of results) {
    for (const tx of result.transactions) {
      const activity = transactionToActivity(tx);
      if (activity) {
        activities.push(activity);
      }
    }

    if (result.pagination) {
      totalRecords = Math.max(totalRecords, result.pagination.totalRecords || 0);
      hasMore = hasMore || (result.pagination.self < result.pagination.totalPages);
    }
  }

  // Sort by timestamp descending (most recent first)
  activities.sort((a, b) => b.timestamp - a.timestamp);

  debugLog(`[Activity] Fetched ${activities.length} activities`);

  return {
    activities,
    total: totalRecords,
    hasMore,
  };
}

// =============================================================================
// Hook
// =============================================================================

interface UseMarketplaceActivityOptions {
  type?: ActivityType;
  page?: number;
  limit?: number;
}

export function useMarketplaceActivity(options: UseMarketplaceActivityOptions = {}) {
  const { type = 'all', page = 1, limit = 20 } = options;
  const { network } = useNetworkConfig();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['nft', 'activity', network, type, page, limit],
    queryFn: () => fetchMarketplaceActivity(network, type, page, limit),
    staleTime: 1 * 60 * 1000, // 1 minute - activity changes frequently
    gcTime: 5 * 60 * 1000,    // 5 minutes
  });

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['nft', 'activity', network],
    });
  }, [queryClient, network]);

  return {
    activities: data?.activities ?? [],
    loading: isLoading,
    isFetching,
    error: error ? String(error) : null,
    total: data?.total ?? 0,
    hasMore: data?.hasMore ?? false,
    refresh,
    invalidate,
  };
}
