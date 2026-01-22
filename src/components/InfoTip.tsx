import { ReactNode } from 'react';

/**
 * InfoTip Component
 * 
 * An informational tip/note box with an icon.
 * Used to display helpful information, warnings, or tips in context.
 * 
 * @example
 * <InfoTip>Rewards accumulate automatically while staking.</InfoTip>
 * <InfoTip variant="warning">This action cannot be undone.</InfoTip>
 */

export interface InfoTipProps {
  /** Content to display */
  children: ReactNode;
  /** Variant style */
  variant?: 'info' | 'warning' | 'success' | 'neutral';
  /** Custom icon (overrides variant icon) */
  icon?: ReactNode;
  /** Additional className */
  className?: string;
}

export function InfoTip({
  children,
  variant = 'info',
  icon,
  className = '',
}: InfoTipProps) {
  const variantStyles = {
    info: {
      bg: 'bg-overlay-default',
      border: 'border-border-default',
      iconColor: 'text-text-secondary',
    },
    warning: {
      bg: 'bg-warning-muted',
      border: 'border-border-warning',
      iconColor: 'text-yellow-500',
    },
    success: {
      bg: 'bg-success-muted',
      border: 'border-border-success',
      iconColor: 'text-green-500',
    },
    neutral: {
      bg: 'bg-overlay-default',
      border: 'border-border-default',
      iconColor: 'text-text-secondary',
    },
  };

  const styles = variantStyles[variant];

  const defaultIcons = {
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    neutral: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div className={`p-4 ${styles.bg} rounded-xl border ${styles.border} ${className}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${styles.iconColor}`}>
          {icon || defaultIcons[variant]}
        </div>
        <div className="text-sm text-text-primary leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
