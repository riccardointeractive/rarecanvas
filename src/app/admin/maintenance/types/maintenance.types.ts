/**
 * Maintenance Mode Types
 * 
 * Type definitions for the maintenance mode system.
 */

// Pages that can be put into maintenance mode
export type MaintenancePage = 
  | 'staking'
  | 'swap'
  | 'dashboard'
  | 'games'
  | 'dgko'
  | 'babydgko'
  | 'validators'
  | 'documentation'
  | 'pool'
  | 'nft'
  | 'ctr-kart'
  | 'planets';

// Page configuration
export interface PageConfig {
  id: MaintenancePage;
  name: string;
  path: string;
  description: string;
}

// Maintenance settings for a single page
export interface PageMaintenanceSettings {
  enabled: boolean;
  endTime: string | null; // ISO date string or null for indefinite
  reason: string;
  showCountdown: boolean;
}

// Full maintenance configuration
export interface MaintenanceConfig {
  pages: Record<MaintenancePage, PageMaintenanceSettings>;
  updatedAt: string;
  updatedBy: string;
}

// API response
export interface MaintenanceApiResponse {
  success: boolean;
  data?: MaintenanceConfig;
  error?: string;
}
