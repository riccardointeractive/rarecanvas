/**
 * CollectionCard Component
 * 
 * Display card for an NFT collection with logo, name, and stats.
 * Uses gallery-focused design consistent with NFTCard.
 */

import { useState } from 'react';
import Link from 'next/link';
import { NFTCollection } from '../types/nft.types';
import { formatNFTPrice, NFT_CONFIG } from '../config/nft.config';

interface CollectionCardProps {
  collection: NFTCollection;
  showStats?: boolean;
}

export function CollectionCard({ collection, showStats = true }: CollectionCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = imageError 
    ? NFT_CONFIG.defaultNFTImage 
    : collection.logo || NFT_CONFIG.defaultNFTImage;

  return (
    <Link href={`/nft/collection/${encodeURIComponent(collection.assetId)}`}>
      <div className="
        group relative glass rounded-2xl overflow-hidden transition-all duration-150
        hover:border-border-active hover:bg-overlay-hover
        cursor-pointer p-3 md:p-4
      ">
        {/* Image Container */}
        <div className="relative aspect-square rounded-xl overflow-hidden bg-overlay-default mb-3 md:mb-4">
          {/* Loading Skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-overlay-default animate-pulse" />
          )}
          
          {/* Collection Logo */}
          <img
            src={imageUrl}
            alt={collection.name}
            className={`
              w-full h-full object-cover transition-all duration-150
              
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
            `}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />

          {/* Verified Badge */}
          {collection.verified && (
            <div className="
              absolute top-2 right-2 p-1.5 rounded-lg
              bg-brand-primary/90 text-text-primary
            ">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="
            absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent
            opacity-0 group-hover:opacity-100 transition-opacity duration-150
            flex items-end justify-center pb-4
          ">
            <span className="
              px-4 py-2 bg-brand-primary rounded-lg text-text-primary text-sm font-medium
              transform translate-y-4 group-hover:translate-y-0 tr-transform
            ">
              View Collection
            </span>
          </div>
        </div>

        {/* Collection Info */}
        <div className="space-y-2">
          {/* Ticker */}
          <p className="text-2xs md:text-xs text-text-muted font-mono">
            {collection.ticker || collection.assetId.split('-')[0]}
          </p>

          {/* Collection Name */}
          <h3 className="font-medium text-text-primary text-sm md:text-base truncate">
            {collection.name}
          </h3>

          {/* Stats */}
          {showStats && (
            <div className="flex items-center gap-4 pt-2">
              {/* Floor Price */}
              <div>
                <p className="text-2xs text-text-muted">Floor</p>
                <p className="text-sm font-mono font-medium text-text-primary">
                  {collection.floorPrice 
                    ? formatNFTPrice(collection.floorPrice, 'KLV')
                    : '--'
                  }
                </p>
              </div>

              {/* Items / Supply */}
              <div>
                <p className="text-2xs text-text-muted">Items</p>
                <p className="text-sm font-mono font-medium text-text-primary">
                  {collection.mintedCount > 0 
                    ? collection.mintedCount.toLocaleString()
                    : '--'
                  }
                </p>
              </div>

              {/* Royalties */}
              {collection.royalties > 0 && (
                <div>
                  <p className="text-2xs text-text-muted">Royalty</p>
                  <p className="text-sm font-mono font-medium text-text-primary">
                    {(collection.royalties / 100).toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}

/**
 * CollectionCardSkeleton Component
 * Loading skeleton for collection cards
 */
export function CollectionCardSkeleton() {
  return (
    <div className="glass rounded-2xl overflow-hidden p-3 md:p-4">
      {/* Image Skeleton */}
      <div className="aspect-square rounded-xl bg-overlay-default animate-pulse mb-3 md:mb-4" />
      
      {/* Info Skeletons */}
      <div className="space-y-2">
        <div className="h-3 bg-overlay-default rounded animate-pulse w-1/3" />
        <div className="h-4 bg-overlay-default rounded animate-pulse w-2/3" />
        <div className="flex gap-4 pt-2">
          <div className="h-8 bg-overlay-default rounded animate-pulse w-16" />
          <div className="h-8 bg-overlay-default rounded animate-pulse w-16" />
        </div>
      </div>
    </div>
  );
}

/**
 * CollectionBanner Component
 * Large banner for collection detail page
 */
interface CollectionBannerProps {
  collection: NFTCollection;
  stats?: {
    floorPrice: number;
    listings: number;
    owners: number;
    items: number;
  };
}

export function CollectionBanner({ collection, stats }: CollectionBannerProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = imageError 
    ? NFT_CONFIG.defaultNFTImage 
    : collection.logo || NFT_CONFIG.defaultNFTImage;

  return (
    <div className="glass rounded-2xl p-4 md:p-6 lg:p-8 mb-6 md:mb-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Collection Logo */}
        <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0 mx-auto md:mx-0">
          {!imageLoaded && (
            <div className="absolute inset-0 rounded-2xl bg-overlay-default animate-pulse" />
          )}
          <img
            src={imageUrl}
            alt={collection.name}
            className={`
              w-full h-full object-cover rounded-2xl
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              transition-opacity duration-150
            `}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
          {collection.verified && (
            <div className="
              absolute -bottom-2 -right-2 p-2 rounded-xl
              bg-brand-primary text-text-primary shadow-lg
            ">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Collection Info */}
        <div className="flex-1 text-center md:text-left">
          {/* Ticker */}
          <p className="text-xs md:text-sm text-text-muted font-mono mb-1">
            {collection.ticker || collection.assetId}
          </p>

          {/* Name */}
          <h1 className="text-2xl md:text-3xl font-semibold text-text-primary mb-2">
            {collection.name}
          </h1>

          {/* Creator */}
          <p className="text-sm text-text-secondary mb-4">
            By{' '}
            <span className="text-brand-primary">
              {collection.creator.slice(0, 8)}...{collection.creator.slice(-6)}
            </span>
          </p>

          {/* Description */}
          {collection.description && (
            <p className="text-sm text-text-secondary mb-4 max-w-2xl">
              {collection.description}
            </p>
          )}

          {/* Stats */}
          {stats && (
            <div className="flex flex-wrap justify-center md:justify-start gap-4 md:gap-6">
              <div className="glass rounded-xl p-3 min-w-[80px]">
                <p className="text-2xs md:text-xs text-text-muted mb-0.5">Floor</p>
                <p className="text-base md:text-lg font-mono font-semibold text-text-primary">
                  {stats.floorPrice > 0 
                    ? formatNFTPrice(stats.floorPrice, 'KLV')
                    : '--'
                  }
                </p>
              </div>
              
              <div className="glass rounded-xl p-3 min-w-[80px]">
                <p className="text-2xs md:text-xs text-text-muted mb-0.5">Listed</p>
                <p className="text-base md:text-lg font-mono font-semibold text-text-primary">
                  {stats.listings}
                </p>
              </div>

              <div className="glass rounded-xl p-3 min-w-[80px]">
                <p className="text-2xs md:text-xs text-text-muted mb-0.5">Owners</p>
                <p className="text-base md:text-lg font-mono font-semibold text-text-primary">
                  {stats.owners}
                </p>
              </div>

              <div className="glass rounded-xl p-3 min-w-[80px]">
                <p className="text-2xs md:text-xs text-text-muted mb-0.5">Items</p>
                <p className="text-base md:text-lg font-mono font-semibold text-text-primary">
                  {stats.items > 0 ? stats.items.toLocaleString() : '--'}
                </p>
              </div>

              {collection.royalties > 0 && (
                <div className="glass rounded-xl p-3 min-w-[80px]">
                  <p className="text-2xs md:text-xs text-text-muted mb-0.5">Royalty</p>
                  <p className="text-base md:text-lg font-mono font-semibold text-text-primary">
                    {(collection.royalties / 100).toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
