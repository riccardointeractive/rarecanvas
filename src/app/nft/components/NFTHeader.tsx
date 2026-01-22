/**
 * NFTHeader Component
 * 
 * Page header for the NFT marketplace with tab navigation.
 * Follows fintech minimal design territory with gallery focus.
 */

import Link from 'next/link';
import { MarketplaceTab } from '../types/nft.types';
import { MARKETPLACE_TABS } from '../config/nft.config';

interface NFTHeaderProps {
  activeTab: MarketplaceTab;
  onTabChange: (tab: MarketplaceTab) => void;
  totalListings?: number;
}

const TabIcon = ({ icon }: { icon: string }) => {
  switch (icon) {
    case 'compass':
      return (
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2a10 10 0 100 20 10 10 0 000-20zM9.356 9.356l5.288-1.65-1.65 5.288-5.288 1.65 1.65-5.288z" />
        </svg>
      );
    case 'wallet':
      return (
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
        </svg>
      );
    case 'activity':
      return (
        <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      );
    default:
      return null;
  }
};

export function NFTHeader({ activeTab, onTabChange, totalListings }: NFTHeaderProps) {
  return (
    <div className="mb-8 md:mb-10 lg:mb-12">
      {/* Title and Description */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3 md:gap-4 mb-4">
          {/* NFT Icon */}
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-brand-primary/10 border border-border-default flex items-center justify-center">
            <svg className="w-6 h-6 md:w-7 md:h-7 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-text-primary">NFT Marketplace</h1>
            {totalListings !== undefined && (
              <p className="text-xs md:text-sm text-text-secondary mt-1">
                {totalListings.toLocaleString()} items listed
              </p>
            )}
          </div>
        </div>
        <p className="text-sm md:text-base text-text-secondary max-w-2xl">
          Discover, collect, and trade unique digital assets on the Klever blockchain. 
          Browse collections, view your NFTs, and track marketplace activity.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 p-1 bg-overlay-default rounded-xl border border-border-default">
          {MARKETPLACE_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-lg font-medium text-sm md:text-base
                transition-all duration-100
                ${activeTab === tab.id
                  ? 'bg-brand-primary text-text-primary shadow-lg shadow-brand-primary/20'
                  : 'text-text-secondary hover:text-text-primary hover:bg-overlay-default'
                }
              `}
            >
              <TabIcon icon={tab.icon} />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Collections Link */}
        <Link
          href="/nft/collections"
          className="
            flex items-center gap-2 px-4 py-2.5 md:px-5 md:py-3 rounded-xl
            glass border border-border-default text-text-secondary
            hover:text-text-primary hover:border-border-active hover:bg-overlay-default
            transition-all duration-100 text-sm md:text-base font-medium
          "
        >
          <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="hidden sm:inline">Collections</span>
        </Link>
      </div>
    </div>
  );
}
