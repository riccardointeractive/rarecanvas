'use client';

import { ImageSize, IMAGE_SIZES, ACCENT_COLORS, GridOptions, GRID_STYLES } from '../types/social-media.types';

interface StyleOptionsProps {
  size: ImageSize;
  accentColor: string;
  showDisclaimer: boolean;
  grid: GridOptions;
  onSizeChange: (size: ImageSize) => void;
  onColorChange: (color: string) => void;
  onDisclaimerChange: (show: boolean) => void;
  onGridChange: (grid: GridOptions) => void;
}

const SIZE_LABELS: Record<ImageSize, string> = {
  '1200x630': 'Twitter / LinkedIn',
  '1080x1080': 'Instagram Square',
  '1200x1200': 'High-res Square',
  '1920x1080': 'HD Banner',
};

export function StyleOptions({
  size,
  accentColor,
  showDisclaimer,
  grid,
  onSizeChange,
  onColorChange,
  onDisclaimerChange,
  onGridChange,
}: StyleOptionsProps) {
  return (
    <div className="space-y-5">
      {/* Image Size */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">Image Size</label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(IMAGE_SIZES) as ImageSize[]).map((sizeKey) => (
            <button
              key={sizeKey}
              onClick={() => onSizeChange(sizeKey)}
              className={`
                p-2.5 rounded-xl border transition-all text-left
                ${size === sizeKey
                  ? 'bg-brand-primary/20 border-brand-primary text-text-primary'
                  : 'bg-overlay-subtle border-border-default text-text-secondary hover:border-border-hover hover:text-text-primary'
                }
              `}
            >
              <div className="text-xs font-medium">{SIZE_LABELS[sizeKey]}</div>
              <div className="text-[10px] text-text-muted">{sizeKey}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Accent Color */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-text-secondary">Accent Color</label>
        <div className="flex flex-wrap gap-2">
          {ACCENT_COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => onColorChange(color.value)}
              className={`
                group relative w-10 h-10 rounded-xl transition-all
                ${accentColor === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-[#0d0d14]' : 'hover:scale-110'}
              `}
              style={{ backgroundColor: color.value }}
              title={color.label}
            >
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded text-xs bg-black/80 text-text-primary whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                {color.label}
              </span>
            </button>
          ))}
          
          <div className="relative">
            <input
              type="color"
              value={accentColor}
              onChange={(e) => onColorChange(e.target.value)}
              className="w-10 h-10 rounded-xl cursor-pointer bg-transparent border-2 border-dashed border-border-hover"
              title="Custom color"
            />
          </div>
        </div>
      </div>

      {/* 3D Grid Background */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-text-secondary">3D Grid Background</label>
        
        {/* Grid Style */}
        <div className="grid grid-cols-3 gap-1.5">
          {GRID_STYLES.map((style) => (
            <button
              key={style.value}
              onClick={() => onGridChange({ ...grid, style: style.value })}
              className={`
                p-2 rounded-lg border transition-all text-center
                ${grid.style === style.value
                  ? 'bg-brand-primary/20 border-brand-primary text-text-primary'
                  : 'bg-overlay-subtle border-border-default text-text-secondary hover:border-border-hover hover:text-text-primary'
                }
              `}
            >
              <div className="text-lg mb-0.5">{style.icon}</div>
              <div className="text-[10px]">{style.label}</div>
            </button>
          ))}
        </div>

        {/* Grid Opacity */}
        {grid.style !== 'none' && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="text-text-muted">Opacity</span>
              <span className="text-text-secondary">{grid.opacity}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="80"
              value={grid.opacity}
              onChange={(e) => onGridChange({ ...grid, opacity: parseInt(e.target.value) })}
              className="w-full h-1.5 bg-overlay-default rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-3.5
                [&::-webkit-slider-thumb]:h-3.5
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-brand-primary
                [&::-webkit-slider-thumb]:cursor-pointer
                [&::-webkit-slider-thumb]:transition-transform
                [&::-webkit-slider-thumb]:hover:scale-110"
            />
          </div>
        )}

        {/* Grid Density */}
        {grid.style !== 'none' && (
          <div className="flex gap-1.5">
            {[
              { value: 1, label: 'Sparse' },
              { value: 2, label: 'Normal' },
              { value: 3, label: 'Dense' },
            ].map((density) => (
              <button
                key={density.value}
                onClick={() => onGridChange({ ...grid, density: density.value })}
                className={`
                  flex-1 py-1.5 px-2 rounded-lg border transition-all text-xs
                  ${grid.density === density.value
                    ? 'bg-brand-primary/20 border-brand-primary text-text-primary'
                    : 'bg-overlay-subtle border-border-default text-text-secondary hover:border-border-hover'
                  }
                `}
              >
                {density.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Disclaimer Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <label className="text-sm font-medium text-text-secondary">Show Disclaimer</label>
          <p className="text-xs text-text-muted">Add legal disclaimer at bottom</p>
        </div>
        <button
          onClick={() => onDisclaimerChange(!showDisclaimer)}
          className={`
            w-12 h-6 rounded-full transition-colors relative
            ${showDisclaimer ? 'bg-brand-primary' : 'bg-white/20'}
          `}
        >
          <div
            className={`
              absolute top-1 w-4 h-4 rounded-full bg-white transition-transform
              ${showDisclaimer ? 'translate-x-7' : 'translate-x-1'}
            `}
          />
        </button>
      </div>
    </div>
  );
}
