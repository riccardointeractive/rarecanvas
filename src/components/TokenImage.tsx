'use client';

import { useState, useEffect } from 'react';
import { useKlever } from '@/context/KleverContext';
import { getTokenLogo, getTokenGradientClasses, getTokenByAssetId } from '@/config/tokens';

interface TokenImageProps {
  assetId: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  xs: 'w-5 h-5',
  sm: 'w-8 h-8',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16',
};

// Cache for API-fetched logos to avoid repeated calls
const apiLogoCache: Record<string, string | null> = {};

/**
 * TokenImage Component
 * 
 * PRIORITY ORDER:
 * 1. Local image from /public/tokens/ (configured in tokens.ts) - INSTANT
 * 2. API fetch from Klever blockchain (for unknown tokens) - NETWORK
 * 3. Gradient fallback with initials
 */
export function TokenImage({ 
  assetId, 
  size = 'md', 
  className = '',
}: TokenImageProps) {
  const { network } = useKlever();
  const [apiLogo, setApiLogo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  
  // 1. FIRST: Check for local logo in tokens.ts (instant, no API call)
  const localLogo = getTokenLogo(assetId);
  
  // 2. SECOND: If no local logo, fetch from API (for unknown tokens)
  useEffect(() => {
    // Skip if we have a local logo
    if (localLogo) return;
    
    const cacheKey = `${network}:${assetId}`;
    
    // Check cache first
    if (apiLogoCache[cacheKey] !== undefined) {
      setApiLogo(apiLogoCache[cacheKey]);
      return;
    }
    
    // Fetch from API for unknown tokens
    const fetchLogo = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/asset?assetId=${encodeURIComponent(assetId)}&network=${network}`);
        if (response.ok) {
          const data = await response.json();
          const logo = data.data?.asset?.logo || null;
          apiLogoCache[cacheKey] = logo;
          setApiLogo(logo);
        } else {
          apiLogoCache[cacheKey] = null;
        }
      } catch {
        apiLogoCache[cacheKey] = null;
      } finally {
        setLoading(false);
      }
    };
    
    fetchLogo();
  }, [assetId, network, localLogo]);
  
  // Get fallback text (first 2 chars of token symbol)
  const getFallbackText = () => {
    const token = getTokenByAssetId(assetId);
    if (token) {
      return token.symbol.substring(0, 2).toUpperCase();
    }
    // Fallback to parsing asset ID
    const name = assetId.split('-')[0] ?? assetId;
    return name.substring(0, 2).toUpperCase();
  };

  // Get gradient colors from centralized token config
  const getGradientColors = () => {
    return getTokenGradientClasses(assetId);
  };

  const sizeClass = sizeClasses[size];
  
  // Determine which logo to use
  const logoUrl = localLogo || apiLogo;

  // Loading state (only for API fetches)
  if (!localLogo && loading) {
    return (
      <div className={`${sizeClass} rounded-full bg-overlay-default animate-pulse ${className}`} />
    );
  }

  // Has logo and no error - show image
  if (logoUrl && !error) {
    return (
      <img
        src={logoUrl}
        alt={`${assetId} logo`}
        className={`${sizeClass} rounded-full object-cover ${className}`}
        onError={() => setError(true)}
      />
    );
  }

  // Fallback - show styled placeholder with gradient
  return (
    <div 
      className={`${sizeClass} rounded-full bg-gradient-to-br ${getGradientColors()} flex items-center justify-center border border-border-default ${className}`}
    >
      <span className="text-text-primary/80 font-mono text-xs font-medium">
        {getFallbackText()}
      </span>
    </div>
  );
}

/**
 * Utility function to get token logo URL (for use outside React)
 * Returns local path first, then would need async for API
 */
export function getTokenLogoUrl(assetId: string): string | null {
  return getTokenLogo(assetId) || null;
}

/**
 * @deprecated Use TOKEN_REGISTRY from '@/config/tokens' instead
 */
export const TOKEN_IDS = {
  DGKO: 'DGKO-CXVJ',
  BABYDGKO: 'BABYDGKO-3S67',
  KLV: 'KLV',
  KFI: 'KFI',
} as const;
