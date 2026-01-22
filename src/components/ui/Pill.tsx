'use client';

import { ReactNode, ButtonHTMLAttributes } from 'react';

export interface PillProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /** Whether the pill is in active/selected state */
  active?: boolean;
  /** Pill content */
  children: ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Style variant */
  variant?: 'default' | 'inverted';
  /** Optional icon (displayed before children) */
  icon?: ReactNode;
}

const sizeStyles = {
  sm: 'gap-1.5 px-4 py-2 text-sm',
  md: 'gap-2 px-5 py-2 text-sm',
  lg: 'gap-2 px-6 py-2.5 text-base',
};

const variantStyles = {
  default: {
    active: 'bg-overlay-active text-text-primary border-border-active',
    inactive: 'text-text-secondary hover:text-text-primary hover:bg-overlay-default border-transparent',
  },
  inverted: {
    active: 'bg-bg-inverse text-text-inverse border-transparent',
    inactive: 'text-text-secondary hover:text-text-primary border-transparent',
  },
};

/**
 * Pill Component
 * 
 * A pill-shaped button for filters, tabs, and toggles.
 * Use for selecting between multiple options in a horizontal list.
 * 
 * @example
 * // Basic filter pills
 * <div className="flex gap-2">
 *   <Pill active={filter === 'all'} onClick={() => setFilter('all')}>All</Pill>
 *   <Pill active={filter === 'active'} onClick={() => setFilter('active')}>Active</Pill>
 * </div>
 * 
 * @example
 * // Navigation tabs with inverted style
 * <PillNavGroup>
 *   <Pill variant="inverted" active={tab === 'swap'}>Swap</Pill>
 *   <Pill variant="inverted" active={tab === 'pool'}>Pool</Pill>
 * </PillNavGroup>
 */
export function Pill({
  active = false,
  children,
  size = 'md',
  variant = 'default',
  icon,
  className = '',
  disabled,
  ...props
}: PillProps) {
  const variantStyle = variantStyles[variant];
  
  return (
    <button
      className={`
        flex items-center justify-center rounded-full font-medium 
        whitespace-nowrap transition-all flex-shrink-0 min-w-fit
        border
        ${sizeStyles[size]}
        ${active ? variantStyle.active : variantStyle.inactive}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

export interface PillGroupProps {
  /** Pill elements */
  children: ReactNode;
  /** Additional classes for the container */
  className?: string;
  /** Enable horizontal scroll on overflow */
  scrollable?: boolean;
}

/**
 * PillGroup Component
 * 
 * Container for a group of pills with proper spacing and optional horizontal scroll.
 * 
 * @example
 * <PillGroup scrollable>
 *   <Pill active>All</Pill>
 *   <Pill>Option 1</Pill>
 *   <Pill>Option 2</Pill>
 * </PillGroup>
 */
export function PillGroup({ 
  children, 
  className = '',
  scrollable = false 
}: PillGroupProps) {
  return (
    <div 
      className={`
        flex gap-2 
        ${scrollable ? 'overflow-x-auto pb-2 scrollbar-hide' : 'flex-wrap'}
        ${className}
      `}
      style={scrollable ? { scrollbarWidth: 'none', msOverflowStyle: 'none' } : undefined}
    >
      {children}
    </div>
  );
}

export interface PillNavGroupProps {
  /** Pill elements */
  children: ReactNode;
  /** Additional classes for the container */
  className?: string;
}

/**
 * PillNavGroup Component
 * 
 * Container for navigation pills with elevated background.
 * Use with variant="inverted" pills for navigation tabs.
 * 
 * @example
 * <PillNavGroup>
 *   <Pill variant="inverted" active={tab === 'swap'} onClick={() => setTab('swap')}>Swap</Pill>
 *   <Pill variant="inverted" active={tab === 'pool'} onClick={() => setTab('pool')}>Pool</Pill>
 * </PillNavGroup>
 */
export function PillNavGroup({ 
  children, 
  className = '',
}: PillNavGroupProps) {
  return (
    <div 
      className={`
        flex bg-bg-elevated rounded-full border border-border-default p-1
        ${className}
      `}
    >
      {children}
    </div>
  );
}
