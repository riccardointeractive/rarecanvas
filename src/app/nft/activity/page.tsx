/**
 * NFT Activity Page
 *
 * Displays marketplace activity including sales, listings, and cancellations.
 * Uses real blockchain data via TanStack Query.
 *
 * Design: Fintech Minimal with gallery-focused presentation
 * Following: PROJECT_RULES.md, DESIGN_PHILOSOPHY.md
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { MaintenanceWrapper } from '@/app/admin/maintenance';
import { useMarketplaceActivity, ActivityType, MarketplaceActivity } from '../hooks/useMarketplaceActivity';
import { formatNFTPrice } from '../config/nft.config';
import { useNetworkConfig } from '@/hooks/useNetworkConfig';

// =============================================================================
// Helper Functions
// =============================================================================

function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function shortenAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getActivityIcon(type: ActivityType) {
  switch (type) {
    case 'sale':
      return (
        <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-success" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case 'listing':
      return (
        <div className="w-8 h-8 rounded-lg bg-brand-primary/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
    case 'cancel':
      return (
        <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center">
          <svg className="w-4 h-4 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    default:
      return (
        <div className="w-8 h-8 rounded-lg bg-overlay-default flex items-center justify-center">
          <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      );
  }
}

function getActivityLabel(type: ActivityType): string {
  switch (type) {
    case 'sale':
      return 'Sale';
    case 'listing':
      return 'Listed';
    case 'cancel':
      return 'Cancelled';
    default:
      return 'Activity';
  }
}

// =============================================================================
// Components
// =============================================================================

interface ActivityRowProps {
  activity: MarketplaceActivity;
  network: string;
}

function ActivityRow({ activity, network }: ActivityRowProps) {
  const explorerUrl = network === 'testnet'
    ? `https://testnet.kleverscan.org/transaction/${activity.txHash}`
    : `https://kleverscan.org/transaction/${activity.txHash}`;

  const nftName = activity.nftName || (activity.collectionId
    ? `${activity.collectionId.split('-')[0]} #${activity.nftId}`
    : 'Unknown NFT');

  return (
    <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-bg-surface rounded-xl border border-border-default hover:border-border-hover tr-colors">
      {/* Activity Icon */}
      {getActivityIcon(activity.type)}

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-text-secondary">
            {getActivityLabel(activity.type)}
          </span>
          <span className="text-xs text-text-muted">
            {formatTimestamp(activity.timestamp)}
          </span>
        </div>

        <p className="text-sm font-medium text-text-primary truncate">
          {nftName}
        </p>

        {/* Addresses */}
        <div className="flex items-center gap-2 mt-1 text-xs text-text-muted">
          {activity.type === 'sale' && activity.seller && activity.buyer && (
            <>
              <span className="font-mono">{shortenAddress(activity.seller)}</span>
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
              <span className="font-mono">{shortenAddress(activity.buyer)}</span>
            </>
          )}
          {activity.type === 'listing' && activity.seller && (
            <span className="font-mono">by {shortenAddress(activity.seller)}</span>
          )}
          {activity.type === 'cancel' && activity.seller && (
            <span className="font-mono">by {shortenAddress(activity.seller)}</span>
          )}
        </div>
      </div>

      {/* Price */}
      {activity.price !== undefined && activity.price > 0 && (
        <div className="text-right">
          <p className="text-sm font-mono font-medium text-text-primary">
            {formatNFTPrice(activity.price, activity.currency || 'KLV')}
          </p>
        </div>
      )}

      {/* Explorer Link */}
      <a
        href={explorerUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="p-2 rounded-lg hover:bg-overlay-default tr-colors"
        title="View on KleverScan"
      >
        <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-bg-surface rounded-xl border border-border-default">
      <div className="w-8 h-8 rounded-lg bg-overlay-default animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-3 bg-overlay-default rounded animate-pulse w-24" />
        <div className="h-4 bg-overlay-default rounded animate-pulse w-40" />
        <div className="h-3 bg-overlay-default rounded animate-pulse w-32" />
      </div>
      <div className="h-4 bg-overlay-default rounded animate-pulse w-20" />
    </div>
  );
}

