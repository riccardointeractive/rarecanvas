/**
 * useCollections Hook
 *
 * Fetches NFT collections from Klever marketplace.
 * Uses TanStack Query for caching and request deduplication.
 */

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useNetworkConfig } from '@/hooks/useNetworkConfig';
import { debugWarn } from '@/utils/debugMode';
import { NFTCollection, NFTListing, NFT } from '../types/nft.types';
import { queryKeys } from '@/lib/queryKeys';

// =============================================================================
// Types
// =============================================================================

interface KleverURI {
  key: string;
  value: string;
}

interface KleverCollectionAsset {
  assetId: string;
  name?: string;
  assetName?: string;
  ticker?: string;
  ownerAddress?: string;
  creatorAddress?: string;
  logo?: string;
  uris?: KleverURI[];
  royalties?: {
    transferPercentage?: number;
  };
  attributes?: {
    maxSupply?: number;
  };
  properties?: {
    canMint?: boolean;
  };
  circulatingSupply?: number;
  initialSupply?: number;
  staking?: {
    totalStaked?: number;
  };
}

interface CollectionStats {
  floorPrice: number;
  totalVolume: number;
  volume24h: number;
  listings: number;
  owners: number;
  items: number;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Normalize IPFS URLs to use more reliable gateways
 */
function normalizeImageUrl(url: string): string {
  if (!url) return url;

  // Replace problematic IPFS gateways with more reliable ones
  const ipfsReplacements: [RegExp, string][] = [
    [/^https?:\/\/ipfs\.io\/ipfs\//, 'https://cloudflare-ipfs.com/ipfs/'],
    [/^https?:\/\/klever-mint\.mypinata\.cloud\/ipfs\//, 'https://cloudflare-ipfs.com/ipfs/'],
    [/^ipfs:\/\//, 'https://cloudflare-ipfs.com/ipfs/'],
  ];

  for (const [pattern, replacement] of ipfsReplacements) {
    if (pattern.test(url)) {
      return url.replace(pattern, replacement);
    }
  }

  return url;
}

function extractLogoUrl(asset: KleverCollectionAsset): string | undefined {
  // Priority 1: logo field
  if (asset.logo) return normalizeImageUrl(asset.logo);

  // Priority 2: URIs with image keys
  if (asset.uris && Array.isArray(asset.uris)) {
    const imageKeys = ['image', 'logo', 'thumbnail', 'picture'];
    for (const key of imageKeys) {
      const found = asset.uris.find(u => u.key?.toLowerCase() === key.toLowerCase());
      if (found?.value && isImageUrl(found.value)) {
        return normalizeImageUrl(found.value);
      }
    }

    // Any URI that looks like an image
    const imageUri = asset.uris.find(u => u.value && isImageUrl(u.value));
    if (imageUri?.value) return normalizeImageUrl(imageUri.value);
  }

  return undefined;
}

function isImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  const lower = url.toLowerCase();

  // Skip social links
  const socialDomains = ['t.me', 'telegram', 'twitter', 'x.com', 'discord', 'medium.com', 'github'];
  if (socialDomains.some(d => lower.includes(d))) return false;

  // Skip metadata
  if (lower.includes('metadata') || lower.endsWith('.json')) return false;

  // Check for image extensions
  const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.avif'];
  if (imageExtensions.some(ext => lower.includes(ext))) return true;

  // IPFS/Arweave (likely images)
  if (lower.includes('ipfs') || lower.includes('arweave') || lower.includes('pinata')) {
    return !lower.includes('metadata');
  }

  return false;
}

function assetToCollection(asset: KleverCollectionAsset): NFTCollection {
  return {
    assetId: asset.assetId,
    name: asset.name || asset.assetName || asset.ticker || asset.assetId,
    ticker: asset.ticker || asset.assetId.split('-')[0] || '',
    creator: asset.creatorAddress || asset.ownerAddress || '',
    logo: extractLogoUrl(asset),
    royalties: asset.royalties?.transferPercentage || 0,
    totalSupply: asset.attributes?.maxSupply || 0,
    mintedCount: asset.circulatingSupply || asset.initialSupply || 0,
    holders: 0, // Would need separate API call
    verified: false, // No verification system yet
  };
}

// =============================================================================
// Fetch Functions
// =============================================================================

async function fetchCollections(network: string): Promise<NFTCollection[]> {
  // Fetch marketplace orders to get active collections
  const ordersResponse = await fetch(
    `/api/marketplace?action=orders&active=true&limit=100&network=${network}`
  );

  if (!ordersResponse.ok) {
    throw new Error('Failed to fetch marketplace orders');
  }

  const ordersData = await ordersResponse.json();
  const orders = ordersData.data?.orders || [];

  // Extract unique collection IDs
  const collectionIds = Array.from(new Set(orders.map((o: { collectionId: string }) => o.collectionId)));

  // Fetch metadata for each collection
  const collectionsMap = new Map<string, NFTCollection>();

  for (const collectionId of collectionIds as string[]) {
    try {
      const metaResponse = await fetch(
        `/api/marketplace?action=nft&assetId=${encodeURIComponent(collectionId)}&nonce=0&network=${network}`
      );

      if (metaResponse.ok) {
        const metaData = await metaResponse.json();
        const asset = metaData?.data?.asset || metaData?.data || metaData;

        if (asset) {
          const collection = assetToCollection(asset);

          // Find floor price from listings for this collection
          const collectionOrders = orders.filter(
            (o: { collectionId: string }) => o.collectionId === collectionId
          );
          const prices = collectionOrders
            .map((o: { price: string }) => parseFloat(o.price))
            .filter((p: number) => !isNaN(p) && p > 0);

          collection.floorPrice = prices.length > 0 ? Math.min(...prices) : undefined;
          collectionsMap.set(collectionId, collection);
        }
      }
    } catch (err) {
      debugWarn(`Failed to fetch metadata for ${collectionId}:`, err);
    }
  }

  // Sort by floor price (collections with listings first)
  return Array.from(collectionsMap.values()).sort((a, b) => {
    if (a.floorPrice && !b.floorPrice) return -1;
    if (!a.floorPrice && b.floorPrice) return 1;
    return (a.floorPrice || 0) - (b.floorPrice || 0);
  });
}

interface CollectionData {
  collection: NFTCollection | null;
  listings: NFTListing[];
  stats: CollectionStats;
}

async function fetchCollectionData(collectionId: string, network: string): Promise<CollectionData> {
  // Fetch collection metadata
  const metaResponse = await fetch(
    `/api/marketplace?action=nft&assetId=${encodeURIComponent(collectionId)}&nonce=0&network=${network}`
  );

  let collection: NFTCollection | null = null;

  if (metaResponse.ok) {
    const metaData = await metaResponse.json();
    const asset = metaData?.data?.asset || metaData?.data || metaData;
    if (asset) {
      collection = assetToCollection(asset);
    }
  }

  // Fetch listings for this collection
  const ordersResponse = await fetch(
    `/api/marketplace?action=orders&collection=${encodeURIComponent(collectionId)}&active=true&limit=100&network=${network}`
  );

  const ordersData = await ordersResponse.json();
  const orders = ordersData.data?.orders || [];

  // Fetch metadata for each NFT in the collection
  const listings: NFTListing[] = [];

  for (const order of orders) {
    try {
      const nftResponse = await fetch(
        `/api/marketplace?action=nft&assetId=${encodeURIComponent(order.collectionId)}&nonce=${order.assetId}&network=${network}`
      );

      let nftMetadata = null;
      if (nftResponse.ok) {
        const nftData = await nftResponse.json();
        nftMetadata = nftData?.data?.asset || nftData?.data || nftData;
      }

      const nft: NFT = {
        assetId: order.collectionId,
        nonce: parseInt(order.assetId) || 0,
        name: `${nftMetadata?.name || collection?.name || order.collectionId} #${order.assetId}`,
        owner: order.ownerAddress || '',
        creator: nftMetadata?.creatorAddress || collection?.creator || '',
        collection: order.collectionId,
        metadata: {
          name: `${nftMetadata?.name || order.collectionId} #${order.assetId}`,
          image: nftMetadata?.logo || collection?.logo,
        },
        royalties: nftMetadata?.royalties?.transferPercentage || collection?.royalties || 0,
        uri: nftMetadata?.logo,
      };

      listings.push({
        id: order.orderId,
        nft,
        seller: order.ownerAddress || '',
        price: parseFloat(order.price) || 0,
        currency: order.currencyId || 'KLV',
        status: 'active',
        createdAt: order.timestamp || Date.now(),
      });
    } catch (err) {
      debugWarn(`Failed to fetch NFT ${order.collectionId}/${order.assetId}:`, err);
    }
  }

  // Calculate stats
  const prices = listings.map(l => l.price).filter(p => p > 0);
  const stats: CollectionStats = {
    floorPrice: prices.length > 0 ? Math.min(...prices) : 0,
    totalVolume: 0, // Would need sales history
    volume24h: 0,   // Would need sales history
    listings: listings.length,
    owners: new Set(listings.map(l => l.seller)).size,
    items: collection?.mintedCount || listings.length,
  };

  // Update collection with calculated stats
  if (collection) {
    collection.floorPrice = stats.floorPrice || undefined;
  }

  return { collection, listings, stats };
}

// =============================================================================
// Hooks
// =============================================================================

/**
 * Fetch all collections with marketplace activity
 */
export function useCollections() {
  const { network } = useNetworkConfig();
  const queryClient = useQueryClient();

  const {
    data: collections,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: queryKeys.nft.collections(network),
    queryFn: () => fetchCollections(network),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  });

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: queryKeys.nft.collections(network)
    });
  }, [queryClient, network]);

  return {
    collections: collections ?? [],
    loading: isLoading,
    isFetching,
    error: error ? String(error) : null,
    refresh,
    invalidate,
  };
}

/**
 * Fetch single collection with its listings
 */
export function useCollection(collectionId: string) {
  const { network } = useNetworkConfig();
  const queryClient = useQueryClient();

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ['nft', 'collection', collectionId, network],
    queryFn: () => fetchCollectionData(collectionId, network),
    enabled: !!collectionId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000,    // 5 minutes
  });

  const refresh = useCallback(() => {
    refetch();
  }, [refetch]);

  const invalidate = useCallback(() => {
    queryClient.invalidateQueries({
      queryKey: ['nft', 'collection', collectionId, network]
    });
  }, [queryClient, collectionId, network]);

  return {
    collection: data?.collection ?? null,
    listings: data?.listings ?? [],
    stats: data?.stats ?? {
      floorPrice: 0,
      totalVolume: 0,
      volume24h: 0,
      listings: 0,
      owners: 0,
      items: 0,
    },
    loading: isLoading,
    isFetching,
    error: error ? String(error) : null,
    refresh,
    invalidate,
  };
}
