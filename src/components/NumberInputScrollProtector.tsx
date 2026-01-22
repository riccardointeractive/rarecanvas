'use client';

import { useDisableNumberInputScroll } from '@/hooks/useDisableNumberInputScroll';

/** Installs global scroll wheel protection for number inputs */
export function NumberInputScrollProtector() {
  useDisableNumberInputScroll();
  return null;
}
