'use client';

import Link from 'next/link';
import { ArrowRight, Coins, ArrowLeftRight, Lock, Gamepad2 } from 'lucide-react';

/**
 * QuickGuideSection Component
 * Feature cards for quick navigation to main app sections
 */
export function QuickGuideSection() {
  const features = [
    {
      title: 'Token Pages',
      description: 'Explore DGKO and BABYDGKO tokenomics, stats, and on-chain data',
      icon: <Coins className="w-5 h-5" />,
      href: '/dgko',
      color: 'blue',
      badge: null,
    },
    {
      title: 'DEX Swap',
      description: 'Trade tokens directly with our decentralized exchange',
      icon: <ArrowLeftRight className="w-5 h-5" />,
      href: '/swap',
      color: 'purple',
      badge: null,
    },
    {
      title: 'Staking',
      description: 'Earn up to 15% APY by staking your tokens',
      icon: <Lock className="w-5 h-5" />,
      href: '/staking',
      color: 'green',
      badge: null,
    },
    {
      title: 'Games',
      description: 'Play crypto games and win tokens',
      icon: <Gamepad2 className="w-5 h-5" />,
      href: '/games',
      color: 'cyan',
      badge: 'Soon',
    },
  ];

  const colorStyles = {
    blue: {
      bg: 'bg-info-muted',
      border: 'group-hover:border-border-info',
      icon: 'text-info',
      arrow: 'group-hover:text-info',
    },
    purple: {
      bg: 'bg-brand-primary/10',
      border: 'group-hover:border-border-brand',
      icon: 'text-brand-primary',
      arrow: 'group-hover:text-brand-primary',
    },
    green: {
      bg: 'bg-success-muted',
      border: 'group-hover:border-border-success',
      icon: 'text-success',
      arrow: 'group-hover:text-success',
    },
    cyan: {
      bg: 'bg-info-muted',
      border: 'group-hover:border-border-info',
      icon: 'text-info',
      arrow: 'group-hover:text-info',
    },
  };

  return (
    <div className="mt-6">
      <h3 className="text-lg font-medium text-text-primary mb-4">Explore Rare Canvas</h3>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {features.map((feature) => {
          const colors = colorStyles[feature.color as keyof typeof colorStyles];
          
          return (
            <Link
              key={feature.title}
              href={feature.href}
              className={`group relative p-4 rounded-xl bg-overlay-default border border-border-default hover:bg-overlay-active ${colors.border} transition-all duration-150`}
            >
              {/* Badge */}
              {feature.badge && (
                <span className="absolute top-3 right-3 text-2xs uppercase tracking-wider px-2 py-0.5 rounded bg-overlay-active text-text-secondary">
                  {feature.badge}
                </span>
              )}
              
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg ${colors.bg} flex items-center justify-center mb-3`}>
                <span className={colors.icon}>{feature.icon}</span>
              </div>
              
              {/* Content */}
              <h4 className="font-medium text-text-primary mb-1">{feature.title}</h4>
              <p className="text-sm text-text-muted line-clamp-2">{feature.description}</p>
              
              {/* Arrow */}
              <div className={`absolute bottom-4 right-4 text-text-muted ${colors.arrow} transition-colors`}>
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
