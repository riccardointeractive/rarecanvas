import { ReactNode } from 'react';
import { Card } from '@/components/Card';

/**
 * SocialLink Interface
 * Configuration for a single social media link.
 */
export interface SocialLink {
  /** Display name */
  name: string;
  /** Icon element */
  icon: ReactNode;
  /** URL to link to */
  url: string;
  /** Hover color class (e.g., 'hover:text-info') */
  hoverColor?: string;
}

/**
 * SocialLinks Component
 * 
 * A section displaying social media/community links in a card.
 * Used on token pages and other community sections.
 * 
 * @example
 * <SocialLinks
 *   title="Community"
 *   links={[
 *     { name: 'X (Twitter)', icon: <XIcon />, url: 'https://x.com/...' },
 *     { name: 'Telegram', icon: <TelegramIcon />, url: 'https://t.me/...' },
 *     { name: 'LinkedIn', icon: <LinkedInIcon />, url: 'https://linkedin.com/...' },
 *   ]}
 * />
 */

export interface SocialLinksProps {
  /** Section title */
  title?: string;
  /** Array of social links */
  links: SocialLink[];
  /** Additional className for wrapper */
  className?: string;
}

export function SocialLinks({
  title = 'Community',
  links,
  className = '',
}: SocialLinksProps) {
  return (
    <div className={`mb-12 ${className}`}>
      {title && (
        <h2 className="text-2xl font-medium text-text-primary mb-6">{title}</h2>
      )}
      <Card rounded="2xl" size="xl">
        <div className="flex flex-wrap gap-3">
          {links.map((social) => (
            <a
              key={social.name}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center gap-3 px-5 py-3 rounded-xl bg-overlay-default hover:bg-overlay-active transition-all duration-150 text-text-secondary ${social.hoverColor || 'hover:text-text-primary'}`}
            >
              {social.icon}
              <span className="font-medium">{social.name}</span>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
