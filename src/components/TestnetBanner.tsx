'use client';
import { debugLog } from '@/utils/debugMode';

import { useState } from 'react';
import { useNetworkConfig } from '@/hooks/useNetworkConfig';
import { useKlever } from '@/context/KleverContext';
import { AlertTriangle, X, ExternalLink, Info } from 'lucide-react';

/**
 * TestnetBanner
 * 
 * Shows a warning banner when the user is on testnet.
 * Displays:
 * - Visual warning that this is testnet
 * - Token remapping info (DGKO → KFI, etc.)
 * - Contract deployment status
 * - Link to testnet faucet
 */
export function TestnetBanner() {
  const [showDetails, setShowDetails] = useState(false);
  const { switchNetwork } = useKlever();
  const { 
    isTestnet, 
    tokens, 
    testnetValidation,
    isContractDeployed,
  } = useNetworkConfig();
  
  // Don't show on mainnet
  if (!isTestnet) return null;

  const handleSwitchToMainnet = () => {
    switchNetwork('mainnet');
    debugLog('🔄 Switched to mainnet from testnet banner');
  };
  
  const dexDeployed = isContractDeployed('DEX');
  
  return (
    <div className="relative">
      {/* Main Banner */}
      <div className="bg-amber-950 border-b border-border-warning">
        <div className="max-w-7xl mx-auto px-4 py-2">
          <div className="flex items-center justify-between gap-4">
            {/* Warning Message */}
            <div className="flex items-center gap-3 min-w-0">
              <div className="flex-shrink-0 p-1.5 rounded-lg bg-warning-muted">
                <AlertTriangle className="w-4 h-4 text-warning" />
              </div>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-amber-300 font-medium text-sm">
                  Testnet Mode
                </span>
                <span className="text-warning/80 text-xs hidden sm:inline">
                  Using test tokens & contracts
                </span>
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Details Toggle */}
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-warning hover:text-amber-300 hover:bg-warning-muted rounded transition-colors"
              >
                <Info className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{showDetails ? 'Hide' : 'Details'}</span>
              </button>
              
              {/* Faucet Link */}
              <a
                href="https://testnet.kleverscan.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-2 py-1 text-xs text-warning hover:text-amber-300 hover:bg-warning-muted rounded transition-colors"
              >
                <span>Get KLV</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              
              {/* Switch to Mainnet */}
              <button
                onClick={handleSwitchToMainnet}
                className="p-1 text-warning/50 hover:text-warning hover:bg-warning-muted rounded transition-colors"
                title="Switch to Mainnet"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Expandable Details */}
      {showDetails && (
        <div className="bg-amber-950/80 border-b border-border-warning">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              {/* Token Remapping */}
              <div className="space-y-1.5">
                <h4 className="font-medium text-amber-300">Token Remapping</h4>
                <div className="space-y-1 text-text-secondary">
                  <div className="flex items-center justify-between">
                    <span>DGKO (mainnet)</span>
                    <span className="text-warning">→ {tokens.DGKO.symbol} ({tokens.DGKO.assetId})</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>BABYDGKO (mainnet)</span>
                    <span className="text-warning">→ {tokens.BABYDGKO.symbol} ({tokens.BABYDGKO.assetId})</span>
                  </div>
                </div>
              </div>
              
              {/* Contract Status */}
              <div className="space-y-1.5">
                <h4 className="font-medium text-amber-300">Contracts</h4>
                <div className="space-y-1 text-text-secondary">
                  <div className="flex items-center justify-between">
                    <span>DEX Contract</span>
                    <span className={dexDeployed ? 'text-success' : 'text-error'}>
                      {dexDeployed ? '✓ Deployed' : '✗ Not Deployed'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Warnings */}
              {testnetValidation && testnetValidation.warnings.length > 0 && (
                <div className="space-y-1.5">
                  <h4 className="font-medium text-amber-300">Warnings</h4>
                  <div className="space-y-1 text-text-secondary">
                    {testnetValidation.warnings.map((warning, i) => (
                      <div key={i} className="text-warning/70 text-[11px]">
                        ⚠️ {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Faucet Instructions */}
            <div className="mt-3 pt-3 border-t border-border-warning">
              <p className="text-[11px] text-text-secondary">
                <span className="text-warning">Need test KLV?</span>{' '}
                Visit <a href="https://testnet.kleverscan.org/" target="_blank" rel="noopener noreferrer" className="text-warning hover:underline">testnet.kleverscan.org</a> to get testnet KLV.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Compact testnet indicator for use in headers/footers
 */
export function TestnetIndicator() {
  const { isTestnet } = useNetworkConfig();
  
  if (!isTestnet) return null;
  
  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-warning-muted border border-border-warning">
      <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
      <span className="text-2xs font-medium text-warning uppercase tracking-wider">
        Testnet
      </span>
    </div>
  );
}
