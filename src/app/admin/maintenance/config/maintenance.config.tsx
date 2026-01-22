import { Droplets, 
  Coins, 
  ArrowLeftRight, 
  Gamepad2, 
  Wallet, 
  Baby, 
  BookOpen,
  Shield,
  ImageIcon,
  Car,
  Globe
} from 'lucide-react';
import { MaintenancePage, PageConfig, MaintenanceConfig, PageMaintenanceSettings } from '../types/maintenance.types';

/**
 * Maintenance Mode Configuration
 * 
 * Defines all pages that can be put into maintenance mode.
 * Config is stored server-side via API for cross-device support.
 */

// Page definitions with icons
export const MAINTAINABLE_PAGES: PageConfig[] = [
  {
    id: 'staking',
    name: 'Staking',
    path: '/staking',
    description: 'DGKO and BABYDGKO token staking',
  },
  {
    id: 'swap',
    name: 'Swap',
    path: '/swap',
    description: 'Token swap and DEX functionality',
  },
  {
    id: 'dashboard',
    name: 'Wallet',
    path: '/dashboard',
    description: 'Portfolio and account overview',
  },
  {
    id: 'validators',
    name: 'Validators',
    path: '/validators',
    description: 'Validator simulation and delegation optimizer',
  },
  {
    id: 'games',
    name: 'Games',
    path: '/games',
    description: 'Roulette and gaming features',
  },
  {
    id: 'ctr-kart',
    name: 'CTR Kart',
    path: '/games/ctr-kart',
    description: '2D racing game',
  },
  {
    id: 'dgko',
    name: 'DGKO Token',
    path: '/dgko',
    description: 'DGKO token information page',
  },
  {
    id: 'babydgko',
    name: 'BABYDGKO Token',
    path: '/babydgko',
    description: 'BABYDGKO token information page',
  },
  {
    id: 'documentation',
    name: 'Documentation',
    path: '/documentation',
    description: 'Platform documentation and guides',
  },
  {
    id: 'pool',
    name: 'Pool',
    path: '/pool',
    description: 'Liquidity pool management',
  },
  {
    id: 'nft',
    name: 'NFT Marketplace',
    path: '/nft',
    description: 'NFT marketplace and trading',
  },
  {
    id: 'planets',
    name: 'Planet Survival',
    path: '/games/planets',
    description: 'Planet survival betting game',
  },
];

// Page icons mapping
export const PAGE_ICONS: Record<MaintenancePage, React.ReactNode> = {
  staking: <Coins className="w-5 h-5" />,
  swap: <ArrowLeftRight className="w-5 h-5" />,
  dashboard: <Wallet className="w-5 h-5" />,
  validators: <Shield className="w-5 h-5" />,
  games: <Gamepad2 className="w-5 h-5" />,
  'ctr-kart': <Car className="w-5 h-5" />,
  dgko: <Coins className="w-5 h-5" />,
  babydgko: <Baby className="w-5 h-5" />,
  documentation: <BookOpen className="w-5 h-5" />,
  pool: <Droplets className="w-5 h-5" />,
  nft: <ImageIcon className="w-5 h-5" />,
  planets: <Globe className="w-5 h-5" />,
};

// Default settings for a page
export const DEFAULT_PAGE_SETTINGS: PageMaintenanceSettings = {
  enabled: false,
  endTime: null,
  reason: 'This feature is temporarily undergoing maintenance.',
  showCountdown: true,
};

// Default maintenance config
export const DEFAULT_MAINTENANCE_CONFIG: MaintenanceConfig = {
  pages: {
    staking: { ...DEFAULT_PAGE_SETTINGS },
    swap: { ...DEFAULT_PAGE_SETTINGS },
    dashboard: { ...DEFAULT_PAGE_SETTINGS },
    validators: { ...DEFAULT_PAGE_SETTINGS },
    games: { ...DEFAULT_PAGE_SETTINGS },
    'ctr-kart': { ...DEFAULT_PAGE_SETTINGS },
    dgko: { ...DEFAULT_PAGE_SETTINGS },
    babydgko: { ...DEFAULT_PAGE_SETTINGS },
    documentation: { ...DEFAULT_PAGE_SETTINGS },
    pool: { ...DEFAULT_PAGE_SETTINGS },
    nft: { ...DEFAULT_PAGE_SETTINGS },
    planets: { ...DEFAULT_PAGE_SETTINGS },
  },
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
};

// API endpoint
const API_ENDPOINT = '/api/maintenance';

// Cache for maintenance config (with TTL)
let configCache: MaintenanceConfig | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5000; // 5 seconds cache

// Fetch maintenance config from API
export async function fetchMaintenanceConfig(): Promise<MaintenanceConfig> {
  // Check cache first
  const now = Date.now();
  if (configCache && (now - cacheTimestamp) < CACHE_TTL) {
    return configCache;
  }

  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'GET',
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch config');
    }
    
    const result = await response.json();
    if (result.success && result.data) {
      // Merge with defaults to ensure new pages exist
      const mergedConfig: MaintenanceConfig = {
        ...DEFAULT_MAINTENANCE_CONFIG,
        ...result.data,
        pages: {
          ...DEFAULT_MAINTENANCE_CONFIG.pages,
          ...result.data.pages,
        },
      };
      configCache = mergedConfig;
      cacheTimestamp = now;
      return mergedConfig;
    }
  } catch (error) {
    console.error('Error fetching maintenance config:', error);
  }
  
  return DEFAULT_MAINTENANCE_CONFIG;
}

// Save maintenance config to API
export async function saveMaintenanceConfig(config: MaintenanceConfig): Promise<boolean> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config),
    });
    
    if (!response.ok) {
      throw new Error('Failed to save config');
    }
    
    const result = await response.json();
    if (result.success) {
      // Update cache
      configCache = config;
      cacheTimestamp = Date.now();
      return true;
    }
  } catch (error) {
    console.error('Error saving maintenance config:', error);
  }
  
  return false;
}

// Helper to check if a page is in maintenance mode (async)
export async function isPageInMaintenance(pageId: MaintenancePage): Promise<boolean> {
  const config = await fetchMaintenanceConfig();
  const pageSettings = config.pages[pageId];
  
  if (!pageSettings?.enabled) return false;
  
  // If there's an end time and it has passed, page is no longer in maintenance
  if (pageSettings.endTime) {
    const endTime = new Date(pageSettings.endTime);
    if (endTime <= new Date()) {
      return false;
    }
  }
  
  return true;
}

// Legacy sync function for backward compatibility (uses cache only)
export function getMaintenanceConfig(): MaintenanceConfig {
  return configCache || DEFAULT_MAINTENANCE_CONFIG;
}

// Legacy sync save (triggers async save)
export function saveMaintenanceConfigSync(config: MaintenanceConfig): void {
  configCache = config;
  cacheTimestamp = Date.now();
  // Fire and forget
  saveMaintenanceConfig(config);
}
