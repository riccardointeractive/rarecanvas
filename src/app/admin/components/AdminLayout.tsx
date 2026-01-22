'use client';

import { ReactNode, useState, useEffect } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminHeader } from './AdminHeader';
import { TestnetBanner } from '@/components/TestnetBanner';
import { useNetworkConfig } from '@/hooks/useNetworkConfig';

/**
 * Admin Layout Component
 * 
 * Provides consistent layout for all admin pages with responsive sidebar + header
 * - TestnetBanner at very top (when on testnet)
 * - AdminSidebar on left (responsive widths)
 * - AdminHeader at top (fixed, below banner)
 * - Main content area with proper spacing
 * - Dynamically adjusts to sidebar collapse state
 * - Handles authentication state
 */

interface AdminLayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

const STORAGE_KEY = 'rarecanvas-admin-sidebar-collapsed';

export function AdminLayout({ children, onLogout }: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { isTestnet } = useNetworkConfig();

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

  // Prevent layout shift during SSR
  if (!mounted) {
    return (
      <>
        {/* Testnet Banner - Fixed at very top with highest z-index */}
        <div className="fixed top-0 left-0 right-0 z-50">
          <TestnetBanner />
        </div>
        <AdminSidebar onLogout={onLogout} />
        <AdminHeader />
        <main className="ml-16 lg:ml-60 pt-16 transition-all duration-300">
          <div className="min-h-screen py-8 px-6 md:px-8 lg:px-12">
            <div className="max-w-[1400px] mx-auto">
              {children}
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      {/* Testnet Banner - Fixed at very top with highest z-index */}
      <div className="fixed top-0 left-0 right-0 z-50">
        <TestnetBanner />
      </div>

      {/* Sidebar */}
      <AdminSidebar onLogout={onLogout} showBannerOffset={isTestnet} />

      {/* Header - needs top offset when testnet banner is visible */}
      <AdminHeader showBannerOffset={isTestnet} />

      {/* Main Content - Dynamic margin based on sidebar state, padding for header */}
      <main 
        className={`
          transition-all duration-300
          ${isTestnet ? 'pt-[104px]' : 'pt-16'}
          ml-16
          ${isCollapsed ? 'lg:ml-16' : 'lg:ml-60'}
        `}
      >
        <div className="min-h-screen py-8 px-6 md:px-8 lg:px-12">
          <div className="max-w-[1400px] mx-auto">
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
