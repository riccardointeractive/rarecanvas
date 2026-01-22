'use client';

import { useRef, useEffect, useState } from 'react';
import { debugWarn } from '@/utils/debugMode';
import {
  TemplateData,
  IMAGE_SIZES,
  TokenInfo,
} from '../types/social-media.types';
import { DEFAULT_DISCLAIMER } from '../config/social-media.config';

interface CanvasRendererProps {
  data: TemplateData;
  scale?: number;
}

const imageCache = new Map<string, HTMLImageElement>();

// Font stacks - using Geist fonts (already loaded in layout.tsx)
const FONT_DISPLAY = '"Geist Sans", "Inter", -apple-system, BlinkMacSystemFont, sans-serif';
const FONT_MONO = '"Geist Mono", "JetBrains Mono", "SF Mono", monospace';

// For headlines and body
const FONT = FONT_DISPLAY;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY SYSTEM (refined from feedback)
// For 1080px canvas:
// - Headline: 72-88px / weight 700 / line-height 1.05 / tracking +0.5-1%
// - Subhead: 32-36px / weight 500 / opacity 85%
// - Kicker: 18-20px / weight 500 / all caps / tracking +10% / opacity 70%
// - CTA: 22-24px / opacity 70% / tracking +1-2%
// - Safe margin: 56px (5.2%) → increased to 64px (6%)
// ═══════════════════════════════════════════════════════════════════════════════

const TYPO = {
  headline: { size: 0.075, weight: 700, lineHeight: 1.05, tracking: 0.008 },
  subhead: { size: 0.033, weight: 500, lineHeight: 1.2, opacity: 0.85 },
  kicker: { size: 0.018, weight: 500, tracking: 0.1, opacity: 0.65 },
  body: { size: 0.022, weight: 400, lineHeight: 1.4 },
  cta: { size: 0.022, weight: 500, tracking: 0.015, opacity: 0.7 },
  caption: { size: 0.015, weight: 400, lineHeight: 1.3 },
  safeMargin: 0.06,
  gapXL: 0.045,     // 48px - after kicker
  gapLarge: 0.028,  // 30px - headline → subhead  
  gapMedium: 0.02,  // 22px
  gapSmall: 0.015,  // 16px
};

// Color palette - subtle variations
const TEXT_PRIMARY = 'rgba(255, 255, 255, 0.95)';
const TEXT_SECONDARY = 'rgba(255, 255, 255, 0.7)';
const TEXT_TERTIARY = 'rgba(255, 255, 255, 0.5)';

// DGKO logo path for footer - local image
const DGKO_LOGO_URL = '/tokens/dgko.png';

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

export function CanvasRenderer({ data, scale = 1 }: CanvasRendererProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { width, height } = IMAGE_SIZES[data.size];
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());

  useEffect(() => {
    // Collect all images to load (tokens + DGKO logo for footer)
    const imagesToLoad: string[] = [DGKO_LOGO_URL];
    data.tokens.forEach(t => {
      const logoUrl = getTokenLogoUrl(t);
      if (logoUrl && !imagesToLoad.includes(logoUrl)) {
        imagesToLoad.push(logoUrl);
      }
    });

    let loadCount = 0;
    const newImages = new Map<string, HTMLImageElement>();

    if (imagesToLoad.length === 0) {
      setLoadedImages(new Map());
      return;
    }

    imagesToLoad.forEach(url => {
      if (imageCache.has(url)) {
        newImages.set(url, imageCache.get(url)!);
        loadCount++;
        if (loadCount === imagesToLoad.length) setLoadedImages(new Map(newImages));
        return;
      }

      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        imageCache.set(url, img);
        newImages.set(url, img);
        loadCount++;
        if (loadCount === imagesToLoad.length) setLoadedImages(new Map(newImages));
      };
      img.onerror = () => {
        debugWarn('Failed to load image:', url);
        loadCount++;
        if (loadCount === imagesToLoad.length) setLoadedImages(new Map(newImages));
      };
      img.src = url;
    });
  }, [data.tokens]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    ctx.clearRect(0, 0, width, height);
    renderTemplate(ctx, data, width, height, loadedImages);
  }, [data, width, height, loadedImages]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      style={{ width: width * scale, height: height * scale, borderRadius: '12px' }}
      className="shadow-2xl"
    />
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN RENDER
// ═══════════════════════════════════════════════════════════════════════════════

function renderTemplate(
  ctx: CanvasRenderingContext2D,
  data: TemplateData,
  w: number,
  h: number,
  images: Map<string, HTMLImageElement>
) {
  // Cinematic background with grid
  drawCinematicBackground(ctx, w, h, data.accentColor, data.grid);
  
  switch (data.template) {
    case 'new-pair': drawNewPair(ctx, data, w, h, images); break;
    case 'apr-promotion': drawApr(ctx, data, w, h, images); break;
    case 'listing': drawListing(ctx, data, w, h, images); break;
    case 'announcement': drawAnnouncement(ctx, data, w, h); break;
    case 'milestone': drawMilestone(ctx, data, w, h); break;
    case 'season-announcement': drawSeasonAnnouncement(ctx, data, w, h); break;
  }

  // Get DGKO logo for footer
  const logoImg = images.get(DGKO_LOGO_URL) || null;
  drawFooter(ctx, w, h, data.accentColor, data.showDisclaimer, logoImg);
}

// ═══════════════════════════════════════════════════════════════════════════════
// CINEMATIC BACKGROUND
// ═══════════════════════════════════════════════════════════════════════════════

function drawCinematicBackground(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string, grid: { style: string; opacity: number; density: number }) {
  // Deep dark base
  const base = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.8);
  base.addColorStop(0, '#0c0a12');
  base.addColorStop(1, '#06050a');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, w, h);

  // Ambient glow - top right
  const ambient1 = ctx.createRadialGradient(w * 0.8, h * 0.15, 0, w * 0.8, h * 0.15, w * 0.5);
  ambient1.addColorStop(0, hexToRgba(accent, 0.12));
  ambient1.addColorStop(0.5, hexToRgba(accent, 0.03));
  ambient1.addColorStop(1, 'transparent');
  ctx.fillStyle = ambient1;
  ctx.fillRect(0, 0, w, h);

  // Ambient glow - bottom left
  const ambient2 = ctx.createRadialGradient(w * 0.2, h * 0.85, 0, w * 0.2, h * 0.85, w * 0.35);
  ambient2.addColorStop(0, hexToRgba('#6366F1', 0.06));
  ambient2.addColorStop(1, 'transparent');
  ctx.fillStyle = ambient2;
  ctx.fillRect(0, 0, w, h);

  // 3D Grid background
  draw3DGrid(ctx, w, h, accent, grid.style, grid.opacity, grid.density);

  // Diagonal light beams
  drawLightBeams(ctx, w, h, accent);

  // Subtle noise
  addNoise(ctx, w, h, 3);
}

