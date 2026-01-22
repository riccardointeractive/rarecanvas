import { ButtonHTMLAttributes, ReactNode } from 'react';

/**
 * Button Component - Linear/Vercel Style
 * 
 * Uses semantic design tokens from the design system.
 */

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'secondaryBlue' | 'danger' | 'dangerSolid' | 'ghost' | 'connect' | 'success' | 'successGradient' | 'successOutline' | 'warning' | 'warningOutline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: ReactNode;
  className?: string;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  
  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-lg
    transition-colors duration-150
    disabled:opacity-50 disabled:cursor-not-allowed
  `;
  
  const variantStyles = {
    primary: 'bg-brand-primary hover:bg-brand-primary-hover text-text-on-brand',
    secondary: 'bg-bg-surface hover:bg-bg-hover text-text-primary border border-border-default',
    secondaryBlue: 'bg-brand-primary-hover hover:bg-brand-primary text-text-on-brand',
    danger: 'bg-transparent hover:bg-error-muted text-error border border-border-error',
    dangerSolid: 'bg-error hover:bg-error/90 text-text-on-brand',
    ghost: 'bg-transparent hover:bg-bg-hover text-text-secondary hover:text-text-primary',
    connect: 'bg-transparent hover:bg-bg-hover text-text-secondary hover:text-text-primary border border-border-default',
    success: 'bg-success hover:bg-success/90 text-text-on-brand',
    successGradient: 'bg-success hover:bg-success/90 text-text-on-brand',
    successOutline: 'bg-transparent hover:bg-success-muted text-success border border-border-success',
    warning: 'bg-warning hover:bg-warning/90 text-text-inverse',
    warningOutline: 'bg-transparent hover:bg-warning-muted text-warning border border-border-warning',
  };
  
  const sizeStyles = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-9 px-4 text-sm',
    lg: 'h-10 px-5 text-sm',
  };
  
  const buttonClasses = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;
  
  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
