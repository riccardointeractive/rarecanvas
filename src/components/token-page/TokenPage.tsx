'use client';

import { useKlever } from '@/context/KleverContext';
import { TokenPageConfig } from './types';
import { useTokenStats } from './useTokenStats';

// Components
import { TokenPageHeader } from './TokenPageHeader';
import { StakingOverviewCard } from './StakingOverviewCard';
import { TokenActivityCards } from './TokenActivityCards';
import { TokenomicsSection } from './TokenomicsSection';
import { OnChainDataGrid } from './OnChainDataGrid';
import { EcosystemGrid } from './EcosystemGrid';
import { RoadmapSection } from './RoadmapSection';
import { TokenDetailsSection } from './TokenDetailsSection';
import { CommunitySection } from './CommunitySection';
import { CTASection } from './CTASection';

interface TokenPageProps {
  config: TokenPageConfig;
}

/**
 * Dynamic Token Page Component
 *
 * Renders a complete token page based on configuration.
 *
 * Sections displayed:
 * - Header with token info
 * - Live staking statistics
 * - Token activity (burned/minted)
 * - Tokenomics with donut chart
 * - On-chain data
 * - Ecosystem features
 * - Roadmap
 * - Token details and exchanges
 * - Community links
 * - Call-to-action
 */
export function TokenPage({ config }: TokenPageProps) {
  const { network } = useKlever();
  const { stats, loading } = useTokenStats(config.assetId, config.precision, network);

  return (
    <div className="min-h-screen py-8 md:py-10 lg:py-12">
      <div className="max-w-dashboard mx-auto px-4 md:px-6 lg:px-8">

        {/* Page Header */}
        <TokenPageHeader config={config} />

        {/* Live Staking Stats */}
        <StakingOverviewCard config={config} stats={stats} loading={loading} />

        {/* Token Activity (Burned/Minted) */}
        <TokenActivityCards config={config} stats={stats} loading={loading} />

        {/* Tokenomics with Donut Chart */}
        <TokenomicsSection config={config} />

        {/* On-Chain Data */}
        <OnChainDataGrid config={config} stats={stats} loading={loading} />

        {/* Ecosystem Features */}
        <EcosystemGrid config={config} />

        {/* Roadmap */}
        <RoadmapSection config={config} />

        {/* Token Details + Where to Trade */}
        <TokenDetailsSection config={config} />

        {/* Community / Social */}
        <CommunitySection config={config} />

        {/* CTA */}
        <CTASection config={config} />

      </div>
    </div>
  );
}
