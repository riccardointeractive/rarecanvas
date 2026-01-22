/**
 * NFTDetailModal Component
 * 
 * Modal for viewing NFT details, attributes, and actions.
 * Includes buy/sell functionality.
 */

import { useState, useEffect } from 'react';
import { NFT, NFTListing } from '../types/nft.types';
import { formatNFTPrice, NFT_CONFIG } from '../config/nft.config';
import { useKlever } from '@/context/KleverContext';
import { Button } from '@/components/Button';

interface NFTDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  nft: NFT | null;
  listing?: NFTListing | null;
  onBuy?: (listing: NFTListing) => void;
  onList?: (nft: NFT) => void;
}

export function NFTDetailModal({
  isOpen,
  onClose,
  nft,
  listing,
  onBuy,
  onList,
}: NFTDetailModalProps) {
  const { address, isConnected } = useKlever();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'details' | 'attributes' | 'history'>('details');

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setImageLoaded(false);
      setActiveTab('details');
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !nft) return null;

  const isOwner = address && nft.owner.toLowerCase() === address.toLowerCase();
  const canBuy = listing && !isOwner && isConnected;
  const canList = isOwner && !listing;

  const imageUrl = nft.metadata.image || NFT_CONFIG.defaultNFTImage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="
        relative w-full max-w-4xl max-h-[90vh] overflow-hidden
        glass rounded-3xl border border-border-default
        animate-fade-in
      ">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="
            absolute top-4 right-4 z-10
            w-10 h-10 rounded-full bg-black/50
            flex items-center justify-center
            text-text-secondary hover:text-text-primary
            transition-colors duration-100
          "
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content Grid */}
        <div className="grid md:grid-cols-2 max-h-[90vh] overflow-y-auto">
          {/* Image Section */}
          <div className="relative aspect-square md:aspect-auto md:h-full bg-black/30">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-overlay-default animate-pulse" />
            )}
            <img
              src={imageUrl}
              alt={nft.name}
              className={`
                w-full h-full object-contain
                transition-opacity duration-150-emphasis
                ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              `}
              onLoad={() => setImageLoaded(true)}
            />
          </div>

          {/* Info Section */}
          <div className="p-6 md:p-8 space-y-6 overflow-y-auto">
            {/* Header */}
            <div>
              <p className="text-sm text-brand-primary font-medium mb-1">
                {nft.collection}
              </p>
              <h2 className="text-2xl md:text-3xl font-medium text-text-primary">
                {nft.name}
              </h2>
            </div>

            {/* Owner Info */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-overlay-default">
              <div className="w-10 h-10 rounded-full bg-brand-primary flex items-center justify-center text-text-on-brand font-medium">
                {nft.owner.slice(4, 6).toUpperCase()}
              </div>
              <div>
                <p className="text-xs text-text-muted">
                  {isOwner ? 'You own this' : 'Owned by'}
                </p>
                <p className="text-sm text-text-primary font-mono">
                  {nft.owner.slice(0, 10)}...{nft.owner.slice(-8)}
                </p>
              </div>
            </div>

            {/* Price & Actions */}
            {listing && (
              <div className="p-4 rounded-xl bg-brand-primary/10 border border-border-brand">
                <p className="text-sm text-text-secondary mb-1">Current Price</p>
                <p className="text-2xl font-mono font-semibold text-text-primary mb-4">
                  {formatNFTPrice(listing.price, listing.currency)}
                </p>
                
                {canBuy && onBuy && (
                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={() => onBuy(listing)}
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Buy Now
                  </Button>
                )}

                {isOwner && (
                  <p className="text-center text-sm text-text-secondary">
                    This NFT is listed for sale
                  </p>
                )}
              </div>
            )}

            {canList && onList && (
              <Button
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => onList(nft)}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                List for Sale
              </Button>
            )}

            {!isConnected && (
              <div className="p-4 rounded-xl bg-overlay-default text-center">
                <p className="text-sm text-text-secondary">
                  Connect your wallet to buy or list this NFT
                </p>
              </div>
            )}

            {/* Tabs */}
            <div className="border-b border-border-default">
              <div className="flex gap-1">
                {(['details', 'attributes', 'history'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`
                      px-4 py-3 text-sm font-medium capitalize
                      border-b-2 -mb-px transition-colors duration-100
                      ${activeTab === tab
                        ? 'border-border-brand text-text-primary'
                        : 'border-transparent text-text-muted hover:text-text-primary'
                      }
                    `}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            <div className="min-h-[150px]">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  {nft.metadata.description && (
                    <div>
                      <p className="text-xs text-text-muted mb-1">Description</p>
                      <p className="text-sm text-text-primary">{nft.metadata.description}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-text-muted mb-1">Asset ID</p>
                      <p className="text-sm text-text-primary font-mono truncate">{nft.assetId}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">Token ID</p>
                      <p className="text-sm text-text-primary font-mono">#{nft.nonce}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">Royalties</p>
                      <p className="text-sm text-text-primary">{(nft.royalties / 100).toFixed(1)}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-muted mb-1">Creator</p>
                      <p className="text-sm text-text-primary font-mono truncate">
                        {nft.creator || 'Unknown'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'attributes' && (
                <div className="grid grid-cols-2 gap-3">
                  {nft.metadata.attributes && nft.metadata.attributes.length > 0 ? (
                    nft.metadata.attributes.map((attr, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-xl bg-overlay-default border border-border-default"
                      >
                        <p className="text-2xs text-text-muted uppercase tracking-wider">
                          {attr.trait_type}
                        </p>
                        <p className="text-sm font-medium text-text-primary mt-1">
                          {attr.value}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="col-span-2 text-sm text-text-muted">
                      No attributes available
                    </p>
                  )}
                </div>
              )}

              {activeTab === 'history' && (
                <div className="space-y-3">
                  <p className="text-sm text-text-muted">
                    Transaction history coming soon...
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
