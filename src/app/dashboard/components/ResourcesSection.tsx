import Link from 'next/link';
import { IconBox } from '@/components/ui';

interface ResourceItem {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant: 'blue' | 'cyan';
  href: string;
}

const RESOURCES: ResourceItem[] = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
    title: 'Swap Tokens',
    description: 'Coming soon - Trade DGKO for KLV using our automated market maker',
    variant: 'blue',
    href: '#',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
      </svg>
    ),
    title: 'Stake Tokens',
    description: 'Stake DGKO and BABYDGKO to earn rewards on Klever blockchain',
    variant: 'cyan',
    href: '/staking',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    title: 'Explore Tokens',
    description: 'View detailed information about DGKO and BABYDGKO tokens',
    variant: 'blue',
    href: '/dgko',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
    title: 'Documentation',
    description: 'Complete guide to using Rare Canvas features and understanding the platform',
    variant: 'cyan',
    href: '/documentation',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    title: 'Updates',
    description: 'Latest features, improvements, and changes to the platform',
    variant: 'blue',
    href: '/updates',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
      </svg>
    ),
    title: 'Help & Support',
    description: 'Get help with common questions and troubleshooting',
    variant: 'cyan',
    href: '/documentation#help',
  },
];

export function ResourcesSection() {
  return (
    <div className="bg-bg-surface rounded-3xl p-8 border border-border-default">
      <h2 className="text-2xl font-medium text-text-primary mb-8">Resources</h2>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {RESOURCES.map((item, i) => (
          <Link
            key={i}
            href={item.href}
            className="group flex items-start gap-4 p-5 rounded-2xl bg-overlay-default hover:bg-overlay-active border border-border-default hover:border-border-brand transition-all duration-150 cursor-pointer"
          >
            <IconBox icon={item.icon} size="sm" variant={item.variant} />
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-medium text-text-primary mb-1.5">
                {item.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {item.description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
