import { HTMLAttributes, ReactNode } from 'react';

/**
 * Badge Component
 * 
 * Unified badge system for status, features, and labels.
 * ALL badges are uppercase for readability and to distinguish from buttons.
 * Includes the beta badge gradient style used in header/footer.
 * 
 * @example
 * <Badge variant="gradient" blur>Beta</Badge>
 * <Badge variant="success" dot pulse>Live</Badge>
 * <Badge variant="feature">soon</Badge> // Renders as "SOON"
 */

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Badge variant/style */
  variant?: 'gradient' | 'success' | 'error' | 'warning' | 'info' | 'feature' | 'neutral' | 'ghost';
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  /** Show dot indicator */
  dot?: boolean;
  /** Pulse animation on dot */
  pulse?: boolean;
  /** Blur effect (only for gradient variant) */
  blur?: boolean;
  /** Children content */
  children: ReactNode;
  /** Additional classes */
  className?: string;
}

export function Badge({
  variant = 'neutral',
  size = 'md',
  dot = false,
  pulse = false,
  blur = false,
  children,
  className = '',
  ...props
}: BadgeProps) {
  
  // Base styles - NO hover effects (badges are static)
  // ALWAYS uppercase for readability and to distinguish from buttons
  const baseStyles = 'inline-flex items-center gap-2 font-medium rounded-lg uppercase badge-uppercase';
  
  // Variant styles - Linear style, minimal borders
  const variantStyles = {
    // Beta badge style - subtle, no heavy border
    gradient: 'bg-overlay-default text-brand-primary',
    
    // Status colors - subtle backgrounds only
    success: 'bg-success-muted text-success',
    error: 'bg-error-muted text-error',
    warning: 'bg-warning-muted text-warning',
    info: 'bg-brand-primary/10 text-brand-primary',
    
    // Feature highlight
    feature: 'bg-overlay-active text-text-primary',
    
    // Neutral
    neutral: 'bg-overlay-default text-text-secondary',
    
    // Ghost (no background)
    ghost: 'text-text-secondary',
  };
  
  // Size styles
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-2xs tracking-wider',
    md: 'px-2 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };
  
  // Dot color based on variant
  const dotColors = {
    gradient: 'bg-brand-primary',
    success: 'bg-success',
    error: 'bg-error',
    warning: 'bg-warning',
    info: 'bg-info',
    feature: 'bg-text-primary',
    neutral: 'bg-neutral',
    ghost: 'bg-neutral',
  };
  
  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      style={{ textTransform: 'uppercase' }}
      {...props}
    >
      {/* Blur effect for gradient variant */}
      {variant === 'gradient' && blur && (
        <span className="absolute inset-0 rounded-lg bg-brand-primary/10 blur-sm -z-10" />
      )}
      
      {/* Dot indicator */}
      {dot && (
        <div className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} ${pulse ? 'animate-pulse' : ''}`} />
      )}
      
      {/* Content */}
      {children}
    </span>
  );
}

/**
 * StatusBadge Component
 * 
 * Pre-configured badge for status indicators with dot.
 * 
 * @example
 * <StatusBadge status="active" pulse />
 */
export interface StatusBadgeProps {
  status: 'active' | 'inactive' | 'pending' | 'error';
  label?: string;
  pulse?: boolean;
  className?: string;
}

export function StatusBadge({
  status,
  label,
  pulse = false,
  className = '',
}: StatusBadgeProps) {
  
  const statusConfig = {
    active: {
      variant: 'success' as const,
      label: label || 'Active',
    },
    inactive: {
      variant: 'neutral' as const,
      label: label || 'Inactive',
    },
    pending: {
      variant: 'warning' as const,
      label: label || 'Pending',
    },
    error: {
      variant: 'error' as const,
      label: label || 'Error',
    },
  };
  
  const config = statusConfig[status];
  
  return (
    <Badge variant={config.variant} dot pulse={pulse} className={className}>
      {config.label}
    </Badge>
  );
}

/**
 * FeatureBadge Component
 * 
 * Pre-configured badge for feature labels (SOON, BETA, NEW, LIVE, etc.)
 * Automatically uppercases and applies appropriate styling.
 * 
 * @example
 * <FeatureBadge label="BETA" blur />
 * <FeatureBadge label="LIVE" />
 */
export interface FeatureBadgeProps {
  label: 'SOON' | 'BETA' | 'NEW' | 'HOT' | 'LIVE' | string;
  blur?: boolean;
  className?: string;
}

export function FeatureBadge({
  label,
  blur = false,
  className = '',
}: FeatureBadgeProps) {
  
  // Determine variant based on label
  const getVariant = () => {
    const upperLabel = label.toUpperCase();
    if (upperLabel === 'BETA') return 'gradient';
    if (upperLabel === 'LIVE' || upperLabel === 'HOT') return 'success';
    if (upperLabel === 'NEW') return 'feature';
    return 'neutral'; // SOON and others
  };
  
  // Determine if should pulse
  const shouldPulse = label.toUpperCase() === 'LIVE' || label.toUpperCase() === 'HOT';
  
  // Determine if should show dot
  const shouldShowDot = shouldPulse;
  
  return (
    <Badge 
      variant={getVariant()}
      size="sm" 
      dot={shouldShowDot} 
      pulse={shouldPulse}
      blur={blur}
      className={`font-semibold tracking-wider ${className}`}
    >
      {label}
    </Badge>
  );
}
