/**
 * NFT Collections Page
 * 
 * Browse all NFT collections with marketplace activity.
 * Shows collection cards with floor price, items, and other stats.
 * 
 * Design: Fintech Minimal with gallery-focused presentation
 */

'use client';

import Link from 'next/link';
import { MaintenanceWrapper } from '@/app/admin/maintenance';
import { useCollections } from '../hooks/useCollections';
import { CollectionCard, CollectionCardSkeleton } from '../components/CollectionCard';

export default function CollectionsPage() {
  const { collections, loading, error, refresh } = useCollections();

  return (
    <MaintenanceWrapper pageId="nft">
      <main className="min-h-screen py-8 md:py-12 lg:py-16">
        <div className="max-w-dashboard mx-auto px-4 md:px-6 lg:px-8">
          
          {/* Header */}
          <div className="mb-8 md:mb-12">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-text-muted mb-4">
              <Link href="/nft" className="hover:text-text-primary transition-colors">
                Marketplace
              </Link>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-text-primary">Collections</span>
            </div>

            {/* Title */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-semibold text-text-primary mb-2">
                  NFT Collections
                </h1>
                <p className="text-text-secondary text-sm md:text-base">
                  Browse {collections.length > 0 ? `${collections.length} collections` : 'collections'} with active marketplace listings
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={refresh}
                  disabled={loading}
                  className="
                    p-2.5 rounded-xl glass border border-border-default
                    text-text-secondary hover:text-text-primary hover:border-border-active
                    transition-all duration-100 disabled:opacity-50
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

                <Link
                  href="/nft"
                  className="
                    px-4 py-2.5 rounded-xl glass border border-border-default
                    text-text-secondary hover:text-text-primary hover:border-border-active
                    transition-all duration-100 text-sm font-medium
                  "
                >
                  View All NFTs
                </Link>
              </div>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="glass rounded-2xl p-6 text-center mb-8">
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

          {/* Collections Grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <CollectionCardSkeleton key={i} />
              ))}
            </div>
          ) : collections.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6">
              {collections.map((collection) => (
                <CollectionCard
                  key={collection.assetId}
                  collection={collection}
                  showStats={true}
                />
              ))}
            </div>
          ) : (
            <div className="glass rounded-2xl p-8 md:p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-overlay-default flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-text-primary mb-2">
                No Collections Found
              </h3>
              <p className="text-text-secondary mb-6 max-w-md mx-auto">
                There are no collections with active marketplace listings at the moment.
              </p>
              <Link
                href="/nft"
                className="
                  inline-flex items-center gap-2 px-6 py-3 rounded-xl
                  bg-brand-primary text-text-primary font-medium
                  hover:bg-brand-primary/90 transition-colors
                "
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Browse All NFTs
              </Link>
            </div>
          )}

        </div>
      </main>
    </MaintenanceWrapper>
  );
}
