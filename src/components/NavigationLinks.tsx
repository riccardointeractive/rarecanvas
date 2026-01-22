'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

/**
 * NavigationLinks Component
 * Desktop navigation with active page indication
 */
export function NavigationLinks() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Exact match for specific routes
    if (href === '/nft') return pathname === '/nft';
    return pathname.startsWith(href);
  };

  const navItems = [
    { href: '/dashboard', label: 'Wallet' },
    { href: '/nft', label: 'Explore' },
    { href: '/nft/my-nfts', label: 'My NFTs' },
    { href: '/nft/activity', label: 'Activity' },
    { href: '/nft/collections', label: 'Collections' },
  ];

  return (
    <div className="hidden md:flex items-center gap-1">
      {navItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`px-4 py-2 text-sm rounded-lg transition-colors duration-150 ${
            isActive(item.href)
              ? 'text-text-primary bg-overlay-default'
              : 'text-text-secondary hover:text-text-primary hover:bg-overlay-default'
          }`}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
