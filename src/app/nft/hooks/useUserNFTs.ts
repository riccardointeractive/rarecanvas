/**
 * useUserNFTs Hook
 * 
 * Fetches NFTs owned by the connected user from Klever blockchain.
 * Uses Proxy API for indexed, fast retrieval.
 * 
 * IMPORTANT: On Klever, NFT images are stored in the `uris` field of the asset.
 * The account endpoint only returns basic info, so we need to fetch
 * each NFT's metadata separately from /v1.0/assets/sft/{assetId}/{nonce}
 */

import { debugLog, debugWarn } from '@/utils/debugMode';
import { useState, useEffect, useCallback } from 'react';
import { useKlever } from '@/context/KleverContext';
import { useNetworkConfig } from '@/hooks/useNetworkConfig';
import { NFT, UserNFTStats } from '../types/nft.types';
import { NFT_CONFIG } from '../config/nft.config';

interface UserNFTsState {
  nfts: NFT[];
  loading: boolean;
  error: string | null;
  stats: UserNFTStats;
}

interface AccountAsset {
  assetId: string;
  assetType: number;
  balance: number;
  frozenBalance?: number;
  collection?: {
    nonce: number;
    balance: number;
  }[];
}

interface AccountResponse {
  data: {
    account: {
      address: string;
      balance: number;
      assets?: Record<string, AccountAsset>;
    };
  };
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
 * From /v1.0/assets/sft/{assetId}/{nonce}
 */
interface KleverNFTAssetResponse {
  data: {
    asset: {
      assetId: string;
      assetName?: string;
      assetType: number;
      name?: string;
      ticker?: string;
      ownerAddress: string;
      creatorAddress?: string;
      nonce?: number;
      mime?: string;
      logo?: string;
      // URIs - Array of {key, value} objects where images are stored!
      uris?: KleverURI[];
      royalties?: {
        transferPercentage?: number;
      };
    };
  };
}

/**
 * Fetch full NFT metadata from Klever API
 * This includes the URIs where images are stored
 */
async function fetchNFTMetadata(
  apiUrl: string,
  assetId: string,
  nonce: number
): Promise<KleverNFTAssetResponse | null> {
  try {
    // Use the SFT endpoint which works for both NFTs and SFTs
    const response = await fetch(`${apiUrl}/v1.0/assets/sft/${assetId}/${nonce}`);
    
    if (!response.ok) {
      // Try alternative endpoint
      const altResponse = await fetch(`${apiUrl}/v1.0/assets/${assetId}/${nonce}`);
      if (!altResponse.ok) {
        debugWarn(`[NFT] Failed to fetch metadata for ${assetId}/${nonce}`);
        return null;
      }
      return altResponse.json();
    }
    
    return response.json();
  } catch (error) {
    debugWarn(`[NFT] Error fetching metadata for ${assetId}/${nonce}:`, error);
    return null;
  }
}

/**
 * Extract image URL from Klever NFT URIs
 * Klever stores URIs as an array of {key, value} objects, e.g.:
 * [{ "key": "image", "value": "https://..." }, { "key": "thumbnail", "value": "https://..." }]
 */
function extractImageUrl(uris?: KleverURI[]): string | undefined {
  if (!uris || !Array.isArray(uris) || uris.length === 0) return undefined;
  
  // Priority keys to look for
  const imageKeys = ['image', 'Image', 'IMAGE', 'img', 'picture', 'thumbnail', 'media'];
  
  // First, try to find a specific image key
  for (const searchKey of imageKeys) {
    const found = uris.find(uri => uri.key?.toLowerCase() === searchKey.toLowerCase());
    if (found?.value) {
      return found.value;
    }
  }
  
  // Fall back to first URI with a value
  const firstWithValue = uris.find(uri => uri.value);
  return firstWithValue?.value;
}

/**
 * Convert IPFS URLs to HTTP gateway URLs
 */
function normalizeImageUrl(url?: string): string | undefined {
  if (!url) return undefined;
  
  // Convert IPFS URLs to gateway
  if (url.startsWith('ipfs://')) {
    const cid = url.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${cid}`;
  }
  
  // Convert Arweave URLs if needed
  if (url.startsWith('ar://')) {
    const txId = url.replace('ar://', '');
    return `https://arweave.net/${txId}`;
  }
  
  return url;
}

export function useUserNFTs() {
  const { address, isConnected } = useKlever();
  const { getApiUrl } = useNetworkConfig();
  
  const [state, setState] = useState<UserNFTsState>({
    nfts: [],
    loading: false,
    error: null,
    stats: {
      totalOwned: 0,
      totalListed: 0,
      totalValue: 0,
      collections: 0,
    },
  });

  const fetchUserNFTs = useCallback(async () => {
    if (!address || !isConnected) {
      setState(prev => {
        // Only update if actually different to prevent unnecessary re-renders
        if (prev.nfts.length === 0 && !prev.loading) return prev;
        return { ...prev, nfts: [], loading: false };
      });
      return;
    }

    setState(prev => {
      if (prev.loading) return prev;
      return { ...prev, loading: true, error: null };
    });

    try {
      const apiUrl = getApiUrl();
      
      // Step 1: Fetch account overview which includes all assets
      const response = await fetch(`${apiUrl}/v1.0/address/${address}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch account data');
      }

      const data: AccountResponse = await response.json();
      const assets = data.data?.account?.assets || {};

      // Step 2: Filter for NFT-type assets (assetType 1 = NFT, 2 = SFT)
      const nftItems: Array<{ assetId: string; nonce: number; balance: number }> = [];
      const collections = new Set<string>();

      for (const [assetId, asset] of Object.entries(assets)) {
        // Skip fungible tokens (assetType 0)
        if (asset.assetType === 0) continue;
        
        // NFT or SFT with collection data
        if (asset.collection && Array.isArray(asset.collection)) {
          collections.add(assetId);
          
          for (const item of asset.collection) {
            if (item.balance > 0) {
              nftItems.push({
                assetId,
                nonce: item.nonce,
                balance: item.balance,
              });
            }
          }
        }
      }

      debugLog(`[NFT] Found ${nftItems.length} NFTs in wallet, fetching metadata...`);

      // Step 3: Fetch full metadata for each NFT (including images)
      // Batch requests to avoid overwhelming the API
      const BATCH_SIZE = 10;
      const nftAssets: NFT[] = [];

      for (let i = 0; i < nftItems.length; i += BATCH_SIZE) {
        const batch = nftItems.slice(i, i + BATCH_SIZE);
        
        const metadataPromises = batch.map(item => 
          fetchNFTMetadata(apiUrl, item.assetId, item.nonce)
        );
        
        const metadataResults = await Promise.all(metadataPromises);
        
        for (let j = 0; j < batch.length; j++) {
          const item = batch[j];
          const metadata = metadataResults[j];
          
          if (!item) continue;
          
          // Extract image URL from URIs, fallback to logo field
          const imageUrl = normalizeImageUrl(
            extractImageUrl(metadata?.data?.asset?.uris) || metadata?.data?.asset?.logo
          );
          
          // Get name from metadata or construct from assetId
          const assetName = metadata?.data?.asset?.assetName 
            || metadata?.data?.asset?.name 
            || metadata?.data?.asset?.ticker
            || item.assetId;
          
          nftAssets.push({
            assetId: item.assetId,
            nonce: item.nonce,
            name: `${assetName} #${item.nonce}`,
            owner: address,
            creator: metadata?.data?.asset?.creatorAddress || '',
            collection: item.assetId,
            metadata: {
              name: `${assetName} #${item.nonce}`,
              description: metadata?.data?.asset?.mime || undefined,
              image: imageUrl,
            },
            royalties: metadata?.data?.asset?.royalties?.transferPercentage || 0,
            uri: imageUrl,
            balance: item.balance,
          });
          
          if (imageUrl) {
            debugLog(`[NFT] Found image for ${item.assetId}#${item.nonce}: ${imageUrl}`);
          }
        }
      }

      // Calculate stats
      const stats: UserNFTStats = {
        totalOwned: nftAssets.length,
        totalListed: nftAssets.filter(n => n.isListed).length,
        totalValue: 0, // Would need price data
        collections: collections.size,
      };

      debugLog(`[NFT] Loaded ${nftAssets.length} NFTs with metadata`);

      setState({
        nfts: nftAssets,
        loading: false,
        error: null,
        stats,
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch NFTs';
      console.error('[NFT] Error fetching user NFTs:', err);
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: message 
      }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address, isConnected]);

  // Fetch on mount and when address changes
  useEffect(() => {
    fetchUserNFTs();
  }, [fetchUserNFTs]);

  // Auto-refresh
  useEffect(() => {
    if (!isConnected) return;

    const interval = setInterval(fetchUserNFTs, NFT_CONFIG.refreshIntervalMs);
    return () => clearInterval(interval);
  }, [isConnected, fetchUserNFTs]);

  return {
    ...state,
    refresh: fetchUserNFTs,
  };
}