function drawLightBeams(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string) {
  ctx.save();
  
  // Main diagonal beam - softer, dimmer
  const beam1 = ctx.createLinearGradient(w, 0, 0, h);
  beam1.addColorStop(0, hexToRgba(accent, 0.05));  // reduced from 0.08
  beam1.addColorStop(0.4, hexToRgba(accent, 0.015));
  beam1.addColorStop(1, 'transparent');
  
  ctx.fillStyle = beam1;
  ctx.beginPath();
  ctx.moveTo(w * 0.55, 0);  // shifted up
  ctx.lineTo(w, 0);
  ctx.lineTo(w * 0.45, h);
  ctx.lineTo(0, h);
  ctx.closePath();
  ctx.fill();

  // Secondary beam - even softer
  const beam2 = ctx.createLinearGradient(w * 0.8, 0, w * 0.2, h);
  beam2.addColorStop(0, hexToRgba('#6366F1', 0.025));  // reduced from 0.04
  beam2.addColorStop(0.5, hexToRgba('#6366F1', 0.008));
  beam2.addColorStop(1, 'transparent');

  ctx.fillStyle = beam2;
  ctx.beginPath();
  ctx.moveTo(w * 0.72, 0);
  ctx.lineTo(w * 0.84, 0);
  ctx.lineTo(w * 0.32, h);
  ctx.lineTo(w * 0.2, h);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3D GRID BACKGROUNDS
// ═══════════════════════════════════════════════════════════════════════════════

function draw3DGrid(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  accent: string,
  style: string,
  opacity: number,
  density: number
) {
  if (style === 'none') return;
  
  // Convert opacity 0-100 to 0-1, with minimum visibility
  const alpha = Math.max(0.1, opacity / 100);
  const lineCount = density === 1 ? 8 : density === 2 ? 12 : 18;
  
  ctx.save();
  
  switch (style) {
    case 'perspective':
      drawPerspectiveGrid(ctx, w, h, accent, lineCount, alpha);
      break;
    case 'isometric':
      drawIsometricGrid(ctx, w, h, accent, lineCount, alpha);
      break;
    case 'horizontal':
      drawHorizontalGrid(ctx, w, h, accent, lineCount, alpha);
      break;
    case 'radial':
      drawRadialGrid(ctx, w, h, accent, lineCount, alpha);
      break;
    case 'hex':
      drawHexGrid(ctx, w, h, accent, density, alpha);
      break;
  }
  
  ctx.restore();
}

function drawPerspectiveGrid(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string, lines: number, alpha: number) {
  const horizon = h * 0.45;
  const vanishX = w * 0.5;
  
  ctx.lineWidth = 1;
  
  // Horizontal lines (floor)
  for (let i = 0; i <= lines; i++) {
    const progress = i / lines;
    const y = horizon + (h - horizon) * Math.pow(progress, 1.8);
    
    // Fade out toward horizon
    const lineAlpha = alpha * (0.15 + progress * 0.85);
    ctx.strokeStyle = hexToRgba(accent, lineAlpha);
    
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(w, y);
    ctx.stroke();
  }
  
  // Vertical lines converging to vanishing point
  const spread = w * 0.8;
  for (let i = -lines; i <= lines; i++) {
    const bottomX = vanishX + (i / lines) * spread;
    
    // Fade based on distance from center
    const lineAlpha = alpha * 0.5 * (1 - Math.abs(i / lines) * 0.5);
    ctx.strokeStyle = hexToRgba(accent, lineAlpha);
    
    ctx.beginPath();
    ctx.moveTo(vanishX, horizon);
    ctx.lineTo(bottomX, h);
    ctx.stroke();
  }
  
  // Glow at horizon
  const horizonGlow = ctx.createRadialGradient(vanishX, horizon, 0, vanishX, horizon, w * 0.3);
  horizonGlow.addColorStop(0, hexToRgba(accent, alpha * 0.3));
  horizonGlow.addColorStop(0.5, hexToRgba(accent, alpha * 0.1));
  horizonGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = horizonGlow;
  ctx.fillRect(0, horizon - h * 0.15, w, h * 0.3);
}

function drawIsometricGrid(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string, lines: number, alpha: number) {
  const cellSize = w / (lines * 1.5);
  const angle = Math.PI / 6; // 30 degrees
  
  ctx.lineWidth = 1;
  
  // Lines going bottom-left to top-right
  for (let i = -lines * 2; i <= lines * 2; i++) {
    const startX = w * 0.5 + i * cellSize;
    const lineAlpha = alpha * (0.3 + 0.5 * (1 - Math.abs(i / (lines * 2))));
    ctx.strokeStyle = hexToRgba(accent, lineAlpha);
    
    ctx.beginPath();
    ctx.moveTo(startX - h / Math.tan(angle), h);
    ctx.lineTo(startX + h / Math.tan(angle), 0);
    ctx.stroke();
  }
  
  // Lines going bottom-right to top-left
  for (let i = -lines * 2; i <= lines * 2; i++) {
    const startX = w * 0.5 + i * cellSize;
    const lineAlpha = alpha * (0.3 + 0.5 * (1 - Math.abs(i / (lines * 2))));
    ctx.strokeStyle = hexToRgba(accent, lineAlpha);
    
    ctx.beginPath();
    ctx.moveTo(startX + h / Math.tan(angle), h);
    ctx.lineTo(startX - h / Math.tan(angle), 0);
    ctx.stroke();
  }
  
  // Center glow
  const centerGlow = ctx.createRadialGradient(w * 0.5, h * 0.5, 0, w * 0.5, h * 0.5, w * 0.4);
  centerGlow.addColorStop(0, hexToRgba(accent, alpha * 0.2));
  centerGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = centerGlow;
  ctx.fillRect(0, 0, w, h);
}

function drawHorizontalGrid(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string, lines: number, alpha: number) {
  ctx.lineWidth = 1;
  
  const centerY = h * 0.5;
  const spacing = h / (lines + 1);
  
  // Horizontal lines with fade from center
  for (let i = 1; i <= lines; i++) {
    const yUp = centerY - i * spacing * 0.8;
    const yDown = centerY + i * spacing * 0.8;
    const lineAlpha = alpha * 0.7 * (1 - (i - 1) / lines);
    ctx.strokeStyle = hexToRgba(accent, lineAlpha);
    
    // Upper line
    if (yUp > 0) {
      ctx.beginPath();
      ctx.moveTo(w * 0.05, yUp);
      ctx.lineTo(w * 0.95, yUp);
      ctx.stroke();
    }
    
    // Lower line
    if (yDown < h) {
      ctx.beginPath();
      ctx.moveTo(w * 0.05, yDown);
      ctx.lineTo(w * 0.95, yDown);
      ctx.stroke();
    }
  }
  
  // Accent center line
  ctx.strokeStyle = hexToRgba(accent, alpha * 0.8);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(w * 0.1, centerY);
  ctx.lineTo(w * 0.9, centerY);
  ctx.stroke();
  
  // Glow on center line
  const lineGlow = ctx.createLinearGradient(0, centerY - 20, 0, centerY + 20);
  lineGlow.addColorStop(0, 'transparent');
  lineGlow.addColorStop(0.5, hexToRgba(accent, alpha * 0.15));
  lineGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = lineGlow;
  ctx.fillRect(0, centerY - 30, w, 60);
}

function drawRadialGrid(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string, lines: number, alpha: number) {
  const centerX = w * 0.5;
  const centerY = h * 0.5;
  const maxRadius = Math.max(w, h) * 0.6;
  
  ctx.lineWidth = 1;
  
  // Concentric circles
  for (let i = 1; i <= lines; i++) {
    const radius = (i / lines) * maxRadius;
    const lineAlpha = alpha * (0.3 + 0.5 * (i / lines));
    ctx.strokeStyle = hexToRgba(accent, lineAlpha);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  // Radial lines
  const rayCount = lines * 2;
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2;
    ctx.strokeStyle = hexToRgba(accent, alpha * 0.3);
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + Math.cos(angle) * maxRadius,
      centerY + Math.sin(angle) * maxRadius
    );
    ctx.stroke();
  }
  
  // Center glow
  const centerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 0.3);
  centerGlow.addColorStop(0, hexToRgba(accent, alpha * 0.25));
  centerGlow.addColorStop(0.5, hexToRgba(accent, alpha * 0.1));
  centerGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = centerGlow;
  ctx.fillRect(0, 0, w, h);
}

