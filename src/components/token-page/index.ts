/**
 * Token Page Component Library
 * 
 * Dynamic token page system for DGKO, BABYDGKO, and future tokens.
 * Each token page just needs a config file.
 * 
 * @example
 * import { TokenPage, TokenPageConfig } from '@/components/token-page';
 * import { myTokenConfig } from './config/mytoken.config';
 * 
 * export default function MyTokenPage() {
 *   return <TokenPage config={myTokenConfig} />;
 * }
 */

// Main component
export { TokenPage } from './TokenPage';

// Types
export type {
  TokenPageConfig,
  TokenStats,
  TokenomicsItem,
  TokenomicsDisplayConfig,
  RoadmapItem,
  EcosystemFeature,
  TokenDetail,
  SocialLinkConfig,
  CTAConfig,
  OnChainDataConfig,
  ActivityMetric,
} from './types';

// Hook (if you need to use it separately)
export { useTokenStats } from './useTokenStats';

// Individual components (if you need to compose differently)
export { TokenPageHeader } from './TokenPageHeader';
export { StakingOverviewCard } from './StakingOverviewCard';
export { TokenActivityCards } from './TokenActivityCards';
export { TokenomicsSection } from './TokenomicsSection';
export { OnChainDataGrid } from './OnChainDataGrid';
export { EcosystemGrid } from './EcosystemGrid';
export { EcosystemCard } from './EcosystemCard';
export { RoadmapSection } from './RoadmapSection';
export { TokenDetailsSection } from './TokenDetailsSection';
export { CommunitySection } from './CommunitySection';
export { CTASection } from './CTASection';
