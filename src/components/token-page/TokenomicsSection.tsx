'use client';

import { DonutChart, DonutChartLegend } from '@/components/ui';
import { TokenPageConfig } from './types';

interface TokenomicsSectionProps {
  config: TokenPageConfig;
}

/**
 * Tokenomics Section
 * Complete tokenomics display with donut chart and distribution breakdown
 */
export function TokenomicsSection({ config }: TokenomicsSectionProps) {
  const { tokenomics, tokenomicsDisplay } = config;
  
  return (
    <div className="bg-bg-surface rounded-xl border border-border-default overflow-hidden mb-12 md:mb-12 lg:mb-14">
      <div className="p-10 md:p-10 border-b border-border-default">
        <h2 className="text-xl md:text-2xl font-medium text-text-primary">Tokenomics</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-10 md:p-10 flex items-center justify-center border-b lg:border-b-0 lg:border-r border-border-default">
          <DonutChart
            segments={tokenomics}
            centerContent={
              <>
                <div className="text-4xl font-mono font-medium text-text-primary">
                  {tokenomicsDisplay.centerLabel}
                </div>
                <div className="text-sm text-text-muted">
                  {tokenomicsDisplay.centerSublabel}
                </div>
              </>
            }
          />
        </div>
        
        <div className="p-10 md:p-10">
          <DonutChartLegend segments={tokenomics} showPercent />
          
          <div className="mt-10 md:mt-10 pt-10 md:pt-10 border-t border-border-default grid grid-cols-2 gap-10 md:gap-8">
            <div>
              <div className="text-xs md:text-sm text-text-muted mb-4">Decimals</div>
              <div className="text-sm md:text-base font-mono text-text-primary">
                {tokenomicsDisplay.decimals}
              </div>
            </div>
            <div>
              <div className="text-xs md:text-sm text-text-muted mb-4">Vesting</div>
              <div className="text-sm md:text-base font-mono text-text-primary">
                {tokenomicsDisplay.vesting}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
