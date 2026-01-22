'use client';

import Link from 'next/link';
import { useCollections } from './nft/hooks/useCollections';
import { useNFTListings } from './nft/hooks/useNFTListings';
import { CollectionCard, CollectionCardSkeleton } from './nft/components/CollectionCard';
import { NFTCard, NFTCardSkeleton } from './nft/components/NFTCard';

export default function Home() {
  const { collections, loading: collectionsLoading } = useCollections();
  const { listings, loading: listingsLoading } = useNFTListings({ sort: 'recent' });

  // Take first 4 collections and 8 listings for display
  const featuredCollections = collections.slice(0, 4);
  const recentListings = listings.slice(0, 8);

  return (
    <div className="relative">
      <div className="max-w-container mx-auto px-4 md:px-6 lg:px-8">
        {/* Hero Section */}
        <section className="min-h-hero flex flex-col justify-center py-16 md:py-20">
          <div className="max-w-3xl">
            {/* Main headline */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium mb-5 leading-[1.1] tracking-tighter">
              <span className="text-text-primary">Discover, Trade, and Collect</span>
              <br />
              <span className="text-brand-primary">NFTs on Klever Chain</span>
            </h1>

            <p className="text-base md:text-lg text-text-muted mb-8 max-w-xl leading-relaxed">
              The NFT marketplace built on Klever blockchain. Browse collections,
              buy and sell digital art, and manage your portfolio.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-3">
              <Link href="/nft">
                <button className="h-11 px-6 bg-brand-primary hover:bg-brand-primary-hover text-text-on-brand text-sm font-medium rounded-lg tr-colors">
                  Explore NFTs
                </button>
              </Link>
              <Link href="/nft/collections">
                <button className="h-11 px-6 bg-bg-surface hover:bg-bg-elevated border border-border-default hover:border-border-hover text-text-primary text-sm font-medium rounded-lg tr-colors">
                  Browse Collections
                </button>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Collections Section */}
        <section className="py-12 md:py-16 border-t border-border-default">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-text-primary">
                Collections
              </h2>
              <p className="text-sm text-text-muted mt-1">
                Browse NFT collections with active listings
              </p>
            </div>
            <Link
              href="/nft/collections"
              className="text-sm text-text-secondary hover:text-text-primary tr-colors flex items-center gap-1"
            >
              View all
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Collections Grid */}
          {collectionsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <CollectionCardSkeleton key={i} />
              ))}
            </div>
          ) : featuredCollections.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {featuredCollections.map((collection) => (
                <CollectionCard key={collection.assetId} collection={collection} />
              ))}
            </div>
          ) : (
            <div className="bg-bg-surface rounded-2xl border border-border-default p-8 text-center">
              <p className="text-text-muted">No collections available yet</p>
            </div>
          )}
        </section>

        {/* Recent Listings Section */}
        <section className="py-12 md:py-16 border-t border-border-default">
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-text-primary">
                Recent Listings
              </h2>
              <p className="text-sm text-text-muted mt-1">
                NFTs recently listed for sale
              </p>
            </div>
            <Link
              href="/nft"
              className="text-sm text-text-secondary hover:text-text-primary tr-colors flex items-center gap-1"
            >
              View all
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* NFT Grid */}
          {listingsLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <NFTCardSkeleton key={i} />
              ))}
            </div>
          ) : recentListings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {recentListings.map((listing) => (
                <NFTCard
                  key={listing.id}
                  nft={listing.nft}
                  listing={listing}
                  onClick={() => {
                    // Navigate to explore page - clicking will open modal there
                    window.location.href = '/nft';
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="bg-bg-surface rounded-2xl border border-border-default p-8 text-center">
              <p className="text-text-muted">No NFTs listed yet</p>
            </div>
          )}
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-16 border-t border-border-default">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-medium text-text-primary mb-3">
              Built on Klever Blockchain
            </h2>
            <p className="text-sm md:text-base text-text-muted max-w-2xl mx-auto">
              Fast, secure, and low-cost transactions powered by Klever Chain
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {/* Feature 1 */}
            <div className="bg-bg-surface rounded-2xl border border-border-default p-5 md:p-6">
              <div className="w-10 h-10 rounded-xl bg-overlay-default flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-text-primary mb-2">
                Fast Transactions
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Near-instant transaction finality with Klever&apos;s high-performance blockchain
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-bg-surface rounded-2xl border border-border-default p-5 md:p-6">
              <div className="w-10 h-10 rounded-xl bg-overlay-default flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-text-primary mb-2">
                Low Fees
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Minimal transaction fees make buying, selling, and trading NFTs affordable
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-bg-surface rounded-2xl border border-border-default p-5 md:p-6">
              <div className="w-10 h-10 rounded-xl bg-overlay-default flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <h3 className="text-base font-medium text-text-primary mb-2">
                Secure Marketplace
              </h3>
              <p className="text-sm text-text-muted leading-relaxed">
                Non-custodial trading through Klever smart contracts ensures safe transactions
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-16 border-t border-border-default mb-8">
          <div className="bg-bg-surface rounded-2xl border border-border-default p-6 md:p-10 text-center">
            <h2 className="text-xl md:text-2xl font-medium text-text-primary mb-3">
              Ready to explore?
            </h2>
            <p className="text-sm text-text-muted mb-6 max-w-lg mx-auto">
              Connect your Klever wallet to start buying, selling, and collecting NFTs
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/nft">
                <button className="h-11 px-6 bg-brand-primary hover:bg-brand-primary-hover text-text-on-brand text-sm font-medium rounded-lg tr-colors">
                  Start Exploring
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="h-11 px-6 bg-bg-elevated hover:bg-overlay-hover border border-border-default hover:border-border-hover text-text-primary text-sm font-medium rounded-lg tr-colors">
                  View Dashboard
                </button>
              </Link>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
