'use client';

import { useEffect, useCallback, ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  backdropClassName?: string;
  glow?: string; /* Legacy - kept for compatibility, not used */
  gradientOverlay?: string; /* Legacy - kept for compatibility, not used */
}

const sizeClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-4xl',
};

/**
 * Modal Component - Linear/Vercel Style
 * 
 * Uses semantic design tokens from the design system.
 * No hardcoded colors - all values come from CSS variables via Tailwind.
 */
export function Modal({
  isOpen,
  onClose,
  children,
  title,
  size = 'lg',
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  className = '',
  backdropClassName = '',
}: ModalProps) {
  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && closeOnEscape) {
      onClose();
    }
  }, [closeOnEscape, onClose]);

  const handleBackdropClick = useCallback(() => {
    if (closeOnBackdropClick) {
      onClose();
    }
  }, [closeOnBackdropClick, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleEscape);
      };
    }
    return undefined;
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-50 bg-backdrop animate-fade-in ${backdropClassName}`}
        onClick={handleBackdropClick}
        aria-hidden="true"
      />
      
      {/* Modal container */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
      >
        <div 
          className={`
            w-full ${sizeClasses[size]} 
            bg-bg-surface 
            border border-border-default
            rounded-xl
            pointer-events-auto 
            animate-scale-in
            ${className}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-hover transition-colors duration-base"
              aria-label="Close modal"
            >
              <svg 
                className="w-4 h-4 text-text-muted hover:text-text-primary transition-colors" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}

          {title && <h2 id="modal-title" className="sr-only">{title}</h2>}

          {children}
        </div>
      </div>
    </>
  );
}

/* ========================================
   Modal Sub-components
   ======================================== */

export interface ModalHeaderProps {
  children: ReactNode;
  className?: string;
  centered?: boolean;
}

export function ModalHeader({ 
  children, 
  className = '',
  centered = false 
}: ModalHeaderProps) {
  return (
    <div className={`px-6 pt-6 pb-2 ${centered ? 'text-center' : ''} ${className}`}>
      <h3 className="text-lg font-semibold text-text-primary">
        {children}
      </h3>
    </div>
  );
}

export interface ModalBodyProps {
  children: ReactNode;
  className?: string;
  centered?: boolean;
  padded?: boolean;
}

export function ModalBody({ 
  children, 
  className = '',
  centered = false,
  padded = true 
}: ModalBodyProps) {
  return (
    <div className={`
      ${padded ? 'px-6 py-4' : ''} 
      ${centered ? 'flex flex-col items-center text-center' : ''} 
      ${className}
    `}>
      {children}
    </div>
  );
}

export interface ModalFooterProps {
  children: ReactNode;
  className?: string;
  centered?: boolean;
}

export function ModalFooter({ 
  children, 
  className = '',
  centered = true 
}: ModalFooterProps) {
  return (
    <div className={`
      px-6 pb-6 pt-2 
      ${centered ? 'flex flex-col items-center gap-2' : 'flex gap-2'} 
      ${className}
    `}>
      {children}
    </div>
  );
}

export interface ModalIconProps {
  children: ReactNode;
  className?: string;
}

export function ModalIcon({ children, className = '' }: ModalIconProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

export interface ModalDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function ModalDescription({ children, className = '' }: ModalDescriptionProps) {
  return (
    <p className={`text-text-secondary text-sm mb-4 ${className}`}>
      {children}
    </p>
  );
}
