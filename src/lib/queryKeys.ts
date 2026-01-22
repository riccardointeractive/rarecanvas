/**
 * Query Keys - Centralized key factory for TanStack Query
 * 
 * LOCATION: /src/lib/queryKeys.ts (GLOBAL - used across entire app)
 * 
 * Benefits:
 * - Type-safe cache invalidation
 * - Easy to find all queries for a feature
 * - Consistent key structure
 * - Prevents duplicate fetches across pages
 * 
 * RULE 7: ALL data fetching hooks MUST use TanStack Query
 */

export const queryKeys = {
  // =========================================================================
  // WALLET - User account data (balances, account info)
  // =========================================================================
  wallet: {
    all: ['wallet'] as const,
    /** User's token balances across all assets */
    balances: (address: string, network: string) => 
      ['wallet', 'balances', address, network] as const,
    /** Raw account data from Klever API */
    account: (address: string, network: string) => 
      ['wallet', 'account', address, network] as const,
  },

  // =========================================================================
  // TRADING PAIRS - DEX pair data
  // =========================================================================
  tradingPairs: {
    all: ['tradingPairs'] as const,
    /** All active trading pairs for a network */
    byNetwork: (network: string) => ['tradingPairs', network] as const,
  },

  // =========================================================================
  // RESERVES - Pool liquidity reserves
  // =========================================================================
  reserves: {
    all: ['reserves'] as const,
    /** Reserves for a specific pair */
    byPair: (pairId: string, network: string) => 
      ['reserves', pairId, network] as const,
    /** All reserves for a contract */
    byContract: (contractAddress: string) => 
      ['reserves', 'contract', contractAddress] as const,
  },

  // =========================================================================
  // POSITIONS - User LP positions
  // =========================================================================
  positions: {
    all: ['positions'] as const,
    /** User's LP positions across all pools */
    byAddress: (address: string) => ['positions', address] as const,
    /** User's position in a specific pair */
    byAddressAndPair: (address: string, pairId: string) => 
      ['positions', address, pairId] as const,
  },

  // =========================================================================
  // ACTIVITY - User swap/transaction activity
  // =========================================================================
  activity: {
    all: ['activity'] as const,
    /** User's recent swap activity */
    byAddress: (address: string) => ['activity', address] as const,
  },

  // =========================================================================
  // FAVORITES - User's favorite pairs
  // =========================================================================
  favorites: {
    all: ['favorites'] as const,
    byAddress: (address: string) => ['favorites', address] as const,
  },

  // =========================================================================
  // VALIDATORS - Network validators
  // =========================================================================
  validators: {
    all: ['validators'] as const,
    /** All validators for a network */
    byNetwork: (network: string) => ['validators', network] as const,
  },

  // =========================================================================
  // STAKING - Token staking data
  // =========================================================================
  staking: {
    all: ['staking'] as const,
    /** DGKO staking position */
    dgko: (address: string, network: string) => 
      ['staking', 'dgko', address, network] as const,
    /** BABYDGKO staking position */
    babydgko: (address: string, network: string) => 
      ['staking', 'babydgko', address, network] as const,
    /** KLV delegation buckets */
    klv: (address: string, network: string) => 
      ['staking', 'klv', address, network] as const,
    /** Combined staking stats */
    stats: (address: string, network: string) => 
      ['staking', 'stats', address, network] as const,
  },

  // =========================================================================
  // TRANSACTIONS - Transaction history
  // =========================================================================
  transactions: {
    all: ['transactions'] as const,
    /** Full transaction history */
    history: (address: string, network: string, limit?: number) => 
      ['transactions', 'history', address, network, limit ?? 50] as const,
    /** Swap-specific history */
    swaps: (address: string, network: string) => 
      ['transactions', 'swaps', address, network] as const,
  },

  // =========================================================================
  // PRICES - Token prices (supplement to TokenPricesContext)
  // =========================================================================
  prices: {
    all: ['prices'] as const,
    /** Current prices snapshot */
    current: () => ['prices', 'current'] as const,
    /** Price history for a token */
    history: (symbol: string, timeframe: string) => 
      ['prices', 'history', symbol, timeframe] as const,
  },

  // =========================================================================
  // NFT - NFT marketplace data
  // =========================================================================
  nft: {
    all: ['nft'] as const,
    /** All NFT collections */
    collections: (network: string) => ['nft', 'collections', network] as const,
    /** Listings for a collection */
    listings: (collectionId: string) => ['nft', 'listings', collectionId] as const,
    /** User's owned NFTs */
    userNfts: (address: string) => ['nft', 'user', address] as const,
  },

  // =========================================================================
  // POOL INFO - Pool share and liquidity info
  // =========================================================================
  pool: {
    all: ['pool'] as const,
    /** Total shares for a pair */
    shares: (pairId: string, network: string) => 
      ['pool', 'shares', pairId, network] as const,
    /** Pool info including reserves and shares */
    info: (pairId: string, network: string) => 
      ['pool', 'info', pairId, network] as const,
    /** Pending deposits for a user in a pair */
    pendingDeposits: (address: string, pairId: string, network: string) => 
      ['pool', 'pending', address, pairId, network] as const,
  },

  // =========================================================================
  // SWAP STATS - Aggregate historical statistics
  // =========================================================================
  swapStats: {
    all: ['swapStats'] as const,
    /** Contract-level aggregate stats */
    contract: (network: string) => ['swapStats', 'contract', network] as const,
    /** User-specific aggregate stats */
    user: (network: string, address: string) => 
      ['swapStats', 'user', network, address] as const,
  },

  // =========================================================================
  // DEXSCAN - External VIEW PRICES from DEXscan API
  // =========================================================================
  dexscan: {
    all: ['dexscan'] as const,
    /** All tokens overview (primary endpoint for VIEW PRICES) */
    overview: () => ['dexscan', 'overview'] as const,
    /** Single asset price */
    asset: (ticker: string) => ['dexscan', 'asset', ticker] as const,
    /** Full asset data with pools */
    assetFull: (ticker: string) => ['dexscan', 'assetFull', ticker] as const,
    /** Liquidity overview */
    liquidity: () => ['dexscan', 'liquidity'] as const,
    /** Specific pool detail */
    pool: (dex: string, tokenA: string, tokenB: string) => 
      ['dexscan', 'pool', dex, tokenA, tokenB] as const,
    /** VIEW PRICES map (processed) */
    viewPrices: () => ['dexscan', 'viewPrices'] as const,
  },
} as const;

// =========================================================================
// TYPE EXPORTS
// =========================================================================

/** Extract the query key type for a specific query */
export type QueryKey<T extends (...args: any[]) => readonly unknown[]> = ReturnType<T>;

/** All possible query key prefixes */
export type QueryKeyPrefix = keyof typeof queryKeys;
