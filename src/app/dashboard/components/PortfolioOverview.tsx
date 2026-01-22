'use client';

import { usePortfolioStats } from '../hooks/usePortfolioStats';

export function PortfolioOverview() {
  const { stats, loading, refetch } = usePortfolioStats();

  if (loading) {
    return (
      <div className="bg-bg-surface rounded-2xl md:rounded-3xl p-5 md:p-6 lg:p-8 border border-border-default">
        <div className="animate-pulse">
          <div className="h-3 md:h-4 bg-overlay-active rounded w-32 mb-3 md:mb-4"></div>
          <div className="h-8 md:h-10 bg-overlay-active rounded w-48 mb-2"></div>
          <div className="h-3 md:h-4 bg-overlay-active rounded w-24"></div>
        </div>
      </div>
    );
  }

  // Note: isPositive will be used when 24h change feature is re-enabled
  // const isPositive = stats.change24h >= 0;

  return (
    <div className="bg-bg-surface rounded-2xl md:rounded-3xl p-5 md:p-6 lg:p-8 border border-border-default">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4 md:mb-5 lg:mb-6">
        <h3 className="text-xs md:text-sm font-medium text-text-secondary">Your DGKO and BABYDGKO worth</h3>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success"></div>
            <span className="text-xs text-text-secondary">Live</span>
          </div>
          <button
            onClick={refetch}
            disabled={loading}
            className="p-2 rounded-xl bg-overlay-default hover:bg-overlay-active border border-border-default hover:border-border-brand transition-all duration-150 group disabled:opacity-50"
            title="Refresh portfolio"
          >
            <svg className="w-4 h-4 md:w-5 md:h-5 text-text-secondary group-hover:text-text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>
      <div className="mb-3 md:mb-4">
        <div className="text-2xl md:text-3xl font-medium font-mono text-text-primary mb-2">
          ${stats.totalValueUSD.toFixed(2)}
        </div>
        {/* 24h change - Hidden, working on it next week */}
        {/* <div className="flex items-center gap-2">
          <span className={`text-sm font-mono ${isPositive ? 'text-success' : 'text-error'}`}>
            {isPositive ? '+' : ''}{stats.change24h.toFixed(2)} USD
          </span>
          <span className={`text-xs px-2 py-1 rounded ${isPositive ? 'bg-success-muted text-success' : 'bg-error-muted text-error'}`}>
            {isPositive ? '+' : ''}{stats.change24hPercent.toFixed(2)}%
          </span>
          <span className="text-xs text-text-muted">24h</span>
        </div> */}
      </div>
      <div className="grid grid-cols-2 gap-3 md:gap-4 pt-3 md:pt-4 border-t border-border-default">
        <div>
          <div className="text-xs text-text-secondary mb-1">Assets</div>
          <div className="text-sm md:text-base font-mono font-semibold text-text-primary">{stats.totalAssets}</div>
        </div>
        <div>
          <div className="text-xs text-text-secondary mb-1">Network</div>
          <div className="text-sm md:text-base font-semibold text-text-primary">Klever</div>
        </div>
      </div>
      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-border-default">
        <div className="text-xs text-text-muted">Last updated: {new Date().toLocaleTimeString()}</div>
      </div>
    </div>
  );
}