function drawHexGrid(ctx: CanvasRenderingContext2D, w: number, h: number, accent: string, density: number, alpha: number) {
  const hexSize = density === 1 ? w * 0.08 : density === 2 ? w * 0.055 : w * 0.038;
  const hexHeight = hexSize * Math.sqrt(3);
  const hexWidth = hexSize * 2;
  
  ctx.lineWidth = 1;
  
  const centerX = w * 0.5;
  const centerY = h * 0.5;
  const maxDist = Math.max(w, h) * 0.7;
  
  // Draw hexagons in a grid pattern
  for (let row = -10; row <= 10; row++) {
    for (let col = -10; col <= 10; col++) {
      const x = centerX + col * hexWidth * 0.75;
      const y = centerY + row * hexHeight + (col % 2) * hexHeight * 0.5;
      
      // Distance from center for fade
      const dist = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
      if (dist > maxDist) continue;
      
      const hexAlpha = alpha * (0.2 + 0.6 * (1 - dist / maxDist));
      ctx.strokeStyle = hexToRgba(accent, hexAlpha);
      
      // Draw hexagon
      ctx.beginPath();
      for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i + Math.PI / 6;
        const px = x + hexSize * 0.9 * Math.cos(angle);
        const py = y + hexSize * 0.9 * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.stroke();
    }
  }
  
  // Center glow
  const centerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxDist * 0.4);
  centerGlow.addColorStop(0, hexToRgba(accent, alpha * 0.2));
  centerGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = centerGlow;
  ctx.fillRect(0, 0, w, h);
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3D PLATFORM
// ═══════════════════════════════════════════════════════════════════════════════

function draw3DPlatform(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, _h: number, accent: string) {
  const platformW = w * 0.32;
  const platformH = platformW * 0.22;
  const depth = platformW * 0.07;
  
  // Shadow BELOW platform (new)
  const shadow = ctx.createRadialGradient(x, y + depth + platformH * 0.3, 0, x, y + depth + platformH * 0.3, platformW * 0.5);
  shadow.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
  shadow.addColorStop(0.5, 'rgba(0, 0, 0, 0.15)');
  shadow.addColorStop(1, 'transparent');
  ctx.fillStyle = shadow;
  ctx.fillRect(x - platformW * 0.6, y, platformW * 1.2, platformH * 2);

  // Glow under platform - REDUCED radius by 25%
  const glowGrad = ctx.createRadialGradient(x, y + depth, 0, x, y + depth, platformW * 0.5);  // was 0.7
  glowGrad.addColorStop(0, hexToRgba(accent, 0.28));  // reduced from 0.35
  glowGrad.addColorStop(0.5, hexToRgba(accent, 0.08));
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(x - platformW * 0.6, y - platformH, platformW * 1.2, platformH * 3);

  // Platform top surface
  ctx.beginPath();
  const topY = y - depth;
  ctx.moveTo(x - platformW * 0.5, topY);
  ctx.lineTo(x - platformW * 0.25, topY - platformH * 0.5);
  ctx.lineTo(x + platformW * 0.25, topY - platformH * 0.5);
  ctx.lineTo(x + platformW * 0.5, topY);
  ctx.lineTo(x + platformW * 0.25, topY + platformH * 0.5);
  ctx.lineTo(x - platformW * 0.25, topY + platformH * 0.5);
  ctx.closePath();
  
  const topGrad = ctx.createLinearGradient(x - platformW * 0.5, topY, x + platformW * 0.5, topY);
  topGrad.addColorStop(0, '#18141f');
  topGrad.addColorStop(0.5, '#1f1a28');
  topGrad.addColorStop(1, '#18141f');
  ctx.fillStyle = topGrad;
  ctx.fill();
  
  // Outline - reduced brightness
  ctx.strokeStyle = hexToRgba(accent, 0.35);  // was 0.5
  ctx.lineWidth = 1;  // was 1.5
  ctx.stroke();

  // Front faces
  ctx.beginPath();
  ctx.moveTo(x - platformW * 0.5, topY);
  ctx.lineTo(x - platformW * 0.25, topY + platformH * 0.5);
  ctx.lineTo(x - platformW * 0.25, topY + platformH * 0.5 + depth);
  ctx.lineTo(x - platformW * 0.5, topY + depth);
  ctx.closePath();
  ctx.fillStyle = '#0d0a12';
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x - platformW * 0.25, topY + platformH * 0.5);
  ctx.lineTo(x + platformW * 0.25, topY + platformH * 0.5);
  ctx.lineTo(x + platformW * 0.25, topY + platformH * 0.5 + depth);
  ctx.lineTo(x - platformW * 0.25, topY + platformH * 0.5 + depth);
  ctx.closePath();
  ctx.fillStyle = '#08060c';
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(x + platformW * 0.25, topY + platformH * 0.5);
  ctx.lineTo(x + platformW * 0.5, topY);
  ctx.lineTo(x + platformW * 0.5, topY + depth);
  ctx.lineTo(x + platformW * 0.25, topY + platformH * 0.5 + depth);
  ctx.closePath();
  ctx.fillStyle = '#0d0a12';
  ctx.fill();
  ctx.stroke();

  // Accent line - slightly dimmer
  ctx.beginPath();
  ctx.moveTo(x - platformW * 0.25, topY + platformH * 0.5 + depth);
  ctx.lineTo(x + platformW * 0.25, topY + platformH * 0.5 + depth);
  ctx.strokeStyle = hexToRgba(accent, 0.8);  // was full accent
  ctx.lineWidth = 1.5;  // was 2
  ctx.stroke();

  // Lens flare - slightly smaller
  drawLensFlare(ctx, x, topY + platformH * 0.5 + depth, w * 0.02, accent);  // was 0.025

  return topY - platformH * 0.25;
}

