import Link from 'next/link';
import { IconBox } from '@/components/ui';

interface FeatureLinkRowProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant: 'blue' | 'cyan';
  href?: string;
}

/**
 * FeatureLinkRow Component
 * 
 * Horizontal row-style card for features, guides, and documentation links.
 * Different from shared FeatureCard which is vertical with badge support.
 * 
 * Use this for compact horizontal lists (dashboard quick actions).
 * Use shared FeatureCard for vertical grid layouts.
 */
export function FeatureLinkRow({ icon, title, description, variant, href }: FeatureLinkRowProps) {
  const content = (
    <>
      <IconBox icon={icon} size="sm" variant={variant} />
      <div className="flex-1">
        <h3 className="text-base font-medium text-text-primary mb-1">
          {title}
        </h3>
        <p className="text-sm text-text-secondary leading-relaxed">
          {description}
        </p>
      </div>
      {href && (
        <svg className="w-5 h-5 text-text-muted group-hover:text-text-primary transition-colors duration-100 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      )}
    </>
  );

  if (href) {
    return (
      <Link 
        href={href}
        className="group flex items-center gap-4 p-4 rounded-xl bg-overlay-default hover:bg-overlay-active border border-border-default hover:border-border-brand transition-all duration-150 cursor-pointer"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="group flex items-center gap-4 p-4 rounded-xl bg-overlay-default border border-border-default">
      {content}
    </div>
  );
}
