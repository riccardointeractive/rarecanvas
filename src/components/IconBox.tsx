interface IconBoxProps {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'blue' | 'purple' | 'cyan' | 'gray';
}

export function IconBox({ icon, size = 'md', variant = 'blue' }: IconBoxProps) {
  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-14 h-14',
    lg: 'w-16 h-16'
  };

  const variantClasses = {
    blue: 'bg-gradient-to-br from-surface to-elevated',
    purple: 'bg-gradient-to-br from-brand-secondary/20 to-brand-secondary/5',
    cyan: 'bg-gradient-to-br from-brand-primary/20 to-brand-primary/5',
    gray: 'bg-gradient-to-br from-text-muted/20 to-text-muted/5'
  };

  const iconColorClasses = {
    blue: 'text-text-primary',
    purple: 'text-brand-primary-secondary',
    cyan: 'text-brand-primary',
    gray: 'text-text-muted'
  };

  return (
    <div className={`${sizeClasses[size]} rounded-2xl ${variantClasses[variant]} flex items-center justify-center tr-transform-emphasis ${iconColorClasses[variant]}`}>
      {icon}
    </div>
  );
}
