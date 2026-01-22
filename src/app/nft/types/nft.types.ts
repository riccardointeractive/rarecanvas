/**
 * NFT Marketplace Types
 * 
 * Type definitions for Klever blockchain NFTs and SFTs.
 * 
 * On Klever, NFTs are KDA (Klever Digital Assets) with:
 * - assetId: Collection identifier (e.g., "DGKONFT-ABC123")
 * - nonce: Individual NFT within collection (0 for fungible, 1+ for NFTs)
 * - Royalties: Built-in creator royalties (0-10000 = 0-100%)
 */

// =============================================================================
// Core NFT Types
// =============================================================================

export interface NFTMetadata {
  name: string;
  description?: string;
  image?: string;
  attributes?: NFTAttribute[];
  externalUrl?: string;
  animationUrl?: string;
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
  display_type?: 'number' | 'boost_number' | 'boost_percentage' | 'date';
}

export interface NFT {
  assetId: string;
  nonce: number;
  name: string;
  owner: string;
  creator: string;
  collection: string;
  metadata: NFTMetadata;
  royalties: number; // 0-10000 (represents 0-100%)
  uri?: string;
  hash?: string;
  balance?: number; // For SFTs (Semi-Fungible Tokens)
  isListed?: boolean;
  listingPrice?: number;
  listingCurrency?: string;
}

export interface NFTCollection {
  assetId: string;
  name: string;
  ticker: string;
  creator: string;
  description?: string;
  logo?: string;
  banner?: string;
  royalties: number;
  totalSupply: number;
  mintedCount: number;
  floorPrice?: number;
  volume24h?: number;
  holders: number;
  verified?: boolean;
}

// =============================================================================
// Listing & Trading Types
// =============================================================================

export type ListingStatus = 'active' | 'sold' | 'cancelled' | 'expired';
export type SortOption = 'price_asc' | 'price_desc' | 'recent' | 'oldest' | 'rarity';

export interface NFTListing {
  id: string;
  nft: NFT;
  seller: string;
  price: number;
  currency: string; // 'KLV' or token assetId
  status: ListingStatus;
  createdAt: number;
  expiresAt?: number;
  txHash?: string;
}

export interface NFTSale {
  listingId: string;
  nft: NFT;
  seller: string;
  buyer: string;
  price: number;
  currency: string;
  royaltyAmount: number;
  royaltyRecipient: string;
  platformFee: number;
  soldAt: number;
  txHash: string;
}

export interface ListingFormData {
  assetId: string;
  nonce: number;
  price: string;
  currency: string;
  duration?: number; // Days until expiry
}

// =============================================================================
// Filter & Search Types
// =============================================================================

export interface NFTFilters {
  collection?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  status?: ListingStatus;
  traits?: Record<string, string[]>;
  search?: string;
  sort?: SortOption;
}

export interface NFTSearchResult {
  nfts: NFT[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

// =============================================================================
// User NFT Types
// =============================================================================

export interface UserNFTBalance {
  assetId: string;
  nonce: number;
  balance: number;
  nft?: NFT;
}

export interface UserNFTStats {
  totalOwned: number;
  totalListed: number;
  totalValue: number;
  collections: number;
}

// =============================================================================
// Activity Types
// =============================================================================

export type ActivityType = 'mint' | 'list' | 'sale' | 'transfer' | 'delist' | 'bid' | 'offer';

export interface NFTActivity {
  type: ActivityType;
  nft: NFT;
  from: string;
  to?: string;
  price?: number;
  currency?: string;
  timestamp: number;
  txHash: string;
}

// =============================================================================
// Page State Types
// =============================================================================

export type MarketplaceTab = 'explore' | 'my-nfts' | 'activity';

export interface MarketplaceState {
  tab: MarketplaceTab;
  filters: NFTFilters;
  viewMode: 'grid' | 'list';
  selectedNFT: NFT | null;
  isListingModalOpen: boolean;
  isBuyModalOpen: boolean;
}
