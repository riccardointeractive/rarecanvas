import { HTMLAttributes, ReactNode } from 'react';

/**
 * Card Component - Linear/Vercel Style
 * 
 * Uses semantic design tokens from the design system.
 * No hardcoded colors - all values come from CSS variables via Tailwind.
 * 
 * Migration Note: 'glass' variant is deprecated, use 'surface' instead.
 * The 'glass' name is kept as alias for backward compatibility.
 */

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card style variant. 'surface' is default (was 'glass'). */
  variant?: 'surface' | 'glass' | 'stat' | 'feature' | 'minimal' | 'success' | 'info' | 'warning' | 'error';
  /** Padding size */
  size?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /** Border radius */
  rounded?: 'lg' | 'xl' | '2xl' | '3xl' | '4xl';
  /** Enable hover effect */
  hover?: boolean;
  /** Left accent border color */
  accent?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'cyan' | 'none';
  children: ReactNode;
  className?: string;
}

export function Card({
  variant = 'surface',
  size = 'md',
  rounded = '2xl',
  hover = false,
  accent = 'none',
  children,
  className = '',
  ...props
}: CardProps) {
  
  const baseStyles = 'border transition-colors duration-base';
  
  const roundedStyles = {
    'lg': 'rounded-lg',
    'xl': 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    '4xl': 'rounded-4xl',
  };
  
  // 'glass' is alias for 'surface' (backward compat)
  const variantStyles = {
    surface: 'bg-bg-surface border-border-default',
    glass: 'bg-bg-surface border-border-default', // deprecated alias
    stat: 'bg-bg-surface border-border-default',
    feature: 'bg-bg-surface border-border-default',
    minimal: 'bg-transparent border-transparent',
    success: 'bg-success-muted border-border-success',
    info: 'bg-info-muted border-border-info',
    warning: 'bg-warning-muted border-border-warning',
    error: 'bg-error-muted border-border-error',
  };
  
  const sizeStyles = {
    none: '',
    xs: 'p-2',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
    xl: 'p-6',
    '2xl': 'p-8',
  };
  
  // stat variant has its own padding
  const paddingClass = variant === 'stat' ? 'p-3 md:p-4' : sizeStyles[size];
  const hoverStyles = hover ? 'hover:bg-bg-elevated hover:border-border-active cursor-pointer' : '';
  
  const accentStyles = {
    none: '',
    blue: 'border-l-2 border-l-brand-primary',
    green: 'border-l-2 border-l-success',
    red: 'border-l-2 border-l-error',
    yellow: 'border-l-2 border-l-warning',
    purple: 'border-l-2 border-l-brand-secondary',
    cyan: 'border-l-2 border-l-brand-primary',
  };
  
  return (
    <div
      className={`${baseStyles} ${roundedStyles[rounded]} ${variantStyles[variant]} ${paddingClass} ${hoverStyles} ${accentStyles[accent]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

/**
 * StatCard Component - Linear Style
 */

export interface StatCardProps {
  label: string;
  value: ReactNode;
  subValue?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  subValue,
  icon,
  trend,
  trendValue,
  className = '',
}: StatCardProps) {
  
  const trendColors = {
    up: 'text-success',
    down: 'text-error',
    neutral: 'text-text-secondary',
  };
  
  return (
    <Card variant="stat" className={className}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-text-secondary mb-1">
            {label}
          </div>
          <div className="text-lg md:text-xl font-mono font-medium text-text-primary">
            {value}
          </div>
          {subValue && (
            <div className="text-xs text-text-muted mt-0.5">{subValue}</div>
          )}
          {trend && trendValue && (
            <div className={`text-xs ${trendColors[trend]} mt-1`}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </div>
          )}
        </div>
        {icon && (
          <div className="flex-shrink-0 text-text-muted">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
}

/**
 * FeatureCard Component - Linear Style
 */

export interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  href?: string;
  onClick?: () => void;
  badge?: ReactNode;
  className?: string;
}

export function FeatureCard({
  icon,
  title,
  description,
  href,
  onClick,
  badge,
  className = '',
}: FeatureCardProps) {
  
  const card = (
    <Card 
      variant="feature" 
      hover={!!(href || onClick)}
      className={className}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-bg-elevated">
          {icon}
        </div>
        {badge && badge}
      </div>
      <h3 className="text-sm font-medium text-text-primary mb-1">{title}</h3>
      <p className="text-xs text-text-secondary">{description}</p>
    </Card>
  );

  if (href) {
    return <a href={href} className="block">{card}</a>;
  }

  return card;
}
