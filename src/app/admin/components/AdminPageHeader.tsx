'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

/**
 * AdminPageHeader Component
 * 
 * Standardized page header for admin panel pages.
 * Provides consistent styling for titles, descriptions, back buttons, and action areas.
 * 
 * USAGE PATTERN:
 * - Top-level pages (Overview, Maintenance, etc.): No back button
 * - Child pages under dropdowns (Add Pair, Edit Pair, etc.): Include back button
 * 
 * @example
 * // Top-level page (no back button)
 * <AdminPageHeader
 *   title="DEX Contract Overview"
 *   description="Multi-pair DEX V2 smart contract status"
 *   actions={<RefreshButton onClick={handleRefresh} isLoading={loading} />}
 * />
 * 
 * @example
 * // Child page with back button
 * <AdminPageHeader
 *   title="Add Trading Pair"
 *   description="Create a new trading pair on the DEX V2 contract"
 *   backHref="/admin/contracts/overview"
 *   backLabel="Back to Overview"
 *   badge={isTestnet ? { label: 'Testnet', variant: 'warning' } : undefined}
 * />
 * 
 * @example
 * // With icon in title
 * <AdminPageHeader
 *   title="Claim Fees"
 *   titleIcon={<TrendingUp className="w-7 h-7 text-success" />}
 *   description="Withdraw accumulated trading fees"
 *   backHref="/admin/contracts/overview"
 * />
 */

export interface AdminPageHeaderBadge {
  label: string;
  variant?: 'default' | 'warning' | 'success' | 'error';
}

export interface AdminPageHeaderProps {
  /** Page title */
  title: string;
  /** Optional icon displayed before title */
  titleIcon?: ReactNode;
  /** Page description */
  description?: string;
  /** URL to navigate back to (shows back button if provided) */
  backHref?: string;
  /** Custom back button label (default: "Back") */
  backLabel?: string;
  /** Use router.back() instead of navigating to backHref */
  useRouterBack?: boolean;
  /** Optional badge next to title */
  badge?: AdminPageHeaderBadge;
  /** Action elements (buttons, etc.) displayed on the right */
  actions?: ReactNode;
  /** Additional className for wrapper */
  className?: string;
}

export function AdminPageHeader({
  title,
  titleIcon,
  description,
  backHref,
  backLabel = 'Back',
  useRouterBack = false,
  badge,
  actions,
  className = '',
}: AdminPageHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (useRouterBack) {
      router.back();
    } else if (backHref) {
      router.push(backHref);
    }
  };

  const showBackButton = backHref || useRouterBack;

  const getBadgeClasses = (variant: AdminPageHeaderBadge['variant'] = 'default') => {
    const variants = {
      default: 'bg-blue-500/20 text-info border-blue-500/30',
      warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
      success: 'bg-green-500/20 text-success border-green-500/30',
      error: 'bg-red-500/20 text-error border-red-500/30',
    };
    return variants[variant];
  };

  return (
    <div className={`mb-8 ${className}`}>
      {/* Back Button */}
      {showBackButton && (
        <button
          onClick={handleBack}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">{backLabel}</span>
        </button>
      )}

      {/* Header Row */}
      <div className="flex items-start justify-between gap-4">
        {/* Left: Title and Description */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Title with optional icon */}
            <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-3">
              {titleIcon}
              {title}
            </h1>
            
            {/* Badge */}
            {badge && (
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getBadgeClasses(badge.variant)}`}>
                {badge.label}
              </span>
            )}
          </div>
          
          {/* Description */}
          {description && (
            <p className="text-text-secondary mt-1.5">{description}</p>
          )}
        </div>

        {/* Right: Actions */}
        {actions && (
          <div className="flex items-center gap-3 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}
