import { ReactNode } from 'react';

/**
 * InfoCard Component - Linear Style
 * 
 * Centered information card with icon, title, and description.
 * Uses design tokens only.
 */

export interface InfoCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  iconVariant?: 'blue' | 'cyan' | 'purple';
  align?: 'left' | 'center';
  className?: string;
}

export function InfoCard({
  icon,
  title,
  description,
  align = 'center',
  className = '',
}: InfoCardProps) {
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
  };

  const iconAlignStyles = {
    left: '',
    center: 'mx-auto',
  };

  return (
    <div className={`${alignStyles[align]} ${className}`}>
      <div className={`w-12 h-12 rounded-xl bg-bg-elevated flex items-center justify-center mb-4 ${iconAlignStyles[align]}`}>
        <div className="text-brand-primary">
          {icon}
        </div>
      </div>
      <h3 className="text-base font-medium text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-secondary leading-relaxed">{description}</p>
    </div>
  );
}
