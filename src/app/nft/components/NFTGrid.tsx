/**
 * NFTGrid Component
 * 
 * Responsive grid layout for displaying NFT cards.
 * Supports loading states and empty states.
 */

import { NFT, NFTListing } from '../types/nft.types';
import { NFTCard, NFTCardSkeleton } from './NFTCard';
import { NFT_CONFIG } from '../config/nft.config';
import { getTokenPrecision } from '@/config/tokens';

interface NFTGridProps {
  listings?: NFTListing[];
  nfts?: NFT[];
  loading?: boolean;
  onNFTClick?: (nft: NFT, listing?: NFTListing) => void;
  showPrice?: boolean;
  showOwner?: boolean;
  compact?: boolean;
  columns?: 2 | 3 | 4;
}

export function NFTGrid({
  listings,
  nfts,
  loading = false,
  onNFTClick,
  showPrice = true,
  showOwner = false,
  compact = false,
  columns = 4,
}: NFTGridProps) {
  // Determine grid columns class
  const gridColsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 md:grid-cols-3',
    4: 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  }[columns];

  // Loading state
  if (loading) {
    return (
      <div className={`grid ${gridColsClass} gap-3 md:gap-4 lg:gap-5`}>
        {Array.from({ length: NFT_CONFIG.defaultPerPage }).map((_, i) => (
          <NFTCardSkeleton key={i} compact={compact} />
        ))}
      </div>
    );
  }

  // If we have listings, render those
  if (listings && listings.length > 0) {
    return (
      <div className={`grid ${gridColsClass} gap-3 md:gap-4 lg:gap-5`}>
        {listings.map((listing) => (
          <NFTCard
            key={listing.id}
            nft={listing.nft}
            listing={listing}
            onClick={() => onNFTClick?.(listing.nft, listing)}
            showPrice={showPrice}
            showOwner={showOwner}
            compact={compact}
          />
        ))}
      </div>
    );
  }

  // If we have NFTs (without listings), render those
  if (nfts && nfts.length > 0) {
    return (
      <div className={`grid ${gridColsClass} gap-3 md:gap-4 lg:gap-5`}>
        {nfts.map((nft) => (
          <NFTCard
            key={`${nft.assetId}-${nft.nonce}`}
            nft={nft}
            onClick={() => onNFTClick?.(nft)}
            showPrice={false}
            showOwner={showOwner}
            compact={compact}
          />
        ))}
      </div>
    );
  }

  // Empty state - handled by parent component
  return null;
}

/**
 * NFTListView Component
 * 
 * Alternative list layout for NFT display.
 */
interface NFTListViewProps {
  listings?: NFTListing[];
  nfts?: NFT[];
  loading?: boolean;
  onNFTClick?: (nft: NFT, listing?: NFTListing) => void;
}

export function NFTListView({
  listings,
  nfts,
  loading = false,
  onNFTClick,
}: NFTListViewProps) {
  // Loading state
  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="bg-bg-surface rounded-xl border border-border-default p-4 flex gap-4 animate-pulse">
            <div className="w-20 h-20 rounded-lg bg-overlay-default" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-overlay-default rounded w-1/4" />
              <div className="h-5 bg-overlay-default rounded w-1/2" />
              <div className="h-4 bg-overlay-default rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const items = listings || nfts?.map(nft => ({
    id: `${nft.assetId}-${nft.nonce}`,
    nft,
    seller: nft.owner,
    price: 0,
    currency: 'KLV',
    status: 'active' as const,
    createdAt: Date.now(),
  }));

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          onClick={() => onNFTClick?.(item.nft, listings ? item as NFTListing : undefined)}
          className="
            bg-bg-surface rounded-xl border border-border-default p-3 md:p-4 flex gap-3 md:gap-4
            cursor-pointer hover:bg-bg-elevated hover:border-border-active
            tr-card
          "
        >
          {/* Thumbnail */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg overflow-hidden bg-overlay-default flex-shrink-0">
            <img
              src={item.nft.metadata.image || NFT_CONFIG.defaultNFTImage}
              alt={item.nft.name}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-text-muted truncate">{item.nft.collection}</p>
            <h3 className="text-sm md:text-base font-medium text-text-primary truncate">
              {item.nft.name}
            </h3>
            {listings && (
              <p className="text-xs text-text-secondary mt-1">
                Listed by {item.seller.slice(0, 8)}...{item.seller.slice(-6)}
              </p>
            )}
          </div>

          {/* Price */}
          {listings && (
            <div className="text-right flex-shrink-0">
              <p className="text-xs text-text-muted">Price</p>
              <p className="font-mono font-medium text-text-primary">
                {((item as NFTListing).price / getTokenPrecision((item as NFTListing).currency || 'KLV')).toLocaleString()} {(item as NFTListing).currency || 'KLV'}
              </p>
            </div>
          )}

          {/* Arrow */}
          <div className="flex items-center">
            <svg className="w-5 h-5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      ))}
    </div>
  );
}
