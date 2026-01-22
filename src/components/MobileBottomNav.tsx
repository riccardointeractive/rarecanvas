'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { APP_CONFIG } from '@/config/app';
import { NetworkToggleInline } from './NetworkToggle';
import { ThemeToggle } from './ThemeToggle';

/**
 * MobileBottomNav Component
 * Fixed bottom navigation bar for mobile devices with main icons:
 * Wallet, Staking, and Menu (opens remaining pages)
 */
export function MobileBottomNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  // Main bottom nav items
  const mainNavItems = [
    {
      href: '/dashboard',
      label: 'Wallet',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
        </svg>
      )
    },
    {
      href: '/nft',
      label: 'Explore',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      )
    },
  ];

  // Menu items (remaining pages accessible via menu)
  const menuItems = [
    { href: '/nft/my-nfts', label: 'My NFTs', icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3" />
      </svg>
    )},
    { href: '/nft/activity', label: 'Activity', icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    )},
    { href: '/nft/collections', label: 'Collections', icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    )},
  ];


  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Check if any main nav item is active
  const isMainNavActive = mainNavItems.some(item => isActive(item.href));


  return (
    <>
      {/* Fixed bottom navigation - only visible on mobile */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
        {/* Solid background with top border */}
        <div className="bg-bg-base border-t border-border-default safe-area-bottom">
          <div className="flex items-center h-16">
            {mainNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                  isActive(item.href)
                    ? 'text-text-primary'
                    : 'text-text-muted hover:text-text-primary'
                }`}
              >
                {item.icon}
                <span className="text-2xs mt-1 font-medium">{item.label}</span>
              </Link>
            ))}
            
            {/* Menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-colors ${
                isMenuOpen || (!isMainNavActive && pathname !== '/')
                  ? 'text-text-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
              aria-label="Menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
              <span className="text-2xs mt-1 font-medium">More</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Menu overlay */}
      {isMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-backdrop z-40 md:hidden"
            onClick={() => setIsMenuOpen(false)}
          />
          
          {/* Menu panel - slides up from bottom */}
          <div className="fixed bottom-16 left-0 right-0 z-50 md:hidden animate-slide-up safe-area-bottom">
            <div className="mx-4 mb-2 bg-bg-surface rounded-2xl border border-border-default shadow-dropdown overflow-hidden">
              {/* Main menu items */}
              <div className="p-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors duration-150 ${
                      isActive(item.href)
                        ? 'bg-overlay-active text-text-primary border border-border-default'
                        : 'text-text-secondary hover:text-text-primary hover:bg-overlay-default'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ))}
              </div>
              
              {/* Theme Toggle */}
              <div className="border-t border-border-default p-2">
                <ThemeToggle />
              </div>
              
              {/* Bottom section with app info and network toggle */}
              <div className="px-4 py-3 border-t border-border-default bg-overlay-subtle">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">
                    {APP_CONFIG.name} v{APP_CONFIG.version} {APP_CONFIG.status}
                  </span>
                  <NetworkToggleInline />
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}