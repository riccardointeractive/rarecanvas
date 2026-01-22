import { ReactNode } from 'react';

/**
 * BalanceRow Component
 * 
 * Displays a label-value pair with optional token symbol.
 * Used for showing balances, stats, and key-value pairs in cards.
 * 
 * @example
 * <BalanceRow label="Available" value="1,234.56" token="DGKO" />
 * <BalanceRow label="APY" value="10%" />
 */

export interface BalanceRowProps {
  /** Label text */
  label: string;
  /** Value to display */
  value: string | number | ReactNode;
  /** Optional token symbol */
  token?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show as highlighted/accent */
  highlight?: boolean;
  /** Additional className */
  className?: string;
}

export function BalanceRow({
  label,
  value,
  token,
  size = 'md',
  highlight = false,
  className = '',
}: BalanceRowProps) {
  const sizeStyles = {
    sm: {
      label: 'text-xs',
      value: 'text-base',
      token: 'text-xs',
    },
    md: {
      label: 'text-sm',
      value: 'text-lg md:text-xl',
      token: 'text-sm',
    },
    lg: {
      label: 'text-sm',
      value: 'text-2xl md:text-3xl',
      token: 'text-base',
    },
  };

  const styles = sizeStyles[size];

  return (
    <div className={`flex justify-between items-center p-4 bg-klever-dark rounded-xl ${className}`}>
      <span className={`text-text-secondary ${styles.label}`}>{label}</span>
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className={`balance-display font-mono tabular-nums ${highlight ? 'text-brand-primary' : 'text-text-primary'} ${styles.value}`}>
          {value}
        </span>
        {token && (
          <span className={`token-name-mobile text-text-secondary ${styles.token}`}>
            {token}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * BalanceRowGroup Component
 * 
 * Container for multiple BalanceRow components with proper spacing.
 */
export interface BalanceRowGroupProps {
  children: ReactNode;
  className?: string;
}

export function BalanceRowGroup({ children, className = '' }: BalanceRowGroupProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
}
