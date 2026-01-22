/**
 * usePortfolioStats - DEPRECATED
 * 
 * This hook is now a thin wrapper around the global usePortfolioStatsQuery hook.
 * For new code, use usePortfolioStatsQuery from '@/hooks/useDashboardQueries'.
 * 
 * RULE 7: ALL data fetching hooks MUST use TanStack Query.
 * 
 * @deprecated Use usePortfolioStatsQuery from '@/hooks/useDashboardQueries' instead
 */

import { usePortfolioStatsQuery } from '@/hooks/useDashboardQueries';

export function usePortfolioStats() {
  const { stats, klvStakedAmount, isLoading, refetch } = usePortfolioStatsQuery();
  
  return {
    stats,
    loading: isLoading,
    refetch,
    klvStakedAmount,
  };
}
