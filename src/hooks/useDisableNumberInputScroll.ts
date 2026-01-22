'use client';

import { useEffect } from 'react';

/**
 * Disables scroll wheel on ALL number inputs globally.
 * Prevents accidental value changes when scrolling through forms.
 * Call once in root layout.
 */
export function useDisableNumberInputScroll() {
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'number') {
        target.blur();
      }
    };
    document.addEventListener('wheel', handleWheel, { passive: true });
    return () => document.removeEventListener('wheel', handleWheel);
  }, []);
}