// =============================================================================
// Page Component
// =============================================================================

const FILTER_OPTIONS: { value: ActivityType; label: string }[] = [
  { value: 'all', label: 'All Activity' },
  { value: 'sale', label: 'Sales' },
  { value: 'listing', label: 'Listings' },
];

export default function NFTActivityPage() {
  const [filter, setFilter] = useState<ActivityType>('all');
  const { network } = useNetworkConfig();
  const { activities, loading, isFetching, error, refresh } = useMarketplaceActivity({
    type: filter,
    limit: 30,
  });

  return (
    <MaintenanceWrapper pageId="nft">
      <main className="min-h-screen py-8 md:py-12 lg:py-16">
        <div className="max-w-dashboard mx-auto px-4 md:px-6 lg:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-medium text-text-primary">
                Marketplace Activity
              </h1>
              <p className="text-sm text-text-muted mt-1">
                Recent NFT sales and listings on Klever blockchain
              </p>
            </div>

            {/* Filter & Refresh */}
            <div className="flex items-center gap-3">
              {/* Filter Tabs */}
              <div className="flex gap-1 p-1 bg-overlay-default rounded-lg border border-border-default">
                {FILTER_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`
                      px-3 py-1.5 rounded-md text-sm font-medium tr-colors
                      ${filter === option.value
                        ? 'bg-brand-primary text-text-on-brand'
                        : 'text-text-secondary hover:text-text-primary'
                      }
                    `}
                  >
                    {option.label}
                  </button>
                ))}
              </div>

              {/* Refresh Button */}
              <button
                onClick={refresh}
                disabled={isFetching}
                className="p-2 rounded-lg bg-overlay-default border border-border-default hover:bg-overlay-hover tr-colors disabled:opacity-50"
                title="Refresh"
              >
                <svg
                  className={`w-4 h-4 text-text-secondary ${isFetching ? 'animate-spin' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="bg-bg-surface rounded-2xl border border-error/30 p-6 text-center mb-6">
              <p className="text-error mb-4">{error}</p>
              <button
                onClick={refresh}
                className="px-4 py-2 rounded-lg bg-overlay-default border border-border-default text-text-primary hover:bg-overlay-active tr-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Activity List */}
          <div className="space-y-2 md:space-y-3">
            {loading ? (
              // Loading skeletons
              Array.from({ length: 10 }).map((_, i) => (
                <ActivitySkeleton key={i} />
              ))
            ) : activities.length > 0 ? (
              // Activity rows
              activities.map((activity) => (
                <ActivityRow key={activity.id} activity={activity} network={network} />
              ))
            ) : (
              // Empty state
              <div className="bg-bg-surface rounded-2xl border border-border-default p-8 md:p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-overlay-default flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
                  </svg>
                </div>
                <h3 className="text-xl font-medium text-text-primary mb-2">
                  No Activity Found
                </h3>
                <p className="text-text-secondary mb-6 max-w-md mx-auto">
                  {filter === 'all'
                    ? 'There is no marketplace activity yet. Be the first to list or buy an NFT!'
                    : filter === 'sale'
                      ? 'No sales have been recorded yet.'
                      : 'No listings have been created yet.'}
                </p>
                <Link
                  href="/nft"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-primary text-text-on-brand font-medium hover:bg-brand-primary-hover tr-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Browse NFTs
                </Link>
              </div>
            )}
          </div>

          {/* Stats Summary */}
          {!loading && activities.length > 0 && (
            <div className="mt-6 p-4 bg-overlay-subtle rounded-xl border border-border-default">
              <p className="text-sm text-text-muted text-center">
                Showing {activities.length} recent {filter === 'all' ? 'activities' : filter === 'sale' ? 'sales' : 'listings'}
              </p>
            </div>
          )}
        </div>
      </main>
    </MaintenanceWrapper>
  );
}
