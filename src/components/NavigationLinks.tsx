'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * NavigationLinks Component
 * Desktop navigation with active page indication
 */
export function NavigationLinks() {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href;

  return (
    <div className="hidden md:flex items-center gap-1">
      <Link
        href="/"
        className={`px-4 py-2 text-sm rounded-lg transition-colors duration-150 ${
          isActive('/')
            ? 'text-text-primary bg-overlay-default'
            : 'text-text-secondary hover:text-text-primary hover:bg-overlay-default'
        }`}
      >
        Home
      </Link>
      <Link
        href="/dashboard"
        className={`px-4 py-2 text-sm rounded-lg transition-colors duration-150 ${
          isActive('/dashboard')
            ? 'text-text-primary bg-overlay-default'
            : 'text-text-secondary hover:text-text-primary hover:bg-overlay-default'
        }`}
      >
        Wallet
      </Link>
    </div>
  );
}
