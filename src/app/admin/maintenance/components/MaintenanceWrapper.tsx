'use client';

import { useState, useEffect, ReactNode } from 'react';
import { MaintenanceOverlay } from './MaintenanceOverlay';
import { 
  MaintenancePage, 
  PageMaintenanceSettings 
} from '../types/maintenance.types';
import { 
  MAINTAINABLE_PAGES,
} from '../config/maintenance.config';

/**
 * Maintenance Wrapper Component
 * 
 * Wraps a page and shows maintenance overlay if the page is in maintenance mode.
 * Fetches config from server API for cross-device support.
 */

interface MaintenanceWrapperProps {
  pageId: MaintenancePage;
  children: ReactNode;
}

// Simple in-memory cache to avoid repeated API calls
let cachedConfig: any = null;
let cacheTime: number = 0;
const CACHE_DURATION = 30000; // 30 seconds

async function getMaintenanceConfig() {
  const now = Date.now();
  
  // Return cache if fresh
  if (cachedConfig && (now - cacheTime) < CACHE_DURATION) {
    return cachedConfig;
  }
  
  try {
    const response = await fetch('/api/maintenance', { 
      cache: 'no-store',
      signal: AbortSignal.timeout(5000), // 5 second timeout
    });
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        cachedConfig = result.data;
        cacheTime = now;
        return result.data;
      }
    }
  } catch (error) {
    console.error('Error fetching maintenance config:', error);
  }
  
  return cachedConfig || { pages: {} };
}

export function MaintenanceWrapper({ pageId, children }: MaintenanceWrapperProps) {
  const [isInMaintenance, setIsInMaintenance] = useState(false);
  const [settings, setSettings] = useState<PageMaintenanceSettings | null>(null);
  const [pageName, setPageName] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const config = await getMaintenanceConfig();
        const pageSettings = config.pages?.[pageId];
        const page = MAINTAINABLE_PAGES.find(p => p.id === pageId);
        
        setPageName(page?.name || pageId);
        
        if (!pageSettings?.enabled) {
          setIsInMaintenance(false);
          setSettings(null);
          setIsLoading(false);
          return;
        }

        // Check if maintenance has ended
        if (pageSettings.endTime) {
          const endTime = new Date(pageSettings.endTime);
          if (endTime <= new Date()) {
            setIsInMaintenance(false);
            setSettings(null);
            setIsLoading(false);
            return;
          }
        }

        setIsInMaintenance(true);
        setSettings(pageSettings);
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking maintenance status:', error);
        setIsInMaintenance(false);
        setIsLoading(false);
      }
    };

    // Initial check
    checkMaintenance();

    // Poll less frequently - every 60 seconds
    const interval = setInterval(checkMaintenance, 60000);
    
    return () => {
      clearInterval(interval);
    };
  }, [pageId]);

  // Show children immediately while loading (non-blocking)
  if (isLoading) {
    return <>{children}</>;
  }

  // If in maintenance, show overlay
  if (isInMaintenance && settings) {
    return <MaintenanceOverlay pageName={pageName} settings={settings} />;
  }

  // Otherwise, render the page normally
  return <>{children}</>;
}
