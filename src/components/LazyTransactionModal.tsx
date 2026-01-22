/**
 * Lazy-loaded TransactionModal
 * 
 * Use this instead of direct import to reduce initial bundle size.
 * The modal code (675 lines) is only loaded when isOpen becomes true.
 * 
 * Usage:
 * import { LazyTransactionModal, TransactionStatus } from '@/components/LazyTransactionModal';
 * 
 * {modalOpen && (
 *   <LazyTransactionModal
 *     isOpen={modalOpen}
 *     status={status}
 *     ...
 *   />
 * )}
 */

import dynamic from 'next/dynamic';

// Re-export the type for convenience
export type { TransactionStatus } from './TransactionModal';

// Lazy load the modal - only downloaded when needed
export const LazyTransactionModal = dynamic(
  () => import('./TransactionModal').then(mod => ({ default: mod.TransactionModal })),
  { 
    ssr: false,
    // No loading state needed - modal appears instantly when ready
    // The parent component controls visibility with isOpen
  }
);

// Also export a version with loading indicator for cases where you want feedback
export const LazyTransactionModalWithLoader = dynamic(
  () => import('./TransactionModal').then(mod => ({ default: mod.TransactionModal })),
  { 
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-backdrop">
        <div className="w-12 h-12 border-4 border-border-brand border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }
);
