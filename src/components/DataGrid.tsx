import { ReactNode } from 'react';

/**
 * DataGridItem Component
 * 
 * A single data item card with label, value, optional subtitle, and optional action.
 * Used within DataGrid for displaying on-chain data, stats, etc.
 * 
 * @example
 * <DataGridItem
 *   label="Total Supply"
 *   value="100,000,000"
 *   subtitle="DGKO"
 * />
 * 
 * <DataGridItem
 *   label="Stakers"
 *   value="1,234"
 *   action={{ label: "View all holders →", href: "https://..." }}
 * />
 */

export interface DataGridItemProps {
  /** Label above the value */
  label: string;
  /** Main value to display (undefined shows loading dash) */
  value?: string | number;
  /** Optional subtitle below the value */
  subtitle?: string;
  /** Optional action link below value */
  action?: {
    label: string;
    href: string;
    external?: boolean;
  };
  /** Additional className for wrapper */
  className?: string;
}

export function DataGridItem({
  label,
  value,
  subtitle,
  action,
  className = '',
}: DataGridItemProps) {
  return (
    <div className={`glass rounded-xl md:rounded-2xl p-10 md:p-10 ${className}`}>
      <div className="text-xs md:text-sm text-text-secondary mb-4">{label}</div>
      <div className="text-lg font-medium font-mono text-text-primary">
        {value !== undefined ? value : '—'}
      </div>
      {subtitle && (
        <div className="text-xs text-text-muted mt-4">{subtitle}</div>
      )}
      {action && (
        <a 
          href={action.href}
          target={action.external !== false ? "_blank" : undefined}
          rel={action.external !== false ? "noopener noreferrer" : undefined}
          className="text-xs text-brand-primary hover:text-brand-primary transition-colors mt-4 block"
        >
          {action.label}
        </a>
      )}
    </div>
  );
}

/**
 * DataGrid Component
 * 
 * A section with title and grid of DataGridItems.
 * Used for on-chain data displays, supply stats, etc.
 * 
 * @example
 * // With children
 * <DataGrid title="On-Chain Data">
 *   <DataGridItem label="Total Supply" value="100,000,000" />
 *   <DataGridItem label="Circulating Supply" value="50,000,000" />
 * </DataGrid>
 * 
 * // With items prop
 * <DataGrid 
 *   title="On-Chain Data"
 *   items={[
 *     { label: "Total Supply", value: stats.totalSupply },
 *     { label: "Circulating Supply", value: stats.circulatingSupply },
 *   ]}
 * />
 */

export interface DataGridProps {
  /** Section title */
  title?: string;
  /** Number of columns (1-4) */
  columns?: 1 | 2 | 3 | 4;
  /** Items to render (alternative to children) */
  items?: DataGridItemProps[];
  /** Child DataGridItem components (alternative to items) */
  children?: ReactNode;
  /** Additional className for wrapper */
  className?: string;
}

export function DataGrid({
  title,
  columns = 3,
  items,
  children,
  className = '',
}: DataGridProps) {
  const columnStyles = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={`mb-12 md:mb-12 lg:mb-14 ${className}`}>
      {title && (
        <h2 className="text-xl md:text-2xl font-medium text-text-primary mb-5 md:mb-5">{title}</h2>
      )}
      <div className={`grid ${columnStyles[columns]} gap-10 md:gap-8`}>
        {items ? items.map((item, index) => (
          <DataGridItem key={item.label || index} {...item} />
        )) : children}
      </div>
    </div>
  );
}