function drawLensFlare(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, color: string) {
  const core = ctx.createRadialGradient(x, y, 0, x, y, size);
  core.addColorStop(0, 'rgba(255,255,255,0.9)');
  core.addColorStop(0.3, hexToRgba(color, 0.6));
  core.addColorStop(0.6, hexToRgba(color, 0.2));
  core.addColorStop(1, 'transparent');
  ctx.fillStyle = core;
  ctx.fillRect(x - size * 2, y - size * 2, size * 4, size * 4);

  ctx.fillStyle = hexToRgba(color, 0.2);
  ctx.fillRect(x - size * 3, y - 1, size * 6, 2);
}

// ═══════════════════════════════════════════════════════════════════════════════
// FLOATING TOKEN
// ═══════════════════════════════════════════════════════════════════════════════

function drawFloatingToken(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  token: TokenInfo,
  images: Map<string, HTMLImageElement>,
  accent: string
) {
  const logoUrl = getTokenLogoUrl(token);
  const img = logoUrl ? images.get(logoUrl) : null;

  // Outer glow
  const glow = ctx.createRadialGradient(x, y, size * 0.4, x, y, size * 0.8);
  glow.addColorStop(0, hexToRgba(accent, 0.2));
  glow.addColorStop(1, 'transparent');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(x, y, size * 0.8, 0, Math.PI * 2);
  ctx.fill();

  // Rim
  ctx.beginPath();
  ctx.arc(x, y, size * 0.52, 0, Math.PI * 2);
  ctx.strokeStyle = hexToRgba(accent, 0.3);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Token background
  ctx.beginPath();
  ctx.arc(x, y, size * 0.48, 0, Math.PI * 2);
  ctx.fillStyle = '#12101a';
  ctx.fill();

  // Token image
  if (img) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, size * 0.44, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, x - size * 0.44, y - size * 0.44, size * 0.88, size * 0.88);
    ctx.restore();
  } else {
    ctx.beginPath();
    ctx.arc(x, y, size * 0.44, 0, Math.PI * 2);
    ctx.fillStyle = token.color;
    ctx.fill();
    
    ctx.font = `500 ${size * 0.3}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(token.symbol.charAt(0), x, y);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// TYPOGRAPHY FUNCTIONS - Precise control
// ═══════════════════════════════════════════════════════════════════════════════

function drawHeadline(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  w: number,
  opts: { gradient?: [string, string]; align?: CanvasTextAlign; scale?: number; glow?: boolean } = {}
) {
  const { gradient, align = 'left', scale = 1, glow = true } = opts;
  const size = w * TYPO.headline.size * scale;
  const tracking = TYPO.headline.tracking;
  
  ctx.font = `${TYPO.headline.weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';

  // Subtle glow behind headline (point 9)
  if (glow) {
    const glowGrad = ctx.createRadialGradient(x, y + size * 0.5, 0, x, y + size * 0.5, size * 2.5);
    glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
    glowGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.015)');
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.fillRect(x - size * 3, y - size * 0.5, size * 6, size * 2);
  }

  // Apply gradient or solid color
  if (gradient) {
    const metrics = ctx.measureText(text);
    const textW = metrics.width;
    const startX = align === 'center' ? x - textW / 2 : align === 'right' ? x - textW : x;
    const grad = ctx.createLinearGradient(startX, y, startX + textW, y);
    grad.addColorStop(0, gradient[0]);
    grad.addColorStop(1, gradient[1]);
    ctx.fillStyle = grad;
  } else {
    ctx.fillStyle = TEXT_PRIMARY;
  }

  // Apply tracking
  if (tracking > 0) {
    const chars = text.split('');
    const space = size * tracking;
    let totalW = 0;
    chars.forEach(c => { totalW += ctx.measureText(c).width; });
    totalW += space * (chars.length - 1);
    
    let startX = align === 'center' ? x - totalW / 2 : align === 'right' ? x - totalW : x;
    
    // Re-apply gradient for tracked text
    if (gradient) {
      const grad = ctx.createLinearGradient(startX, y, startX + totalW, y);
      grad.addColorStop(0, gradient[0]);
      grad.addColorStop(1, gradient[1]);
      ctx.fillStyle = grad;
    }
    
    chars.forEach(c => {
      ctx.textAlign = 'left';
      ctx.fillText(c, startX, y);
      startX += ctx.measureText(c).width + space;
    });
  } else {
    ctx.fillText(text, x, y);
  }
  
  return y + size * TYPO.headline.lineHeight;
}

