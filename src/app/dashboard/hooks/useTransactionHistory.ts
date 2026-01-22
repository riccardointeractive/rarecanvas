/**
 * useTransactionHistory - DEPRECATED
 * 
 * This hook is now a thin wrapper around the global useTransactionHistoryQuery hook.
 * For new code, use useTransactionHistoryQuery from '@/hooks/useDashboardQueries'.
 * 
 * RULE 7: ALL data fetching hooks MUST use TanStack Query.
 * 
 * @deprecated Use useTransactionHistoryQuery from '@/hooks/useDashboardQueries' instead
 */

import { useTransactionHistoryQuery } from '@/hooks/useDashboardQueries';

export function useTransactionHistory(limit: number = 10) {
  const { transactions, isLoading, error, refetch } = useTransactionHistoryQuery(limit);
  
  return {
    transactions,
    loading: isLoading,
    error,
    refetch,
  };
}
