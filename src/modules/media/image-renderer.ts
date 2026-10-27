import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import crypto from 'node:crypto';

export type AspectRatio = '1:1' | '4:5' | '9:16';
export type StudioTheme = 'emerald-dark' | 'royal-gold' | 'midnight-teal' | 'minimal-slate';

export interface ImageRenderOptions {
  id?: string;
  title: string;
  subtitle?: string;
  aspectRatio?: AspectRatio;
  theme?: StudioTheme;
  brandWatermark?: string;
  categoryTag?: string;
  outputFilename?: string;
}

export interface ImageRenderResult {
  buffer: Buffer;
  filename: string;
  filePath: string;
  publicUrl: string;
  storageKey: string;
  width: number;
  height: number;
  sizeBytes: number;
  format: 'png';
  aspectRatio: AspectRatio;
  theme: StudioTheme;
  durationMs: number;
}

export const ASPECT_RATIO_CONFIGS: Record<
  AspectRatio,
  { width: number; height: number; titleFontSize: number; subtitleFontSize: number; maxCharsPerLine: number }
> = {
  '1:1': {
    width: 1080,
    height: 1080,
    titleFontSize: 52,
    subtitleFontSize: 28,
    maxCharsPerLine: 34,
  },
  '4:5': {
    width: 1080,
    height: 1350,
    titleFontSize: 54,
    subtitleFontSize: 30,
    maxCharsPerLine: 34,
  },
  '9:16': {
    width: 1080,
    height: 1920,
    titleFontSize: 56,
    subtitleFontSize: 32,
    maxCharsPerLine: 32,
  },
};

interface ThemeColors {
  name: string;
  bgGradStart: string;
  bgGradMid: string;
  bgGradEnd: string;
  primaryAccent: string;
  secondaryAccent: string;
  borderAccent: string;
  borderOuter: string;
  cardBg: string;
  quoteFill: string;
  titleColor: string;
  subtitleColor: string;
  watermarkColor: string;
  badgeBg: string;
  badgeText: string;
  glowColor: string;
}

const THEMES: Record<StudioTheme, ThemeColors> = {
  'emerald-dark': {
    name: 'الزمرد الداكن',
    bgGradStart: '#064e3b',
    bgGradMid: '#022c22',
    bgGradEnd: '#02150e',
    primaryAccent: '#10b981',
    secondaryAccent: '#34d399',
    borderAccent: '#059669',
    borderOuter: '#10b98144',
    cardBg: '#03140c88',
    quoteFill: '#10b981',
    titleColor: '#ffffff',
    subtitleColor: '#a7f3d0',
    watermarkColor: '#34d399',
    badgeBg: '#064e3b88',
    badgeText: '#6ee7b7',
    glowColor: '#10b98122',
  },
  'royal-gold': {
    name: 'الذهبي الملكي',
    bgGradStart: '#78350f',
    bgGradMid: '#381604',
    bgGradEnd: '#0f0701',
    primaryAccent: '#f59e0b',
    secondaryAccent: '#fbbf24',
    borderAccent: '#d97706',
    borderOuter: '#f59e0b44',
    cardBg: '#1e0c0388',
    quoteFill: '#f59e0b',
    titleColor: '#ffffff',
    subtitleColor: '#fde68a',
    watermarkColor: '#fbbf24',
    badgeBg: '#78350f88',
    badgeText: '#fcd34d',
    glowColor: '#f59e0b22',
  },
  'midnight-teal': {
    name: 'التيل الليلي',
    bgGradStart: '#155e75',
    bgGradMid: '#083344',
    bgGradEnd: '#02101a',
    primaryAccent: '#06b6d4',
    secondaryAccent: '#22d3ee',
    borderAccent: '#0891b2',
    borderOuter: '#06b6d444',
    cardBg: '#031f2d88',
    quoteFill: '#06b6d4',
    titleColor: '#ffffff',
    subtitleColor: '#a5f3fc',
    watermarkColor: '#22d3ee',
    badgeBg: '#155e7588',
    badgeText: '#67e8f9',
    glowColor: '#06b6d422',
  },
  'minimal-slate': {
    name: 'الرمادي المينيمال',
    bgGradStart: '#334155',
    bgGradMid: '#0f172a',
    bgGradEnd: '#020617',
    primaryAccent: '#94a3b8',
    secondaryAccent: '#cbd5e1',
    borderAccent: '#475569',
    borderOuter: '#94a3b844',
    cardBg: '#0f172a88',
    quoteFill: '#94a3b8',
    titleColor: '#ffffff',
    subtitleColor: '#e2e8f0',
    watermarkColor: '#cbd5e1',
    badgeBg: '#1e293b88',
    badgeText: '#e2e8f0',
    glowColor: '#94a3b818',
  },
};

