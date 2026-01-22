'use client';

import { use } from 'react';
import { TokenPage } from '@/components/token-page';
import { MaintenanceWrapper } from '@/app/admin/maintenance';
import { hasCustomConfig, getTokenConfig } from './config';
import { GenericTokenPage } from './GenericTokenPage';

interface TokenPageParams {
  params: Promise<{ assetId: string }>;
}

/**
 * Dynamic Token Page
 * 
 * Routes to the appropriate token page based on asset ID:
 * - DGKO-CXVJ, BABYDGKO-3S67: Uses custom TokenPage with rich config
 * - All other tokens: Uses GenericTokenPage with Klever API data
 * 
 * URL format: /token/[assetId]
 * Examples:
 * - /token/DGKO-CXVJ
 * - /token/BABYDGKO-3S67
 * - /token/KLV
 * - /token/USDT-ODW7
 */
export default function DynamicTokenPage({ params }: TokenPageParams) {
  const { assetId } = use(params);
  
  // Decode URL-encoded asset ID (handles special characters like -)
  const decodedAssetId = decodeURIComponent(assetId);

  // Check if this is a Digiko ecosystem token with custom config
  if (hasCustomConfig(decodedAssetId)) {
    const config = getTokenConfig(decodedAssetId);
    
    if (config) {
      // Determine maintenance page ID from asset ID
      const maintenancePageId = decodedAssetId === 'DGKO-CXVJ' ? 'dgko' : 
                                decodedAssetId === 'BABYDGKO-3S67' ? 'babydgko' : 
                                undefined;
      
      // Wrap in maintenance if it's a Digiko token
      if (maintenancePageId) {
        return (
          <MaintenanceWrapper pageId={maintenancePageId}>
            <TokenPage config={config} />
          </MaintenanceWrapper>
        );
      }
      
      return <TokenPage config={config} />;
    }
  }

  // Generic token page for all other tokens
  return <GenericTokenPage assetId={decodedAssetId} />;
}
