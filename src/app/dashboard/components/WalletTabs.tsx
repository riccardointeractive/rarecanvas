'use client';

import { Pill, PillNavGroup } from '@/components/ui/Pill';

interface WalletTabsProps {
  activeTab: 'wallet' | 'history';
  onTabChange: (tab: 'wallet' | 'history') => void;
}

/**
 * WalletTabs Component
 * 
 * Navigation tabs for Wallet and History views.
 * - Mobile: Fixed at bottom (above nav bar)
 * - Desktop: Centered at top of page
 * 
 * Uses centralized Pill component for consistent styling.
 */
export function WalletTabs({ activeTab, onTabChange }: WalletTabsProps) {
  return (
    <>
      {/* Mobile: Fixed bottom pill */}
      <div className="md:hidden fixed bottom-bottom-nav left-0 right-0 z-40 flex justify-center pointer-events-none">
        <div className="pointer-events-auto">
          <PillNavGroup className="shadow-lg shadow-black/30">
            <Pill
              variant="inverted"
              size="sm"
              active={activeTab === 'wallet'}
              onClick={() => onTabChange('wallet')}
            >
              Wallet
            </Pill>
            <Pill
              variant="inverted"
              size="sm"
              active={activeTab === 'history'}
              onClick={() => onTabChange('history')}
            >
              History
            </Pill>
          </PillNavGroup>
        </div>
      </div>

      {/* Desktop: Top centered pill */}
      <div className="hidden md:flex justify-center py-6">
        <PillNavGroup>
          <Pill
            variant="inverted"
            size="md"
            active={activeTab === 'wallet'}
            onClick={() => onTabChange('wallet')}
          >
            Wallet
          </Pill>
          <Pill
            variant="inverted"
            size="md"
            active={activeTab === 'history'}
            onClick={() => onTabChange('history')}
          >
            History
          </Pill>
        </PillNavGroup>
      </div>
    </>
  );
}
