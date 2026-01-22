import { ReactNode } from 'react';

/**
 * PageHeader Component
 * 
 * Page header with optional icon/image and description.
 * Used for token pages and other landing pages.
 * 
 * @example
 * // With token image
 * <PageHeader
 *   icon={<TokenImage assetId="DGKO-AB12" size="xl" />}
 *   title="DGKO Token"
 *   description="The native utility token powering the Rare Canvas ecosystem"
 * />
 * 
 * // With custom icon
 * <PageHeader
 *   icon={<IconBox icon={<StarIcon />} variant="blue" size="lg" />}
 *   title="Dashboard"
 *   description="Your complete portfolio overview"
 * />
 * 
 * // Simple header
 * <PageHeader
 *   title="Documentation"
 *   description="Learn how to use the Rare Canvas platform"
 * />
 */

export interface PageHeaderProps {
  /** Optional icon or image element (e.g., TokenImage, IconBox) */
  icon?: ReactNode;
  /** Page title */
  title: string;
  /** Optional tagline (appears after title) */
  tagline?: string;
  /** Page description */
  description: string;
  /** Additional className for wrapper */
  className?: string;
}

export function PageHeader({
  icon,
  title,
  tagline,
  description,
  className = '',
}: PageHeaderProps) {
  return (
    <div className={`mb-12 md:mb-12 lg:mb-14 ${className}`}>
      <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-5">
        {icon}
        <div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-text-primary">{title}</h1>
          {tagline && (
            <p className="text-sm md:text-base text-brand-primary mt-1">{tagline}</p>
          )}
        </div>
      </div>
      <p className="text-base md:text-lg text-text-secondary">
        {description}
      </p>
    </div>
  );
}
