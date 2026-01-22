/**
 * NFT Marketplace Configuration
 * 
 * Centralized configuration for the NFT marketplace.
 * Following RULE 12: Centralized Configuration
 */

import { SortOption, MarketplaceTab } from '../types/nft.types';

// =============================================================================
// Klever Marketplace IDs
// =============================================================================

export const KLEVER_MARKETPLACES = {
  RARE_CANVAS: '417b70c0eb7a33cb',
  KLEVER_NFT: 'd4f2bab340c55fde',
  XPORT: 'aa68ad853a09988c',
  NFT_ART_GALLERY: 'd2a04fe890a6edda',
  MINTHREE: '2936933ee43db509',
  SKY_GALLERY: '7c353c02770da029',
  KDEX: '116056b257d9f6d5',
  WORLD_DEX: '81376f526cf47730',
} as const;

export type MarketplaceId = typeof KLEVER_MARKETPLACES[keyof typeof KLEVER_MARKETPLACES];

// Exchange address where listed NFTs are held
export const KLEVER_EXCHANGE_ADDRESS = 'klv1qqqqqqqqqqqqqqqpqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqylllsymmgky';

// =============================================================================
// Marketplace Configuration
// =============================================================================

export const NFT_CONFIG = {
  // Platform fee percentage (in basis points, 100 = 1%)
  platformFeePercent: 250, // 2.5%

  // Default marketplace for listing (Rare Canvas)
  defaultMarketplaceId: KLEVER_MARKETPLACES.RARE_CANVAS,

  // Default currencies for listings
  defaultCurrency: 'KLV',
  supportedCurrencies: ['KLV'],
  
  // Pagination
  defaultPerPage: 12,
  maxPerPage: 50,
  
  // Listing defaults
  defaultListingDurationDays: 30,
  maxListingDurationDays: 180,
  
  // Min/Max prices
  minListingPrice: 1, // In smallest unit
  maxListingPrice: 1000000000, // 1 billion
  
  // Image fallbacks
  defaultNFTImage: '/images/nft-placeholder.svg',
  defaultCollectionImage: '/images/collection-placeholder.svg',
  
  // Refresh intervals
  refreshIntervalMs: 30000, // 30 seconds
  activityRefreshMs: 15000, // 15 seconds
};

// =============================================================================
// Sort Options
// =============================================================================

export const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'recent', label: 'Recently Listed' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'rarity', label: 'Rarity' },
];

// =============================================================================
// Tab Configuration
// =============================================================================

export const MARKETPLACE_TABS: { id: MarketplaceTab; label: string; icon: string }[] = [
  { id: 'explore', label: 'Explore', icon: 'compass' },
  { id: 'my-nfts', label: 'My NFTs', icon: 'wallet' },
  { id: 'activity', label: 'Activity', icon: 'activity' },
];

// =============================================================================
// Activity Type Labels
// =============================================================================

export const ACTIVITY_LABELS = {
  mint: 'Minted',
  list: 'Listed',
  sale: 'Sold',
  transfer: 'Transferred',
  delist: 'Delisted',
  bid: 'Bid Placed',
  offer: 'Offer Made',
};

export const ACTIVITY_COLORS = {
  mint: 'text-success',
  list: 'text-brand-primary',
  sale: 'text-brand-primary',
  transfer: 'text-brand-primary',
  delist: 'text-text-secondary',
  bid: 'text-warning',
  offer: 'text-warning',
};

// =============================================================================
// Featured Collections (Hardcoded for now, can be made dynamic)
// =============================================================================

export const FEATURED_COLLECTIONS = [
  {
    assetId: 'RCNFT-EXAMPLE',
    name: 'Rare Canvas Genesis',
    description: 'The founding collection of Rare Canvas NFTs',
    featured: true,
  },
];

// =============================================================================
// API Endpoints (Following RULE 50: Klever API Selection)
// =============================================================================

export const NFT_API_ENDPOINTS = {
  // Proxy API for indexed data
  getNFTsByOwner: (address: string) => `/v1.0/address/${address}/assets`,
  getCollection: (assetId: string) => `/v1.0/assets/${assetId}`,
  getNFT: (assetId: string, nonce: number) => `/v1.0/assets/${assetId}/${nonce}`,
  getSFT: (assetId: string, nonce: number) => `/v1.0/assets/sft/${assetId}/${nonce}`,
  getNFTHolder: (nftId: string) => `/v1.0/assets/nft/holder/${nftId}`,
  getCollectionByOwner: (address: string, collectionId: string) => 
    `/v1.0/address/${address}/collection/${collectionId}`,
  
  // Marketplace API Endpoints
  // List all marketplaces
  getMarketplaces: '/v1.0/marketplaces/list',
  // Get marketplace by ID with NFT listings
  getMarketplace: (id: string) => `/v1.0/marketplaces/${id}`,
  // Get all active orders across marketplaces
  getOrders: '/v1.0/marketplaces/orders/list',
  // Get marketplace collections
  getMarketplaceCollections: (id: string) => `/v1.0/marketplaces/${id}/collections`,
  // Get specific collection in marketplace
  getMarketplaceAsset: (marketplaceId: string, assetId: string) => 
    `/v1.0/marketplaces/${marketplaceId}/collections/${assetId}`,
  // Get marketplace stats
  getMarketplaceStats: (id: string) => `/v1.0/marketplaces/${id}/stats`,
  // Get NFT activity history
  getNFTActivity: '/v1.0/marketplaces/nfts/activity',
  // Get marketplace leaderboard
  getLeaderboard: (id: string) => `/v1.0/marketplaces/${id}/leaderboard`,
};

// =============================================================================
// Transaction Types for NFT Operations
// =============================================================================

export const NFT_TX_TYPES = {
  // Transfer NFT
  TRANSFER: 0,
  // Create Asset (includes NFT collection creation)
  CREATE_ASSET: 1,
  // Asset Trigger (for various NFT operations)
  ASSET_TRIGGER: 15,
  // Sell order on marketplace
  SELL: 17,
  // Buy order on marketplace
  BUY: 18,
  // Cancel sell order
  CANCEL_MARKET_ORDER: 19,
};

// =============================================================================
// Asset Trigger Types for NFT Operations
// =============================================================================

export const NFT_TRIGGERS = {
  // Mint additional NFT
  MINT: 0,
  // Burn NFT
  BURN: 1,
  // Wipe (remove all NFTs from address)
  WIPE: 2,
  // Pause transfers
  PAUSE: 3,
  // Resume transfers
  RESUME: 4,
  // Change owner
  CHANGE_OWNER: 5,
  // Add role
  ADD_ROLE: 6,
  // Remove role
  REMOVE_ROLE: 7,
  // Update metadata
  UPDATE_METADATA: 8,
  // Update royalties
  UPDATE_ROYALTIES: 12,
  // Update URI
  UPDATE_URI: 14,
};

// =============================================================================
// View Mode Options
// =============================================================================

export const VIEW_MODES = [
  { id: 'grid', icon: 'grid', label: 'Grid View' },
  { id: 'list', icon: 'list', label: 'List View' },
] as const;

// =============================================================================
// Price Formatting
// =============================================================================

export function formatNFTPrice(price: number, currency: string, decimals = 6): string {
  const formatted = (price / Math.pow(10, decimals)).toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  return `${formatted} ${currency}`;
}

export function parseNFTPrice(priceString: string, decimals = 6): number {
  const cleanPrice = priceString.replace(/[^0-9.]/g, '');
  return Math.floor(parseFloat(cleanPrice) * Math.pow(10, decimals));
}
