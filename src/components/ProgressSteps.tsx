
import { Check, Loader2 } from 'lucide-react';

/**
 * ProgressSteps Component
 * 
 * Multi-step progress indicator for transactions and workflows.
 * Shows completed, current, and pending steps with animations.
 * 
 * @example
 * <ProgressSteps
 *   steps={[
 *     { label: 'Add DGKO', status: 'complete' },
 *     { label: 'Add KLV', status: 'current' },
 *   ]}
 * />
 */

export type StepStatus = 'pending' | 'current' | 'complete' | 'error';

export interface Step {
  /** Step label */
  label: string;
  /** Step status */
  status: StepStatus;
  /** Optional description */
  description?: string;
}

export interface ProgressStepsProps {
  /** Array of steps */
  steps: Step[];
  /** Variant - vertical list or horizontal compact */
  variant?: 'vertical' | 'horizontal';
  /** Additional className */
  className?: string;
}

export function ProgressSteps({
  steps,
  variant = 'vertical',
  className = '',
}: ProgressStepsProps) {
  if (variant === 'horizontal') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2">
            <StepIndicator status={step.status} size="sm" />
            <span className={`text-sm ${
              step.status === 'complete' ? 'text-success' :
              step.status === 'current' ? 'text-text-primary' :
              step.status === 'error' ? 'text-error' :
              'text-text-primary/40'
            }`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-4 h-px ${
                step.status === 'complete' ? 'bg-success' : 'bg-overlay-heavy'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`bg-info-muted border border-border-info rounded-xl p-4 space-y-3 ${className}`}>
      {steps.map((step, index) => (
        <div key={index} className="flex items-center gap-3">
          <StepIndicator status={step.status} />
          <div className="flex-1 min-w-0">
            <span className={`text-sm ${
              step.status === 'complete' ? 'text-success' :
              step.status === 'current' ? 'text-text-primary' :
              step.status === 'error' ? 'text-error' :
              'text-text-primary/60'
            }`}>
              {step.label}
            </span>
            {step.description && (
              <p className="text-xs text-text-primary/40 mt-0.5">{step.description}</p>
            )}
          </div>
          {step.status === 'current' && (
            <Loader2 className="w-4 h-4 text-info animate-spin" />
          )}
        </div>
      ))}
    </div>
  );
}

interface StepIndicatorProps {
  status: StepStatus;
  size?: 'sm' | 'md';
}

function StepIndicator({ status, size = 'md' }: StepIndicatorProps) {
  const sizeClasses = size === 'sm' ? 'w-5 h-5 text-xs' : 'w-6 h-6 text-xs';
  
  const baseClasses = `${sizeClasses} rounded-full flex items-center justify-center font-bold transition-colors`;
  
  const statusClasses = {
    pending: 'bg-overlay-heavy text-text-primary/60',
    current: 'bg-brand-primary text-text-primary animate-pulse',
    complete: 'bg-success text-text-primary',
    error: 'bg-error text-text-primary',
  };

  return (
    <div className={`${baseClasses} ${statusClasses[status]}`}>
      {status === 'complete' ? (
        <Check className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} strokeWidth={3} />
      ) : status === 'error' ? (
        '!'
      ) : null}
    </div>
  );
}
