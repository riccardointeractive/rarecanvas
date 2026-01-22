import { SocialLinks, SocialLink } from '@/components/ui';
import { TokenPageConfig } from './types';

interface CommunitySectionProps {
  config: TokenPageConfig;
}

/**
 * Community Section
 * Displays social links for the token community
 */
export function CommunitySection({ config }: CommunitySectionProps) {
  // Transform config social links to SocialLinks format
  const socialLinks: SocialLink[] = config.socialLinks.map(link => ({
    name: link.name,
    icon: link.icon,
    url: link.url,
  }));

  return (
    <SocialLinks 
      title={config.communityTitle} 
      links={socialLinks} 
    />
  );
}
