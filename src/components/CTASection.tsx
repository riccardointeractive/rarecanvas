import { ReactNode } from 'react';
import Link from 'next/link';

/**
 * CTASection Component - Linear Style
 * 
 * Clean call-to-action section with minimal styling.
 */

export interface CTAAction {
  href: string;
  label: string;
  icon?: ReactNode;
  external?: boolean;
}

export interface CTASectionProps {
  title: string;
  description: string;
  primaryAction: CTAAction;
  secondaryAction?: CTAAction;
  className?: string;
}

export function CTASection({
  title,
  description,
  primaryAction,
  secondaryAction,
  className = '',
}: CTASectionProps) {
  return (
    <div className={`py-20 md:py-24 border-t border-border-default ${className}`}>
      <div className="max-w-2xl mx-auto text-center">
        {/* Title - larger */}
        <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-text-primary mb-4">
          {title}
        </h2>
        
        {/* Description */}
        <p className="text-base md:text-lg text-text-muted mb-8 leading-relaxed">
          {description}
        </p>
        
        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {/* Primary button */}
          {primaryAction.external ? (
            <a 
              href={primaryAction.href} 
              target="_blank"
              rel="noopener noreferrer"
              className="h-10 px-5 bg-brand-primary hover:bg-brand-primary-hover text-text-on-brand text-sm font-medium rounded-lg transition-colors duration-150 inline-flex items-center gap-2"
            >
              {primaryAction.label}
              {primaryAction.icon || (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </a>
          ) : (
            <Link 
              href={primaryAction.href}
              className="h-10 px-5 bg-brand-primary hover:bg-brand-primary-hover text-text-on-brand text-sm font-medium rounded-lg transition-colors duration-150 inline-flex items-center gap-2"
            >
              {primaryAction.label}
              {primaryAction.icon || (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              )}
            </Link>
          )}
          
          {/* Secondary action - button style like hero */}
          {secondaryAction && (
            <Link 
              href={secondaryAction.href}
              className="h-10 px-5 bg-transparent hover:bg-bg-hover text-text-secondary hover:text-text-primary text-sm font-medium rounded-lg border border-border-default transition-colors duration-150 inline-flex items-center"
            >
              {secondaryAction.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
