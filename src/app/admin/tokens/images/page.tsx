'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Search,
  Copy,
  Check,
  ExternalLink,
  Palette,
  Code,
} from 'lucide-react';
import Link from 'next/link';
import { isSessionValidSync, isSessionValid, logout } from '../../utils/adminAuth.secure';
import { LoginFormSecure as LoginForm } from '../../components/LoginForm.secure';
import { AdminLayout } from '../../components/AdminLayout';
import { AdminPageHeader } from '../../components/AdminPageHeader';
import { 
  Card,
  StatusBadge,
  FeatureBadge,
  Alert,
  Input,
} from '@/components/ui';
import { IconBox } from '@/components/IconBox';
import { TokenImage } from '@/components/TokenImage';
import { 
  getAllTokens, 
  getTokenGradientClasses,
} from '@/config/tokens';

/**
 * Token Images Admin Page
 * 
 * PURPOSE: Visual preview of how tokens render.
 * All logos are stored locally in /public/tokens/
 * 
 * SOURCE OF TRUTH: tokens.ts + /public/tokens/ folder
 * - All token logos are local PNG files
 * - No external API calls for images
 * - Gradient fallback for tokens without local logo
 */
export default function TokenImagesPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<'xs' | 'sm' | 'md' | 'lg' | 'xl'>('lg');
  
  const tokens = useMemo(() => getAllTokens(), []);
  
  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokens;
    const query = searchQuery.toLowerCase();
    return tokens.filter(token => 
      token.symbol.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query)
    );
  }, [tokens, searchQuery]);

  useEffect(() => {
    const syncValid = isSessionValidSync();
    setIsAuthenticated(syncValid);
    setIsLoading(false);
    
    if (syncValid) {
      isSessionValid().then(valid => {
        if (!valid) setIsAuthenticated(false);
      });
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
  };

  const copyToClipboard = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const sizes = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="flex items-center gap-3">
          <div className="w-5 h-5 border-2 border-brand-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-text-primary font-medium">Loading...</span>
        </Card>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <AdminLayout onLogout={handleLogout}>
      <div className="space-y-8">
        {/* Header */}
        <AdminPageHeader
          title="Token Images"
          description="Visual reference for token logos, colors, and fallback gradients. All configuration is centralized in /src/config/tokens.ts."
          backHref="/admin/tokens"
          backLabel="Back"
        />

        {/* Source of Truth Alert */}
        <Alert variant="info" title="Source of Truth: Local Images">
          All token logos are stored locally in <code className="text-blue-300">/public/tokens/</code> folder.
          The <code className="text-blue-300">TokenImage</code> component uses <code className="text-blue-300">tokens.ts</code> to look up
          the logo path. No external API calls are made for images - instant loading, zero network errors.
        </Alert>

        {/* Size Selector */}
        <Card>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-text-secondary text-sm">Preview Size:</span>
            <div className="flex gap-2">
              {sizes.map(size => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedSize === size
                      ? 'bg-brand-primary text-text-primary'
                      : 'bg-overlay-subtle text-text-secondary hover:text-text-primary hover:bg-overlay-default'
                  }`}
                >
                  {size.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </Card>

        {/* Token Images Grid */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-medium text-text-primary">Token Gallery</h2>
            <Input
              type="search"
              placeholder="Search tokens..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
              inputSize="sm"
              containerClassName="w-full sm:w-64"
            />
          </div>
          
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredTokens.map((token) => (
              <Card key={token.symbol} className="p-0 overflow-hidden">
                {/* Preview Header */}
                <div 
                  className="p-6 flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${token.color}20 0%, ${token.colorSecondary || token.color}10 100%)` 
                  }}
                >
                  <TokenImage 
                    assetId={token.assetIdMainnet} 
                    size={selectedSize} 
                  />
                </div>
                
                {/* Token Info */}
                <div className="p-4 border-t border-border-default">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-text-primary font-medium">{token.symbol}</span>
                        {token.isNative && <FeatureBadge label="NATIVE" />}
                      </div>
                      <div className="text-text-muted text-sm">{token.name}</div>
                    </div>
                    {token.isActive ? (
                      <StatusBadge status="active" />
                    ) : (
                      <StatusBadge status="inactive" />
                    )}
                  </div>
                  
                  {/* Color Info */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted text-xs">Primary Color</span>
                      <button
                        onClick={() => copyToClipboard(token.color, `color-${token.symbol}`)}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div 
                          className="w-4 h-4 rounded border border-border-hover"
                          style={{ backgroundColor: token.color }}
                        />
                        <span className="font-mono text-text-secondary hover:text-text-primary transition-colors">
                          {token.color}
                        </span>
                        {copiedField === `color-${token.symbol}` ? (
                          <Check className="w-3 h-3 text-success" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-50" />
                        )}
                      </button>
                    </div>
                    
                    {token.colorSecondary && (
                      <div className="flex items-center justify-between">
                        <span className="text-text-muted text-xs">Secondary</span>
                        <button
                          onClick={() => copyToClipboard(token.colorSecondary!, `color2-${token.symbol}`)}
                          className="flex items-center gap-2 text-sm"
                        >
                          <div 
                            className="w-4 h-4 rounded border border-border-hover"
                            style={{ backgroundColor: token.colorSecondary }}
                          />
                          <span className="font-mono text-text-secondary hover:text-text-primary transition-colors">
                            {token.colorSecondary}
                          </span>
                          {copiedField === `color2-${token.symbol}` ? (
                            <Check className="w-3 h-3 text-success" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-50" />
                          )}
                        </button>
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted text-xs">Logo Path</span>
                      <span className="font-mono text-xs text-text-secondary">
                        {token.logo || 'API/Fallback'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          {filteredTokens.length === 0 && (
            <Card className="text-center py-8">
              <div className="text-text-muted">No tokens found matching &quot;{searchQuery}&quot;</div>
            </Card>
          )}
        </div>

        {/* Fallback Gradients Reference */}
        <div>
          <h2 className="text-lg font-medium text-text-primary mb-4">Fallback Gradients</h2>
          
          <Card>
            <p className="text-text-secondary text-sm mb-4">
              When no logo is available, the TokenImage component shows a gradient placeholder 
              using the token&apos;s configured colors. These are defined via <code className="text-brand-primary">getTokenGradientClasses()</code>.
            </p>
            
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {tokens.map((token) => {
                const gradient = getTokenGradientClasses(token.symbol);
                return (
                  <div 
                    key={token.symbol}
                    className="flex items-center gap-3 p-3 bg-overlay-subtle rounded-lg"
                  >
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center border border-border-default`}>
                      <span className="text-text-primary/80 font-mono text-xs font-medium">
                        {token.symbol.substring(0, 2)}
                      </span>
                    </div>
                    <div>
                      <div className="text-text-primary text-sm font-medium">{token.symbol}</div>
                      <div className="text-text-muted text-xs font-mono truncate max-w-[150px]">
                        {gradient}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>

        {/* Usage Examples */}
        <div>
          <h2 className="text-lg font-medium text-text-primary mb-4">Usage Examples</h2>
          
          <Card>
            <div className="space-y-4">
              <div className="p-4 bg-gray-900/50 rounded-xl font-mono text-sm overflow-x-auto">
                <div className="text-text-muted mb-2">{`// Basic usage`}</div>
                <div className="text-text-primary">
                  <span className="text-text-secondary">&lt;</span>
                  <span className="text-info">TokenImage</span>
                  <span className="text-purple-400"> assetId</span>
                  <span className="text-text-secondary">=</span>
                  <span className="text-success">&quot;DGKO-CXVJ&quot;</span>
                  <span className="text-purple-400"> size</span>
                  <span className="text-text-secondary">=</span>
                  <span className="text-success">&quot;md&quot;</span>
                  <span className="text-text-secondary"> /&gt;</span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-900/50 rounded-xl font-mono text-sm overflow-x-auto">
                <div className="text-text-muted mb-2">{`// Get colors programmatically`}</div>
                <div className="text-text-primary">
                  <span className="text-purple-400">const</span> color = <span className="text-warning">getTokenColor</span>(<span className="text-success">&apos;DGKO&apos;</span>); <span className="text-text-muted">{`// "#0066FF"`}</span>
                </div>
                <div className="text-text-primary mt-1">
                  <span className="text-purple-400">const</span> gradient = <span className="text-warning">getTokenGradientClasses</span>(<span className="text-success">&apos;DGKO&apos;</span>);
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Related Links */}
        <div>
          <h2 className="text-lg font-medium text-text-primary mb-4">Related</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Link href="/admin/tokens/precision">
              <Card hover className="flex items-center gap-4">
                <IconBox icon={<Palette className="w-5 h-5" />} size="md" variant="blue" />
                <div className="flex-1">
                  <div className="text-text-primary font-medium">Token Precision</div>
                  <div className="text-text-muted text-sm">Decimals and precision values</div>
                </div>
                <ExternalLink className="w-4 h-4 text-text-muted" />
              </Card>
            </Link>
            
            <Link href="/admin/social-media">
              <Card hover className="flex items-center gap-4">
                <IconBox icon={<Palette className="w-5 h-5" />} size="md" variant="purple" />
                <div className="flex-1">
                  <div className="text-text-primary font-medium">Social Media</div>
                  <div className="text-text-muted text-sm">Uses local token logos</div>
                </div>
                <ExternalLink className="w-4 h-4 text-text-muted" />
              </Card>
            </Link>
            
            <Link href="/admin/design-system">
              <Card hover className="flex items-center gap-4">
                <IconBox icon={<Code className="w-5 h-5" />} size="md" variant="purple" />
                <div className="flex-1">
                  <div className="text-text-primary font-medium">Design System</div>
                  <div className="text-text-muted text-sm">Component library</div>
                </div>
                <ExternalLink className="w-4 h-4 text-text-muted" />
              </Card>
            </Link>
          </div>
        </div>

        {/* Important Notes */}
        <Alert variant="warning" title="How to Add New Token Logos">
          <ul className="space-y-1 text-sm">
            <li>1. Add PNG image to <code className="text-amber-300">/public/tokens/{'{symbol}'}.png</code></li>
            <li>2. Add <code className="text-amber-300">logo: &apos;/tokens/{'{symbol}'}.png&apos;</code> to token in <code className="text-amber-300">tokens.ts</code></li>
            <li>3. TokenImage component will automatically use it - no rebuild needed</li>
            <li className="mt-2 pt-2 border-t border-amber-500/20">
              <strong>Note:</strong> Keep image files under 100KB for best performance. Use lowercase filenames matching the token symbol.
            </li>
          </ul>
        </Alert>
      </div>
    </AdminLayout>
  );
}
