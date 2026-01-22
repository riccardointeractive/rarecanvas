'use client';

import { useState, useEffect, ReactNode } from 'react';

/**
 * DonutChartSegment Interface
 * Configuration for a single donut chart segment.
 */
export interface DonutChartSegment {
  /** Segment label */
  label: string;
  /** Percentage value (should sum to 100) */
  percent: number;
  /** Segment color (CSS color value) */
  color: string;
}

/**
 * DonutChart Component
 * 
 * Animated donut chart for displaying distributions/percentages.
 * Used for tokenomics displays and similar visualizations.
 * 
 * @example
 * // Basic usage with tokenomics
 * <DonutChart
 *   segments={[
 *     { label: 'Liquidity', percent: 40, color: '#0066FF' },
 *     { label: 'Staking Rewards', percent: 30, color: '#00D4FF' },
 *     { label: 'Team', percent: 20, color: '#8B5CF6' },
 *     { label: 'Marketing', percent: 10, color: '#06B6D4' },
 *   ]}
 *   centerContent={
 *     <>
 *       <div className="text-4xl font-mono font-medium text-text-primary">100M</div>
 *       <div className="text-sm text-text-muted">Max Supply</div>
 *     </>
 *   }
 * />
 * 
 * // Custom size
 * <DonutChart
 *   segments={tokenomics}
 *   size={320}
 *   strokeWidth={20}
 *   centerContent={<div>Custom</div>}
 * />
 */

export interface DonutChartProps {
  /** Array of segments to display */
  segments: DonutChartSegment[];
  /** Chart size in pixels */
  size?: number;
  /** Stroke width in pixels */
  strokeWidth?: number;
  /** Gap between segments as percentage */
  gapPercent?: number;
  /** Content to display in the center */
  centerContent?: ReactNode;
  /** Additional className for wrapper */
  className?: string;
}

export function DonutChart({
  segments,
  size = 280,
  strokeWidth = 16,
  gapPercent = 2,
  centerContent,
  className = '',
}: DonutChartProps) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  let accumulatedPercent = 0;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255, 255, 255, 0.05)"
          strokeWidth={strokeWidth}
        />
        
        {/* Segments */}
        {segments.map((item, index) => {
          const segmentPercent = item.percent - gapPercent;
          const segmentLength = (segmentPercent / 100) * circumference;
          const segmentOffset = -(accumulatedPercent + gapPercent / 2) / 100 * circumference;
          accumulatedPercent += item.percent;
          
          return (
            <circle
              key={item.label}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference}`}
              strokeDashoffset={segmentOffset}
              strokeLinecap="round"
              style={{
                transitionProperty: mounted ? 'stroke-dasharray, stroke-dashoffset, opacity' : 'none',
                transitionDuration: mounted ? '1s' : '0s',
                transitionTimingFunction: 'ease-in-out',
                transitionDelay: mounted ? `${index * 100}ms` : '0s',
                opacity: mounted ? 1 : 0,
              }}
            />
          );
        })}
      </svg>
      
      {/* Center content */}
      {centerContent && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            {centerContent}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * DonutChartLegend Component
 * 
 * Legend items to accompany DonutChart.
 * 
 * @example
 * <DonutChartLegend
 *   segments={tokenomics}
 *   showPercent
 * />
 */

export interface DonutChartLegendProps {
  /** Same segments as DonutChart */
  segments: DonutChartSegment[];
  /** Whether to show percentage values */
  showPercent?: boolean;
  /** Additional className for wrapper */
  className?: string;
}

export function DonutChartLegend({
  segments,
  showPercent = true,
  className = '',
}: DonutChartLegendProps) {
  return (
    <div className={`space-y-4 md:space-y-4 ${className}`}>
      {segments.map((item) => (
        <div
          key={item.label}
          className="flex items-center justify-between p-4 md:p-4 rounded-lg md:rounded-xl hover:bg-overlay-default transition-colors"
        >
          <div className="flex items-center gap-2 md:gap-3">
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm md:text-base text-text-primary">{item.label}</span>
          </div>
          {showPercent && (
            <span className="text-base font-medium font-mono text-text-primary">{item.percent}%</span>
          )}
        </div>
      ))}
    </div>
  );
}