function drawSubhead(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  w: number,
  opts: { color?: string; align?: CanvasTextAlign; scale?: number } = {}
) {
  const { color = TEXT_SECONDARY, align = 'left', scale = 1 } = opts;
  const size = w * TYPO.subhead.size * scale;
  
  ctx.font = `${TYPO.subhead.weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
  
  return y + size * TYPO.subhead.lineHeight;
}

function drawBody(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  w: number,
  opts: { color?: string; align?: CanvasTextAlign; maxWidth?: number } = {}
) {
  const { color = TEXT_TERTIARY, align = 'left', maxWidth } = opts;
  const size = w * TYPO.body.size;
  const lineH = size * TYPO.body.lineHeight;
  
  ctx.font = `${TYPO.body.weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'top';
  ctx.fillStyle = color;
  
  if (maxWidth) {
    wrapText(ctx, text, x, y, maxWidth, lineH);
  } else {
    ctx.fillText(text, x, y);
  }
  
  return y + lineH;
}

function drawLabel(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  w: number,
  opts: { color?: string; align?: CanvasTextAlign } = {}
) {
  const { align = 'left' } = opts;
  const size = w * TYPO.kicker.size;
  const tracking = TYPO.kicker.tracking;
  const color = opts.color || `rgba(255, 255, 255, ${TYPO.kicker.opacity})`;
  
  // Use mono font for labels
  ctx.font = `${TYPO.kicker.weight} ${size}px ${FONT_MONO}`;
  ctx.textBaseline = 'top';
  ctx.fillStyle = color;
  
  // Apply letter-spacing for uppercase labels
  const chars = text.toUpperCase().split('');
  const space = size * tracking;
  let totalW = 0;
  chars.forEach(c => { totalW += ctx.measureText(c).width; });
  totalW += space * (chars.length - 1);
  
  let startX = align === 'center' ? x - totalW / 2 : align === 'right' ? x - totalW : x;
  
  chars.forEach(c => {
    ctx.textAlign = 'left';
    ctx.fillText(c, startX, y);
    startX += ctx.measureText(c).width + space;
  });
  
  return y + size * 1.3;
}

// CTA line with arrow - uses mono font
function drawCTA(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  w: number,
  opts: { align?: CanvasTextAlign; arrow?: boolean } = {}
) {
  const { align = 'left', arrow = true } = opts;
  const size = w * TYPO.cta.size;
  const tracking = TYPO.cta.tracking;
  const displayText = arrow ? `${text} ↗` : text;
  
  ctx.font = `${TYPO.cta.weight} ${size}px ${FONT_MONO}`;
  ctx.textBaseline = 'top';
  ctx.fillStyle = `rgba(255, 255, 255, ${TYPO.cta.opacity})`;
  
  // Apply tracking
  const chars = displayText.split('');
  const space = size * tracking;
  let totalW = 0;
  chars.forEach(c => { totalW += ctx.measureText(c).width; });
  totalW += space * (chars.length - 1);
  
  let startX = align === 'center' ? x - totalW / 2 : align === 'right' ? x - totalW : x;
  
  chars.forEach(c => {
    ctx.textAlign = 'left';
    ctx.fillText(c, startX, y);
    startX += ctx.measureText(c).width + space;
  });
  
  return y + size * 1.4;
}

// ═══════════════════════════════════════════════════════════════════════════════
// BADGE
// ═══════════════════════════════════════════════════════════════════════════════

function drawIconBadge(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  w: number,
  accent: string,
  opts: { align?: 'left' | 'center' | 'right' } = {}
) {
  const { align = 'left' } = opts;
  const size = w * 0.012;
  const iconSize = size * 1.1;
  const gap = size * 0.5;
  
  // Use mono font for badge text
  ctx.font = `500 ${size}px ${FONT_MONO}`;
  const textW = ctx.measureText(text).width;
  const totalW = iconSize + gap + textW;
  
  const startX = align === 'center' ? x - totalW / 2 : align === 'right' ? x - totalW : x;

  // Icon box
  ctx.fillStyle = hexToRgba(accent, 0.15);
  ctx.strokeStyle = hexToRgba(accent, 0.3);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.roundRect(startX, y - iconSize / 2, iconSize, iconSize, 3);
  ctx.fill();
  ctx.stroke();

  // Icon dot
  ctx.fillStyle = accent;
  ctx.beginPath();
  ctx.arc(startX + iconSize / 2, y, iconSize * 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Text - mono font
  ctx.fillStyle = TEXT_SECONDARY;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, startX + iconSize + gap, y);
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEW PAIR TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════════

function drawNewPair(
  ctx: CanvasRenderingContext2D,
  data: TemplateData,
  w: number,
  h: number,
  images: Map<string, HTMLImageElement>
) {
  const headline = (data.fields.headline as string) || 'New Pair Added';
  const subheadline = (data.fields.subheadline as string) || 'Trade now on Digiko DEX';
  const t1 = data.tokens[0] || { symbol: 'DGKO', name: 'Digiko', color: data.accentColor };
  const t2 = data.tokens[1] || { symbol: 'KLV', name: 'Klever', color: '#8B5CF6' };

  // Text at TOP - centered, shifted down by ~5% (point 4)
  let curY = h * 0.15;  // was 0.12
  
  // Kicker - higher opacity, more tracking (point 3)
  curY = drawLabel(ctx, 'Introducing', w * 0.5, curY, w, { align: 'center' });
  curY += w * TYPO.gapXL;  // 48px gap after kicker (point 1)
  
  // Headline with glow (points 2, 9)
  curY = drawHeadline(ctx, headline.toUpperCase(), w * 0.5, curY, w, {
    gradient: [TEXT_PRIMARY, hexToRgba(data.accentColor, 0.85)],
    align: 'center',
    glow: true
  });
  curY += w * TYPO.gapLarge;  // 30px gap (point 1)
  
  // Pair symbols - slightly larger, medium weight (point 1)
  drawSubhead(ctx, `${t1.symbol} / ${t2.symbol}`, w * 0.5, curY, w, { 
    color: `rgba(255, 255, 255, ${TYPO.subhead.opacity})`, 
    align: 'center', 
    scale: 1.2 
  });

  // Platform CENTER - shifted down (point 4)
  const platformX = w * 0.5;
  const platformY = h * 0.65;  // was 0.62
  const tokenY = draw3DPlatform(ctx, platformX, platformY, w, h, data.accentColor);

  // Bigger tokens (point 5 - platform is refined)
  const tokenSize = w * 0.15;
  const tokenGap = tokenSize * 0.45;
  
  drawFloatingToken(ctx, platformX - tokenGap, tokenY - tokenSize * 0.35, tokenSize, t1, images, data.accentColor);
  drawFloatingToken(ctx, platformX + tokenGap, tokenY - tokenSize * 0.35, tokenSize, t2, images, t2.color);

  // Connection line
  ctx.strokeStyle = hexToRgba('#ffffff', 0.12);
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.beginPath();
  ctx.moveTo(platformX - tokenGap + tokenSize * 0.52, tokenY - tokenSize * 0.35);
  ctx.lineTo(platformX + tokenGap - tokenSize * 0.52, tokenY - tokenSize * 0.35);
  ctx.stroke();
  ctx.setLineDash([]);

  // CTA at bottom - bigger, higher opacity, with arrow (point 6)
  drawCTA(ctx, subheadline, w * 0.5, h * 0.82, w, { align: 'center', arrow: true });
}

// ═══════════════════════════════════════════════════════════════════════════════
// APR TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════════

function drawApr(
  ctx: CanvasRenderingContext2D,
  data: TemplateData,
  w: number,
  h: number,
  images: Map<string, HTMLImageElement>
) {
  const headline = (data.fields.headline as string) || 'Staking Rewards';
  const apr = (data.fields.apr as string) || '10%';
  const subheadline = (data.fields.subheadline as string) || 'Earn passive income by staking your tokens';
  const token = data.tokens[0] || { symbol: 'DGKO', name: 'Digiko', color: data.accentColor };

  // Token LEFT - vertically centered
  const platformX = w * 0.26;
  const platformY = h * 0.52;
  const tokenY = draw3DPlatform(ctx, platformX, platformY, w, h, data.accentColor);
  
  const tokenSize = w * 0.14;
  drawFloatingToken(ctx, platformX, tokenY - tokenSize * 0.35, tokenSize, token, images, data.accentColor);

  // Text RIGHT
  const textX = w * 0.52;
  let curY = h * 0.22;

  // Badge
  drawIconBadge(ctx, 'Staking is live', textX, curY, w, data.accentColor);
  curY += w * TYPO.gapXL;

  // APR - hero number
  const aprSize = w * 0.12;
  ctx.font = `700 ${aprSize}px ${FONT}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  
  const aprGrad = ctx.createLinearGradient(textX, curY, textX + ctx.measureText(apr).width, curY);
  aprGrad.addColorStop(0, TEXT_PRIMARY);
  aprGrad.addColorStop(1, hexToRgba(data.accentColor, 0.75));
  ctx.fillStyle = aprGrad;
  ctx.fillText(apr, textX, curY);
  
  // APR label
  const aprWidth = ctx.measureText(apr).width;
  ctx.font = `400 ${w * 0.022}px ${FONT}`;
  ctx.fillStyle = TEXT_TERTIARY;
  ctx.fillText('APR', textX + aprWidth + w * 0.015, curY + aprSize * 0.35);
  
  curY += aprSize * 1.05 + w * TYPO.gapLarge;

  // Headline
  curY = drawSubhead(ctx, headline, textX, curY, w, { color: TEXT_PRIMARY, scale: 1.1 });
  curY += w * TYPO.gapSmall;

  // Description
  drawBody(ctx, subheadline, textX, curY, w, { maxWidth: w * 0.42 });
}

// ═══════════════════════════════════════════════════════════════════════════════
// LISTING TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════════

function drawListing(
  ctx: CanvasRenderingContext2D,
  data: TemplateData,
  w: number,
  h: number,
  images: Map<string, HTMLImageElement>
) {
  const subheadline = (data.fields.subheadline as string) || 'Available for trading on Digiko';
  const token = data.tokens[0] || { symbol: 'DGKO', name: 'Digiko', color: data.accentColor };

  // Text top - centered
  let curY = h * 0.14;
  
  curY = drawLabel(ctx, 'Now Listed', w * 0.5, curY, w, { align: 'center' });
  curY += w * TYPO.gapXL;
  
  // Token symbol as hero
  curY = drawHeadline(ctx, token.symbol, w * 0.5, curY, w, {
    gradient: [TEXT_PRIMARY, hexToRgba(data.accentColor, 0.7)],
    align: 'center',
    scale: 1.3
  });
  curY += w * TYPO.gapMedium;
  
  // "is now available" instead of repeating name
  drawSubhead(ctx, 'is now available', w * 0.5, curY, w, { color: `rgba(255,255,255,${TYPO.subhead.opacity})`, align: 'center' });

  // Platform center
  const platformX = w * 0.5;
  const platformY = h * 0.66;
  const tokenY = draw3DPlatform(ctx, platformX, platformY, w, h, data.accentColor);

  // Large token
  const tokenSize = w * 0.17;
  drawFloatingToken(ctx, platformX, tokenY - tokenSize * 0.4, tokenSize, token, images, data.accentColor);

  // Bottom - use CTA style
  drawCTA(ctx, `${token.name} • ${subheadline}`, w * 0.5, h * 0.84, w, { align: 'center', arrow: false });
}

// ═══════════════════════════════════════════════════════════════════════════════
// 3D BLOCKCHAIN VISUALIZATION
// ═══════════════════════════════════════════════════════════════════════════════

function draw3DBlockchain(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, _h: number, accent: string) {
  const blockSize = w * 0.06;
  const depth = blockSize * 0.4;
  
  // Draw a chain of 3D blocks
  const blocks = [
    { x: x - blockSize * 2.2, y: y + blockSize * 0.3, scale: 0.7, opacity: 0.4 },
    { x: x - blockSize * 0.8, y: y, scale: 0.85, opacity: 0.6 },
    { x: x + blockSize * 0.7, y: y - blockSize * 0.2, scale: 1, opacity: 0.8 },
    { x: x + blockSize * 2.3, y: y + blockSize * 0.1, scale: 0.85, opacity: 0.6 },
    { x: x + blockSize * 3.7, y: y + blockSize * 0.4, scale: 0.7, opacity: 0.4 },
  ];

  // Draw connection lines first (behind blocks)
  ctx.strokeStyle = hexToRgba(accent, 0.2);
  ctx.lineWidth = 2;
  for (let i = 0; i < blocks.length - 1; i++) {
    const b1 = blocks[i];
    const b2 = blocks[i + 1];
    if (!b1 || !b2) continue;
    const s1 = blockSize * b1.scale;
    const s2 = blockSize * b2.scale;
    
    ctx.beginPath();
    ctx.moveTo(b1.x + s1 * 0.5, b1.y);
    ctx.lineTo(b2.x - s2 * 0.5, b2.y);
    ctx.stroke();
  }

  // Draw each block
  blocks.forEach(block => {
    const s = blockSize * block.scale;
    const d = depth * block.scale;
    const bx = block.x;
    const by = block.y;
    
    ctx.globalAlpha = block.opacity;
    
    // Top face
    ctx.beginPath();
    ctx.moveTo(bx - s * 0.5, by - s * 0.3);
    ctx.lineTo(bx, by - s * 0.5);
    ctx.lineTo(bx + s * 0.5, by - s * 0.3);
    ctx.lineTo(bx, by - s * 0.1);
    ctx.closePath();
    const topGrad = ctx.createLinearGradient(bx - s * 0.5, by - s * 0.5, bx + s * 0.5, by);
    topGrad.addColorStop(0, hexToRgba(accent, 0.3));
    topGrad.addColorStop(1, hexToRgba(accent, 0.15));
    ctx.fillStyle = topGrad;
    ctx.fill();
    ctx.strokeStyle = hexToRgba(accent, 0.5);
    ctx.lineWidth = 1;
    ctx.stroke();

    // Left face
    ctx.beginPath();
    ctx.moveTo(bx - s * 0.5, by - s * 0.3);
    ctx.lineTo(bx, by - s * 0.1);
    ctx.lineTo(bx, by + d);
    ctx.lineTo(bx - s * 0.5, by - s * 0.3 + d);
    ctx.closePath();
    ctx.fillStyle = hexToRgba(accent, 0.1);
    ctx.fill();
    ctx.stroke();

    // Right face
    ctx.beginPath();
    ctx.moveTo(bx + s * 0.5, by - s * 0.3);
    ctx.lineTo(bx, by - s * 0.1);
    ctx.lineTo(bx, by + d);
    ctx.lineTo(bx + s * 0.5, by - s * 0.3 + d);
    ctx.closePath();
    ctx.fillStyle = hexToRgba(accent, 0.05);
    ctx.fill();
    ctx.stroke();

    // Inner detail - hash symbol
    ctx.font = `600 ${s * 0.25}px ${FONT}`;
    ctx.fillStyle = hexToRgba(accent, 0.6);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('#', bx, by - s * 0.25);
    
    ctx.globalAlpha = 1;
  });

  // Glow effect behind center block
  const centerGlow = ctx.createRadialGradient(x + blockSize * 0.7, y - blockSize * 0.2, 0, x + blockSize * 0.7, y - blockSize * 0.2, blockSize * 1.5);
  centerGlow.addColorStop(0, hexToRgba(accent, 0.15));
  centerGlow.addColorStop(0.5, hexToRgba(accent, 0.05));
  centerGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = centerGlow;
  ctx.fillRect(x - blockSize * 2, y - blockSize * 2, blockSize * 6, blockSize * 4);
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANNOUNCEMENT TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════════

function drawAnnouncement(
  ctx: CanvasRenderingContext2D,
  data: TemplateData,
  w: number,
  h: number
) {
  const headline = (data.fields.headline as string) || 'Major Update';
  const subheadline = (data.fields.subheadline as string) || '';
  const bodyText = (data.fields.bodyText as string) || '';

  // Draw 3D blockchain in the background
  draw3DBlockchain(ctx, w * 0.5, h * 0.72, w, h, data.accentColor);

  let curY = h * 0.16;

  // Badge
  drawIconBadge(ctx, 'Announcement', w * 0.5, curY, w, data.accentColor, { align: 'center' });
  curY += w * TYPO.gapXL;

  // Headline - handle multi-line
  const words = headline.split(' ');
  if (words.length > 3) {
    const mid = Math.ceil(words.length / 2);
    curY = drawHeadline(ctx, words.slice(0, mid).join(' '), w * 0.5, curY, w, {
      gradient: [TEXT_PRIMARY, hexToRgba(data.accentColor, 0.75)],
      align: 'center',
      scale: 0.85
    });
    curY = drawHeadline(ctx, words.slice(mid).join(' '), w * 0.5, curY, w, {
      gradient: [TEXT_PRIMARY, hexToRgba(data.accentColor, 0.75)],
      align: 'center',
      scale: 0.85
    });
  } else {
    curY = drawHeadline(ctx, headline, w * 0.5, curY, w, {
      gradient: [TEXT_PRIMARY, hexToRgba(data.accentColor, 0.75)],
      align: 'center'
    });
  }
  curY += w * TYPO.gapLarge;

  // Subheadline
  if (subheadline) {
    curY = drawSubhead(ctx, subheadline, w * 0.5, curY, w, { color: `rgba(255,255,255,${TYPO.subhead.opacity})`, align: 'center' });
    curY += w * TYPO.gapSmall;
  }
  
  // Body
  if (bodyText) {
    drawBody(ctx, bodyText, w * 0.5, curY, w, { align: 'center' });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MILESTONE TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════════

function drawMilestone(
  ctx: CanvasRenderingContext2D,
  data: TemplateData,
  w: number,
  h: number
) {
  const number = (data.fields.number as string) || '1,000,000';
  const metric = (data.fields.metric as string) || 'transactions';
  const headline = (data.fields.headline as string) || 'Milestone Reached';

  const labels: Record<string, string> = {
    transactions: 'transactions processed',
    users: 'active users',
    volume: 'in trading volume',
    tvl: 'total value locked',
    holders: 'token holders',
  };

  let curY = h * 0.30;

  // Badge
  drawIconBadge(ctx, headline, w * 0.5, curY, w, data.accentColor, { align: 'center' });
  curY += w * TYPO.gapXL;

  // Hero number (extra large) with glow
  const numSize = w * 0.11;
  
  // Glow behind number
  const glowGrad = ctx.createRadialGradient(w * 0.5, curY + numSize * 0.5, 0, w * 0.5, curY + numSize * 0.5, numSize * 2);
  glowGrad.addColorStop(0, 'rgba(255, 255, 255, 0.04)');
  glowGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.015)');
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(w * 0.2, curY - numSize * 0.5, w * 0.6, numSize * 2);
  
  ctx.font = `700 ${numSize}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  const numGrad = ctx.createLinearGradient(w * 0.3, curY, w * 0.7, curY);
  numGrad.addColorStop(0, TEXT_PRIMARY);
  numGrad.addColorStop(1, hexToRgba(data.accentColor, 0.7));
  ctx.fillStyle = numGrad;
  ctx.fillText(number, w * 0.5, curY);
  
  curY += numSize * 1.05 + w * TYPO.gapLarge;

  // Metric
  drawSubhead(ctx, labels[metric] || metric, w * 0.5, curY, w, { color: `rgba(255,255,255,${TYPO.subhead.opacity})`, align: 'center' });

  // Accent dots
  const dots: [number, number][] = [[0.28, 0.40], [0.72, 0.40], [0.24, 0.54], [0.76, 0.54]];
  ctx.fillStyle = hexToRgba(data.accentColor, 0.25);
  dots.forEach(([px, py]) => {
    ctx.beginPath();
    ctx.arc(w * px, h * py, 3, 0, Math.PI * 2);
    ctx.fill();
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEASON ANNOUNCEMENT TEMPLATE
// ═══════════════════════════════════════════════════════════════════════════════

function drawSeasonAnnouncement(
  ctx: CanvasRenderingContext2D,
  data: TemplateData,
  w: number,
  h: number
) {
  const headline = (data.fields.headline as string) || 'New Season Starts!';
  const prizePool = (data.fields.prizePool as string) || '20,000';
  const prizeToken = (data.fields.prizeToken as string) || 'KLV';
  const topPlayers = (data.fields.topPlayers as string) || '10';
  const duration = (data.fields.duration as string) || '7 days';
  const subheadline = (data.fields.subheadline as string) || 'Race to win!';
  const gameName = (data.fields.gameName as string) || 'CTR Kart';

  // Racing emoji/icon at top
  let curY = h * 0.14;

  // Game badge
  drawIconBadge(ctx, `🏎️ ${gameName}`, w * 0.5, curY, w, data.accentColor, { align: 'center' });
  curY += w * TYPO.gapXL;

  // Headline
  curY = drawHeadline(ctx, headline, w * 0.5, curY, w, {
    gradient: [TEXT_PRIMARY, hexToRgba(data.accentColor, 0.75)],
    align: 'center',
    scale: 0.9
  });
  curY += w * TYPO.gapLarge;

  // Prize pool - HERO number with glow
  const prizeText = `${prizePool} ${prizeToken}`;
  const prizeSize = w * 0.095;
  
  // Glow behind prize
  const glowGrad = ctx.createRadialGradient(w * 0.5, curY + prizeSize * 0.5, 0, w * 0.5, curY + prizeSize * 0.5, prizeSize * 2.5);
  glowGrad.addColorStop(0, hexToRgba(data.accentColor, 0.15));
  glowGrad.addColorStop(0.4, hexToRgba(data.accentColor, 0.05));
  glowGrad.addColorStop(1, 'transparent');
  ctx.fillStyle = glowGrad;
  ctx.fillRect(w * 0.1, curY - prizeSize * 0.3, w * 0.8, prizeSize * 1.8);
  
  ctx.font = `700 ${prizeSize}px ${FONT}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  
  const prizeGrad = ctx.createLinearGradient(w * 0.25, curY, w * 0.75, curY);
  prizeGrad.addColorStop(0, '#FFD700'); // Gold
  prizeGrad.addColorStop(0.5, '#FFF8DC'); // Cream
  prizeGrad.addColorStop(1, '#FFD700'); // Gold
  ctx.fillStyle = prizeGrad;
  ctx.fillText(prizeText, w * 0.5, curY);
  
  curY += prizeSize * 1.1 + w * TYPO.gapMedium;

  // "PRIZE POOL" label
  ctx.font = `500 ${w * 0.02}px ${FONT}`;
  ctx.fillStyle = TEXT_TERTIARY;
  ctx.letterSpacing = `${w * 0.003}px`;
  ctx.fillText('PRIZE POOL', w * 0.5, curY);
  ctx.letterSpacing = '0px';
  
  curY += w * TYPO.gapXL;

  // Info cards row
  const cardWidth = w * 0.25;
  const cardHeight = w * 0.10;
  const cardGap = w * 0.04;
  const cardsStartX = w * 0.5 - cardWidth - cardGap * 0.5;
  
  // Card 1: Top N players
  drawInfoCard(ctx, cardsStartX, curY, cardWidth, cardHeight, {
    label: 'TOP PLAYERS',
    value: `Top ${topPlayers}`,
    accent: data.accentColor,
  });
  
  // Card 2: Duration
  drawInfoCard(ctx, cardsStartX + cardWidth + cardGap, curY, cardWidth, cardHeight, {
    label: 'DURATION',
    value: duration,
    accent: data.accentColor,
  });
  
  curY += cardHeight + w * TYPO.gapLarge;

  // Subheadline / CTA
  if (subheadline) {
    drawSubhead(ctx, subheadline, w * 0.5, curY, w, { 
      color: `rgba(255,255,255,${TYPO.subhead.opacity})`, 
      align: 'center' 
    });
  }

  // Decorative racing elements
  drawRacingDecorations(ctx, w, h, data.accentColor);
}

// Helper: Draw info card for season template
function drawInfoCard(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  opts: { label: string; value: string; accent: string }
) {
  // Card background
  ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  
  const radius = height * 0.15;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fill();
  ctx.stroke();
  
  // Label
  const labelSize = width * 0.09;
  ctx.font = `500 ${labelSize}px ${FONT}`;
  ctx.fillStyle = TEXT_TERTIARY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(opts.label, x + width * 0.5, y + height * 0.18);
  
  // Value
  const valueSize = width * 0.18;
  ctx.font = `700 ${valueSize}px ${FONT}`;
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.textBaseline = 'bottom';
  ctx.fillText(opts.value, x + width * 0.5, y + height * 0.88);
}

// Helper: Draw racing decorations
function drawRacingDecorations(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  accent: string
) {
  ctx.save();
  
  // Checkered flag pattern in corners (subtle)
  const flagSize = w * 0.06;
  const squareSize = flagSize / 4;
  
  // Top-left corner
  ctx.globalAlpha = 0.06;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if ((row + col) % 2 === 0) {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(w * 0.03 + col * squareSize, h * 0.03 + row * squareSize, squareSize, squareSize);
      }
    }
  }
  
  // Bottom-right corner
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      if ((row + col) % 2 === 0) {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(w * 0.97 - flagSize + col * squareSize, h * 0.97 - flagSize + row * squareSize, squareSize, squareSize);
      }
    }
  }
  
  // Speed lines (left side)
  ctx.globalAlpha = 0.08;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  
  const lineStartY = h * 0.35;
  for (let i = 0; i < 5; i++) {
    const y = lineStartY + i * w * 0.025;
    const lineLen = w * (0.08 - i * 0.012);
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(lineLen, y);
    ctx.stroke();
  }
  
  // Speed lines (right side)
  for (let i = 0; i < 5; i++) {
    const y = lineStartY + i * w * 0.025;
    const lineLen = w * (0.08 - i * 0.012);
    ctx.beginPath();
    ctx.moveTo(w, y);
    ctx.lineTo(w - lineLen, y);
    ctx.stroke();
  }
  
  ctx.restore();
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROFESSIONAL FOOTER
// ═══════════════════════════════════════════════════════════════════════════════

function drawFooter(
  ctx: CanvasRenderingContext2D, 
  w: number, 
  h: number, 
  _accent: string, 
  showDisclaimer: boolean,
  logoImg?: HTMLImageElement | null
) {
  const margin = w * TYPO.safeMargin + w * 0.015;
  const footerY = h * 0.9;
  
  // Sharp separator line
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(margin, footerY - h * 0.025);
  ctx.lineTo(w - margin, footerY - h * 0.025);
  ctx.stroke();

  // Logo size
  const logoSize = w * 0.032;
  let textStartX = margin;

  // Draw DGKO logo if available
  if (logoImg) {
    ctx.save();
    // Circle clip for logo
    ctx.beginPath();
    ctx.arc(margin + logoSize / 2, footerY + h * 0.008, logoSize / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(logoImg, margin, footerY + h * 0.008 - logoSize / 2, logoSize, logoSize);
    ctx.restore();
    
    textStartX = margin + logoSize + w * 0.012;
  }

  // Title: "DIGIKO ECOSYSTEM" - display font
  const titleSize = w * 0.014;
  ctx.font = `600 ${titleSize}px ${FONT_DISPLAY}`;
  ctx.fillStyle = TEXT_PRIMARY;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('DIGIKO ECOSYSTEM', textStartX, footerY - h * 0.005);

  // Description under title - mono font
  const descSize = w * 0.0095;
  ctx.font = `400 ${descSize}px ${FONT_MONO}`;
  ctx.fillStyle = TEXT_TERTIARY;
  ctx.fillText('Decentralised services on Klever Blockchain', textStartX, footerY + h * 0.013);

  // Website - right aligned, mono font
  ctx.font = `500 ${w * 0.011}px ${FONT_MONO}`;
  ctx.fillStyle = TEXT_SECONDARY;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('digiko.io', w - margin, footerY + h * 0.008);

  // Disclaimer - mono font
  if (showDisclaimer) {
    ctx.font = `400 ${w * 0.0075}px ${FONT_MONO}`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.38)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(DEFAULT_DISCLAIMER, w * 0.5, h * 0.96);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function hexToRgba(hex: string, a: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
}

function addNoise(ctx: CanvasRenderingContext2D, w: number, h: number, intensity: number) {
  const imageData = ctx.getImageData(0, 0, w, h);
  const d = imageData.data;
  for (let i = 0; i < d.length; i += 4) {
    const noise = (Math.random() - 0.5) * intensity;
    const r = d[i];
    const g = d[i + 1];
    const b = d[i + 2];
    if (r !== undefined) d[i] = Math.max(0, Math.min(255, r + noise));
    if (g !== undefined) d[i + 1] = Math.max(0, Math.min(255, g + noise));
    if (b !== undefined) d[i + 2] = Math.max(0, Math.min(255, b + noise));
  }
  ctx.putImageData(imageData, 0, 0);
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number) {
  const words = text.split(' ');
  let line = '';
  let currY = y;

  for (const word of words) {
    const test = line + word + ' ';
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line.trim(), x, currY);
      line = word + ' ';
      currY += lineH;
    } else {
      line = test;
    }
  }
  ctx.fillText(line.trim(), x, currY);
}

export function downloadCanvas(canvas: HTMLCanvasElement, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
