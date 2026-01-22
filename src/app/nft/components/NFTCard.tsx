/**
 * NFTCard Component
 * 
 * Display card for a single NFT with image, name, and price.
 * Uses gallery-focused design with clean presentation.
 */

import { useState } from 'react';
import { NFT, NFTListing } from '../types/nft.types';
import { formatNFTPrice, NFT_CONFIG } from '../config/nft.config';

interface NFTCardProps {
  nft: NFT;
  listing?: NFTListing;
  onClick?: () => void;
  showPrice?: boolean;
  showOwner?: boolean;
  compact?: boolean;
}

export function NFTCard({ 
  nft, 
  listing, 
  onClick, 
  showPrice = true, 
  showOwner = false,
  compact = false 
}: NFTCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const imageUrl = imageError 
    ? NFT_CONFIG.defaultNFTImage 
    : nft.metadata.image || NFT_CONFIG.defaultNFTImage;

  // Format address for display
  const formatAddress = (addr: string) => {
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  // Get rarity from attributes
  const rarityAttr = nft.metadata.attributes?.find(
    a => a.trait_type.toLowerCase() === 'rarity'
  );
  const rarity = rarityAttr?.value?.toString();

  // Rarity colors
  const rarityColors: Record<string, string> = {
    common: 'bg-neutral-muted text-text-secondary border-border-default',
    uncommon: 'bg-success-muted text-success border-border-success',
    rare: 'bg-info-muted text-info border-border-info',
    epic: 'bg-brand-primary/10 text-brand-primary border-border-brand',
    legendary: 'bg-warning-muted text-warning border-border-warning',
    mythic: 'bg-error-muted text-error border-border-error',
  };

  const rarityClass = rarity 
    ? rarityColors[rarity.toLowerCase()] || rarityColors.common
    : '';

  return (
    <div
      onClick={onClick}
      className={`
        group relative glass rounded-2xl overflow-hidden transition-all duration-150
        hover:border-border-active hover:bg-overlay-hover
        ${onClick ? 'cursor-pointer' : ''}
        ${compact ? 'p-2' : 'p-3 md:p-4'}
      `}
    >
      {/* Image Container */}
      <div className={`
        relative aspect-square rounded-xl overflow-hidden bg-overlay-default mb-3
        ${compact ? 'mb-2' : 'mb-3 md:mb-4'}
      `}>
        {/* Loading Skeleton */}
        {!imageLoaded && (
          <div className="absolute inset-0 bg-overlay-default animate-pulse" />
        )}
        
        {/* NFT Image */}
        <img
          src={imageUrl}
          alt={nft.name}
          className={`
            w-full h-full object-cover transition-all duration-150
            
            ${imageLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
        />

        {/* Rarity Badge */}
        {rarity && (
          <div className={`
            absolute top-2 left-2 px-2 py-1 rounded-lg text-2xs md:text-xs font-medium
            border ${rarityClass}
          `}>
            {rarity}
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
            View Details
          </span>
        </div>
      </div>

      {/* NFT Info */}
      <div className={compact ? 'space-y-1' : 'space-y-2'}>
        {/* Collection Name */}
        <p className="text-2xs md:text-xs text-text-muted truncate">
          {nft.collection}
        </p>

        {/* NFT Name */}
        <h3 className={`
          font-medium text-text-primary truncate
          ${compact ? 'text-sm' : 'text-sm md:text-base'}
        `}>
          {nft.name}
        </h3>

        {/* Price */}
        {showPrice && listing && (
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-2xs md:text-xs text-text-muted">Price</p>
              <p className={`
                font-mono font-medium text-text-primary
                ${compact ? 'text-sm' : 'text-sm md:text-base'}
              `}>
                {formatNFTPrice(listing.price, listing.currency)}
              </p>
            </div>
            {/* Quick Buy Button */}
            <button 
              className="
                p-2 rounded-lg bg-brand-primary/10 border border-border-brand
                text-brand-primary hover:bg-brand-primary hover:text-text-primary
                transition-all duration-100
              "
              onClick={(e) => {
                e.stopPropagation();
                // Buy action would go here
              }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          </div>
        )}

        {/* Owner */}
        {showOwner && (
          <p className="text-2xs md:text-xs text-text-muted truncate">
            Owned by <span className="text-brand-primary">{formatAddress(nft.owner)}</span>
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * NFTCardSkeleton Component
 * Loading skeleton for NFT cards
 */
export function NFTCardSkeleton({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`
      glass rounded-2xl overflow-hidden
      ${compact ? 'p-2' : 'p-3 md:p-4'}
    `}>
      {/* Image Skeleton */}
      <div className={`
        aspect-square rounded-xl bg-overlay-default animate-pulse
        ${compact ? 'mb-2' : 'mb-3 md:mb-4'}
      `} />
      
      {/* Info Skeletons */}
      <div className={compact ? 'space-y-1' : 'space-y-2'}>
        <div className="h-3 bg-overlay-default rounded animate-pulse w-1/2" />
        <div className="h-4 bg-overlay-default rounded animate-pulse w-3/4" />
        <div className="h-4 bg-overlay-default rounded animate-pulse w-1/3" />
      </div>
    </div>
  );
}
