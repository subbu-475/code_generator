// ============================================================
// Image Provider — Programmatic SVG diagram generation
// ============================================================

import type { ImageProvider, AssetResult, ImageOptions } from './types.js';
import fs from 'node:fs';
import path from 'node:path';
import { v4 as uuidv4 } from 'uuid';

/**
 * Built-in image provider that generates SVG diagrams programmatically.
 * No API key required. Produces clean, dark-themed technical diagrams.
 */
export class BuiltInImageProvider implements ImageProvider {
  name = 'built-in-svg';

  isAvailable(): boolean {
    return true; // Always available — no external dependencies
  }

  async generateImage(prompt: string, options: ImageOptions): Promise<AssetResult> {
    const id = uuidv4();
    const svgContent = this.generateSVG(prompt, options.width, options.height);

    // Ensure directory exists
    const dir = path.dirname(options.outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(options.outputPath, svgContent, 'utf-8');

    return {
      id,
      type: 'svg-diagram',
      path: options.outputPath,
      url: `/storage/${path.relative(process.cwd(), options.outputPath).replace(/\\/g, '/')}`,
      prompt,
      provider: this.name,
      cached: false,
    };
  }

  private generateSVG(prompt: string, width: number, height: number): string {
    // Generate a clean, dark-themed SVG based on the prompt content
    const lower = prompt.toLowerCase();

    if (lower.includes('node') && lower.includes('flow') || lower.includes('diagram') || lower.includes('architecture')) {
      return this.generateFlowDiagram(prompt, width, height);
    }
    if (lower.includes('comparison') || lower.includes('vs')) {
      return this.generateComparisonDiagram(prompt, width, height);
    }
    if (lower.includes('code') || lower.includes('editor')) {
      return this.generateCodeBlock(prompt, width, height);
    }

    // Default: concept card
    return this.generateConceptCard(prompt, width, height);
  }

  private generateFlowDiagram(prompt: string, w: number, h: number): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0f"/>
      <stop offset="100%" style="stop-color:#111827"/>
    </linearGradient>
    <filter id="glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <text x="${w/2}" y="${h/2}" text-anchor="middle" fill="#F8FAFC" font-family="Inter, sans-serif" font-size="24" font-weight="700">${this.escapeXml(prompt.substring(0, 60))}</text>
</svg>`;
  }

  private generateComparisonDiagram(prompt: string, w: number, h: number): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#0a0a0f"/>
  <line x1="${w/2}" y1="40" x2="${w/2}" y2="${h-40}" stroke="#6C63FF" stroke-width="2" stroke-dasharray="8 4"/>
  <text x="${w/4}" y="60" text-anchor="middle" fill="#6C63FF" font-family="Inter, sans-serif" font-size="20" font-weight="700">Option A</text>
  <text x="${3*w/4}" y="60" text-anchor="middle" fill="#00D4AA" font-family="Inter, sans-serif" font-size="20" font-weight="700">Option B</text>
</svg>`;
  }

  private generateCodeBlock(prompt: string, w: number, h: number): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <rect width="${w}" height="${h}" fill="#0a0a0f"/>
  <rect x="20" y="20" width="${w-40}" height="${h-40}" rx="12" fill="#1a1b26" stroke="#6C63FF" stroke-width="1"/>
  <circle cx="44" cy="44" r="6" fill="#EF4444"/>
  <circle cx="64" cy="44" r="6" fill="#F59E0B"/>
  <circle cx="84" cy="44" r="6" fill="#22C55E"/>
  <text x="40" y="80" fill="#c0caf5" font-family="JetBrains Mono, monospace" font-size="14">// Code visualization</text>
</svg>`;
  }

  private generateConceptCard(prompt: string, w: number, h: number): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#0a0a0f"/>
      <stop offset="100%" style="stop-color:#111827"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg)"/>
  <rect x="${w*0.1}" y="${h*0.3}" width="${w*0.8}" height="${h*0.4}" rx="16" fill="rgba(30,30,50,0.8)" stroke="rgba(108,99,255,0.3)" stroke-width="1"/>
  <text x="${w/2}" y="${h/2}" text-anchor="middle" fill="#F8FAFC" font-family="Inter, sans-serif" font-size="20" font-weight="600">${this.escapeXml(prompt.substring(0, 50))}</text>
</svg>`;
  }

  private escapeXml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}
