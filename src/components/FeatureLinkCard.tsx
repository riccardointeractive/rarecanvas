import { ReactNode } from 'react';
import Link from 'next/link';

/**
 * FeatureLinkCard Component - Linear Style
 * 
 * Clean, minimal feature card with subtle hover effects.
 */

export interface FeatureLinkCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  href?: string;
  linkText?: string;
  links?: Array<{ href: string; label: string }>;
  iconVariant?: 'blue' | 'cyan' | 'purple' | 'gray';
  badge?: ReactNode;
  disabled?: boolean;
  className?: string;
}

export function FeatureLinkCard({
  icon,
  title,
  description,
  href,
  linkText,
  links,
  iconVariant: _iconVariant = 'blue',
  badge,
  disabled = false,
  className = '',
}: FeatureLinkCardProps) {
  
  // Icon color - always brand blue, muted when disabled
  const iconColorClass = disabled ? 'text-text-muted' : 'text-brand-primary';

  const content = (
    <>
      {/* Icon */}
      <div className={`mb-4 ${iconColorClass}`}>
        <div className="w-10 h-10 flex items-center justify-center">
          {icon}
        </div>
      </div>
      
      {/* Title + Badge */}
      <div className="flex items-center gap-3 mb-2">
        <h3 className="text-base font-medium text-text-primary">
          {title}
        </h3>
        {badge}
      </div>
      
      {/* Description */}
      <p className="text-sm text-text-secondary leading-relaxed mb-4">
        {description}
      </p>
      
      {/* Single link */}
      {href && linkText && !links && (
        <div className="flex items-center gap-1.5 text-sm text-brand-primary">
          <span>{linkText}</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      )}
      
      {/* Multiple links */}
      {links && links.length > 0 && (
        <div className="flex items-center gap-4">
          {links.map((link, index) => (
            <Link 
              key={index}
              href={link.href} 
              className="flex items-center gap-1.5 text-sm text-brand-primary hover:text-text-primary transition-colors"
            >
              <span>{link.label}</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </>
  );

  const cardClasses = `
    p-6 rounded-xl
    border border-border-default
    bg-bg-surface
    transition-colors duration-150
    ${disabled ? 'opacity-50' : 'hover:bg-bg-elevated hover:border-border-hover'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  if (href && !disabled) {
    return (
      <Link href={href} className={`block ${cardClasses}`}>
        {content}
      </Link>
    );
  }

  return (
    <div className={cardClasses}>
      {content}
    </div>
  );
}
