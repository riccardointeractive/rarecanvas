'use client';

import { useState } from 'react';
import { useKlever } from '@/context/KleverContext';
import { EmptyStateCard } from '@/components/ui';
import { WalletTabs } from './components/WalletTabs';
import { WalletHeader } from './components/WalletHeader';
import { QuickActionsBar } from './components/QuickActionsBar';
import { AllTokenBalances } from './components/AllTokenBalances';
import { TransactionHistory } from './components/TransactionHistory';
import { MaintenanceWrapper } from '@/app/admin/maintenance';

// Wallet icon for empty state
const WalletIcon = (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
  </svg>
);

/**
 * Dashboard Page
 * 
 * Tabbed interface: Wallet | History
 * FLAT design - all sections at the same layer, no nested cards
 * Gray/white text only - no colored values
 */
export default function Dashboard() {
  const { isConnected, connect } = useKlever();
  const [activeTab, setActiveTab] = useState<'wallet' | 'history'>('wallet');

  return (
    <MaintenanceWrapper pageId="dashboard">
      <div className="py-4 md:py-8 lg:py-12">
        <div className="max-w-dashboard mx-auto px-4 md:px-6 lg:px-8">
          {/* Show connect prompt when not connected */}
          {!isConnected && (
            <div className="mb-8">
            <EmptyStateCard
              icon={WalletIcon}
              title="Connect Your Wallet"
              description="Connect your Klever wallet to view your portfolio, balances, and transaction history"
              variant="purple"
              action={{
                label: 'Connect',
                onClick: connect,
                variant: 'connect',
              }}
              secondaryAction={{
                label: "Don't have Klever Wallet?",
                href: 'https://klever.io/extension/',
              }}
            />
          </div>
        )}
        
        {/* Show content when connected */}
        {isConnected && (
          <>
            {/* Tab Navigation */}
            <WalletTabs activeTab={activeTab} onTabChange={setActiveTab} />
            
            {/* Wallet Tab Content */}
            {activeTab === 'wallet' && (
              <div className="pb-24 md:pb-8">
                {/* Wallet Header - Total value & address */}
                <WalletHeader />
                
                {/* Quick Actions Bar */}
                <QuickActionsBar />
                
                {/* Your Tokens - Full width */}
                <div className="mb-6 md:mb-8">
                  <AllTokenBalances />
                </div>
              </div>
            )}
            
            {/* History Tab Content */}
            {activeTab === 'history' && (
              <div className="pb-24 md:pb-8">
                <TransactionHistory />
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </MaintenanceWrapper>
  );
}
