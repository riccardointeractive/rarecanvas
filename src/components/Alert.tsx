import { ReactNode } from 'react';
import { AlertTriangle, CheckCircle, Info, X, ExternalLink } from 'lucide-react';

/**
 * Alert Component
 * 
 * Consistent alert/notification for success, error, warning, and info messages.
 * Follows Rare Canvas design system with glass morphism and proper color semantics.
 * 
 * @example
 * <Alert variant="success" title="Transaction Complete" onDismiss={() => {}}>
 *   Your swap was successful.
 * </Alert>
 * 
 * <Alert variant="error" onDismiss={clearError}>
 *   {errorMessage}
 * </Alert>
 */

export type AlertVariant = 'success' | 'error' | 'warning' | 'info';

export interface AlertProps {
  /** Alert variant determines color and icon */
  variant: AlertVariant;
  /** Optional title */
  title?: string;
  /** Alert message content */
  children: ReactNode;
  /** Dismiss handler - if provided, shows close button */
  onDismiss?: () => void;
  /** Optional link (e.g., transaction explorer) */
  link?: {
    href: string;
    label: string;
    external?: boolean;
  };
  /** Additional className */
  className?: string;
}

const variantStyles = {
  success: {
    bg: 'bg-success-muted',
    border: 'border-border-success',
    text: 'text-success',
    textLight: 'text-green-300',
  },
  error: {
    bg: 'bg-error-muted',
    border: 'border-border-error',
    text: 'text-error',
    textLight: 'text-red-300',
  },
  warning: {
    bg: 'bg-warning-muted',
    border: 'border-border-warning',
    text: 'text-warning',
    textLight: 'text-amber-300',
  },
  info: {
    bg: 'bg-info-muted',
    border: 'border-border-info',
    text: 'text-info',
    textLight: 'text-blue-300',
  },
};

const variantIcons = {
  success: CheckCircle,
  error: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
};

export function Alert({
  variant,
  title,
  children,
  onDismiss,
  link,
  className = '',
}: AlertProps) {
  const styles = variantStyles[variant];
  const Icon = variantIcons[variant];

  return (
    <div
      className={`
        ${styles.bg} ${styles.border} border rounded-xl md:rounded-2xl p-4
        ${className}
      `}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 ${styles.text} flex-shrink-0 mt-0.5`} />
        
        <div className="flex-1 min-w-0">
          {title && (
            <div className={`text-sm font-medium ${styles.text} mb-1`}>
              {title}
            </div>
          )}
          <div className={`text-sm ${styles.textLight}`}>
            {children}
          </div>
          
          {link && (
            <a
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noopener noreferrer' : undefined}
              className={`inline-flex items-center gap-1 text-sm ${styles.text} hover:underline mt-2`}
            >
              {link.label}
              {link.external && <ExternalLink className="w-3 h-3" />}
            </a>
          )}
        </div>

        {onDismiss && (
          <button
            onClick={onDismiss}
            className={`${styles.text} hover:${styles.textLight} transition-colors p-1 -m-1`}
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
}
