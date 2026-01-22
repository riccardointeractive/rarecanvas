'use client';

import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';
import { Check } from 'lucide-react';

/**
 * Checkbox Component
 * 
 * Unified checkbox following Linear/Vercel design principles.
 * Custom styled with smooth animations.
 * 
 * @example
 * // Basic
 * <Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} />
 * 
 * // With label
 * <Checkbox label="Accept terms" checked={checked} onChange={handleChange} />
 * 
 * // With description
 * <Checkbox 
 *   label="Email notifications" 
 *   description="Receive updates about your account"
 *   checked={emailEnabled}
 *   onChange={handleChange}
 * />
 */

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Checkbox label */
  label?: ReactNode;
  /** Description text below label */
  description?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Container className */
  containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(({
  label,
  description,
  size = 'md',
  containerClassName = '',
  className = '',
  disabled,
  checked,
  ...props
}, ref) => {
  // Size styles
  const boxSizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const checkSizeStyles = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const labelSizeStyles = {
    sm: 'text-sm',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <label 
      className={`
        flex items-start gap-3 cursor-pointer group
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${containerClassName}
      `}
    >
      {/* Hidden native checkbox */}
      <input
        ref={ref}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        className="sr-only"
        {...props}
      />

      {/* Custom checkbox */}
      <div 
        className={`
          relative flex-shrink-0 mt-0.5
          rounded-md border-2 
          transition-all duration-150
          flex items-center justify-center
          ${boxSizeStyles[size]}
          ${checked 
            ? 'bg-brand-primary border-brand-primary' 
            : 'bg-overlay-subtle border-border-active group-hover:border-brand-primary/50'
          }
          ${className}
        `}
      >
        {/* Check icon */}
        <Check 
          className={`
            text-white transition-all duration-150
            ${checkSizeStyles[size]}
            ${checked ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
          `}
          strokeWidth={3}
        />
      </div>

      {/* Label & Description */}
      {(label || description) && (
        <div className="flex-1 min-w-0">
          {label && (
            <span className={`
              text-text-primary font-medium
              group-hover:text-text-primary
              transition-colors
              ${labelSizeStyles[size]}
            `}>
              {label}
            </span>
          )}
          {description && (
            <p className="text-xs text-text-muted mt-0.5">
              {description}
            </p>
          )}
        </div>
      )}
    </label>
  );
});

Checkbox.displayName = 'Checkbox';
