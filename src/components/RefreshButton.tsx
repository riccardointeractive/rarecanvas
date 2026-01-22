import { ButtonHTMLAttributes } from 'react';

/**
 * RefreshButton Component
 * 
 * A reusable refresh button with loading state and hover effects.
 * Used in staking cards, dashboard sections, and any data-refresh context.
 * 
 * @example
 * <RefreshButton onClick={fetchData} disabled={isLoading} />
 */

export interface RefreshButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Loading state */
  isLoading?: boolean;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Button title for accessibility */
  title?: string;
}

export function RefreshButton({
  isLoading = false,
  size = 'md',
  title = 'Refresh',
  disabled,
  className = '',
  onClick,
  ...props
}: RefreshButtonProps) {
  const sizeStyles = {
    sm: 'p-1.5',
    md: 'p-2',
  };

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${sizeStyles[size]} rounded-xl bg-overlay-default hover:bg-overlay-active border border-border-default hover:border-border-brand transition-all duration-150 group disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title={title}
      aria-label={title}
      {...props}
    >
      <svg 
        className={`${iconSizes[size]} text-text-secondary group-hover:text-text-primary transition-colors ${isLoading ? 'animate-spin' : ''}`} 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor" 
        strokeWidth={2}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    </button>
  );
}
