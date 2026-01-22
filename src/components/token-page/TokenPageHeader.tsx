import { TokenImage, TOKEN_IDS } from '@/components/TokenImage';
import { TokenPageConfig } from './types';

interface TokenPageHeaderProps {
  config: TokenPageConfig;
}

/**
 * Token Page Header
 * Simple header with token image, name, and asset ID
 * Matches GenericTokenPage style
 */
export function TokenPageHeader({ config }: TokenPageHeaderProps) {
  // Get the actual assetId from TOKEN_IDS mapping
  const assetId = TOKEN_IDS[config.headerTokenId as keyof typeof TOKEN_IDS] || config.assetId;
  
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3">
        <TokenImage assetId={assetId} size="xl" />
        <div>
          <h1 className="text-xl font-medium text-text-primary">{config.displayName}</h1>
          <p className="text-base text-text-secondary font-mono">{config.assetId}</p>
        </div>
      </div>
    </div>
  );
}