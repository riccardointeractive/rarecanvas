'use client';

import { useState } from 'react';
import { TokenInfo, PRESET_TOKENS } from '../types/social-media.types';
import { Plus, X, ChevronDown, Image as ImageIcon } from 'lucide-react';

interface TokenSelectorProps {
  tokens: TokenInfo[];
  onChange: (tokens: TokenInfo[]) => void;
  maxTokens?: number;
}

/**
 * Get the logo URL for a token - uses local images from /public/tokens/
 */
function getTokenLogoUrl(token: TokenInfo): string | undefined {
  // Manual override takes priority
  if (token.logoUrl) return token.logoUrl;
  // Use local token image based on symbol
  if (token.symbol) return `/tokens/${token.symbol.toLowerCase()}.png`;
  return undefined;
}

export function SocialTokenSelector({ tokens, onChange, maxTokens = 2 }: TokenSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customSymbol, setCustomSymbol] = useState('');
  const [customColor, setCustomColor] = useState('#0066FF');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customAssetId, setCustomAssetId] = useState('');

  const addToken = (token: TokenInfo) => {
    if (tokens.length < maxTokens) {
      onChange([...tokens, token]);
    }
    setIsOpen(false);
  };

  const removeToken = (index: number) => {
    onChange(tokens.filter((_, i) => i !== index));
  };

  const addCustomToken = () => {
    if (customSymbol && tokens.length < maxTokens) {
      addToken({
        symbol: customSymbol.toUpperCase(),
        name: customSymbol,
        color: customColor,
        assetId: customAssetId || undefined,
        logoUrl: customImageUrl || undefined,
      });
      setCustomSymbol('');
      setCustomImageUrl('');
      setCustomAssetId('');
    }
  };

  const renderTokenLogo = (token: TokenInfo, size: 'sm' | 'md' = 'sm') => {
    const sizeClass = size === 'sm' ? 'w-4 h-4' : 'w-3 h-3';
    const logoUrl = getTokenLogoUrl(token);
    
    if (logoUrl) {
      return (
        <img 
          src={logoUrl} 
          alt={token.symbol}
          className={`${sizeClass} rounded-full object-cover`}
          onError={(e) => {
            // On error, hide image and show color fallback
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'block';
          }}
        />
      );
    }
    
    // Fallback to color dot
    return (
      <div
        className={`${sizeClass} rounded-full`}
        style={{ backgroundColor: token.color }}
      />
    );
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-text-secondary">Tokens</label>
      
      {/* Selected tokens */}
      <div className="flex flex-wrap gap-2">
        {tokens.map((token, index) => (
          <div
            key={index}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-overlay-default border border-border-default"
          >
            <div className="relative">
              {renderTokenLogo(token, 'sm')}
              {/* Hidden fallback */}
              <div
                className="w-4 h-4 rounded-full absolute inset-0 hidden"
                style={{ backgroundColor: token.color }}
              />
            </div>
            <span className="text-sm font-medium text-text-primary">{token.symbol}</span>
            <button
              onClick={() => removeToken(index)}
              className="text-text-muted hover:text-text-primary transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}

        {tokens.length < maxTokens && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-overlay-subtle border border-dashed border-border-hover text-text-secondary hover:border-border-active hover:text-text-primary transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="text-sm">Add Token</span>
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="glass rounded-xl border border-border-default p-3 space-y-3">
          {/* Preset tokens */}
          <div className="grid grid-cols-3 gap-2">
            {PRESET_TOKENS.filter(
              preset => !tokens.find(t => t.symbol === preset.symbol)
            ).map((token) => (
              <button
                key={token.symbol}
                onClick={() => addToken(token)}
                className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-overlay-subtle hover:bg-overlay-default transition-colors"
              >
                <div className="relative">
                  {renderTokenLogo(token, 'md')}
                  {/* Hidden fallback */}
                  <div
                    className="w-3 h-3 rounded-full absolute inset-0 hidden"
                    style={{ backgroundColor: token.color }}
                  />
                </div>
                <span className="text-xs font-medium text-text-primary">{token.symbol}</span>
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 h-px bg-overlay-default" />
            <span className="text-xs text-text-muted">or custom</span>
            <div className="flex-1 h-px bg-overlay-default" />
          </div>

          {/* Custom token input */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value)}
                placeholder="Symbol"
                className="flex-1 px-3 py-2 rounded-lg bg-overlay-subtle border border-border-default text-text-primary text-sm placeholder-gray-500 focus:outline-none focus:border-border-hover"
                maxLength={10}
              />
              <input
                type="color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                className="w-10 h-10 rounded-lg cursor-pointer bg-transparent"
              />
            </div>
            <div className="relative">
              <input
                type="text"
                value={customAssetId}
                onChange={(e) => setCustomAssetId(e.target.value)}
                placeholder="Asset ID (e.g., DGKO-CXVJ) - auto-fetches logo"
                className="w-full px-3 py-2 rounded-lg bg-overlay-subtle border border-border-default text-text-primary text-sm placeholder-gray-500 focus:outline-none focus:border-border-hover"
              />
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                  type="text"
                  value={customImageUrl}
                  onChange={(e) => setCustomImageUrl(e.target.value)}
                  placeholder="Image URL (optional override)"
                  className="w-full pl-9 pr-3 py-2 rounded-lg bg-overlay-subtle border border-border-default text-text-primary text-sm placeholder-gray-500 focus:outline-none focus:border-border-hover"
                />
              </div>
              <button
                onClick={addCustomToken}
                disabled={!customSymbol}
                className="px-4 py-2 rounded-lg bg-brand-primary text-text-primary text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-brand-primary/80 transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
