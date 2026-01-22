/**
 * NFT Collection Detail Page
 * 
 * Shows all NFTs within a specific collection with:
 * - Collection banner with logo and stats
 * - Grid of listed NFTs
 * - Filter and sort options
 * 
 * Design: Fintech Minimal with gallery-focused presentation
 */

'use client';

import { useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MaintenanceWrapper } from '@/app/admin/maintenance';
import { LazyTransactionModal } from '@/components/LazyTransactionModal';
import { useKlever } from '@/context/KleverContext';
import { getTokenPrecision } from '@/config/tokens';
import { useCollection } from '../../hooks/useCollections';
import { CollectionBanner } from '../../components/CollectionCard';
import { NFTGrid, NFTDetailModal } from '../../components';
import { NFT, NFTListing, SortOption } from '../../types/nft.types';
import { buyNFT, getExplorerTxLink, Network } from '../../utils/marketplace';
import { Select } from '@/components/ui';

export default function CollectionPage() {
  const params = useParams();
  const collectionId = decodeURIComponent(params.id as string);
  
  const { isConnected, address, network } = useKlever();
  const { collection, listings, stats, loading, error, refresh } = useCollection(collectionId);

  // View and sort state
  const [sortBy, setSortBy] = useState<SortOption>('price_asc');
  
  // Modal state
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [selectedListing, setSelectedListing] = useState<NFTListing | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  
  // Transaction modal state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [txMessage, setTxMessage] = useState('');

  // Sort listings
  const sortedListings = [...listings].sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return a.price - b.price;
      case 'price_desc':
        return b.price - a.price;
      case 'recent':
        return b.createdAt - a.createdAt;
      case 'oldest':
        return a.createdAt - b.createdAt;
      default:
        return 0;
    }
  });

  // Handle NFT click
  const handleNFTClick = useCallback((nft: NFT, listing?: NFTListing) => {
    setSelectedNFT(nft);
    setSelectedListing(listing || null);
    setIsDetailModalOpen(true);
  }, []);

  // Handle buy action
  const handleBuy = useCallback(async (listing: NFTListing) => {
    if (!isConnected || !address) {
      setTxMessage('Please connect your wallet first');
      setTxStatus('error');
      setTxModalOpen(true);
      return;
    }

    setTxMessage(`Preparing to buy ${listing.nft.name} on ${network}...`);
    setTxStatus('loading');
    setTxModalOpen(true);
    setIsDetailModalOpen(false);

    try {
      // Price from API is in smallest units - convert to display units for buyNFT
      // Use centralized precision config (RULE 51)
      const priceInDisplayUnits = listing.price / getTokenPrecision(listing.currency);
      
      // Execute the buy transaction on current network
      const result = await buyNFT(
        listing.id,              // Order ID
        priceInDisplayUnits,     // Price in display units (e.g., 100 KLV)
        listing.currency,        // Currency (e.g., "KLV")
        network as Network       // Current network (mainnet/testnet)
      );

      if (result.success && result.txHash) {
        const explorerLink = getExplorerTxLink(result.txHash, network as Network);
        setTxMessage(
          `Successfully purchased ${listing.nft.name}! ` +
          `View on KleverScan: ${explorerLink}`
        );
        setTxStatus('success');
        refresh();
      } else {
        setTxMessage(result.error || 'Transaction failed');
        setTxStatus('error');
      }
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transaction failed';
      setTxMessage(message);
      setTxStatus('error');
    }
  }, [isConnected, address, network, refresh]);

  // Handle list action (placeholder)
  const handleList = useCallback(async (_nft: NFT) => {
    setTxMessage('NFT listing feature coming soon!');
    setTxStatus('error');
    setTxModalOpen(true);
    setIsDetailModalOpen(false);
  }, []);

  return (
    <MaintenanceWrapper pageId="nft">
      <main className="min-h-screen py-8 md:py-12 lg:py-16">
        <div className="max-w-dashboard mx-auto px-4 md:px-6 lg:px-8">
          
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
            <Link href="/nft" className="hover:text-text-primary transition-colors">
              Marketplace
            </Link>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/nft/collections" className="hover:text-text-primary transition-colors">
              Collections
            </Link>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-text-primary truncate max-w-48">
              {collection?.name || collectionId}
            </span>
          </div>

          {/* Loading State */}
          {loading && !collection && (
            <div className="space-y-6">
              {/* Banner Skeleton */}
              <div className="bg-bg-surface rounded-2xl border border-border-default p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl bg-overlay-default animate-pulse mx-auto md:mx-0" />
                  <div className="flex-1 space-y-4">
                    <div className="h-4 bg-overlay-default rounded animate-pulse w-24" />
                    <div className="h-8 bg-overlay-default rounded animate-pulse w-48" />
                    <div className="h-4 bg-overlay-default rounded animate-pulse w-32" />
                    <div className="flex gap-4 pt-2">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-16 w-20 bg-overlay-default rounded-xl animate-pulse" />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Skeleton */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-bg-surface rounded-2xl border border-border-default p-3 md:p-4">
                    <div className="aspect-square rounded-xl bg-overlay-default animate-pulse mb-3" />
                    <div className="space-y-2">
                      <div className="h-3 bg-overlay-default rounded animate-pulse w-1/2" />
                      <div className="h-4 bg-overlay-default rounded animate-pulse w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="bg-bg-surface rounded-2xl border border-border-default p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-error-muted flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-error mb-4">{error}</p>
              <button
                onClick={refresh}
                className="px-4 py-2 rounded-lg bg-overlay-default border border-border-default text-text-primary hover:bg-overlay-active transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Collection Content */}
          {collection && !error && (
            <>
              {/* Collection Banner */}
              <CollectionBanner collection={collection} stats={stats} />

              {/* Filters Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <p className="text-text-secondary text-sm">
                  {listings.length} {listings.length === 1 ? 'item' : 'items'} listed
                </p>

                <div className="flex items-center gap-3">
                  {/* Sort */}
                  <Select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    options={[
                      { value: 'price_asc', label: 'Price: Low to High' },
                      { value: 'price_desc', label: 'Price: High to Low' },
                      { value: 'recent', label: 'Recently Listed' },
                      { value: 'oldest', label: 'Oldest First' },
                    ]}
                    size="md"
                  />

                  {/* Refresh */}
                  <button
                    onClick={refresh}
                    disabled={loading}
                    className="
                      p-2.5 rounded-xl bg-bg-surface border border-border-default
                      text-text-secondary hover:text-text-primary hover:border-border-active
                      tr-interactive disabled:opacity-50
                    "
                    title="Refresh"
                  >
                    <svg 
                      className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* NFT Grid */}
              {sortedListings.length > 0 ? (
                <NFTGrid
                  listings={sortedListings}
                  loading={loading}
                  onNFTClick={handleNFTClick}
                />
              ) : !loading ? (
                <div className="bg-bg-surface rounded-2xl border border-border-default p-8 md:p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-overlay-default flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium text-text-primary mb-2">
                    No Items Listed
                  </h3>
                  <p className="text-text-secondary mb-6 max-w-md mx-auto">
                    There are no NFTs from this collection currently listed for sale.
                  </p>
                  <Link
                    href="/nft"
                    className="
                      inline-flex items-center gap-2 px-6 py-3 rounded-xl
                      bg-brand-primary text-text-primary font-medium
                      hover:bg-brand-primary/90 transition-colors
                    "
                  >
                    Browse All NFTs
                  </Link>
                </div>
              ) : null}
            </>
          )}

        </div>
      </main>

      {/* NFT Detail Modal */}
      <NFTDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        nft={selectedNFT}
        listing={selectedListing}
        onBuy={handleBuy}
        onList={handleList}
      />

      {/* Transaction Modal - Lazy loaded */}
      {txModalOpen && (
        <LazyTransactionModal
          isOpen={txModalOpen}
          status={txStatus}
          title={txStatus === 'loading' ? 'Processing...' : txStatus === 'success' ? 'Success!' : 'Error'}
          message={txMessage}
          onClose={() => setTxModalOpen(false)}
          autoDismiss={txStatus === 'success'}
          autoDismissDelay={3000}
        />
      )}
    </MaintenanceWrapper>
  );
}
