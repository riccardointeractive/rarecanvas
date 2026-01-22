'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Hash, 
  Search,
  Copy,
  Check,
  Calculator,
  ExternalLink,
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
  TOKEN_REGISTRY, 
  getAllTokens, 
  formatTokenAmount, 
  parseTokenAmount,
} from '@/config/tokens';

/**
 * Token Precision Admin Page
 * 
 * PURPOSE: Single source of truth reference for token precision configuration.
 * This page shows all registered tokens and their precision settings.
 * 
 * CLAUDE: This page exists so you can always check token precision.
 * The data comes from /src/config/tokens.ts which is the authoritative source.
 */
export default function TokenPrecisionPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [testAmount, setTestAmount] = useState<string>('1');
  const [selectedToken, setSelectedToken] = useState<string>('DGKO');
  
  const tokens = useMemo(() => getAllTokens(), []);
  
  const filteredTokens = useMemo(() => {
    if (!searchQuery) return tokens;
    const query = searchQuery.toLowerCase();
    return tokens.filter(token => 
      token.symbol.toLowerCase().includes(query) ||
      token.name.toLowerCase().includes(query) ||
      token.assetIdMainnet.toLowerCase().includes(query)
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

  const selectedTokenConfig = TOKEN_REGISTRY[selectedToken];

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
          title="Token Precision"
          description="Centralized reference for all token decimal configurations. This is the single source of truth for precision values."
          backHref="/admin/tokens"
          backLabel="Back"
        />

        {/* Claude Reference Alert */}
        <Alert variant="info" title="Claude Reference">
          Data source: <code className="text-blue-300 bg-info/10 px-1.5 py-0.5 rounded">/src/config/tokens.ts</code>. 
          When working with token amounts, always use <code className="text-blue-300">getTokenPrecision()</code> or 
          check this page. Never hardcode precision values.
        </Alert>

        {/* Quick Reference Table */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-medium text-text-primary">Token Registry</h2>
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
          
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-overlay-subtle">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Token</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Decimals</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Precision</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary hidden md:table-cell">Mainnet ID</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary hidden lg:table-cell">Testnet ID</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-text-secondary">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredTokens.map((token) => (
                    <tr 
                      key={token.symbol} 
                      className="hover:bg-overlay-subtle transition-colors cursor-pointer"
                      onClick={() => setSelectedToken(token.symbol)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <TokenImage 
                            assetId={token.assetIdMainnet} 
                            size="sm" 
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-text-primary font-medium">{token.symbol}</span>
                              {token.isNative && <FeatureBadge label="NATIVE" />}
                            </div>
                            <div className="text-text-muted text-xs">{token.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-text-primary font-mono">{token.decimals}</span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(token.precision.toString(), `precision-${token.symbol}`);
                          }}
                          className="flex items-center gap-1 text-brand-primary hover:text-info transition-colors font-mono"
                        >
                          {token.precision.toLocaleString()}
                          {copiedField === `precision-${token.symbol}` ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-50" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(token.assetIdMainnet, `mainnet-${token.symbol}`);
                          }}
                          className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors font-mono text-sm"
                        >
                          {token.assetIdMainnet}
                          {copiedField === `mainnet-${token.symbol}` ? (
                            <Check className="w-3 h-3 text-success" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-50" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyToClipboard(token.assetIdTestnet, `testnet-${token.symbol}`);
                          }}
                          className="flex items-center gap-1 text-text-secondary hover:text-text-primary transition-colors font-mono text-sm"
                        >
                          {token.assetIdTestnet}
                          {copiedField === `testnet-${token.symbol}` ? (
                            <Check className="w-3 h-3 text-success" />
                          ) : (
                            <Copy className="w-3 h-3 opacity-50" />
                          )}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        {token.isActive ? (
                          <StatusBadge status="active" pulse />
                        ) : (
                          <StatusBadge status="inactive" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {filteredTokens.length === 0 && (
              <div className="p-8 text-center text-text-muted">
                No tokens found matching &quot;{searchQuery}&quot;
              </div>
            )}
          </Card>
        </div>

        {/* Precision Calculator */}
        <div>
          <h2 className="text-lg font-medium text-text-primary mb-4">Precision Calculator</h2>
          
          <Card>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-text-secondary mb-2">Select Token</label>
                  <select
                    value={selectedToken}
                    onChange={(e) => setSelectedToken(e.target.value)}
                    className="w-full px-4 py-2.5 bg-overlay-subtle border border-border-default rounded-xl text-text-primary focus:outline-none focus:border-brand-primary/50"
                  >
                    {tokens.map(token => (
                      <option key={token.symbol} value={token.symbol}>
                        {token.symbol} - {token.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <Input
                  type="text"
                  label="Human-Readable Amount"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  placeholder="1.5"
                  className="font-mono"
                />
              </div>
              
              {selectedTokenConfig && (
                <Card variant="minimal" className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">Token</span>
                    <span className="text-text-primary font-medium">{selectedTokenConfig.symbol}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">Decimals</span>
                    <span className="text-text-primary font-mono">{selectedTokenConfig.decimals}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-secondary text-sm">Precision</span>
                    <span className="text-text-primary font-mono">{selectedTokenConfig.precision.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-border-default pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-text-secondary text-sm">Raw Amount</span>
                      <button
                        onClick={() => {
                          const raw = parseTokenAmount(parseFloat(testAmount) || 0, selectedToken);
                          copyToClipboard(raw.toString(), 'raw-amount');
                        }}
                        className="flex items-center gap-1 text-brand-primary hover:text-info transition-colors font-mono"
                      >
                        {parseTokenAmount(parseFloat(testAmount) || 0, selectedToken).toLocaleString()}
                        {copiedField === 'raw-amount' ? (
                          <Check className="w-3 h-3" />
                        ) : (
                          <Copy className="w-3 h-3 opacity-50" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-secondary text-sm">Formatted</span>
                      <span className="text-text-primary font-mono">
                        {formatTokenAmount(
                          parseTokenAmount(parseFloat(testAmount) || 0, selectedToken), 
                          selectedToken,
                          { showSymbol: true }
                        )}
                      </span>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </Card>
        </div>

        {/* Code Examples */}
        <div>
          <h2 className="text-lg font-medium text-text-primary mb-4">Usage Examples</h2>
          
          <Card>
            <div className="space-y-4">
              <div className="p-4 bg-gray-900/50 rounded-xl font-mono text-sm overflow-x-auto">
                <div className="text-text-muted mb-2">{`// Import helpers`}</div>
                <div className="text-success">import {'{'} getTokenPrecision, formatTokenAmount, parseTokenAmount {'}'} from &apos;@/config/tokens&apos;;</div>
              </div>
              
              <div className="p-4 bg-gray-900/50 rounded-xl font-mono text-sm overflow-x-auto">
                <div className="text-text-muted mb-2">{`// Get precision for any token`}</div>
                <div className="text-text-primary">
                  <span className="text-purple-400">const</span> dgkoPrecision = <span className="text-warning">getTokenPrecision</span>(<span className="text-success">&apos;DGKO&apos;</span>); <span className="text-text-muted">{`// 10000`}</span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-900/50 rounded-xl font-mono text-sm overflow-x-auto">
                <div className="text-text-muted mb-2">{`// Convert human-readable to raw`}</div>
                <div className="text-text-primary">
                  <span className="text-purple-400">const</span> rawAmount = <span className="text-warning">parseTokenAmount</span>(<span className="text-orange-400">1.5</span>, <span className="text-success">&apos;DGKO&apos;</span>); <span className="text-text-muted">{`// 15000`}</span>
                </div>
              </div>
              
              <div className="p-4 bg-gray-900/50 rounded-xl font-mono text-sm overflow-x-auto">
                <div className="text-text-muted mb-2">{`// Format raw amount for display`}</div>
                <div className="text-text-primary">
                  <span className="text-purple-400">const</span> display = <span className="text-warning">formatTokenAmount</span>(<span className="text-orange-400">15000</span>, <span className="text-success">&apos;DGKO&apos;</span>); <span className="text-text-muted">{`// "1.5"`}</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Related Links */}
        <div>
          <h2 className="text-lg font-medium text-text-primary mb-4">Related</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/admin/contracts/overview">
              <Card hover className="flex items-center gap-4">
                <IconBox icon={<Hash className="w-5 h-5" />} size="md" variant="blue" />
                <div className="flex-1">
                  <div className="text-text-primary font-medium">DEX Overview</div>
                  <div className="text-text-muted text-sm">View trading pairs and contract status</div>
                </div>
                <ExternalLink className="w-4 h-4 text-text-muted" />
              </Card>
            </Link>
            
            <Link href="/admin/token-prices">
              <Card hover className="flex items-center gap-4">
                <IconBox icon={<Calculator className="w-5 h-5" />} size="md" variant="cyan" />
                <div className="flex-1">
                  <div className="text-text-primary font-medium">Token Prices</div>
                  <div className="text-text-muted text-sm">Live pricing data</div>
                </div>
                <ExternalLink className="w-4 h-4 text-text-muted" />
              </Card>
            </Link>
          </div>
        </div>

        {/* Important Notes */}
        <Alert variant="warning" title="Important Notes">
          <ul className="space-y-1 text-sm">
            <li>• <strong>precision</strong> = 10^decimals (e.g., 4 decimals = 10,000 precision)</li>
            <li>• Blockchain stores amounts in raw format (smallest unit)</li>
            <li>• Always use helper functions, never hardcode precision values</li>
            <li>• KLV, KFI, and USDT use 6 decimals (standard precision)</li>
            <li>• DGKO uses 4 decimals for cleaner trading amounts</li>
            <li>• BABYDGKO uses 8 decimals for micro-transactions</li>
          </ul>
        </Alert>
      </div>
    </AdminLayout>
  );
}
