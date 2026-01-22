'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * Select Component
 * 
 * Unified dropdown select following Linear/Vercel design principles.
 * Clean, minimal, with custom chevron icon.
 * 
 * @example
 * // Basic
 * <Select value={value} onChange={(e) => setValue(e.target.value)}>
 *   <option value="1">Option 1</option>
 *   <option value="2">Option 2</option>
 * </Select>
 * 
 * // With label
 * <Select label="Filter by" value={filter} onChange={handleChange}>
 *   <option value="all">All</option>
 *   <option value="active">Active</option>
 * </Select>
 * 
 * // With options prop
 * <Select 
 *   options={[
 *     { value: 'asc', label: 'Ascending' },
 *     { value: 'desc', label: 'Descending' },
 *   ]} 
 * />
 */

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  /** Select label */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  error?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Options array (alternative to children) */
  options?: SelectOption[];
  /** Container className */
  containerClassName?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  helperText,
  error,
  size = 'md',
  options,
  containerClassName = '',
  className = '',
  disabled,
  children,
  ...props
}, ref) => {
  // Size styles
  const sizeStyles = {
    sm: 'h-9 pl-3 pr-8 text-sm',
    md: 'h-11 pl-4 pr-10 text-base',
    lg: 'h-13 pl-5 pr-12 text-lg',
  };

  const iconSizeStyles = {
    sm: 'w-4 h-4 right-2',
    md: 'w-4 h-4 right-3',
    lg: 'w-5 h-5 right-4',
  };

  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {/* Label */}
      {label && (
        <label className={`block text-sm text-text-secondary ${disabled ? 'opacity-50' : ''}`}>
          {label}
        </label>
      )}

      {/* Select Container */}
      <div className="relative">
        <select
          ref={ref}
          disabled={disabled}
          className={`
            w-full appearance-none
            bg-bg-surface rounded-xl
            border border-white/5 hover:border-white/10 focus:border-white/20 focus:hover:border-white/20
            text-text-primary
            outline-none focus:outline-none
            transition-colors duration-150
            cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-error/30 hover:border-error/50 focus:border-error/70 focus:hover:border-error/70' : ''}
            ${sizeStyles[size]}
            ${className}
          `}
          {...props}
        >
          {options 
            ? options.map((opt) => (
                <option 
                  key={opt.value} 
                  value={opt.value} 
                  disabled={opt.disabled}
                  className="bg-bg-surface text-text-primary"
                >
                  {opt.label}
                </option>
              ))
            : children
          }
        </select>

        {/* Custom Chevron */}
        <ChevronDown 
          className={`
            absolute top-1/2 -translate-y-1/2 
            text-text-secondary pointer-events-none
            ${iconSizeStyles[size]}
          `}
        />
      </div>

      {/* Helper/Error Text */}
      {(helperText || error) && (
        <p className={`text-xs ${error ? 'text-error' : 'text-text-muted'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
