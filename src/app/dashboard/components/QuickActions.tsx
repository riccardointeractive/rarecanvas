'use client';

import Link from 'next/link';
import { useKlever } from '@/context/KleverContext';

/**
 * Quick Actions Component
 * Provides fast access to common dashboard operations
 */
export function QuickActions() {
  const { isConnected } = useKlever();

  const actions = [
    {
      title: 'Send KLV',
      description: 'Transfer tokens',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
        </svg>
      ),
      action: () => {
        // Scroll to SendForm
        document.getElementById('send-form')?.scrollIntoView({ behavior: 'smooth' });
      },
      color: 'blue',
      disabled: !isConnected,
    },
    {
      title: 'Swap Tokens',
      description: 'Coming soon',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
        </svg>
      ),
      color: 'cyan',
      disabled: true,
    },
    {
      title: 'Stake Tokens',
      description: 'Earn rewards',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
        </svg>
      ),
      href: '/staking',
      color: 'green',
      disabled: false,
    },
    {
      title: 'View DGKO',
      description: 'Token details',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      ),
      href: '/dgko',
      color: 'purple',
      disabled: false,
    },
  ];

  return (
    <div className="bg-bg-surface rounded-2xl p-6 lg:p-8 border border-border-default">
      {/* Header */}
      <h3 className="text-lg font-semibold text-text-primary mb-6">Quick Actions</h3>

      {/* Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action) => {
          const buttonContent = (
            <>
              <div className="w-12 h-12 rounded-xl bg-bg-elevated flex items-center justify-center text-text-primary mb-3">
                {action.icon}
              </div>
              <div className="text-sm font-semibold text-text-primary mb-1">
                {action.title}
              </div>
              <div className="text-xs text-text-secondary">
                {action.description}
              </div>
            </>
          );

          if (action.disabled) {
            return (
              <div
                key={action.title}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-overlay-default border border-border-default opacity-50 cursor-not-allowed"
              >
                {buttonContent}
              </div>
            );
          }

          if (action.href) {
            return (
              <Link
                key={action.title}
                href={action.href}
                className="flex flex-col items-center text-center p-4 rounded-xl bg-overlay-default hover:bg-overlay-active border border-border-default hover:border-border-brand transition-all duration-100 group"
              >
                {buttonContent}
              </Link>
            );
          }

          return (
            <button
              key={action.title}
              onClick={action.action}
              className="flex flex-col items-center text-center p-4 rounded-xl bg-overlay-default hover:bg-overlay-active border border-border-default hover:border-border-brand transition-all duration-100 group"
            >
              {buttonContent}
            </button>
          );
        })}
      </div>
    </div>
  );
}