/**
 * Escapes characters for safe inclusion inside SVG XML
 */
function escapeSvg(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Wrap text into balanced lines respecting maximum character limits per line.
 * Works seamlessly with Arabic words.
 */
function wrapArabicText(text: string, maxCharsPerLine: number): string[] {
  const clean = text.trim();
  if (!clean) return [];

  // Support user-provided explicit linebreaks
  const rawParagraphs = clean.split(/\r?\n+/);
  const resultLines: string[] = [];

  for (const para of rawParagraphs) {
    const words = para.trim().split(/\s+/);
    let currentLine = '';

    for (const word of words) {
      if (!currentLine) {
        currentLine = word;
      } else if (currentLine.length + 1 + word.length <= maxCharsPerLine) {
        currentLine += ' ' + word;
      } else {
        resultLines.push(currentLine);
        currentLine = word;
      }
    }
    if (currentLine) {
      resultLines.push(currentLine);
    }
  }

  return resultLines;
}

export class ImageRenderer {
  /**
   * Builds the complete SVG template for high-resolution programmatic card rendering
   */
  static generateSvg(options: ImageRenderOptions): { svg: string; width: number; height: number } {
    const aspectRatio: AspectRatio = options.aspectRatio || '1:1';
    const themeKey: StudioTheme = options.theme || 'emerald-dark';
    const theme = THEMES[themeKey] || THEMES['emerald-dark'];
    const dimensions = ASPECT_RATIO_CONFIGS[aspectRatio];
    const { width, height, titleFontSize, subtitleFontSize, maxCharsPerLine } = dimensions;

    const watermark = options.brandWatermark || 'M.GH.AL';
    const category = options.categoryTag || 'محتوى ملهم';
    const titleLines = wrapArabicText(options.title, maxCharsPerLine);
    const subtitleLines = options.subtitle ? wrapArabicText(options.subtitle, maxCharsPerLine + 12) : [];

    const centerX = width / 2;
    const centerY = height / 2;

    // Calculate vertical positions
    const titleLineHeight = Math.round(titleFontSize * 1.45);
    const subtitleLineHeight = Math.round(subtitleFontSize * 1.55);

    const totalTitleHeight = titleLines.length * titleLineHeight;
    const totalSubtitleHeight = subtitleLines.length > 0 ? subtitleLines.length * subtitleLineHeight + 40 : 0;
    const dividerHeight = subtitleLines.length > 0 ? 30 : 0;
    const totalBlockHeight = totalTitleHeight + dividerHeight + totalSubtitleHeight;

    // Center the whole quote block
    const blockStartY = centerY - totalBlockHeight / 2 + (aspectRatio === '9:16' ? 20 : 0);

    // Title SVG tspans
    const titleTspans = titleLines
      .map(
        (line, idx) =>
          `<tspan x="${centerX}" dy="${idx === 0 ? 0 : titleLineHeight}">${escapeSvg(line)}</tspan>`
      )
      .join('\n        ');

    // Subtitle SVG tspans
    const subtitleTspans = subtitleLines
      .map(
        (line, idx) =>
          `<tspan x="${centerX}" dy="${idx === 0 ? 0 : subtitleLineHeight}">${escapeSvg(line)}</tspan>`
      )
      .join('\n        ');

    const dividerY = blockStartY + totalTitleHeight + 20;
    const subtitleStartY = dividerY + 35;

    // Decorative margins & border coordinates
    const margin = 50;
    const innerMargin = 62;

    const svg = `
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Background Radial Gradient -->
    <radialGradient id="bgGlow" cx="50%" cy="45%" r="75%">
      <stop offset="0%" stop-color="${theme.bgGradStart}" stop-opacity="0.85"/>
      <stop offset="55%" stop-color="${theme.bgGradMid}" stop-opacity="0.95"/>
      <stop offset="100%" stop-color="${theme.bgGradEnd}" stop-opacity="1"/>
    </radialGradient>

    <!-- Center Accent Glow -->
    <radialGradient id="centerOrb" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${theme.primaryAccent}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="${theme.primaryAccent}" stop-opacity="0"/>
    </radialGradient>

    <!-- Linear Accent for Divider -->
    <linearGradient id="dividerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${theme.primaryAccent}" stop-opacity="0"/>
      <stop offset="25%" stop-color="${theme.primaryAccent}" stop-opacity="0.6"/>
      <stop offset="50%" stop-color="${theme.secondaryAccent}" stop-opacity="1"/>
      <stop offset="75%" stop-color="${theme.primaryAccent}" stop-opacity="0.6"/>
      <stop offset="100%" stop-color="${theme.primaryAccent}" stop-opacity="0"/>
    </linearGradient>

    <!-- Subtle Drop Shadow Filter -->
    <filter id="textShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.65"/>
    </filter>
  </defs>

  <style>
    .brand-title {
      font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;
      font-weight: 800;
      letter-spacing: 1px;
    }
    .arabic-title {
      font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .arabic-subtitle {
      font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;
      font-weight: 500;
    }
    .badge-text {
      font-family: 'Cairo', 'Segoe UI', Tahoma, Arial, sans-serif;
      font-weight: 600;
    }
  </style>

  <!-- Canvas Background -->
  <rect width="${width}" height="${height}" fill="url(#bgGlow)"/>

  <!-- Subtle Center Glow Orb -->
  <circle cx="${centerX}" cy="${centerY}" r="${Math.min(width, height) * 0.45}" fill="url(#centerOrb)"/>

  <!-- Outer Double Luxury Border -->
  <rect x="${margin}" y="${margin}" width="${width - margin * 2}" height="${height - margin * 2}"
        rx="28" fill="none" stroke="${theme.borderOuter}" stroke-width="2"/>
  <rect x="${innerMargin}" y="${innerMargin}" width="${width - innerMargin * 2}" height="${height - innerMargin * 2}"
        rx="22" fill="none" stroke="${theme.borderAccent}" stroke-width="1.2" stroke-opacity="0.45"/>

  <!-- Corner Geometric Motifs -->
  <!-- Top Left -->
  <path d="M ${margin + 16} ${margin + 36} L ${margin + 36} ${margin + 16} M ${margin + 16} ${margin + 16} L ${margin + 44} ${margin + 16} M ${margin + 16} ${margin + 16} L ${margin + 16} ${margin + 44}"
        stroke="${theme.primaryAccent}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- Top Right -->
  <path d="M ${width - margin - 16} ${margin + 36} L ${width - margin - 36} ${margin + 16} M ${width - margin - 16} ${margin + 16} L ${width - margin - 44} ${margin + 16} M ${width - margin - 16} ${margin + 16} L ${width - margin - 16} ${margin + 44}"
        stroke="${theme.primaryAccent}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- Bottom Left -->
  <path d="M ${margin + 16} ${height - margin - 36} L ${margin + 36} ${height - margin - 16} M ${margin + 16} ${height - margin - 16} L ${margin + 44} ${height - margin - 16} M ${margin + 16} ${height - margin - 16} L ${margin + 16} ${height - margin - 44}"
        stroke="${theme.primaryAccent}" stroke-width="2.5" fill="none" stroke-linecap="round"/>
  <!-- Bottom Right -->
  <path d="M ${width - margin - 16} ${height - margin - 36} L ${width - margin - 36} ${height - margin - 16} M ${width - margin - 16} ${height - margin - 16} L ${width - margin - 44} ${height - margin - 16} M ${width - margin - 16} ${height - margin - 16} L ${width - margin - 16} ${height - margin - 44}"
        stroke="${theme.primaryAccent}" stroke-width="2.5" fill="none" stroke-linecap="round"/>

  <!-- Header Section (Watermark + Category Tag) -->
  <g transform="translate(0, ${margin + 60})">
    <!-- Brand Watermark Logo Badge -->
    <rect x="${centerX - 80}" y="-26" width="160" height="42" rx="21" fill="${theme.badgeBg}" stroke="${theme.borderAccent}" stroke-width="1.2"/>
    <text x="${centerX}" y="2" fill="${theme.watermarkColor}" font-size="20" text-anchor="middle" class="brand-title">
      ${escapeSvg(watermark)}
    </text>

    <!-- Category Pill Tag -->
    <text x="${centerX}" y="42" fill="${theme.badgeText}" font-size="16" text-anchor="middle" class="badge-text" opacity="0.85">
      • ${escapeSvg(category)} •
    </text>
  </g>

  <!-- Quote Mark Icon (Top decorative) -->
  <g transform="translate(${centerX}, ${blockStartY - 45})" opacity="0.4">
    <path d="M -22 -15 C -15 -25, -5 -25, -5 -15 C -5 -5, -15 -5, -15 5 C -15 15, -25 15, -25 5 Z M 10 -15 C 17 -25, 27 -25, 27 -15 C 27 -5, 17 -5, 17 5 C 17 15, 7 15, 7 5 Z"
          fill="${theme.quoteFill}"/>
  </g>

  <!-- Main Arabic Title Block -->
  <text x="${centerX}" y="${blockStartY}" fill="${theme.titleColor}" font-size="${titleFontSize}"
        text-anchor="middle" direction="rtl" class="arabic-title" filter="url(#textShadow)">
    ${titleTspans}
  </text>

  <!-- Ornamental Divider (When subtitle is present) -->
  ${
    subtitleLines.length > 0
      ? `
  <line x1="${centerX - 160}" y1="${dividerY}" x2="${centerX + 160}" y2="${dividerY}" stroke="url(#dividerGrad)" stroke-width="2"/>
  <polygon points="${centerX},${dividerY - 5} ${centerX + 6},${dividerY} ${centerX},${dividerY + 5} ${centerX - 6},${dividerY}" fill="${theme.primaryAccent}"/>
  `
      : ''
  }

  <!-- Arabic Subtitle / Core Message -->
  ${
    subtitleLines.length > 0
      ? `
  <text x="${centerX}" y="${subtitleStartY}" fill="${theme.subtitleColor}" font-size="${subtitleFontSize}"
        text-anchor="middle" direction="rtl" class="arabic-subtitle" opacity="0.92">
    ${subtitleTspans}
  </text>
  `
      : ''
  }

  <!-- Footer Section -->
  <g transform="translate(0, ${height - margin - 45})">
    <!-- Subtle Footer Line -->
    <line x1="${centerX - 120}" y1="-25" x2="${centerX + 120}" y2="-25" stroke="${theme.borderAccent}" stroke-width="1" stroke-opacity="0.3"/>
    <!-- Footer Branding -->
    <text x="${centerX}" y="0" fill="${theme.watermarkColor}" font-size="16" text-anchor="middle" class="badge-text" opacity="0.75">
      M.GH.AL Content Studio • استوديو الأتمتة الذكي
    </text>
    <!-- Aspect Ratio / Platform Hint -->
    <text x="${centerX}" y="22" fill="#94a3b8" font-size="12" text-anchor="middle" font-family="'Cairo', sans-serif" opacity="0.6">
      ${aspectRatio === '1:1' ? 'Facebook / Instagram Feed (1080×1080)' : aspectRatio === '4:5' ? 'Instagram Portrait (1080×1350)' : 'TikTok &amp; Reels Background (1080×1920)'}
    </text>
  </g>
</svg>
`.trim();

    return { svg, width, height };
  }

  /**
   * Renders SVG to sharp PNG buffer
   */
  static async renderToBuffer(options: ImageRenderOptions): Promise<{
    buffer: Buffer;
    width: number;
    height: number;
    durationMs: number;
  }> {
    const startTime = Date.now();
    const { svg, width, height } = this.generateSvg(options);

    const buffer = await sharp(Buffer.from(svg))
      .png({
        quality: 100,
        compressionLevel: 8,
      })
      .toBuffer();

    const durationMs = Date.now() - startTime;
    return { buffer, width, height, durationMs };
  }

  /**
   * Complete pipeline: generates image buffer, saves to public/generated/images,
   * calculates metadata, and returns full result descriptor.
   */
  static async renderAndSave(options: ImageRenderOptions): Promise<ImageRenderResult> {
    const aspectRatio = options.aspectRatio || '1:1';
    const theme = options.theme || 'emerald-dark';

    const { buffer, width, height, durationMs } = await this.renderToBuffer(options);

    // Ensure output directory exists
    const outputDir = path.join(process.cwd(), 'public', 'generated', 'images');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const uniqueId = crypto.randomBytes(4).toString('hex');
    const safeAspect = aspectRatio.replace(':', 'x');
    const fileBaseId = options.id ? options.id : `mghal-${theme}-${Date.now()}-${uniqueId}`;
    const filename =
      options.outputFilename || `${fileBaseId}-${safeAspect}.png`;

    const filePath = path.join(outputDir, filename);
    await fs.promises.writeFile(filePath, buffer);

    const publicUrl = `/generated/images/${filename}`;
    const storageKey = `generated/images/${filename}`;

    return {
      buffer,
      filename,
      filePath,
      publicUrl,
      storageKey,
      width,
      height,
      sizeBytes: buffer.length,
      format: 'png',
      aspectRatio,
      theme,
      durationMs,
    };
  }
}
