'use client';

import { usePathname } from 'next/navigation';
import { ReactNode } from 'react';

/**
 * ConditionalNav Component
 * 
 * Conditionally renders navigation based on current route
 * Hides header/footer for admin routes to maintain clean admin interface
 */
export function ConditionalNav({ 
  children 
}: { 
  children: ReactNode 
}) {
  const pathname = usePathname();
  
  // Hide navigation on admin routes
  const isAdminRoute = pathname?.startsWith('/admin');
  
  if (isAdminRoute) {
    return null;
  }
  
  return <>{children}</>;
}
