import { TokenStats, TokenPageConfig } from './types';
import { DataGrid, DataGridItem } from '@/components/ui';

interface OnChainDataGridProps {
  config: TokenPageConfig;
  stats: TokenStats;
  loading: boolean;
}

/**
 * On-Chain Data Grid
 * Displays on-chain token data in a configurable grid layout
 */
export function OnChainDataGrid({ config, stats, loading }: OnChainDataGridProps) {
  const { onChainData, assetId } = config;
  const labels = onChainData.labels || {};
  
  // Map metric types to their values and default labels
  const metricMap: Record<string, { value: string; defaultLabel: string }> = {
    totalSupply: { 
      value: stats.totalSupply, 
      defaultLabel: 'Total Supply' 
    },
    circulatingSupply: { 
      value: stats.circulatingSupply, 
      defaultLabel: 'Circulating Supply' 
    },
    totalStaked: { 
      value: stats.totalStaked, 
      defaultLabel: 'Total Staked' 
    },
    stakedPercent: { 
      value: `${stats.stakedPercent}%`, 
      defaultLabel: 'Staked %' 
    },
    stakingHolders: { 
      value: stats.stakingHolders.toLocaleString(), 
      defaultLabel: 'Stakers' 
    },
  };

  // Determine which item should have the action (last one)
  const lastMetricIndex = onChainData.metrics.length - 1;

  return (
    <DataGrid title="On-Chain Data" columns={onChainData.columns}>
      {onChainData.metrics.map((metric, index) => {
        const metricData = metricMap[metric];
        if (!metricData) return null;
        const isLast = index === lastMetricIndex;
        
        return (
          <DataGridItem
            key={metric}
            label={labels[metric] || metricData.defaultLabel}
            value={loading ? undefined : metricData.value}
            action={isLast ? {
              label: "View all holders →",
              href: `https://kleverscan.org/asset/${assetId}`,
              external: true,
            } : undefined}
          />
        );
      })}
    </DataGrid>
  );
}
