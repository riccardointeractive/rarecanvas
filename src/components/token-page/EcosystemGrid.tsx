import { EcosystemCard } from './EcosystemCard';
import { TokenPageConfig } from './types';

interface EcosystemGridProps {
  config: TokenPageConfig;
}

/**
 * Ecosystem Grid
 * Grid display of all ecosystem features from config
 */
export function EcosystemGrid({ config }: EcosystemGridProps) {
  return (
    <div className="mb-12 md:mb-12 lg:mb-14">
      <h2 className="text-xl md:text-2xl font-medium text-text-primary mb-5 md:mb-5">Ecosystem</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 md:gap-8">
        {config.ecosystemFeatures.map((feature) => (
          <EcosystemCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
            status={feature.status}
            href={feature.href}
          />
        ))}
      </div>
    </div>
  );
}
