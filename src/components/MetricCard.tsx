import { ReactNode } from 'react';

/**
 * MetricCard Component
 * 
 * A card displaying a metric with icon, label, value, and optional description.
 * Used for token activity cards (burned/minted), stats summaries, etc.
 * 
 * @example
 * // Basic usage
 * <MetricCard
 *   icon={<FireIcon />}
 *   iconColor="red"
 *   label="Total Burned"
 *   value="1,234,567"
 *   description="DGKO tokens permanently removed from circulation"
 * />
 * 
 * // With loading state
 * <MetricCard
 *   icon={<PlusIcon />}
 *   iconColor="blue"
 *   label="Total Minted"
 *   value={loading ? undefined : stats.minted}
 *   description="DGKO tokens created since launch"
 * />
 */

export interface MetricCardProps {
  /** Icon element */
  icon: ReactNode;
  /** Icon background color variant */
  iconColor?: 'blue' | 'cyan' | 'purple' | 'red' | 'green' | 'gray';
  /** Metric label */
  label: string;
  /** Metric value (undefined shows loading dash) */
  value?: string | number;
  /** Optional description below the value */
  description?: string;
  /** Additional className for wrapper */
  className?: string;
}

export function MetricCard({
  icon,
  iconColor = 'blue',
  label,
  value,
  description,
  className = '',
}: MetricCardProps) {
  const iconColorStyles = {
    blue: 'bg-overlay-active text-text-primary',
    cyan: 'bg-info-muted text-info',
    purple: 'bg-brand-primary/10 text-brand-primary',
    red: 'bg-error-muted text-error',
    green: 'bg-success-muted text-success',
    gray: 'bg-neutral-muted text-text-secondary',
  };

  return (
    <div className={`glass rounded-xl md:rounded-2xl p-10 md:p-10 ${className}`}>
      <div className="flex items-center gap-2 md:gap-3 mb-5 md:mb-5">
        <div className={`w-9 h-9 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center ${iconColorStyles[iconColor]}`}>
          {icon}
        </div>
        <div>
          <div className="text-xs md:text-sm text-text-secondary">{label}</div>
          <div className="text-base font-medium font-mono text-text-primary">
            {value !== undefined ? value : '—'}
          </div>
        </div>
      </div>
      {description && (
        <p className="text-xs md:text-sm text-text-muted">{description}</p>
      )}
    </div>
  );
}

/**
 * MetricCardGrid Component
 * 
 * Grid container for MetricCards with consistent responsive layout.
 * 
 * @example
 * <MetricCardGrid columns={2}>
 *   <MetricCard ... />
 *   <MetricCard ... />
 * </MetricCardGrid>
 */

export interface MetricCardGridProps {
  /** Child MetricCard components */
  children: ReactNode;
  /** Number of columns (1-4) */
  columns?: 1 | 2 | 3 | 4;
  /** Additional className for wrapper */
  className?: string;
}

export function MetricCardGrid({
  children,
  columns = 2,
  className = '',
}: MetricCardGridProps) {
  const columnStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`grid ${columnStyles[columns]} gap-10 md:gap-8 mb-12 md:mb-12 lg:mb-14 ${className}`}>
      {children}
    </div>
  );
}
