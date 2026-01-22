'use client';

import { useState, useEffect } from 'react';
import { MaintenancePage, PageMaintenanceSettings } from '../types/maintenance.types';
import { fetchMaintenanceConfig } from '../config/maintenance.config';

/**
 * Hook to check if a page is in maintenance mode
 * 
 * @param pageId - The ID of the page to check
 * @returns Object with isInMaintenance boolean and settings
 * 
 * @example
 * const { isInMaintenance, settings } = useMaintenance('staking');
 */
export function useMaintenance(pageId: MaintenancePage) {
  const [isInMaintenance, setIsInMaintenance] = useState(false);
  const [settings, setSettings] = useState<PageMaintenanceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkMaintenance = async () => {
      try {
        const config = await fetchMaintenanceConfig();
        const pageSettings = config.pages[pageId];
        
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
        console.error('Error checking maintenance:', error);
        setIsInMaintenance(false);
        setIsLoading(false);
      }
    };

    checkMaintenance();

    // Poll periodically to catch updates and countdown expiration
    const interval = setInterval(checkMaintenance, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, [pageId]);

  return { isInMaintenance, settings, isLoading };
}
