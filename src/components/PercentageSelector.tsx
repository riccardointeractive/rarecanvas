/**
 * PercentageSelector Component
 * 
 * Quick percentage selection buttons commonly used in DeFi interfaces.
 * Includes optional premium slider for fine-grained control.
 * 
 * @example
 * <PercentageSelector
 *   value={percentage}
 *   onChange={setPercentage}
 *   variant="blue"
 * />
 * 
 * <PercentageSelector
 *   value={removePercentage}
 *   onChange={setRemovePercentage}
 *   variant="red"
 *   withSlider
 * />
 */

'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { sliderVariants } from '@/config/design-tokens';

export interface PercentageSelectorProps {
  /** Current percentage value (0-100) */
  value: number;
  /** Change handler */
  onChange: (value: number) => void;
  /** Color variant */
  variant?: 'blue' | 'red' | 'green' | 'gray';
  /** Show slider above buttons */
  withSlider?: boolean;
  /** Custom percentage options */
  options?: number[];
  /** Disabled state */
  disabled?: boolean;
  /** Additional className */
  className?: string;
}

const variantStyles = {
  blue: {
    active: 'bg-brand-primary text-text-primary',
    inactive: 'bg-overlay-default text-text-primary/60 hover:text-text-primary hover:bg-overlay-active',
    fill: 'bg-brand-primary',
    ...sliderVariants.blue,
  },
  red: {
    active: 'bg-error text-text-primary',
    inactive: 'bg-overlay-default text-text-primary/60 hover:text-text-primary hover:bg-overlay-active',
    fill: 'bg-error',
    ...sliderVariants.red,
  },
  green: {
    active: 'bg-success text-text-primary',
    inactive: 'bg-overlay-default text-text-primary/60 hover:text-text-primary hover:bg-overlay-active',
    fill: 'bg-success',
    ...sliderVariants.green,
  },
  gray: {
    active: 'bg-overlay-heavy text-text-primary',
    inactive: 'bg-overlay-default text-text-primary/60 hover:text-text-primary hover:bg-overlay-active',
    fill: 'bg-neutral',
    ...sliderVariants.gray,
  },
};

export function PercentageSelector({
  value,
  onChange,
  variant = 'blue',
  withSlider = false,
  options = [25, 50, 75, 100],
  disabled = false,
  className = '',
}: PercentageSelectorProps) {
  const styles = variantStyles[variant];
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const calculateValue = useCallback((clientX: number) => {
    if (!trackRef.current) return value;
    const rect = trackRef.current.getBoundingClientRect();
    const percentage = ((clientX - rect.left) / rect.width) * 100;
    return Math.round(Math.max(0, Math.min(100, percentage)));
  }, [value]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    onChange(calculateValue(e.clientX));
  }, [disabled, calculateValue, onChange]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (disabled) return;
    setIsDragging(true);
    onChange(calculateValue(e.touches[0]?.clientX ?? 0));
  }, [disabled, calculateValue, onChange]);

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      onChange(calculateValue(e.clientX));
    };

    const handleTouchMove = (e: TouchEvent) => {
      onChange(calculateValue(e.touches[0]?.clientX ?? 0));
    };

    const handleEnd = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDragging, calculateValue, onChange]);

  return (
    <div className={className}>
      {withSlider && (
        <div className="mb-4">
          {/* Label row */}
          <div className="flex justify-between text-sm mb-3">
            <span className="text-text-primary/60">Amount</span>
            <span 
              className="text-text-primary font-semibold tabular-nums transition-all duration-100"
              style={{ 
                textShadow: isDragging ? `0 0 12px ${styles.glow}` : 'none'
              }}
            >
              {value}%
            </span>
          </div>
          
          {/* Premium Slider Track */}
          <div
            ref={trackRef}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className={`
              relative h-2 rounded-full cursor-pointer select-none
              bg-overlay-hover
              border border-border-default
              transition-all duration-100
              ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
              ${isHovering && !disabled ? 'bg-overlay-active' : ''}
            `}
          >
            {/* Fill track */}
            <div
              className={`
                absolute inset-y-0 left-0 rounded-full
                ${styles.fill}
                transition-all duration-100 ease-out
              `}
              style={{ width: `${value}%` }}
            />
            
            {/* Thumb */}
            <div
              className={`
                absolute top-1/2 -translate-y-1/2 -translate-x-1/2
                w-5 h-5 rounded-full
                ${styles.thumb}
                border-2 border-text-primary
                transition-all duration-100
                ${isDragging ? `scale-110 ${styles.thumbHover}` : ''}
                ${isHovering && !isDragging && !disabled ? 'scale-105' : ''}
              `}
              style={{ left: `${value}%` }}
            />

            {/* Glow effect on drag */}
            {isDragging && (
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full blur-md pointer-events-none"
                style={{ 
                  left: `${value}%`,
                  backgroundColor: styles.glow,
                }}
              />
            )}
          </div>

          {/* Tick marks */}
          <div className="flex justify-between mt-2 px-0.5">
            {[0, 25, 50, 75, 100].map((tick) => (
              <div
                key={tick}
                className={`
                  text-2xs tabular-nums transition-colors duration-100
                  ${value === tick ? 'text-text-primary/80' : 'text-text-primary/30'}
                `}
              >
                {tick}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Percentage buttons */}
      <div className="flex gap-2">
        {options.map((pct) => (
          <button
            key={pct}
            onClick={() => onChange(pct)}
            disabled={disabled}
            className={`
              flex-1 py-2.5 text-sm font-medium rounded-xl transition-all duration-100
              disabled:opacity-50 disabled:cursor-not-allowed
              ${value === pct 
                ? `${styles.active} shadow-lg` 
                : `${styles.inactive}`
              }
            `}
          >
            {pct}%
          </button>
        ))}
      </div>
    </div>
  );
}
