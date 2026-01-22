'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import DEBUG_MODE from '@/utils/debugMode';

/**
 * Debug Menu - Floating Menu for Testing Error Logging
 * 
 * This menu appears when you add ?debug=true to any URL.
 * It lets you force errors to test the error logging system!
 * 
 * Usage: http://localhost:3000/staking?debug=true
 */
export function DebugMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    setIsEnabled(DEBUG_MODE.isEnabled());
  }, [searchParams]);

  if (!isEnabled) return null;

  const currentError = DEBUG_MODE.getCurrentScenario();

  const errorScenarios = [
    {
      id: 'insufficient_balance',
      name: 'Insufficient Balance',
      description: 'User doesn\'t have enough tokens',
      emoji: '💰',
    },
    {
      id: 'api_timeout',
      name: 'API Timeout',
      description: 'API request takes too long',
      emoji: '⏱️',
    },
    {
      id: 'api_error',
      name: 'API Error',
      description: 'API returns 500 error',
      emoji: '🔥',
    },
    {
      id: 'network_error',
      name: 'Network Error',
      description: 'No internet connection',
      emoji: '📡',
    },
    {
      id: 'transaction_failed',
      name: 'Transaction Failed',
      description: 'Blockchain rejects transaction',
      emoji: '⛔',
    },
    {
      id: 'wallet_rejected',
      name: 'Wallet Rejected',
      description: 'User cancels in wallet',
      emoji: '🚫',
    },
    {
      id: 'invalid_address',
      name: 'Invalid Address',
      description: 'Wallet address format invalid',
      emoji: '❌',
    },
    {
      id: 'slippage_exceeded',
      name: 'Slippage Exceeded',
      description: 'Price changed too much',
      emoji: '📉',
    },
  ];

  const setForceError = (scenario: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (scenario) {
      params.set('force_error', scenario);
    } else {
      params.delete('force_error');
    }
    
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearAll = () => {
    router.push(pathname);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full bg-error
          text-text-primary glow-error hover:glow-error-lg glow-transition
          transition-all duration-150 active:scale-95
          flex items-center justify-center text-2xl font-bold
          border-2 border-border-active
          ${isOpen ? 'rotate-180' : ''}
        `}
        title="Debug Menu - Force Errors"
      >
        🐛
      </button>

      {/* Debug Menu Panel */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-80 glass rounded-2xl border border-border-default shadow-2xl overflow-hidden animate-slide-up">
          {/* Header */}
          <div className="bg-error-muted border-b border-border-default p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-text-primary font-bold text-lg">🐛 Debug Mode</h3>
              <button
                onClick={clearAll}
                className="text-xs text-text-primary/60 hover:text-text-primary transition-colors"
              >
                Exit Debug Mode
              </button>
            </div>
            <p className="text-xs text-text-primary/60">
              Force errors to test error logging
            </p>
          </div>

          {/* Current Status */}
          {currentError && (
            <div className="bg-error-muted border-b border-border-error p-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 bg-error rounded-full animate-pulse" />
                <span className="text-xs font-semibold text-error">Error Active</span>
              </div>
              <p className="text-xs text-text-primary/60">
                Currently forcing: <span className="text-text-primary font-medium">{currentError.replace(/_/g, ' ')}</span>
              </p>
              <button
                onClick={() => setForceError(null)}
                className="mt-2 text-xs text-error hover:text-error/80 transition-colors"
              >
                Clear forced error →
              </button>
            </div>
          )}

          {/* Error Scenarios */}
          <div className="max-h-96 overflow-y-auto p-2">
            <div className="space-y-1">
              {errorScenarios.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => setForceError(scenario.id)}
                  className={`
                    w-full text-left p-3 rounded-xl transition-all duration-100
                    ${currentError === scenario.id
                      ? 'bg-error-muted border border-border-error'
                      : 'hover:bg-overlay-default border border-transparent'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{scenario.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-text-primary mb-0.5">
                        {scenario.name}
                      </div>
                      <div className="text-xs text-text-secondary">
                        {scenario.description}
                      </div>
                    </div>
                    {currentError === scenario.id && (
                      <div className="w-2 h-2 bg-error rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-black/20 border-t border-border-default p-3">
            <p className="text-xs text-text-primary/40 text-center">
              Now try doing something in the app!<br />
              The next action will trigger the error.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
