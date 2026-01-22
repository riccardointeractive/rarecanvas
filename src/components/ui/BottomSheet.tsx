'use client';

import { useEffect, useCallback, ReactNode } from 'react';

export interface BottomSheetProps {
  /** Whether the bottom sheet is open */
  isOpen: boolean;
  /** Callback when sheet should close */
  onClose: () => void;
  /** Sheet content */
  children: ReactNode;
  /** Title displayed in header */
  title?: string;
  /** Show close button */
  showCloseButton?: boolean;
  /** Height: 'auto' fits content, 'full' is 90vh, or custom like '50vh' */
  height?: 'auto' | 'full' | string;
  /** Additional class for the sheet container */
  className?: string;
}

/**
 * BottomSheet Component
 * 
 * A mobile-friendly bottom sheet that slides up from the bottom of the screen.
 * Automatically used on mobile, with backdrop and swipe-to-close behavior.
 * 
 * @example
 * <BottomSheet 
 *   isOpen={isOpen} 
 *   onClose={() => setIsOpen(false)}
 *   title="Select Token"
 * >
 *   <TokenList />
 * </BottomSheet>
 */
export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  showCloseButton = true,
  height = 'auto',
  className = '',
}: BottomSheetProps) {
  // Handle escape key
  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  // Lock body scroll when open
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

  const heightClass = height === 'auto' 
    ? 'max-h-[85vh]' 
    : height === 'full' 
      ? 'h-[90vh]' 
      : '';
  
  const heightStyle = height !== 'auto' && height !== 'full' 
    ? { height } 
    : undefined;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-50 bg-backdrop animate-fade-in md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Sheet */}
      <div 
        className={`
          fixed bottom-0 left-0 right-0 z-50 
          bg-bg-surface 
          rounded-t-3xl 
          border-t border-border-default
          shadow-lg
          animate-slide-up
          md:hidden
          ${heightClass}
          ${className}
        `}
        style={heightStyle}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'bottom-sheet-title' : undefined}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 rounded-full bg-overlay-heavy" />
        </div>

        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-5 pb-3 border-b border-border-default">
            {title && (
              <h3 id="bottom-sheet-title" className="text-lg font-semibold text-text-primary">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-overlay-default hover:bg-overlay-active transition-colors ml-auto"
                aria-label="Close"
              >
                <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: 'calc(85vh - 80px)' }}>
          {children}
        </div>
      </div>
    </>
  );
}
