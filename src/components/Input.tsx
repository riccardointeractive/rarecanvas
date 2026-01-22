import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

/**
 * Input Component
 * 
 * Reusable input with all Rare Canvas variants and validation states.
 * Supports text, email, password, search, and more.
 * 
 * @example
 * <Input type="text" placeholder="Enter text..." />
 * <Input type="email" error="Invalid email" />
 * <Input type="text" success="Looks good!" />
 * <Input type="search" icon={<SearchIcon />} />
 */

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'search' | 'url' | 'tel' | 'number';
  /** Validation state */
  state?: 'default' | 'success' | 'error' | 'warning';
  /** Label text */
  label?: string;
  /** Helper text below input */
  helperText?: string;
  /** Error message (sets state to error) */
  error?: string;
  /** Success message (sets state to success) */
  success?: string;
  /** Warning message (sets state to warning) */
  warning?: string;
  /** Icon to display on the left */
  icon?: ReactNode;
  /** Size variant */
  inputSize?: 'sm' | 'md' | 'lg';
  /** Additional container classes */
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  type = 'text',
  state = 'default',
  label,
  helperText,
  error,
  success,
  warning,
  icon,
  inputSize = 'md',
  containerClassName = '',
  className = '',
  disabled,
  ...props
}, ref) => {
  
  // Determine actual state based on props
  const actualState = error ? 'error' : success ? 'success' : warning ? 'warning' : state;
  
  // Determine message to show
  const message = error || success || warning || helperText;
  
  // Base container styles
  const baseContainerStyles = 'rounded-xl transition-colors duration-150 flex items-center';
  
  // State-based container styles
  const stateContainerStyles = {
    default: 'bg-overlay-default border border-border-default focus-within:border-border-brand',
    success: 'bg-success-muted border border-border-success focus-within:border-success',
    error: 'bg-error-muted border border-border-error focus-within:border-error',
    warning: 'bg-warning-muted border border-border-warning focus-within:border-warning',
  };
  
  // Size-based styles - Mobile-optimized: more compact on mobile
  const sizeStyles = {
    sm: 'px-2.5 md:px-3 py-1.5 md:py-2',
    md: 'px-3 md:px-4 py-2.5 md:py-3',
    lg: 'px-4 md:px-5 py-3 md:py-4',
  };
  
  const inputSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };
  
  // Message color based on state
  const messageStyles = {
    default: 'text-text-muted',
    success: 'text-success',
    error: 'text-error',
    warning: 'text-warning',
  };
  
  // Icon for messages
  const MessageIcon = () => {
    if (actualState === 'success') {
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    if (actualState === 'error') {
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    if (actualState === 'warning') {
      return (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    }
    return null;
  };
  
  return (
    <div className={`space-y-2 ${containerClassName}`}>
      {/* Label */}
      {label && (
        <label className={`block text-sm font-medium text-text-primary ${disabled ? 'opacity-50' : ''}`}>
          {label}
        </label>
      )}
      
      {/* Input Container */}
      <div className={`${baseContainerStyles} ${stateContainerStyles[actualState]} ${sizeStyles[inputSize]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
        {/* Leading Icon */}
        {icon && (
          <div className="mr-2 text-text-muted flex-shrink-0">
            {icon}
          </div>
        )}
        
        {/* Input Field */}
        <input
          ref={ref}
          type={type}
          inputMode={type === 'number' ? 'decimal' : undefined}
          disabled={disabled}
          className={`flex-1 bg-transparent text-text-primary placeholder-text-muted outline-none focus:outline-none focus:ring-0 ${inputSizeStyles[inputSize]} ${icon ? '' : ''} ${className}`}
          {...props}
        />
      </div>
      
      {/* Helper/Error/Success/Warning Message */}
      {message && (
        <p className={`text-xs ${messageStyles[actualState]} flex items-center gap-1`}>
          <MessageIcon />
          {message}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
