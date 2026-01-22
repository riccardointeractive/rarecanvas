/**
 * StatsGrid Component
 * 
 * Display statistics in a responsive grid with glass morphism cards.
 * Used on homepage hero and other summary sections.
 * 
 * @example
 * <StatsGrid items={[
 *   { value: '6', label: 'Core Products' },
 *   { value: '2', label: 'Native Tokens' },
 *   { value: '10%', label: 'Staking APR' },
 * ]} />
 */

export interface StatItem {
  /** The main value to display */
  value: string | number;
  /** Label describing the value */
  label: string;
}

export interface StatsGridProps {
  /** Array of stat items to display */
  items: StatItem[];
  /** Number of columns (defaults to items length, max 4) */
  columns?: 2 | 3 | 4;
  /** Max width constraint */
  maxWidth?: 'sm' | 'md' | 'lg' | 'full';
  /** Additional className */
  className?: string;
}

export function StatsGrid({
  items,
  columns,
  maxWidth = 'lg',
  className = '',
}: StatsGridProps) {
  // Determine column count
  const colCount = columns || Math.min(items.length, 4) as 2 | 3 | 4;

  const columnStyles = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  };

  const maxWidthStyles = {
    sm: 'max-w-xl',
    md: 'max-w-2xl',
    lg: 'max-w-3xl',
    full: 'max-w-full',
  };

  return (
    <div className={`grid grid-cols-1 ${columnStyles[colCount]} gap-4 md:gap-6 lg:gap-8 ${maxWidthStyles[maxWidth]} mx-auto ${className}`}>
      {items.map((item, index) => (
        <div 
          key={index}
          className="text-center p-4 md:p-5 lg:p-6 rounded-2xl bg-bg-surface hover:bg-bg-elevated border border-border-default hover:border-border-hover transition-all duration-150"
        >
          <div className="text-2xl md:text-3xl font-medium font-mono font-medium text-text-primary mb-2">
            {item.value}
          </div>
          <div className="text-xs md:text-sm text-text-muted">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  );
}
