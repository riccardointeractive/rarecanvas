import { CTASection as SharedCTASection } from '@/components/ui';
import { TokenPageConfig } from './types';

interface CTASectionProps {
  config: TokenPageConfig;
}

/**
 * CTA Section
 * Call-to-action section using config
 */
export function CTASection({ config }: CTASectionProps) {
  const { cta } = config;
  
  return (
    <SharedCTASection
      title={cta.title}
      description={cta.description}
      primaryAction={{
        href: cta.primaryAction.href,
        label: cta.primaryAction.label,
        external: cta.primaryAction.external,
      }}
      secondaryAction={cta.secondaryAction ? {
        href: cta.secondaryAction.href,
        label: cta.secondaryAction.label,
        external: cta.secondaryAction.external,
      } : undefined}
    />
  );
}
