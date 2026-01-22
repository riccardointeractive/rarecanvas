/**
 * Maintenance Mode Module
 * 
 * Provides maintenance mode functionality for the Digiko platform.
 * Use MaintenanceWrapper to enable maintenance mode support on any page.
 * 
 * @example
 * // In your page.tsx
 * import { MaintenanceWrapper } from '@/app/admin/maintenance';
 * 
 * export default function StakingPage() {
 *   return (
 *     <MaintenanceWrapper pageId="staking">
 *       // ... your page content
 *     </MaintenanceWrapper>
 *   );
 * }
 */

// Components
export { MaintenanceWrapper, MaintenanceOverlay } from './components';

// Hooks
export { useMaintenance } from './hooks/useMaintenance';

// Types
export type { 
  MaintenancePage, 
  PageConfig, 
  PageMaintenanceSettings, 
  MaintenanceConfig 
} from './types/maintenance.types';

// Config & Helpers
export { 
  MAINTAINABLE_PAGES, 
  PAGE_ICONS,
  DEFAULT_PAGE_SETTINGS,
  DEFAULT_MAINTENANCE_CONFIG,
  fetchMaintenanceConfig,
  saveMaintenanceConfig,
  isPageInMaintenance,
} from './config/maintenance.config';
