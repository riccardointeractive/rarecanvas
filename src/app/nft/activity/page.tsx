/**
 * NFT Activity Page
 *
 * Displays marketplace activity including sales, listings, and transfers.
 *
 * Design: Fintech Minimal with gallery-focused presentation
 * Following: PROJECT_RULES.md, DESIGN_PHILOSOPHY.md
 */

'use client';

import { MaintenanceWrapper } from '@/app/admin/maintenance';
import { EmptyStateCard } from '@/components/EmptyStateCard';

/**
 * NFT Activity Page Component
 */
export default function NFTActivityPage() {
  return (
    <MaintenanceWrapper pageId="nft">
      <main className="min-h-screen py-8 md:py-12 lg:py-16">
        <div className="max-w-dashboard mx-auto px-4 md:px-6 lg:px-8">

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

        </div>
      </main>
    </MaintenanceWrapper>
  );
}
