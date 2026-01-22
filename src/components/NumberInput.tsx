/**
 * NumberInput Component
 * Custom number input with beautifully designed increment/decrement buttons
 * Following design guide: glass morphism, proper spacing, smooth interactions
 */

interface NumberInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  label?: string;
  helperText?: string;
  className?: string;
  step?: number;
  min?: number;
  max?: number;
  maxButton?: {
    show: boolean;
    label?: string;
    onClick: () => void;
  };
}

export function NumberInput({
  value,
  onChange,
  placeholder = '0.00',
  disabled = false,
  readOnly = false,
  label,
  helperText,
  className = '',
  step = 1,
  min = 0,
  max,
  maxButton,
}: NumberInputProps) {
  
  const handleIncrement = () => {
    const currentValue = parseFloat(value) || 0;
    const newValue = max !== undefined ? Math.min(currentValue + step, max) : currentValue + step;
    onChange(newValue.toString());
  };

  const handleDecrement = () => {
    const currentValue = parseFloat(value) || 0;
    const newValue = Math.max(currentValue - step, min);
    onChange(newValue.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Don't allow changes if readOnly
    if (readOnly) return;
    
    const newValue = e.target.value;
    
    // Allow empty string for clearing
    if (newValue === '') {
      onChange('');
      return;
    }
    
    // Allow decimal numbers
    if (/^\d*\.?\d*$/.test(newValue)) {
      // Check max constraint
      if (max !== undefined) {
        const numValue = parseFloat(newValue);
        if (!isNaN(numValue) && numValue > max) {
          return; // Don't update if exceeds max
        }
      }
      onChange(newValue);
    }
  };

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <label className={`block text-sm text-text-secondary mb-2 ${disabled ? 'opacity-50' : ''}`}>
          {label}
        </label>
      )}
      
      <div className="flex gap-2">
        {/* Main Input Container */}
        <div className="flex-1 relative">
          <div className="flex items-center gap-2 px-4 py-3 bg-klever-dark rounded-xl border border-gray-700 focus-within:border-border-brand transition-all duration-150">
            {/* Input Field - Hide default spinners */}
            <input
              type="number"
              value={value}
              onChange={handleInputChange}
              placeholder={placeholder}
              disabled={disabled}
              readOnly={readOnly}
              className="flex-1 bg-transparent text-text-primary font-mono text-xl font-medium 
                       outline-none focus:outline-none focus-visible:outline-none
                       focus:ring-0 focus:border-0
                       placeholder:text-text-muted
                       /* Hide number input spinners */
                       [appearance:textfield] 
                       [&::-webkit-outer-spin-button]:appearance-none 
                       [&::-webkit-inner-spin-button]:appearance-none
                       disabled:opacity-50 disabled:cursor-not-allowed
                       read-only:cursor-default"
            />
            
            {/* Custom Increment/Decrement Buttons - Hide when readonly */}
            {!readOnly && (
              <div className="flex flex-col gap-1">
                {/* Increment Button */}
                <button
                  type="button"
                  onClick={handleIncrement}
                  disabled={disabled || (max !== undefined && parseFloat(value) >= max)}
                  className="group w-7 h-6 rounded-lg bg-overlay-default hover:bg-brand-primary/20 
                           border border-border-default hover:border-border-brand
                           transition-all duration-150 flex items-center justify-center
                           disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-overlay-default disabled:hover:border-border-default"
                  title="Increment"
                >
                  <svg 
                    className="w-3.5 h-3.5 text-text-secondary group-hover:text-text-primary transition-colors" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                
                {/* Decrement Button */}
                <button
                  type="button"
                  onClick={handleDecrement}
                  disabled={disabled || parseFloat(value) <= min}
                  className="group w-7 h-6 rounded-lg bg-overlay-default hover:bg-brand-primary/20 
                           border border-border-default hover:border-border-brand
                           transition-all duration-150 flex items-center justify-center
                           disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-overlay-default disabled:hover:border-border-default"
                  title="Decrement"
                >
                  <svg 
                    className="w-3.5 h-3.5 text-text-secondary group-hover:text-text-primary transition-colors" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor" 
                    strokeWidth={3}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Optional MAX Button */}
        {maxButton?.show && !readOnly && (
          <button
            type="button"
            onClick={maxButton.onClick}
            disabled={disabled}
            className="px-4 py-3 bg-brand-primary/20 hover:bg-brand-primary/30 
                     text-brand-primary font-medium rounded-xl transition-all duration-150 
                     border border-border-brand hover:border-border-brand
                     disabled:opacity-50 disabled:cursor-not-allowed
                    "
          >
            {maxButton.label || 'MAX'}
          </button>
        )}
      </div>
      
      {/* Helper Text */}
      {helperText && (
        <p className="text-xs text-text-muted mt-2 ml-1">
          {helperText}
        </p>
      )}
    </div>
  );
}
