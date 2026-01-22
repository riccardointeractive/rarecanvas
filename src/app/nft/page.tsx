/**
 * NFT Marketplace Page - Explore
 *
 * Main page for browsing and buying NFTs on Klever blockchain.
 *
 * Features:
 * - Browse all listed NFTs
 * - Filter, sort, and search functionality
 * - Grid/List view toggle
 * - NFT detail modal with buy/list actions
 *
 * Design: Fintech Minimal with gallery-focused presentation
 * Following: PROJECT_RULES.md, DESIGN_PHILOSOPHY.md
 */

'use client';

import { useState, useCallback } from 'react';
import { useKlever } from '@/context/KleverContext';
import { MaintenanceWrapper } from '@/app/admin/maintenance';
import { EmptyStateCard } from '@/components/EmptyStateCard';
import { LazyTransactionModal } from '@/components/LazyTransactionModal';
import { getTokenPrecision } from '@/config/tokens';

// Types
import { NFTFilters, NFT, NFTListing } from './types/nft.types';

// Hooks
import { useNFTListings } from './hooks/useNFTListings';

// Utils
import { buyNFT, sellNFT, getExplorerTxLink, Network } from './utils/marketplace';

// Components
import {
  NFTGrid,
  NFTListView,
  NFTFiltersBar,
  NFTDetailModal,
  NFTListingModal,
} from './components';

/**
 * NFT Marketplace Page Component - Explore
 */
export default function NFTMarketplacePage() {
  const { isConnected, address, network } = useKlever();

  // View mode state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Filter state
  const [filters, setFilters] = useState<NFTFilters>({
    sort: 'recent',
  });

  // Modal state
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null);
  const [selectedListing, setSelectedListing] = useState<NFTListing | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isListingModalOpen, setIsListingModalOpen] = useState(false);
  const [nftToList, setNftToList] = useState<NFT | null>(null);

  // Transaction modal state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [txMessage, setTxMessage] = useState('');

  // Fetch data
  const {
    listings,
    loading: listingsLoading,
    hasMore,
    loadMore,
    refresh: refreshListings,
  } = useNFTListings(filters);

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
        
        // Refresh data after successful purchase
        refreshListings();
      } else {
        setTxMessage(result.error || 'Transaction failed');
        setTxStatus('error');
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transaction failed';
      setTxMessage(message);
      setTxStatus('error');
    }
  }, [isConnected, address, network, refreshListings]);

  // Handle list action - opens listing modal
  const handleList = useCallback((nft: NFT) => {
    if (!isConnected || !address) {
      setTxMessage('Please connect your wallet first');
      setTxStatus('error');
      setTxModalOpen(true);
      return;
    }

    setNftToList(nft);
    setIsDetailModalOpen(false);
    setIsListingModalOpen(true);
  }, [isConnected, address]);

  // Handle listing submission
  const handleListingSubmit = useCallback(async (
    nft: NFT,
    price: number,
    currency: string,
    durationDays: number
  ) => {
    setIsListingModalOpen(false);
    setTxMessage(`Listing ${nft.name} for ${price} ${currency}...`);
    setTxStatus('loading');
    setTxModalOpen(true);

    try {
      // Build the asset ID for selling (collection/nonce format)
      const assetId = `${nft.assetId}/${nft.nonce}`;

      const result = await sellNFT(
        assetId,
        price,
        currency,
        durationDays,
        network as Network
      );

      if (result.success && result.txHash) {
        const explorerLink = getExplorerTxLink(result.txHash, network as Network);
        setTxMessage(
          `Successfully listed ${nft.name}! View on KleverScan: ${explorerLink}`
        );
        setTxStatus('success');

        // Refresh data after successful listing
        refreshListings();
      } else {
        setTxMessage(result.error || 'Failed to list NFT');
        setTxStatus('error');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list NFT';
      setTxMessage(message);
      setTxStatus('error');
    }
  }, [network, refreshListings]);

  return (
    <MaintenanceWrapper pageId="nft">
      <main className="min-h-screen py-8 md:py-12 lg:py-16">
        <div className="max-w-dashboard mx-auto px-4 md:px-6 lg:px-8">

          {/* Filters Bar */}
          <NFTFiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          {/* NFT Grid/List */}
          {listings.length === 0 && !listingsLoading ? (
            <EmptyStateCard
              icon={
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              }
              title="No NFTs Listed"
              description="Be the first to list an NFT on the Rare Canvas marketplace!"
              variant="pink"
            />
          ) : viewMode === 'grid' ? (
            <NFTGrid
              listings={listings}
              loading={listingsLoading}
              onNFTClick={handleNFTClick}
            />
          ) : (
            <NFTListView
              listings={listings}
              loading={listingsLoading}
              onNFTClick={handleNFTClick}
            />
          )}

          {/* Load More Button */}
          {hasMore && !listingsLoading && (
            <div className="flex justify-center mt-8">
              <button
                onClick={loadMore}
                className="
                  px-6 py-3 rounded-xl
                  bg-overlay-default border border-border-default
                  text-text-primary font-medium
                  hover:bg-overlay-active hover:border-border-active
                  transition-all duration-100
                "
              >
                Load More
              </button>
            </div>
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

      {/* NFT Listing Modal */}
      <NFTListingModal
        isOpen={isListingModalOpen}
        onClose={() => setIsListingModalOpen(false)}
        nft={nftToList}
        onSubmit={handleListingSubmit}
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
