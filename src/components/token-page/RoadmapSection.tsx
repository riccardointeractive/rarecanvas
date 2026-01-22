import { RoadmapItem as RoadmapItemComponent } from '@/components/ui';
import { TokenPageConfig } from './types';

interface RoadmapSectionProps {
  config: TokenPageConfig;
}

/**
 * Roadmap Section
 * Displays project roadmap from config with premium timeline design
 */
export function RoadmapSection({ config }: RoadmapSectionProps) {
  return (
    <div className="mb-12 md:mb-12 lg:mb-14">
      <h2 className="text-xl md:text-2xl font-medium text-text-primary mb-5 md:mb-6">Roadmap</h2>
      <div className="pl-1">
        {config.roadmap.map((item, index) => (
          <RoadmapItemComponent
            key={index}
            title={item.title}
            description={item.description}
            quarter={item.quarter}
            status={item.status === 'live' ? 'complete' : 'upcoming'}
            isLast={index === config.roadmap.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
