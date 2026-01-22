'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

/**
 * Slider Component
 * 
 * Unified range slider following Linear/Vercel design principles.
 * Clean track with brand-colored progress fill.
 * 
 * @example
 * // Basic
 * <Slider value={value} onChange={(e) => setValue(Number(e.target.value))} />
 * 
 * // With label and value display
 * <Slider 
 *   label="Volume"
 *   value={volume}
 *   onChange={handleChange}
 *   showValue
 *   valueSuffix="%"
 * />
 * 
 * // With preset buttons
 * <Slider 
 *   value={percentage}
 *   onChange={handleChange}
 *   presets={[25, 50, 75, 100]}
 *   onPresetClick={(val) => setPercentage(val)}
 * />
 */

export interface SliderProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  /** Slider label */
  label?: string;
  /** Show current value */
  showValue?: boolean;
  /** Suffix for value display (e.g., "%" or " KLV") */
  valueSuffix?: string;
  /** Prefix for value display (e.g., "$") */
  valuePrefix?: string;
  /** Preset buttons */
  presets?: number[];
  /** Handler for preset click */
  onPresetClick?: (value: number) => void;
  /** Size variant */
  size?: 'sm' | 'md';
  /** Container className */
  containerClassName?: string;
}

export const Slider = forwardRef<HTMLInputElement, SliderProps>(({
  label,
  showValue,
  valueSuffix = '',
  valuePrefix = '',
  presets,
  onPresetClick,
  size = 'md',
  containerClassName = '',
  className = '',
  disabled,
  value,
  min = 0,
  max = 100,
  ...props
}, ref) => {
  // Calculate fill percentage for visual progress
  const numValue = Number(value) || 0;
  const numMin = Number(min);
  const numMax = Number(max);
  const percentage = ((numValue - numMin) / (numMax - numMin)) * 100;

  // Size styles
  const trackHeight = size === 'sm' ? 'h-1.5' : 'h-2';

  return (
    <div className={`space-y-3 ${containerClassName}`}>
      {/* Label Row */}
      {(label || showValue) && (
        <div className="flex items-center justify-between">
          {label && (
            <span className={`text-sm text-text-secondary ${disabled ? 'opacity-50' : ''}`}>
              {label}
            </span>
          )}
          {showValue && (
            <span className="text-sm font-medium text-text-primary font-mono">
              {valuePrefix}{value}{valueSuffix}
            </span>
          )}
        </div>
      )}

      {/* Slider Track */}
      <div className="relative">
        {/* Background track */}
        <div className={`absolute inset-0 bg-overlay-default rounded-full ${trackHeight}`} />
        
        {/* Progress fill */}
        <div 
          className={`absolute left-0 top-0 bg-brand-primary rounded-full ${trackHeight} transition-all duration-75`}
          style={{ width: `${percentage}%` }}
        />

        {/* Native range input (invisible but functional) */}
        <input
          ref={ref}
          type="range"
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          className={`
            relative w-full appearance-none bg-transparent cursor-pointer
            ${trackHeight}
            disabled:opacity-50 disabled:cursor-not-allowed

            /* Thumb styles - WebKit */
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-4
            [&::-webkit-slider-thumb]:h-4
            [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:border-2
            [&::-webkit-slider-thumb]:border-brand-primary
            [&::-webkit-slider-thumb]:shadow-md
            [&::-webkit-slider-thumb]:cursor-pointer
            [&::-webkit-slider-thumb]:transition-transform
            [&::-webkit-slider-thumb]:duration-100
            [&::-webkit-slider-thumb]:hover:scale-110

            /* Thumb styles - Firefox */
            [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:w-4
            [&::-moz-range-thumb]:h-4
            [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-white
            [&::-moz-range-thumb]:border-2
            [&::-moz-range-thumb]:border-brand-primary
            [&::-moz-range-thumb]:shadow-md
            [&::-moz-range-thumb]:cursor-pointer

            /* Track styles - both browsers handle differently, we use overlay divs */
            [&::-webkit-slider-runnable-track]:bg-transparent
            [&::-moz-range-track]:bg-transparent

            ${className}
          `}
          {...props}
        />
      </div>

      {/* Preset Buttons */}
      {presets && presets.length > 0 && onPresetClick && (
        <div className="flex gap-2">
          {presets.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => onPresetClick(preset)}
              disabled={disabled}
              className={`
                flex-1 py-1.5 text-sm font-medium rounded-lg
                transition-all duration-100
                disabled:opacity-50 disabled:cursor-not-allowed
                ${Number(value) === preset
                  ? 'bg-brand-primary text-white'
                  : 'bg-overlay-default text-text-secondary hover:text-text-primary hover:bg-overlay-hover border border-border-default'
                }
              `}
            >
              {preset}{valueSuffix}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

Slider.displayName = 'Slider';
