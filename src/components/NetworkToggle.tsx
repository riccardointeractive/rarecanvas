'use client';
import { debugLog } from '@/utils/debugMode';

import { useKlever } from '@/context/KleverContext';
import { Network } from '@/types/klever';

interface NetworkToggleProps {
  /** Compact mode for mobile/tight spaces */
  compact?: boolean;
  /** Show label text */
  showLabel?: boolean;
}

export function NetworkToggle({ compact = false, showLabel = true }: NetworkToggleProps) {
  const { network, switchNetwork, isConnected } = useKlever();
  
  const isTestnet = network === 'testnet';
  
  const handleToggle = () => {
    const newNetwork: Network = isTestnet ? 'mainnet' : 'testnet';
    switchNetwork(newNetwork);
    
    // Log for debugging
    debugLog(`🔄 Network switched to ${newNetwork}`);
    if (isConnected) {
      debugLog('📊 Refreshing data for new network...');
    }
  };

  return (
    <div className={`flex items-center ${compact ? 'gap-2' : 'gap-3'}`}>
      {showLabel && (
        <span className="text-xs text-text-muted uppercase tracking-wider">
          Network
        </span>
      )}
      
      <button
        onClick={handleToggle}
        className={`
          relative flex items-center rounded-full transition-all duration-150 
          ${compact ? 'p-0.5' : 'p-1'}
          ${isTestnet 
            ? 'bg-warning-muted border border-border-warning' 
            : 'bg-success-muted border border-border-success'
          }
          active:scale-95
        `}
        title={`Switch to ${isTestnet ? 'Mainnet' : 'Testnet'}`}
      >
        {/* Slider background */}
        <div className={`
          relative flex items-center rounded-full
          ${compact ? 'w-[76px] h-7' : 'w-[88px] h-8'}
          bg-black/40
        `}>
          {/* Sliding indicator */}
          <div 
            className={`
              absolute transition-all duration-150 ease-out rounded-full
              ${compact ? 'w-[36px] h-5' : 'w-[42px] h-6'}
              ${isTestnet 
                ? `${compact ? 'translate-x-[38px]' : 'translate-x-[44px]'} bg-warning-muted` 
                : 'translate-x-1 bg-success-muted'
              }
            `}
          />
          
          {/* Labels */}
          <div className={`
            relative z-10 flex items-center justify-between w-full 
            ${compact ? 'px-1.5 text-2xs' : 'px-2 text-xs'}
            font-medium
          `}>
            <span className={`
              transition-colors duration-150 w-[36px] text-center
              ${!isTestnet ? 'text-text-primary' : 'text-text-muted'}
            `}>
              Main
            </span>
            <span className={`
              transition-colors duration-150 w-[36px] text-center
              ${isTestnet ? 'text-text-primary' : 'text-text-muted'}
            `}>
              Test
            </span>
          </div>
        </div>
      </button>
      
      {/* Status indicator */}
      <div className={`flex items-center gap-1.5 ${compact ? 'hidden' : ''}`}>
        <span className={`
          w-1.5 h-1.5 rounded-full animate-pulse
          ${isTestnet ? 'bg-warning' : 'bg-success'}
        `} />
        <span className={`text-xs font-medium ${isTestnet ? 'text-warning' : 'text-success'}`}>
          {isTestnet ? 'Testnet' : 'Mainnet'}
        </span>
      </div>
    </div>
  );
}

/**
 * Inline version for menu footers - more minimal
 */
export function NetworkToggleInline() {
  const { network, switchNetwork } = useKlever();
  
  const isTestnet = network === 'testnet';
  
  const handleToggle = () => {
    const newNetwork: Network = isTestnet ? 'mainnet' : 'testnet';
    switchNetwork(newNetwork);
    debugLog(`🔄 Network switched to ${newNetwork}`);
  };

  return (
    <button
      onClick={handleToggle}
      className={`
        flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium
        transition-all duration-150 active:scale-95
        ${isTestnet 
          ? 'bg-warning-muted text-warning border border-border-warning hover:bg-warning-muted' 
          : 'bg-success-muted text-success border border-border-success hover:bg-success-muted'
        }
      `}
      title={`Click to switch to ${isTestnet ? 'Mainnet' : 'Testnet'}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isTestnet ? 'bg-warning' : 'bg-success'}`} />
      {isTestnet ? 'Testnet' : 'Mainnet'}
      <svg 
        className="w-3 h-3 opacity-50" 
        fill="none" 
        viewBox="0 0 24 24" 
        stroke="currentColor"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={2} 
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" 
        />
      </svg>
    </button>
  );
}
