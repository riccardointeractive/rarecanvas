/**
 * NFT Marketplace Page
 * 
 * Main page for browsing, buying, and selling NFTs on Klever blockchain.
 * 
 * Features:
 * - Browse all listed NFTs (Explore tab)
 * - View your owned NFTs (My NFTs tab)
 * - Track marketplace activity (Activity tab)
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
import { MarketplaceTab, NFTFilters, NFT, NFTListing } from './types/nft.types';

// Hooks
import { useUserNFTs } from './hooks/useUserNFTs';
import { useNFTListings } from './hooks/useNFTListings';

// Utils
import { buyNFT, getExplorerTxLink, Network } from './utils/marketplace';

// Components
import {
  NFTHeader,
  NFTGrid,
  NFTListView,
  NFTFiltersBar,
  NFTDetailModal,
} from './components';

/**
 * NFT Marketplace Page Component
 */
export default function NFTMarketplacePage() {
  const { isConnected, connect, address, network } = useKlever();
  
  // Tab state
  const [activeTab, setActiveTab] = useState<MarketplaceTab>('explore');
  
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
  
  // Transaction modal state
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txStatus, setTxStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [txMessage, setTxMessage] = useState('');
  
  // Fetch data
  const { 
    listings, 
    loading: listingsLoading, 
    total: totalListings,
    hasMore,
    loadMore,
    refresh: refreshListings,
  } = useNFTListings(filters);
  
  const { 
    nfts: userNFTs, 
    loading: userNFTsLoading,
    stats: userStats,
    refresh: refreshUserNFTs,
  } = useUserNFTs();

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
        refreshUserNFTs();
      } else {
        setTxMessage(result.error || 'Transaction failed');
        setTxStatus('error');
      }
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Transaction failed';
      setTxMessage(message);
      setTxStatus('error');
    }
  }, [isConnected, address, network, refreshListings, refreshUserNFTs]);

  // Handle list action
  const handleList = useCallback(async (_nft: NFT) => {
    if (!isConnected || !address) {
      setTxMessage('Please connect your wallet first');
      setTxStatus('error');
      setTxModalOpen(true);
      return;
    }

    // TODO: Open listing modal to set price
    // For now, show coming soon message
    setTxMessage('NFT listing feature coming soon!');
    setTxStatus('error');
    setTxModalOpen(true);
    setIsDetailModalOpen(false);
  }, [isConnected, address]);

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'explore':
        return (
          <>
            <NFTFiltersBar
              filters={filters}
              onFiltersChange={setFilters}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
            
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
          </>
        );

      case 'my-nfts':
        if (!isConnected) {
          return (
            <EmptyStateCard
              icon={
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
                </svg>
              }
              title="Connect Your Wallet"
              description="Connect your Klever wallet to view your NFT collection"
              action={{
                label: 'Connect',
                onClick: connect,
                variant: 'connect',
              }}
              secondaryAction={{
                label: "Don't have Klever Wallet?",
                href: 'https://klever.io/extension/',
              }}
              variant="purple"
            />
          );
        }

        return (
          <>
            {/* User Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
              <div className="glass rounded-xl p-3 md:p-4">
                <p className="text-xs text-text-muted mb-1">Total Owned</p>
                <p className="text-xl md:text-2xl font-mono font-semibold text-text-primary">
                  {userStats.totalOwned}
                </p>
              </div>
              <div className="glass rounded-xl p-3 md:p-4">
                <p className="text-xs text-text-muted mb-1">Listed</p>
                <p className="text-xl md:text-2xl font-mono font-semibold text-text-primary">
                  {userStats.totalListed}
                </p>
              </div>
              <div className="glass rounded-xl p-3 md:p-4">
                <p className="text-xs text-text-muted mb-1">Collections</p>
                <p className="text-xl md:text-2xl font-mono font-semibold text-text-primary">
                  {userStats.collections}
                </p>
              </div>
              <div className="glass rounded-xl p-3 md:p-4">
                <p className="text-xs text-text-muted mb-1">Total Value</p>
                <p className="text-xl md:text-2xl font-mono font-semibold text-text-primary">
                  --
                </p>
              </div>
            </div>

            {/* User's NFTs */}
            {userNFTs.length === 0 && !userNFTsLoading ? (
              <EmptyStateCard
                icon={
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                  </svg>
                }
                title="No NFTs Found"
                description="You don't own any NFTs yet. Browse the marketplace to find your first NFT!"
                action={{
                  label: 'Browse Marketplace',
                  onClick: () => setActiveTab('explore'),
                }}
                variant="cyan"
              />
            ) : (
              <NFTGrid
                nfts={userNFTs}
                loading={userNFTsLoading}
                onNFTClick={handleNFTClick}
                showOwner={false}
                showPrice={false}
              />
            )}
          </>
        );

      case 'activity':
        return (
          <EmptyStateCard
            icon={
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            }
            title="Activity Feed Coming Soon"
            description="Track all marketplace activity including sales, listings, and transfers"
            variant="emerald"
          />
        );

      default:
        return null;
    }
  };

  return (
    <MaintenanceWrapper pageId="nft">
      <main className="min-h-screen py-8 md:py-12 lg:py-16">
        <div className="max-w-dashboard mx-auto px-4 md:px-6 lg:px-8">
          
          {/* Page Header */}
          <NFTHeader
            activeTab={activeTab}
            onTabChange={setActiveTab}
            totalListings={activeTab === 'explore' ? totalListings : undefined}
          />

          {/* Main Content */}
          {renderContent()}

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
