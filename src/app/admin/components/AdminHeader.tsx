'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { APP_CONFIG } from '@/config/app';
import { WalletConnect } from '@/components/WalletConnect';
import { NetworkToggle } from '@/components/NetworkToggle';

/**
 * Admin Header Component
 * 
 * Fixed top navigation bar for admin section with:
 * - Page title/breadcrumb
 * - Network toggle (mainnet/testnet)
 * - Version info
 * - Admin badge
 * - Dynamic margin that responds to sidebar collapse state
 * - Offset for testnet banner when active
 */

const STORAGE_KEY = 'rarecanvas-admin-sidebar-collapsed';

const getPageTitle = (pathname: string): string => {
  const segments = pathname.split('/').filter(Boolean);
  const lastSegment = segments[segments.length - 1];
  
  // Map paths to titles
  const titles: Record<string, string> = {
    'admin': 'Dashboard',
    'contracts': 'Smart Contracts',
    'token-prices': 'Token Prices',
    'design-system': 'Design System',
    'project-rules': 'Project Rules',
  };
  
  return (lastSegment && titles[lastSegment]) || 'Admin';
};

interface AdminHeaderProps {
  showBannerOffset?: boolean;
}

export function AdminHeader({ showBannerOffset = false }: AdminHeaderProps) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Sync with sidebar collapse state from localStorage
  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    }

    // Listen for storage changes (in case sidebar is toggled)
    const handleStorageChange = () => {
      const current = localStorage.getItem(STORAGE_KEY);
      if (current !== null) {
        setIsCollapsed(current === 'true');
      }
    };

    // Check localStorage periodically for changes
    const interval = setInterval(handleStorageChange, 100);
    
    return () => clearInterval(interval);
  }, []);

  // Prevent layout shift during SSR - use default expanded state
  const marginClass = !mounted 
    ? 'ml-16 lg:ml-60' 
    : `ml-16 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`;

  // Top position: 0 normally, ~40px when banner is shown (banner height)
  const topClass = showBannerOffset ? 'top-[40px]' : 'top-0';

  return (
    <header className={`fixed ${topClass} left-0 right-0 h-16 glass border-b border-border-default z-40 transition-all duration-300`}>
      <div className={`h-full flex items-center justify-between px-6 transition-all duration-300 ${marginClass}`}>
        {/* Left: Page Title */}
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-semibold text-text-primary">{pageTitle}</h1>
        </div>

        {/* Right: Network Toggle, Version & Info */}
        <div className="flex items-center gap-4">
          {/* Network Toggle */}
          <NetworkToggle compact showLabel={false} />
          
          {/* Version Badge */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-overlay-subtle border border-border-default">
            <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <span className="text-xs font-mono text-text-secondary">{APP_CONFIG.versionDisplay}</span>
          </div>

          {/* Wallet Connect */}
          <WalletConnect variant="compact" />

          {/* Admin Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-brand-primary/10 border border-brand-primary/20">
            <svg className="w-4 h-4 text-brand-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-xs font-medium text-brand-primary">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
}
