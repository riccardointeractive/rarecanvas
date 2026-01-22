/**
 * DeFi Pages Configuration
 * 
 * Shared configuration for core DeFi pages: Staking, Swap, Pool, History
 * Ensures visual consistency and scalability across the platform.
 * 
 * ALL VALUES ARE DESIGN TOKENS - NO HARDCODING!
 * 
 * @see docs/DESIGN_PHILOSOPHY.md for guidelines
 * @see src/config/design-tokens.ts for JS token values
 */

// ============================================================================
// LAYOUT TOKENS
// ============================================================================

/**
 * Page layout configuration
 * All spacing uses standard Tailwind classes (derived from design system)
 */
export const LAYOUT = {
  /** Maximum content width - matches dashboard */
  maxWidth: 'max-w-dashboard', // 1400px from CSS var
  
  /** Page padding */
  padding: {
    mobile: 'px-4',
    tablet: 'md:px-6',
    desktop: 'lg:px-8',
    full: 'px-4 md:px-6 lg:px-8',
  },
  
  /** Vertical spacing */
  vertical: {
    mobile: 'py-4',
    tablet: 'md:py-8',
    desktop: 'lg:py-12',
    full: 'py-4 md:py-8 lg:py-12',
  },
  
  /** Section gaps */
  sectionGap: {
    sm: 'mb-4 md:mb-6',
    md: 'mb-6 md:mb-8',
    lg: 'mb-8 md:mb-10 lg:mb-12',
    xl: 'mb-10 md:mb-12 lg:mb-14',
  },
} as const;

// ============================================================================
// GRID TOKENS
// ============================================================================

/**
 * Grid layout patterns for consistent card arrangements
 */
export const GRID = {
  /** Three column layout (for staking cards, etc) */
  threeColumn: 'grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8',
  
  /** Two column layout (for swap interface) */
  twoColumn: 'grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8',
  
  /** Stats grid */
  stats: 'grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4',
  
  /** Feature grid */
  features: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6',
} as const;

// ============================================================================
// CARD TOKENS
// ============================================================================

/**
 * Card styling configuration
 */
export const CARD = {
  /** Base card styles */
  base: 'bg-bg-surface border border-border-default rounded-xl',
  
  /** Card sizes (padding) */
  size: {
    sm: 'p-4',
    md: 'p-4 md:p-5',
    lg: 'p-5 md:p-6',
    xl: 'p-6 md:p-8',
  },
  
  /** Card border radius */
  rounded: {
    default: 'rounded-xl',
    large: 'rounded-xl md:rounded-2xl',
  },
  
  /** Hover states */
  hover: 'hover:bg-bg-elevated hover:border-border-hover transition-colors duration-base',
} as const;

// ============================================================================
// LOADING STATE TOKENS
// ============================================================================

/**
 * Loading/skeleton state styles
 */
export const LOADING = {
  /** Skeleton base */
  skeleton: 'bg-overlay-default animate-pulse',
  
  /** Card skeleton */
  card: 'bg-overlay-default animate-pulse rounded-xl',
  
  /** Text skeleton */
  text: 'bg-overlay-default animate-pulse rounded',
  
  /** Spinner */
  spinner: 'animate-spin w-8 h-8 border-2 border-brand-primary border-t-transparent rounded-full',
} as const;

// ============================================================================
// TEXT TOKENS
// ============================================================================

/**
 * Typography styles for DeFi pages
 */
export const TEXT = {
  /** Page titles */
  title: {
    primary: 'text-xl md:text-2xl font-semibold text-text-primary',
    secondary: 'text-lg md:text-xl font-semibold text-text-primary',
  },
  
  /** Section labels */
  label: {
    primary: 'text-sm font-medium text-text-primary',
    secondary: 'text-sm text-text-secondary',
    muted: 'text-xs text-text-muted',
  },
  
  /** Value display */
  value: {
    large: 'text-2xl md:text-3xl font-mono font-medium text-text-primary',
    medium: 'text-xl md:text-2xl font-mono font-medium text-text-primary',
    small: 'text-lg font-mono font-medium text-text-primary',
  },
  
  /** Inline values */
  inline: {
    primary: 'font-mono text-text-primary',
    secondary: 'font-mono text-text-secondary',
    success: 'font-mono text-success',
    error: 'font-mono text-error',
  },
} as const;

// ============================================================================
// ICON TOKENS
// ============================================================================

/**
 * Icon sizing for consistency
 */
export const ICON = {
  /** Standard sizes */
  size: {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  },
  
  /** Icon box (container) */
  box: {
    sm: 'w-8 h-8 rounded-lg bg-overlay-default flex items-center justify-center',
    md: 'w-10 h-10 rounded-xl bg-overlay-default flex items-center justify-center',
    lg: 'w-12 h-12 rounded-xl bg-overlay-default flex items-center justify-center',
  },
  
  /** Icon colors */
  color: {
    default: 'text-text-secondary',
    primary: 'text-brand-primary',
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
  },
  
  /** Stroke width for Lucide icons */
  strokeWidth: 1.5,
} as const;

// ============================================================================
// SEMANTIC VARIANTS
// ============================================================================

/**
 * Semantic color variants for status indicators
 */
export const VARIANT = {
  /** Background + border combinations */
  success: 'bg-success-muted border-border-success',
  warning: 'bg-warning-muted border-border-warning',
  error: 'bg-error-muted border-border-error',
  info: 'bg-info-muted border-border-info',
  
  /** Text colors */
  text: {
    success: 'text-success',
    warning: 'text-warning',
    error: 'text-error',
    info: 'text-brand-primary',
  },
} as const;

// ============================================================================
// PAGE WRAPPER COMPONENT STYLES
// ============================================================================

/**
 * Pre-composed class strings for common patterns
 */
export const COMPOSED = {
  /** Main page wrapper */
  pageWrapper: 'min-h-screen py-4 md:py-8 lg:py-12',
  
  /** Content container */
  container: 'max-w-dashboard mx-auto px-4 md:px-6 lg:px-8',
  
  /** Section spacing */
  section: 'mb-6 md:mb-8',
  
  /** Action card (stake, swap, etc) */
  actionCard: 'bg-bg-surface border border-border-default rounded-xl p-5 md:p-6',
  
  /** Stats card */
  statsCard: 'bg-bg-surface border border-border-default rounded-xl p-3 md:p-4',
  
  /** Empty state */
  emptyState: 'text-center py-8 md:py-12 text-text-secondary',
  
  /** Loading spinner container */
  loadingCenter: 'flex items-center justify-center py-12',
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Combine multiple class strings
 */
export function cx(...classes: (string | undefined | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get responsive classes for different breakpoints
 */
export function responsive(mobile: string, tablet?: string, desktop?: string): string {
  const classes = [mobile];
  if (tablet) classes.push(`md:${tablet}`);
  if (desktop) classes.push(`lg:${desktop}`);
  return classes.join(' ');
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type LayoutConfig = typeof LAYOUT;
export type GridConfig = typeof GRID;
export type CardConfig = typeof CARD;
export type LoadingConfig = typeof LOADING;
export type TextConfig = typeof TEXT;
export type IconConfig = typeof ICON;
export type VariantConfig = typeof VARIANT;
