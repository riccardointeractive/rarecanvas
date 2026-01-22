'use client';

import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

/**
 * TextInput Component
 * 
 * Unified text input following Linear/Vercel design principles.
 * Clean, minimal, with subtle interactions.
 * 
 * @example
 * // Basic
 * <TextInput placeholder="Enter text..." />
 * 
 * // With label and helper
 * <TextInput label="Email" type="email" helperText="We'll never share your email" />
 * 
 * // With error
 * <TextInput label="Username" error="Username is already taken" />
 * 
 * // With icon
 * <TextInput icon={<SearchIcon />} placeholder="Search..." />
 * 
 * // Address input (monospace)
 * <TextInput variant="address" placeholder="klv1..." />
 */

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input label */
  label?: string;
  /** Helper text below input */
  helperText?: string;
  /** Error message (shows error state) */
  error?: string;
  /** Success message (shows success state) */
  success?: string;
  /** Leading icon */
  icon?: ReactNode;
  /** Trailing icon or action */
  trailingIcon?: ReactNode;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Style variant */
  variant?: 'default' | 'address' | 'search';
  /** Container className */
  containerClassName?: string;
}

export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(({
  label,
  helperText,
  error,
  success,
  icon,
  trailingIcon,
  size = 'md',
  variant = 'default',
  containerClassName = '',
  className = '',
  disabled,
  type = 'text',
  ...props
}, ref) => {
  // Determine state
  const state = error ? 'error' : success ? 'success' : 'default';
  const message = error || success || helperText;

  // Size styles
  const sizeStyles = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-base',
    lg: 'h-13 px-5 text-lg',
  };

  const iconSizeStyles = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  };

  const messageStyles = {
    default: 'text-text-muted',
    error: 'text-error',
    success: 'text-success',
  };

  // Variant-specific font
  const fontStyle = variant === 'address' ? 'font-mono' : '';

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {/* Label */}
      {label && (
        <label className={`block text-sm text-text-secondary ${disabled ? 'opacity-50' : ''}`}>
          {label}
        </label>
      )}

      {/* Input Container - soft border with hover/focus states */}
      <div 
        className={`
          relative flex items-center gap-2
          bg-bg-surface rounded-xl
          border border-white/5 hover:border-white/10 focus-within:border-white/20 focus-within:hover:border-white/20
          transition-colors duration-150
          ${sizeStyles[size]}
          ${error ? 'border-error/30 hover:border-error/50 focus-within:border-error/70 focus-within:hover:border-error/70' : ''}
          ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        `}
      >
        {/* Leading Icon */}
        {icon && (
          <div className={`text-text-muted flex-shrink-0 ${iconSizeStyles[size]}`}>
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={`
            flex-1 min-w-0 bg-transparent
            text-text-primary placeholder:text-text-primary/30
            outline-none focus:outline-none
            disabled:cursor-not-allowed
            ${fontStyle}
            ${className}
          `}
          {...props}
        />

        {/* Trailing Icon */}
        {trailingIcon && (
          <div className={`text-text-muted flex-shrink-0 ${iconSizeStyles[size]}`}>
            {trailingIcon}
          </div>
        )}
      </div>

      {/* Message */}
      {message && (
        <p className={`text-xs ${messageStyles[state]} flex items-center gap-1.5`}>
          {state === 'error' && (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          {state === 'success' && (
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {message}
        </p>
      )}
    </div>
  );
});

TextInput.displayName = 'TextInput';

/**
 * SearchInput - Convenience wrapper for search inputs
 */
export const SearchInput = forwardRef<HTMLInputElement, Omit<TextInputProps, 'variant' | 'type' | 'icon'>>((props, ref) => (
  <TextInput
    ref={ref}
    type="search"
    variant="search"
    icon={
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    }
    {...props}
  />
));

SearchInput.displayName = 'SearchInput';

/**
 * AddressInput - Convenience wrapper for blockchain addresses
 */
export const AddressInput = forwardRef<HTMLInputElement, Omit<TextInputProps, 'variant'>>((props, ref) => (
  <TextInput
    ref={ref}
    variant="address"
    placeholder="klv1..."
    {...props}
  />
));

AddressInput.displayName = 'AddressInput';
