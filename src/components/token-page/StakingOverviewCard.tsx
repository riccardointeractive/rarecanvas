import { TokenStats, TokenPageConfig } from './types';

interface StakingOverviewCardProps {
  config: TokenPageConfig;
  stats: TokenStats;
  loading: boolean;
}

/**
 * Staking Overview Card
 * Displays live staking statistics for any token
 */
export function StakingOverviewCard({ config, stats, loading }: StakingOverviewCardProps) {
  return (
    <div className="bg-bg-surface rounded-xl border border-border-default p-10 md:p-10 mb-12 md:mb-12 lg:mb-14">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-10 md:mb-10">
        <h2 className="text-xl md:text-2xl font-medium text-text-primary">Staking Overview</h2>
        <span className="text-xs md:text-sm text-text-muted">
          Coming Soon
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-overlay-default rounded-xl md:rounded-2xl p-5 md:p-5">
          <div className="text-xs md:text-sm text-text-secondary mb-4">Total Staked</div>
          <div className="text-lg font-medium font-mono text-text-primary">{loading ? '—' : stats.totalStaked}</div>
          <div className="text-xs text-text-muted mt-4">{config.tokenId}</div>
        </div>
        <div className="bg-overlay-default rounded-xl md:rounded-2xl p-5 md:p-5">
          <div className="text-xs md:text-sm text-text-secondary mb-4">Staked Supply</div>
          <div className="text-lg font-medium font-mono text-text-primary">{loading ? '—' : `${stats.stakedPercent}%`}</div>
          <div className="text-xs text-text-muted mt-4">of circulating</div>
        </div>
        <div className="bg-overlay-default rounded-xl md:rounded-2xl p-5 md:p-5">
          <div className="text-xs md:text-sm text-text-secondary mb-4">APR</div>
          <div className="text-lg font-medium font-mono text-success">{loading ? '—' : `${stats.apr}%`}</div>
          <div className="text-xs text-text-muted mt-4">annual yield</div>
        </div>
        <div className="bg-overlay-default rounded-xl md:rounded-2xl p-5 md:p-5">
          <div className="text-xs md:text-sm text-text-secondary mb-4">Stakers</div>
          <div className="text-lg font-medium font-mono text-text-primary">{loading ? '—' : stats.stakingHolders.toLocaleString()}</div>
          <div className="text-xs text-text-muted mt-4">unique wallets</div>
        </div>
      </div>
    </div>
  );
}
