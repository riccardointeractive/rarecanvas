'use client';

import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Download, RefreshCw, Image as ImageIcon, Sparkles } from 'lucide-react';
import {
  TemplateType,
  ImageSize,
  TokenInfo,
  TemplateData,
  GridOptions,
  IMAGE_SIZES,
  PRESET_TOKENS,
  DEFAULT_GRID,
} from './types/social-media.types';
import { getTemplateConfig } from './config/social-media.config';
import {
  // CanvasRenderer - lazy loaded below (49KB, canvas-based)
  downloadCanvas,
  TemplateSelector,
  SocialTokenSelector,
  TemplateFields,
  StyleOptions,
} from './components';
import { isSessionValidSync, isSessionValid } from '../utils/adminAuth.secure';
import { LoginFormSecure as LoginForm } from '../components/LoginForm.secure';
import { AdminLayout } from '../components/AdminLayout';

// 🚀 LAZY LOAD: CanvasRenderer (49KB, canvas-based, no SSR)
const CanvasRenderer = dynamic(
  () => import('./components/CanvasRenderer').then(mod => mod.CanvasRenderer),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full aspect-square flex items-center justify-center bg-bg-surface-200 rounded-xl border border-border-default">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-brand-primary border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-text-secondary text-sm">Loading canvas...</span>
        </div>
      </div>
    )
  }
);

/**
 * Social Media Image Builder
 * 
 * Admin tool for creating promotional social media images
 * with Web3/crypto aesthetic inspired by KuCoin and Binance
 */
export default function SocialMediaPage() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Template state
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('new-pair');
  const [size, setSize] = useState<ImageSize>('1080x1080');
  const [tokens, setTokens] = useState<TokenInfo[]>([
    PRESET_TOKENS.find(t => t.symbol === 'DGKO')!,
    PRESET_TOKENS.find(t => t.symbol === 'KLV')!,
  ]);
  const [accentColor, setAccentColor] = useState('#0066FF');
  const [showDisclaimer, setShowDisclaimer] = useState(true);
  const [fieldValues, setFieldValues] = useState<Record<string, string | number>>({});
  const [grid, setGrid] = useState<GridOptions>(DEFAULT_GRID);
  
  // Canvas ref for download
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  
  // Get current template config
  const templateConfig = getTemplateConfig(selectedTemplate);
  
  // Check session on mount
  useEffect(() => {
    setMounted(true);
    const syncValid = isSessionValidSync();
    setIsAuthenticated(syncValid);
    if (syncValid) {
      isSessionValid().then(valid => {
        if (!valid) setIsAuthenticated(false);
      });
    }
  }, []);
  
  // Update size when template changes
  useEffect(() => {
    const config = getTemplateConfig(selectedTemplate);
    if (config) {
      setSize(config.defaultSize);
      // Reset field values to defaults
      const defaults: Record<string, string | number> = {};
      config.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          defaults[field.id] = field.defaultValue;
        }
      });
      setFieldValues(defaults);
    }
  }, [selectedTemplate]);

  // Build template data
  const templateData: TemplateData = {
    template: selectedTemplate,
    size,
    fields: fieldValues,
    tokens,
    accentColor,
    showDisclaimer,
    grid,
  };

  // Calculate preview scale based on container - larger for 50% width
  const dimensions = IMAGE_SIZES[size];
  const maxPreviewWidth = 800;
  const maxPreviewHeight = 600;
  const scaleW = maxPreviewWidth / dimensions.width;
  const scaleH = maxPreviewHeight / dimensions.height;
  const scale = Math.min(scaleW, scaleH, 1);

  const handleFieldChange = (fieldId: string, value: string | number) => {
    setFieldValues(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleDownload = () => {
    const canvas = canvasContainerRef.current?.querySelector('canvas');
    if (canvas) {
      const filename = `rarecanvas-${selectedTemplate}-${Date.now()}.png`;
      downloadCanvas(canvas, filename);
    }
  };

  const handleReset = () => {
    if (templateConfig) {
      const defaults: Record<string, string | number> = {};
      templateConfig.fields.forEach(field => {
        if (field.defaultValue !== undefined) {
          defaults[field.id] = field.defaultValue;
        }
      });
      setFieldValues(defaults);
      setTokens([
        PRESET_TOKENS.find(t => t.symbol === 'DGKO')!,
        PRESET_TOKENS.find(t => t.symbol === 'KLV')!,
      ]);
      setAccentColor('#0066FF');
      setShowDisclaimer(true);
      setGrid(DEFAULT_GRID);
    }
  };

  // Prevent SSR issues - wait for client mount
  if (!mounted) {
    return null;
  }

  // Login screen
  if (!isAuthenticated) {
    return <LoginForm onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <AdminLayout onLogout={() => setIsAuthenticated(false)}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-gradient-to-br from-brand-primary/20 to-purple-500/20 border border-border-default">
            <ImageIcon className="w-6 h-6 text-brand-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Social Media Builder</h1>
            <p className="text-sm text-text-secondary">Create promotional images for social media</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-120px)]">
        {/* Preview Panel */}
        <div className="glass rounded-2xl border border-border-default p-6 flex flex-col order-2 lg:order-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-primary" />
              <span className="text-sm font-medium text-text-primary">Preview</span>
            </div>
            <div className="text-xs text-text-muted">{size}</div>
          </div>

          {/* Canvas Container - fills available space */}
          <div 
            ref={canvasContainerRef}
            className="flex-1 flex justify-center items-center bg-black/30 rounded-xl p-4 min-h-0"
          >
            <CanvasRenderer data={templateData} scale={scale} />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleDownload}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-primary text-text-primary font-medium hover:bg-brand-primary/80 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download PNG
            </button>
            <button
              onClick={handleReset}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-overlay-subtle border border-border-default text-text-secondary hover:text-text-primary hover:border-border-hover transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Reset
            </button>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="space-y-4 order-1 lg:order-1 overflow-y-auto max-h-full pr-2">
          {/* Template Selection */}
          <div className="glass rounded-2xl border border-border-default p-5">
            <TemplateSelector
              selected={selectedTemplate}
              onSelect={setSelectedTemplate}
            />
          </div>

          {/* Token Selection */}
          <div className="glass rounded-2xl border border-border-default p-5">
            <SocialTokenSelector
              tokens={tokens}
              onChange={setTokens}
              maxTokens={selectedTemplate === 'new-pair' ? 2 : 1}
            />
          </div>

          {/* Template Fields */}
          {templateConfig && templateConfig.fields.length > 0 && (
            <div className="glass rounded-2xl border border-border-default p-5">
              <TemplateFields
                fields={templateConfig.fields}
                values={fieldValues}
                onChange={handleFieldChange}
              />
            </div>
          )}

          {/* Style Options */}
          <div className="glass rounded-2xl border border-border-default p-5">
            <StyleOptions
              size={size}
              accentColor={accentColor}
              showDisclaimer={showDisclaimer}
              grid={grid}
              onSizeChange={setSize}
              onColorChange={setAccentColor}
              onDisclaimerChange={setShowDisclaimer}
              onGridChange={setGrid}
            />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
