import { ToolCategory, QuickAction, QuickLink } from '../types/admin.types';
import {
  Palette,
  FileText,
  DollarSign,
  BarChart3,
  Terminal,
  Megaphone,
  Pencil,
  ShieldCheck,
  ArrowLeftRight,
  Users,
  Clipboard,
  Trash2,
  Rocket,
  Construction,
} from 'lucide-react';

/**
 * Admin Configuration
 * 
 * All admin tools, quick actions, and links.
 * Uses Lucide React icons for consistency with design system.
 * 
 * @see /admin/design-system for icon guidelines
 */

const tools: ToolCategory[] = [
  {
    category: 'Design & Development',
    items: [
      {
        id: 'design-system',
        title: 'Design System',
        description: 'Interactive reference for colors, typography, components, and animations',
        icon: <Palette className="w-6 h-6" />,
        href: '/design-system',
        status: 'active',
        badge: 'Live',
        badgeColor: 'green',
      },
      {
        id: 'project-rules',
        title: 'Project Rules',
        description: 'Development workflow rules and guidelines for Claude AI integration',
        icon: <FileText className="w-6 h-6" />,
        href: '/admin/project-rules',
        status: 'active',
        badge: 'Live',
        badgeColor: 'green',
      },
    ],
  },
  {
    category: 'Analytics & Monitoring',
    items: [
      {
        id: 'token-prices',
        title: 'Token Prices',
        description: 'Real-time token pricing from CoinGecko and smart contract pools',
        icon: <DollarSign className="w-6 h-6" />,
        href: '/admin/token-prices',
        status: 'active',
        badge: 'Live',
        badgeColor: 'green',
      },
      {
        id: 'analytics',
        title: 'Analytics Dashboard',
        description: 'User metrics, transaction volume, and platform statistics',
        icon: <BarChart3 className="w-6 h-6" />,
        href: '#',
        status: 'coming',
        badge: 'Coming Soon',
        badgeColor: 'blue',
      },
      {
        id: 'logs',
        title: 'System Logs',
        description: 'Real-time logs, error tracking, and system health monitoring',
        icon: <Terminal className="w-6 h-6" />,
        href: '#',
        status: 'coming',
        badge: 'Coming Soon',
        badgeColor: 'blue',
      },
    ],
  },
  {
    category: 'Content Management',
    items: [
      {
        id: 'announcements',
        title: 'Announcements',
        description: 'Create and manage platform announcements and notifications',
        icon: <Megaphone className="w-6 h-6" />,
        href: '#',
        status: 'coming',
        badge: 'Coming Soon',
        badgeColor: 'blue',
      },
      {
        id: 'docs',
        title: 'Documentation Editor',
        description: 'Edit documentation pages and guides directly from admin panel',
        icon: <Pencil className="w-6 h-6" />,
        href: '#',
        status: 'coming',
        badge: 'Coming Soon',
        badgeColor: 'blue',
      },
    ],
  },
  {
    category: 'Blockchain Management',
    items: [
      {
        id: 'contracts',
        title: 'Smart Contracts',
        description: 'Monitor and manage staking contracts, swap pools, and treasury',
        icon: <ShieldCheck className="w-6 h-6" />,
        href: '/admin/contracts',
        status: 'active',
        badge: 'Live',
        badgeColor: 'green',
      },
      {
        id: 'transactions',
        title: 'Transaction Manager',
        description: 'View all platform transactions, pending operations, and history',
        icon: <ArrowLeftRight className="w-6 h-6" />,
        href: '#',
        status: 'coming',
        badge: 'Coming Soon',
        badgeColor: 'blue',
      },
    ],
  },
  {
    category: 'Platform Management',
    items: [
      {
        id: 'maintenance',
        title: 'Maintenance Mode',
        description: 'Enable maintenance mode on individual pages with countdown timers',
        icon: <Construction className="w-6 h-6" />,
        href: '/admin/maintenance',
        status: 'active',
        badge: 'Live',
        badgeColor: 'green',
      },
    ],
  },
  {
    category: 'User Management',
    items: [
      {
        id: 'users',
        title: 'User Directory',
        description: 'Browse active users, wallet addresses, and activity metrics',
        icon: <Users className="w-6 h-6" />,
        href: '#',
        status: 'coming',
        badge: 'Coming Soon',
        badgeColor: 'blue',
      },
    ],
  },
];

// Quick actions with Lucide icons
const quickActions: QuickAction[] = [
  {
    title: 'View Logs',
    description: 'Check system logs',
    icon: <Clipboard className="w-6 h-6 text-brand-primary" />,
    action: () => alert('Logs feature coming soon'),
  },
  {
    title: 'Clear Cache',
    description: 'Clear application cache',
    icon: <Trash2 className="w-6 h-6 text-error" />,
    action: () => alert('Cache cleared! (Demo)'),
  },
  {
    title: 'Deploy Status',
    description: 'Check deployment status',
    icon: <Rocket className="w-6 h-6 text-success" />,
    action: () => alert('Deploy feature coming soon'),
  },
];

// Useful links
const quickLinks: QuickLink[] = [
  { title: 'Documentation', url: '/documentation' },
  { title: 'Updates', url: '/updates' },
  { title: 'GitHub Repo', url: 'https://github.com/yourusername/digiko-web3-app' },
  { title: 'Klever Docs', url: 'https://docs.klever.org' },
];

export { tools, quickActions, quickLinks };
