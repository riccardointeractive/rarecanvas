/**
 * My NFTs Page
 *
 * Displays user's owned NFTs on Klever blockchain.
 *
 * Features:
 * - View owned NFTs
 * - List NFTs for sale
 * - User stats (total owned, listed, collections)
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

// Types
import { NFT, NFTListing } from '../types/nft.types';

// Hooks
import { useUserNFTs } from '../hooks/useUserNFTs';

// Utils
import { sellNFT, getExplorerTxLink, Network } from '../utils/marketplace';

// Components
import {
  NFTGrid,
  NFTDetailModal,
  NFTListingModal,
} from '../components';

/**
 * My NFTs Page Component
 */
export default function MyNFTsPage() {
  const { isConnected, connect, address, network } = useKlever();

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
        refreshUserNFTs();
      } else {
        setTxMessage(result.error || 'Failed to list NFT');
        setTxStatus('error');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to list NFT';
      setTxMessage(message);
      setTxStatus('error');
    }
  }, [network, refreshUserNFTs]);

  // Render content
  const renderContent = () => {
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
          <div className="bg-bg-surface rounded-xl border border-border-default p-3 md:p-4">
            <p className="text-xs text-text-muted mb-1">Total Owned</p>
            <p className="text-xl md:text-2xl font-mono font-semibold text-text-primary">
              {userStats.totalOwned}
            </p>
          </div>
          <div className="bg-bg-surface rounded-xl border border-border-default p-3 md:p-4">
            <p className="text-xs text-text-muted mb-1">Listed</p>
            <p className="text-xl md:text-2xl font-mono font-semibold text-text-primary">
              {userStats.totalListed}
            </p>
          </div>
          <div className="bg-bg-surface rounded-xl border border-border-default p-3 md:p-4">
            <p className="text-xs text-text-muted mb-1">Collections</p>
            <p className="text-xl md:text-2xl font-mono font-semibold text-text-primary">
              {userStats.collections}
            </p>
          </div>
          <div className="bg-bg-surface rounded-xl border border-border-default p-3 md:p-4">
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
              href: '/nft',
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
  };

  return (
    <MaintenanceWrapper pageId="nft">
      <main className="min-h-screen py-8 md:py-12 lg:py-16">
        <div className="max-w-dashboard mx-auto px-4 md:px-6 lg:px-8">

          {renderContent()}

        </div>
      </main>

      {/* NFT Detail Modal */}
      <NFTDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        nft={selectedNFT}
        listing={selectedListing}
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
