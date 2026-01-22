/**
 * useInvalidateQueries - Global Cache Invalidation Hook
 * 
 * Centralized hook for invalidating TanStack Query caches after transactions.
 * Use this after successful blockchain transactions to refresh relevant data.
 * 
 * @example
 * const { invalidateAfterSwap, invalidateAfterLiquidity } = useInvalidateQueries();
 * 
 * // After successful swap:
 * await executeSwap();
 * invalidateAfterSwap(pairId);
 * 
 * // After adding liquidity:
 * await addLiquidity();
 * invalidateAfterLiquidity(pairId);
 */

import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useKlever } from '@/context/KleverContext';
import { queryKeys } from '@/lib/queryKeys';

export function useInvalidateQueries() {
  const queryClient = useQueryClient();
  const { address, network } = useKlever();

  // =========================================================================
  // WALLET
  // =========================================================================

  /** Invalidate user's wallet balances */
  const invalidateBalances = useCallback(() => {
    if (!address) return;
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.wallet.balances(address, network) 
    });
  }, [queryClient, address, network]);

  // =========================================================================
  // TRADING
  // =========================================================================

  /** Invalidate after a swap transaction */
  const invalidateAfterSwap = useCallback((pairId?: string) => {
    if (!address) return;
    
    // Always invalidate balances after swap
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.wallet.balances(address, network) 
    });
    
    // Invalidate user activity
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.activity.byAddress(address) 
    });
    
    // Invalidate specific pair reserves if provided
    if (pairId) {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.reserves.byPair(pairId, network) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.pool.info(pairId, network) 
      });
    }
  }, [queryClient, address, network]);

  /** Invalidate trading pairs (rare - only when pairs change) */
  const invalidateTradingPairs = useCallback(() => {
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.tradingPairs.byNetwork(network) 
    });
  }, [queryClient, network]);

  // =========================================================================
  // LIQUIDITY
  // =========================================================================

  /** Invalidate after adding/removing liquidity */
  const invalidateAfterLiquidity = useCallback((pairId: string) => {
    if (!address) return;
    
    // Balances change after LP operations
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.wallet.balances(address, network) 
    });
    
    // User's positions change
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.positions.byAddress(address) 
    });
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.positions.byAddressAndPair(address, pairId) 
    });
    
    // Pool data changes
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.reserves.byPair(pairId, network) 
    });
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.pool.shares(pairId, network) 
    });
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.pool.info(pairId, network) 
    });
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.pool.pendingDeposits(address, pairId, network) 
    });
    
    // Activity updates
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.activity.byAddress(address) 
    });
  }, [queryClient, address, network]);

  /** Invalidate after claiming LP fees */
  const invalidateAfterClaimFees = useCallback((pairId: string) => {
    if (!address) return;
    
    // Balances change after claiming
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.wallet.balances(address, network) 
    });
    
    // Position fees reset
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.positions.byAddress(address) 
    });
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.positions.byAddressAndPair(address, pairId) 
    });
  }, [queryClient, address, network]);

  // =========================================================================
  // STAKING
  // =========================================================================

  /** Invalidate after DGKO/BABYDGKO staking operation */
  const invalidateAfterStaking = useCallback((tokenType: 'dgko' | 'babydgko') => {
    if (!address) return;
    
    // Balances change
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.wallet.balances(address, network) 
    });
    
    // Staking position changes
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.staking[tokenType](address, network) 
    });
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.staking.stats(address, network) 
    });
  }, [queryClient, address, network]);

  /** Invalidate after KLV delegation operation */
  const invalidateAfterDelegation = useCallback(() => {
    if (!address) return;
    
    // Balances change
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.wallet.balances(address, network) 
    });
    
    // KLV staking position changes
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.staking.klv(address, network) 
    });
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.staking.stats(address, network) 
    });
  }, [queryClient, address, network]);

  // =========================================================================
  // TRANSACTIONS
  // =========================================================================

  /** Invalidate transaction history */
  const invalidateTransactionHistory = useCallback(() => {
    if (!address) return;
    
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.transactions.history(address, network) 
    });
    queryClient.invalidateQueries({ 
      queryKey: queryKeys.transactions.swaps(address, network) 
    });
  }, [queryClient, address, network]);

  // =========================================================================
  // BULK INVALIDATION
  // =========================================================================

  /** Invalidate all user-specific data (use sparingly) */
  const invalidateAllUserData = useCallback(() => {
    if (!address) return;
    
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
    queryClient.invalidateQueries({ queryKey: ['positions'] });
    queryClient.invalidateQueries({ queryKey: ['activity'] });
    queryClient.invalidateQueries({ queryKey: ['favorites'] });
    queryClient.invalidateQueries({ queryKey: ['staking'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
  }, [queryClient, address]);

  /** Invalidate all global data (use very sparingly) */
  const invalidateAllGlobalData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['tradingPairs'] });
    queryClient.invalidateQueries({ queryKey: ['reserves'] });
    queryClient.invalidateQueries({ queryKey: ['pool'] });
    queryClient.invalidateQueries({ queryKey: ['validators'] });
    queryClient.invalidateQueries({ queryKey: ['prices'] });
  }, [queryClient]);

  /** Nuclear option - invalidate everything */
  const invalidateEverything = useCallback(() => {
    queryClient.invalidateQueries();
  }, [queryClient]);

  return {
    // Wallet
    invalidateBalances,
    
    // Trading
    invalidateAfterSwap,
    invalidateTradingPairs,
    
    // Liquidity
    invalidateAfterLiquidity,
    invalidateAfterClaimFees,
    
    // Staking
    invalidateAfterStaking,
    invalidateAfterDelegation,
    
    // Transactions
    invalidateTransactionHistory,
    
    // Bulk
    invalidateAllUserData,
    invalidateAllGlobalData,
    invalidateEverything,
  };
}

export default useInvalidateQueries;
