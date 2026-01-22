import { ReactNode } from 'react';

/**
 * SectionTitle Component
 * 
 * Reusable section header with title and optional description.
 * Used throughout the site for consistent section headings.
 * 
 * @example
 * <SectionTitle 
 *   title="Platform Features"
 *   description="A complete suite of tools for the Klever ecosystem"
 * />
 */

export interface SectionTitleProps {
  /** Main title text */
  title: string | ReactNode;
  /** Optional description below title */
  description?: string;
  /** Text alignment */
  align?: 'left' | 'center';
  /** Title size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional className for wrapper */
  className?: string;
}

export function SectionTitle({
  title,
  description,
  align = 'center',
  size = 'md',
  className = '',
}: SectionTitleProps) {
  const alignStyles = {
    left: 'text-left',
    center: 'text-center',
  };

  const titleSizeStyles = {
    sm: 'text-xl md:text-2xl font-medium',
    md: 'text-2xl md:text-3xl font-medium',
    lg: 'text-3xl md:text-4xl lg:text-5xl font-medium',
  };

  const descriptionMaxWidth = {
    left: '',
    center: 'max-w-2xl mx-auto',
  };

  return (
    <div className={`${alignStyles[align]} mb-10 md:mb-12 lg:mb-16 ${className}`}>
      <h2 className={`${titleSizeStyles[size]} text-text-primary mb-4 md:mb-5`}>
        {title}
      </h2>
      {description && (
        <p className={`text-sm md:text-base text-text-secondary ${descriptionMaxWidth[align]}`}>
          {description}
        </p>
      )}
    </div>
  );
}
