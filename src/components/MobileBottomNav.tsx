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
  ];

  // Menu items (remaining pages accessible via menu)
  const menuItems = [
    { href: '/', label: 'Home', icon: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
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