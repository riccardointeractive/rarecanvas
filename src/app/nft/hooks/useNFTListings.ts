/**
 * useNFTListings Hook
 * 
 * Fetches real NFT listings from Klever blockchain marketplaces.
 * Uses our proxy API to avoid CORS issues:
 * - /api/marketplace?action=orders - Get active NFT orders
 * - /api/marketplace?action=nft - Get NFT metadata including images
 */

import { debugLog, debugWarn } from '@/utils/debugMode';
import { useState, useEffect, useCallback } from 'react';
import { NFTListing, NFTFilters, NFT } from '../types/nft.types';
import { NFT_CONFIG } from '../config/nft.config';
import { useNetworkConfig } from '@/hooks/useNetworkConfig';

interface ListingsState {
  listings: NFTListing[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  hasMore: boolean;
}

/**
 * Klever Marketplace Order from API
 * Based on actual API spec: github_com_klever-io_klever-proxy-go_data.Order
 */
interface KleverMarketplaceOrder {
  orderId: string;
  marketplaceId: string;
  // assetId in the order is actually the NFT nonce/ID within the collection
  assetId: string;
  // collectionId is the collection identifier (e.g., "XBLOCK-1HDW")
  collectionId: string;
  // ownerAddress is the seller
  ownerAddress: string;
  price: number;
  currencyId: string;
  currencyPrecision?: number;
  endTime?: number;
  timestamp?: number;
  status: string;
  marketType?: string;
  // Additional fields that might be present
  currentBid?: number;
  currentBidder?: string;
  reservePrice?: number;
}

/**
 * Klever URI object (array item)
 */
interface KleverURI {
  key: string;
  value: string;
}

/**
 * Klever NFT Asset Response
 */
interface KleverNFTAsset {
  assetId: string;
  assetName?: string;
  name?: string;
  ticker?: string;
  ownerAddress: string;
  creatorAddress?: string;
  nonce?: number;
  mime?: string;
  logo?: string;
  // URIs is an ARRAY of {key, value} objects, not a plain object!
  uris?: KleverURI[];
  royalties?: {
    transferPercentage?: number;
  };
}

/**
 * API Response wrapper
 */
interface ApiResponse<T> {
  data: T;
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

/**
 * Fetch NFT metadata including image URIs via proxy
 * @param collectionId - The collection identifier (e.g., "XBLOCK-1HDW")
 * @param nonce - The NFT nonce within the collection
 * @param network - Network to use (mainnet/testnet)
 */
async function fetchNFTMetadata(
  collectionId: string,
  nonce: number,
  network: string
): Promise<KleverNFTAsset | null> {
  if (!collectionId) return null;
  
  try {
    const url = `/api/marketplace?action=nft&assetId=${encodeURIComponent(collectionId)}&nonce=${nonce}&network=${network}`;
    const response = await fetch(url);
    
    if (!response.ok) return null;
    
    const json = await response.json();
    
    // API returns { data: { asset: {...} } } or just the asset directly
    const asset = json?.data?.asset || json?.data || json?.asset || json;
    
    return asset || null;
  } catch (error) {
    debugWarn(`[NFT] Error fetching metadata for ${collectionId}/${nonce}:`, error);
    return null;
  }
}

/**
 * Check if a URL looks like an image URL
 */
function isImageUrl(url: string): boolean {
  if (!url) return false;
  const lowerUrl = url.toLowerCase();
  
  // Check for image extensions
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif'];
  if (imageExtensions.some(ext => lowerUrl.includes(ext))) {
    return true;
  }
  
  // Check for IPFS/Arweave (often images)
  if (lowerUrl.includes('ipfs') || lowerUrl.includes('arweave')) {
    // But exclude metadata URLs
    if (lowerUrl.includes('metadata')) return false;
    return true;
  }
  
  // Exclude known non-image URLs
  const nonImagePatterns = ['telegram', 'twitter', 't.me', 'discord', 'website', 'youtube'];
  if (nonImagePatterns.some(pattern => lowerUrl.includes(pattern))) {
    return false;
  }
  
  return false;
}

/**
 * Extract image URL from Klever NFT URIs
 * URIs is an array of {key, value} objects
 * Note: Many URIs are social links or metadata, NOT images!
 */
function extractImageUrl(uris?: KleverURI[]): string | undefined {
  if (!uris) return undefined;
  
  if (!Array.isArray(uris)) {
    // Handle object format if encountered
    if (typeof uris === 'object') {
      const values = Object.values(uris as Record<string, string>);
      const imageValue = values.find(v => typeof v === 'string' && isImageUrl(v));
      if (imageValue) return normalizeImageUrl(imageValue);
    }
    return undefined;
  }
  
  if (uris.length === 0) return undefined;
  
  // Priority keys that are likely to be images
  const imageKeys = ['image', 'Image', 'IMAGE', 'img', 'picture', 'thumbnail', 'media', 'photo'];
  
  // First, try to find a URI with an image-related key
  for (const searchKey of imageKeys) {
    const found = uris.find(uri => uri.key?.toLowerCase() === searchKey.toLowerCase());
    if (found?.value && isImageUrl(found.value)) {
      return normalizeImageUrl(found.value);
    }
  }
  
  // Then look for any URI that looks like an image URL
  const imageUri = uris.find(uri => uri.value && isImageUrl(uri.value));
  if (imageUri?.value) {
    return normalizeImageUrl(imageUri.value);
  }
  
  return undefined;
}

/**
 * Convert IPFS/Arweave URLs to HTTP gateway URLs
 */
function normalizeImageUrl(url?: string): string | undefined {
  if (!url) return undefined;
  
  // Convert ipfs:// protocol to HTTPS gateway
  if (url.startsWith('ipfs://')) {
    const cid = url.replace('ipfs://', '');
    return `https://cloudflare-ipfs.com/ipfs/${cid}`;
  }
  
  // Convert ar:// protocol to Arweave gateway
  if (url.startsWith('ar://')) {
    const txId = url.replace('ar://', '');
    return `https://arweave.net/${txId}`;
  }
  
  // Replace problematic IPFS gateways with more reliable ones
  if (url.includes('ipfs.io/ipfs/')) {
    return url.replace(/https?:\/\/ipfs\.io\/ipfs\//, 'https://cloudflare-ipfs.com/ipfs/');
  }
  
  if (url.includes('klever-mint.mypinata.cloud/ipfs/')) {
    return url.replace(/https?:\/\/klever-mint\.mypinata\.cloud\/ipfs\//, 'https://cloudflare-ipfs.com/ipfs/');
  }
  
  return url;
}

/**
 * Convert Klever order to NFTListing format
 */
function orderToListing(
  order: KleverMarketplaceOrder,
  nftMetadata: KleverNFTAsset | null
): NFTListing {
  // PRIORITY: logo field first, then try to extract from URIs
  // On Klever, `logo` typically has the collection/NFT image
  // `uris` often contains social links, metadata URLs, NOT images
  const logoImage = nftMetadata?.logo;
  const uriImage = extractImageUrl(nftMetadata?.uris);
  
  // Prefer logo (usually has actual image), fallback to URI image if valid
  const imageUrl = logoImage || uriImage;
  
  // Get asset name - try multiple fields
  const assetName = nftMetadata?.name || nftMetadata?.assetName || nftMetadata?.ticker || order.collectionId || 'Unknown';
  
  // Parse nonce from assetId (it's actually the nonce in the order)
  const nonce = parseInt(order.assetId) || 0;
  
  // Collection ID is the actual collection
  const collectionId = order.collectionId || '';
  
  const nft: NFT = {
    assetId: collectionId,
    nonce: nonce,
    name: `${assetName} #${nonce}`,
    owner: order.ownerAddress || '',
    creator: nftMetadata?.creatorAddress || nftMetadata?.ownerAddress || '',
    collection: collectionId,
    metadata: {
      name: `${assetName} #${nonce}`,
      description: nftMetadata?.mime || undefined,
      image: imageUrl,
    },
    royalties: nftMetadata?.royalties?.transferPercentage || 0,
    uri: imageUrl,
  };

  return {
    id: order.orderId,
    nft,
    seller: order.ownerAddress || '',
    price: order.price,
    currency: order.currencyId || 'KLV',
    status: order.status === 'created' ? 'active' : 
            order.status === 'fulfilled' ? 'sold' : 'cancelled',
    createdAt: order.timestamp || Date.now(),
    expiresAt: order.endTime,
  };
}

export function useNFTListings(filters?: NFTFilters) {
  const { network } = useNetworkConfig();
  
  const [state, setState] = useState<ListingsState>({
    listings: [],
    loading: true,
    error: null,
    total: 0,
    page: 1,
    hasMore: false,
  });

  const fetchListings = useCallback(async (page = 1) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      // Build query params for our proxy API
      const params = new URLSearchParams({
        action: 'orders',
        active: 'true',
        status: 'created',
        page: page.toString(),
        limit: NFT_CONFIG.defaultPerPage.toString(),
        network: network,
      });
      
      // Add filters
      if (filters?.collection) {
        params.set('collection', filters.collection);
      }
      
      if (filters?.sort) {
        switch (filters.sort) {
          case 'price_asc':
            params.set('sortBy', 'price');
            params.set('orderBy', 'asc');
            break;
          case 'price_desc':
            params.set('sortBy', 'price');
            params.set('orderBy', 'desc');
            break;
          case 'recent':
            params.set('sortBy', 'endTime');
            params.set('orderBy', 'desc');
            break;
          case 'oldest':
            params.set('sortBy', 'endTime');
            params.set('orderBy', 'asc');
            break;
        }
      }

      // Fetch through our proxy API
      const response = await fetch(`/api/marketplace?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch marketplace orders: ${response.status}`);
      }

      const data: ApiResponse<{ orders: KleverMarketplaceOrder[] }> = await response.json();
      const orders = data.data?.orders || [];
      
      debugLog(`[NFT Marketplace] Loaded ${orders.length} orders, fetching metadata...`);

      // Fetch metadata for each NFT (for images)
      // Use collectionId as the collection and assetId as the nonce
      const BATCH_SIZE = 10;
      const listings: NFTListing[] = [];
      
      for (let i = 0; i < orders.length; i += BATCH_SIZE) {
        const batch = orders.slice(i, i + BATCH_SIZE);
        
        const metadataPromises = batch.map(order => {
          // collectionId is the collection, assetId is the nonce
          const nonce = parseInt(order.assetId) || 0;
          return fetchNFTMetadata(order.collectionId, nonce, network);
        });
        
        const metadataResults = await Promise.all(metadataPromises);
        
        for (let j = 0; j < batch.length; j++) {
          const order = batch[j];
          const metadata = metadataResults[j] ?? null;
          if (order) {
            listings.push(orderToListing(order, metadata));
          }
        }
      }

      // Apply local filters that API doesn't support
      let filteredListings = listings;
      
      if (filters?.minPrice !== undefined) {
        filteredListings = filteredListings.filter(
          l => l.price >= filters.minPrice!
        );
      }

      if (filters?.maxPrice !== undefined) {
        filteredListings = filteredListings.filter(
          l => l.price <= filters.maxPrice!
        );
      }

      if (filters?.search) {
        const search = filters.search.toLowerCase();
        filteredListings = filteredListings.filter(
          l => 
            l.nft.name.toLowerCase().includes(search) ||
            l.nft.collection.toLowerCase().includes(search)
        );
      }

      const pagination = data.pagination;
      const totalRecords = pagination?.totalRecords || filteredListings.length;
      const hasMore = pagination 
        ? pagination.self < pagination.totalPages 
        : false;

      const withImages = filteredListings.filter(l => l.nft.metadata.image).length;
      debugLog(`[NFT Marketplace] ✓ ${filteredListings.length} listings (${withImages} with images)`);

      setState({
        listings: filteredListings,
        loading: false,
        error: null,
        total: totalRecords,
        page,
        hasMore,
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch listings';
      console.error('[NFT] Error fetching listings:', err);
      setState(prev => ({ 
        ...prev, 
        listings: [],
        loading: false, 
        error: message 
      }));
    }
  }, [filters, network]);

  // Initial fetch
  useEffect(() => {
    fetchListings(1);
  }, [fetchListings]);

  const loadMore = useCallback(() => {
    if (state.hasMore && !state.loading) {
      fetchListings(state.page + 1);
    }
  }, [state.hasMore, state.loading, state.page, fetchListings]);

  const refresh = useCallback(() => {
    fetchListings(1);
  }, [fetchListings]);

  return {
    ...state,
    loadMore,
    refresh,
  };
}
