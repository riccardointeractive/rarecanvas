import { ReactNode } from 'react';

/**
 * RoadmapItem Component - Linear Style
 * 
 * Timeline item for roadmap sections using design tokens.
 */

export type RoadmapStatus = 'complete' | 'in-progress' | 'upcoming';

export interface RoadmapItemProps {
  title: string;
  description: string;
  quarter: string;
  status: RoadmapStatus;
  isLast?: boolean;
  badge?: ReactNode;
  className?: string;
}

export function RoadmapItem({
  title,
  description,
  quarter,
  status,
  isLast = false,
  badge,
  className = '',
}: RoadmapItemProps) {
  const statusConfig = {
    complete: {
      card: 'bg-bg-surface border-border-default hover:bg-bg-elevated',
      dotOuter: 'bg-success-muted',
      dotInner: 'bg-success',
      titleColor: 'text-text-primary',
      badgeStyle: 'bg-success-muted text-success border-border-success',
      badgeText: 'Complete',
      lineColor: 'bg-success/20',
      checkColor: 'text-success',
    },
    'in-progress': {
      card: 'bg-bg-surface border-border-brand hover:bg-bg-elevated',
      dotOuter: 'bg-brand-primary/15',
      dotInner: 'bg-brand-primary',
      titleColor: 'text-text-primary',
      badgeStyle: 'bg-brand-primary/10 text-brand-primary border-border-brand',
      badgeText: 'In Progress',
      lineColor: 'bg-brand-primary/20',
      checkColor: 'text-brand-primary',
    },
    upcoming: {
      card: 'bg-bg-surface border-border-default hover:bg-bg-elevated',
      dotOuter: 'bg-bg-elevated',
      dotInner: 'bg-text-muted',
      titleColor: 'text-text-secondary',
      badgeStyle: 'bg-bg-elevated text-text-muted border-border-default',
      badgeText: 'Planned',
      lineColor: 'bg-border-default',
      checkColor: 'text-text-muted',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`relative flex gap-4 ${className}`}>
      {/* Timeline indicator */}
      <div className="flex flex-col items-center pt-1">
        {/* Dot */}
        <div className={`relative w-8 h-8 rounded-full flex items-center justify-center ${config.dotOuter} transition-all duration-150`}>
          {status === 'complete' ? (
            <svg 
              className={`w-4 h-4 ${config.checkColor}`}
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <div className={`w-2.5 h-2.5 rounded-full ${config.dotInner}`} />
          )}
        </div>
        
        {/* Connector line */}
        {!isLast && (
          <div className={`flex-1 w-px min-h-[24px] mt-2 ${config.lineColor}`} />
        )}
      </div>

      {/* Content card */}
      <div className={`flex-1 rounded-xl border transition-all duration-150 ${config.card} mb-3`}>
        <div className="p-4 md:p-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className={`text-base md:text-lg font-medium leading-snug ${config.titleColor}`}>
              {title}
            </h3>
            
            {/* Status badge */}
            {badge || (
              <span className={`flex-shrink-0 px-2.5 py-1 rounded-md text-xs font-medium border ${config.badgeStyle}`}>
                {config.badgeText}
              </span>
            )}
          </div>
          
          {/* Description */}
          <p className="text-sm text-text-secondary leading-relaxed mb-3 max-w-2xl">
            {description}
          </p>
          
          {/* Quarter tag */}
          <div className="flex items-center gap-1.5">
            <svg 
              className="w-3.5 h-3.5 text-text-muted" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              strokeWidth={2}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <span className="text-xs text-text-muted font-mono tracking-wide">
              {quarter}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
