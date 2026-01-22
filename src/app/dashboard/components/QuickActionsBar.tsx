'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Lock } from 'lucide-react';
import { SendModal } from './SendModal';
import { ReceiveModal } from './ReceiveModal';

/**
 * QuickActionsBar Component
 * Horizontal bar of quick action buttons for wallet operations
 * Linear style: white icons on dark background
 */
export function QuickActionsBar() {
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);

  const actions = [
    {
      label: 'Send',
      icon: ArrowUpRight,
      description: 'Transfer tokens',
      onClick: () => setShowSendModal(true),
    },
    {
      label: 'Receive',
      icon: ArrowDownLeft,
      description: 'Get your address',
      onClick: () => setShowReceiveModal(true),
    },
    {
      label: 'Swap',
      icon: ArrowLeftRight,
      href: '/swap',
      description: 'Trade tokens',
    },
    {
      label: 'Stake',
      icon: Lock,
      href: '/staking',
      description: 'Earn rewards',
    },
  ];

  return (
    <>
      <div className="bg-bg-surface rounded-2xl md:rounded-3xl p-4 md:p-5 lg:p-6 border border-border-default mb-6">
        <div className="grid grid-cols-4 gap-2 md:gap-4">
          {actions.map((action) => {
            const Icon = action.icon;

            const content = (
              <div className="
                flex flex-col items-center gap-2 p-3 md:p-4 rounded-xl
                bg-bg-elevated border border-border-default transition-all duration-150
                hover:bg-bg-hover hover:border-border-hover cursor-pointer group
              ">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-bg-hover flex items-center justify-center">
                  <Icon className="w-5 h-5 md:w-6 md:h-6 text-text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-xs md:text-sm font-medium text-text-primary">
                  {action.label}
                </span>
                <span className="text-2xs md:text-xs text-text-muted hidden md:block">
                  {action.description}
                </span>
              </div>
            );

            if (action.href) {
              return (
                <Link key={action.label} href={action.href}>
                  {content}
                </Link>
              );
            }

            return (
              <button key={action.label} onClick={action.onClick} className="text-left">
                {content}
              </button>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      <SendModal isOpen={showSendModal} onClose={() => setShowSendModal(false)} />
      <ReceiveModal isOpen={showReceiveModal} onClose={() => setShowReceiveModal(false)} />
    </>
  );
}
