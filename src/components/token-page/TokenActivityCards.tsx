import { TokenStats, TokenPageConfig } from './types';
import { MetricCard, MetricCardGrid } from '@/components/ui';

interface TokenActivityCardsProps {
  config: TokenPageConfig;
  stats: TokenStats;
  loading: boolean;
}

/**
 * Token Activity Cards
 * Displays burned and minted token statistics using config
 */
export function TokenActivityCards({ config, stats, loading }: TokenActivityCardsProps) {
  return (
    <MetricCardGrid columns={2}>
      {config.activityMetrics.map((metric, index) => (
        <MetricCard
          key={index}
          icon={metric.icon}
          iconColor={metric.iconColor}
          label={metric.label}
          value={loading ? undefined : stats[metric.type]}
          description={metric.description}
        />
      ))}
    </MetricCardGrid>
  );
}
