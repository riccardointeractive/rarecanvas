import { ReactNode } from 'react';

/**
 * PageContainer Component
 * 
 * Standardized page wrapper for consistent layout across all pages.
 * Uses design tokens for max-width and spacing.
 * 
 * Variants:
 * - 'app': Standard app pages (swap, staking, pool, dashboard) - less padding
 * - 'content': Content pages (blog, docs, updates) - more breathing room
 * 
 * @example
 * // App page (swap, staking, etc.)
 * <PageContainer>
 *   <YourContent />
 * </PageContainer>
 * 
 * // Content page (blog, docs)
 * <PageContainer variant="content">
 *   <YourContent />
 * </PageContainer>
 */

export interface PageContainerProps {
  children: ReactNode;
  /** Page type - affects vertical padding */
  variant?: 'app' | 'content';
  /** Override max-width (use sparingly) */
  maxWidth?: 'dashboard' | 'content' | 'full';
  /** Additional className */
  className?: string;
  /** Use min-h-screen wrapper */
  fullHeight?: boolean;
}

export function PageContainer({
  children,
  variant = 'app',
  maxWidth = 'dashboard',
  className = '',
  fullHeight = true,
}: PageContainerProps) {
  // Vertical padding based on variant
  const paddingStyles = {
    app: 'py-4 md:py-8 lg:py-12',
    content: 'py-8 md:py-12 lg:py-16',
  };

  // Max-width options
  const maxWidthStyles = {
    dashboard: 'max-w-dashboard',
    content: 'max-w-4xl',
    full: 'max-w-full',
  };

  const wrapperClass = fullHeight ? 'min-h-screen' : '';
  
  return (
    <main className={`${wrapperClass} ${paddingStyles[variant]} ${className}`}>
      <div className={`${maxWidthStyles[maxWidth]} mx-auto px-4 md:px-6 lg:px-8`}>
        {children}
      </div>
    </main>
  );
}

/**
 * PageSection Component
 * 
 * Inner section wrapper for consistent content width.
 * Use inside PageContainer for narrower content sections.
 */
export interface PageSectionProps {
  children: ReactNode;
  /** Max-width for this section */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | 'full';
  /** Center the section */
  centered?: boolean;
  /** Additional className */
  className?: string;
}

export function PageSection({
  children,
  maxWidth = '5xl',
  centered = true,
  className = '',
}: PageSectionProps) {
  const maxWidthStyles = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full',
  };

  return (
    <div className={`${maxWidthStyles[maxWidth]} ${centered ? 'mx-auto' : ''} ${className}`}>
      {children}
    </div>
  );
}
