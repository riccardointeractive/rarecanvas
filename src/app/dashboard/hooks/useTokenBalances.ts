/**
 * useTokenBalances - DEPRECATED
 * 
 * This hook is now a thin wrapper around the global useDashboardTokensQuery hook.
 * For new code, use useDashboardTokensQuery from '@/hooks/useDashboardQueries'.
 * 
 * RULE 7: ALL data fetching hooks MUST use TanStack Query.
 * 
 * @deprecated Use useDashboardTokensQuery from '@/hooks/useDashboardQueries' instead
 */

import { useDashboardTokensQuery } from '@/hooks/useDashboardQueries';

export function useTokenBalances() {
  const { tokens, isLoading, error, refetch } = useDashboardTokensQuery();
  
  return {
    tokens,
    loading: isLoading,
    error,
    refetch,
  };
}
