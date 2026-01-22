import { ReactNode } from 'react';
import Link from 'next/link';
import { Button } from './Button';

/**
 * EmptyStateCard Component
 *
 * A reusable empty state card for prompting user action.
 * Features a gradient accent, floating icon, and modern layout.
 *
 * @example
 * <EmptyStateCard
 *   icon={<WalletIcon />}
 *   title="Connect Your Wallet"
 *   description="Connect to start managing your digital assets"
 *   action={{ label: 'Connect Wallet', onClick: connect }}
 *   variant="purple"
 * />
 */

export interface EmptyStateCardProps {
  /** Icon to display */
  icon?: ReactNode;
  /** Main title */
  title: string;
  /** Description text */
  description?: string;
  /** Primary action button */
  action?: {
    label: string;
    onClick?: () => void;
    href?: string;
    icon?: ReactNode;
    variant?: 'primary' | 'secondary' | 'connect';
  };
  /** Secondary action link */
  secondaryAction?: {
    label: string;
    href: string;
  };
  /** Color variant for accent */
  variant?: 'purple' | 'cyan' | 'pink' | 'emerald';
  /** Additional children below the actions */
  children?: ReactNode;
  /** Additional className */
  className?: string;
}

export function EmptyStateCard({
  icon,
  title,
  description,
  action,
  secondaryAction,
  variant = 'purple',
  children,
  className = '',
}: EmptyStateCardProps) {
  // Gradient and accent styles based on variant (using design tokens)
  // Subtle gradients - just a hint of color
  const variantStyles = {
    purple: {
      gradient: 'from-brand-primary/8 via-transparent to-transparent',
      iconBg: 'bg-brand-primary/10',
      iconBorder: 'border-brand-primary/20',
      iconColor: 'text-brand-primary',
      accentDot: 'bg-brand-primary',
    },
    cyan: {
      gradient: 'from-accent-cyan/8 via-transparent to-transparent',
      iconBg: 'bg-accent-cyan/10',
      iconBorder: 'border-accent-cyan/20',
      iconColor: 'text-accent-cyan',
      accentDot: 'bg-accent-cyan',
    },
    pink: {
      gradient: 'from-accent-pink/8 via-transparent to-transparent',
      iconBg: 'bg-accent-pink/10',
      iconBorder: 'border-accent-pink/20',
      iconColor: 'text-accent-pink',
      accentDot: 'bg-accent-pink',
    },
    emerald: {
      gradient: 'from-accent-emerald/8 via-transparent to-transparent',
      iconBg: 'bg-accent-emerald/10',
      iconBorder: 'border-accent-emerald/20',
      iconColor: 'text-accent-emerald',
      accentDot: 'bg-accent-emerald',
    },
  };

  const styles = variantStyles[variant];

  return (
    <div className={`relative overflow-hidden rounded-2xl md:rounded-3xl bg-bg-surface border border-border-default ${className}`}>
      {/* Gradient background accent */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient} pointer-events-none`} />

      {/* Content */}
      <div className="relative p-6 md:p-10 lg:p-12">
        <div className="flex flex-col items-center text-center max-w-md mx-auto">

          {/* Icon */}
          {icon && (
            <div className="relative mb-6">
              {/* Icon container */}
              <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${styles.iconBg} border ${styles.iconBorder} flex items-center justify-center ${styles.iconColor}`}>
                <div className="w-8 h-8 md:w-10 md:h-10 [&>svg]:w-full [&>svg]:h-full">
                  {icon}
                </div>
              </div>
            </div>
          )}

          {/* Title */}
          <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-text-primary mb-3">
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p className="text-sm md:text-base text-text-secondary leading-relaxed mb-8">
              {description}
            </p>
          )}

          {/* Primary Action */}
          {action && (
            <div className="w-full max-w-xs">
              {action.href ? (
                <Link href={action.href} className="block">
                  <Button
                    variant={action.variant || 'primary'}
                    size="lg"
                    className="w-full justify-center"
                  >
                    {action.icon}
                    {action.label}
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={action.onClick}
                  variant={action.variant || 'connect'}
                  size="lg"
                  className="w-full justify-center"
                >
                  {action.icon}
                  {action.label}
                </Button>
              )}
            </div>
          )}

          {/* Secondary Action - with visual separator */}
          {secondaryAction && (
            <div className="mt-8 pt-6 border-t border-border-default w-full">
              <p className="text-sm text-text-muted">
                <a
                  href={secondaryAction.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-primary hover:text-brand-secondary transition-colors font-medium inline-flex items-center gap-1"
                >
                  {secondaryAction.label}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </a>
              </p>
            </div>
          )}

          {/* Additional Children */}
          {children}
        </div>
      </div>
    </div>
  );
}
