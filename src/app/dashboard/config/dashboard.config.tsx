import { Zap, Shield, TrendingUp, Compass } from 'lucide-react';

type GuideItem = {
  icon: React.ReactNode;
  title: string;
  description: string;
  variant: 'purple' | 'cyan' | 'blue';
  href: string;
}

export const GUIDE_ITEMS: GuideItem[] = [
  {
    icon: <Zap className="w-5 h-5" />,
    title: 'Start Staking',
    description: 'Stake your DGKO and BABYDGKO tokens on Klever blockchain and earn up to 15% APY while maintaining full custody of your assets',
    variant: 'cyan',
    href: '/staking',
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: 'Swap Tokens',
    description: 'Trade DGKO/USDT with zero platform fees using our automated market maker powered by Klever blockchain smart contracts',
    variant: 'purple',
    href: '/swap',
  },
  {
    icon: <TrendingUp className="w-5 h-5" />,
    title: 'Track Portfolio',
    description: 'Monitor your complete token holdings, staking rewards, and transaction history all in one intuitive dashboard interface',
    variant: 'blue',
    href: '/dashboard',
  },
  {
    icon: <Compass className="w-5 h-5" />,
    title: 'Explore Tokens',
    description: 'Discover detailed tokenomics, real-time on-chain data, and ecosystem information for DGKO and BABYDGKO tokens',
    variant: 'cyan',
    href: '/dgko',
  },
];
