import { ReactNode } from 'react';
import Link from 'next/link';
import { IconBox } from './IconBox';

/**
 * GuideItem Component
 * 
 * A reusable horizontal guide/feature item with icon, title, and description.
 * Used for quick guides, feature lists, step indicators, etc.
 * 
 * @example
 * <GuideItem
 *   icon={<ZapIcon />}
 *   title="View Dashboard"
 *   description="Manage your digital assets"
 *   variant="cyan"
 *   href="/dashboard"
 * />
 */

export interface GuideItemProps {
  /** Icon to display */
  icon: ReactNode;
  /** Item title */
  title: string;
  /** Item description */
  description: string;
  /** IconBox color variant */
  variant?: 'blue' | 'cyan' | 'purple' | 'gray';
  /** Optional link */
  href?: string;
  /** IconBox size */
  iconSize?: 'sm' | 'md' | 'lg';
  /** Additional className */
  className?: string;
}

export function GuideItem({
  icon,
  title,
  description,
  variant = 'blue',
  href,
  iconSize = 'sm',
  className = '',
}: GuideItemProps) {
  const content = (
    <>
      <IconBox icon={icon} size={iconSize} variant={variant} />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm md:text-base text-text-primary font-medium mb-1">{title}</h3>
        <p className="text-xs md:text-sm text-text-secondary leading-relaxed">{description}</p>
      </div>
      {href && (
        <svg 
          className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors duration-100 flex-shrink-0" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor" 
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </>
  );

  if (href) {
    return (
      <Link 
        href={href}
        className={`group flex items-start gap-3 md:gap-4 p-3 md:p-4 rounded-xl bg-overlay-default hover:bg-overlay-active border border-border-default hover:border-border-brand transition-all duration-150 ${className}`}
      >
        {content}
      </Link>
    );
  }

  return (
    <div className={`group flex items-start gap-3 md:gap-4 ${className}`}>
      {content}
    </div>
  );
}

/**
 * GuideItemList Component
 * 
 * A container for GuideItems with consistent grid layout.
 * 
 * @example
 * <GuideItemList items={guideItems} columns={2} />
 */

export interface GuideItemListProps {
  /** Array of GuideItem props */
  items: GuideItemProps[];
  /** Number of columns on desktop */
  columns?: 1 | 2 | 3;
  /** Add card styling to items */
  asCards?: boolean;
  /** Additional className */
  className?: string;
}

export function GuideItemList({
  items,
  columns = 2,
  asCards = false,
  className = '',
}: GuideItemListProps) {
  const columnStyles = {
    1: 'md:grid-cols-1',
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
  };

  return (
    <div className={`grid gap-4 md:gap-5 lg:gap-6 ${columnStyles[columns]} ${className}`}>
      {items.map((item, index) => (
        <GuideItem 
          key={index} 
          {...item}
          className={asCards ? 'p-4 rounded-xl bg-overlay-default border border-border-default' : ''}
        />
      ))}
    </div>
  );
}
