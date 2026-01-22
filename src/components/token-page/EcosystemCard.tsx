import Link from 'next/link';
import { IconBox, StatusBadge } from '@/components/ui';
import { EcosystemFeature } from './types';

/**
 * Ecosystem Card
 * Individual ecosystem feature card (live or coming soon)
 */
export function EcosystemCard({ icon, title, description, status, href }: EcosystemFeature) {
  const isLive = status === 'live';
  const cardContent = (
    <>
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <IconBox icon={icon} size="sm" />
        <StatusBadge 
          status={isLive ? 'active' : 'inactive'} 
          label={isLive ? 'Live' : 'Soon'} 
        />
      </div>
      <h3 className="text-sm md:text-base font-medium text-text-primary mb-1">{title}</h3>
      <p className="text-xs md:text-sm text-text-secondary mb-3 md:mb-4">{description}</p>
      <div className={`text-xs md:text-sm ${isLive ? 'text-brand-primary' : 'text-text-muted'}`}>
        {isLive ? 'Open →' : 'Coming soon'}
      </div>
    </>
  );

  const baseClasses = `bg-bg-surface rounded-xl p-4 md:p-5 lg:p-6 border transition-all duration-150 block ${
    isLive 
      ? 'border-border-success hover:border-border-success cursor-pointer' 
      : 'border-border-default opacity-70 cursor-not-allowed'
  }`;

  if (href && isLive) {
    return (
      <Link href={href} className={baseClasses}>
        {cardContent}
      </Link>
    );
  }

  return (
    <div className={baseClasses}>
      {cardContent}
    </div>
  );
}
