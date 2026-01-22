/**
 * Global Hooks - Centralized data fetching with TanStack Query
 *
 * RULE 7: ALL data fetching hooks MUST use TanStack Query.
 *
 * These hooks provide:
 * - Global caching (data shared across pages)
 * - Automatic deduplication (no duplicate API calls)
 * - Background refetching
 * - Easy cache invalidation
 */

// ============================================================================
// TanStack Query Hooks (NEW - use these!)
// ============================================================================

/** Global wallet balances - replaces multiple duplicate balance hooks */
export {
  useWalletBalances,
  useTokenBalance,
  useInvalidateWallet
} from './useWalletBalances';

/** Dashboard data queries with TanStack Query */
export {
  useDashboardTokensQuery,
  usePortfolioStatsQuery,
  useTransactionHistoryQuery,
} from './useDashboardQueries';

/** DEXscan VIEW PRICES - aggregated market data from multiple DEXes */
export {
  useDexScanOverview,
  useDexScanToken,
  useViewPrices,
  useDexScanAssetPrice,
  useDexScanAssetFull,
  useDexScanLiquidity,
  useDexScanPool,
  useInvalidateDexScan,
  useKlvViewPrice,
  useIsTokenTracked,
  useDexScanTokensSorted,
  useDexScanTokensByDex,
} from './useDexScan';

/** Global cache invalidation after transactions */
export { useInvalidateQueries } from './useInvalidateQueries';

// ============================================================================
// Utility Hooks
// ============================================================================

/** Network configuration (mainnet/testnet) */
export { useNetworkConfig } from './useNetworkConfig';

/** Token prices (supplements TokenPricesContext) */
export { useTokenPrices } from './useTokenPrices';

/** Disable scroll on number inputs */
export { useDisableNumberInputScroll } from './useDisableNumberInputScroll';
