// ============================================================
// Thumbnail Generator — Extracts high-CTR thumbnail from video or generates poster
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

export async function generateThumbnail(
  videoPath: string,
  thumbnailPath: string,
  title: string,
): Promise<void> {
  const thumbDir = path.dirname(thumbnailPath);
  if (!fs.existsSync(thumbDir)) {
    fs.mkdirSync(thumbDir, { recursive: true });
  }

  // Attempt FFmpeg frame extraction at 2 seconds
  if (fs.existsSync(videoPath)) {
    try {
      const ffmpegCmd = `ffmpeg -y -ss 00:00:02 -i "${videoPath}" -vframes 1 -q:v 2 "${thumbnailPath}"`;
      await execAsync(ffmpegCmd, { timeout: 15000 });
      if (fs.existsSync(thumbnailPath) && fs.statSync(thumbnailPath).size > 1000) {
        return;
      }
    } catch (err) {
      console.warn('[ThumbnailGen] FFmpeg frame extraction failed, falling back to SVG thumbnail:', err);
    }
  }

  // Fallback: Generate high-contrast 9:16 poster SVG
  const cleanTitle = title.replace(/[<>&"]/g, '');
  const svgContent = `
<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
  <defs>
    <radialGradient id="bg" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#14281d" />
      <stop offset="60%" stop-color="#080B0A" />
      <stop offset="100%" stop-color="#040605" />
    </radialGradient>
    <linearGradient id="textGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#78E08F" />
      <stop offset="100%" stop-color="#B8FF9C" />
    </linearGradient>
  </defs>

  <rect width="1080" height="1920" fill="url(#bg)" />

  <!-- Technical grid pattern -->
  <g stroke="#78E08F" stroke-width="1" opacity="0.08">
    <line x1="140" y1="0" x2="140" y2="1920" />
    <line x1="940" y1="0" x2="940" y2="1920" />
    <line x1="0" y1="500" x2="1080" y2="500" />
    <line x1="0" y1="1420" x2="1080" y2="1420" />
  </g>

  <!-- Channel Brand Badge -->
  <rect x="360" y="320" width="360" height="56" rx="28" fill="#14221a" stroke="#78E08F" stroke-width="2" />
  <text x="540" y="357" text-anchor="middle" fill="#78E08F" font-family="Inter, sans-serif" font-size="22" font-weight="700" letter-spacing="3">CODEWITHSUNDRESH</text>

  <!-- Hero Title -->
  <text x="540" y="700" text-anchor="middle" fill="#F5F2E8" font-family="Inter, sans-serif" font-size="76" font-weight="900" letter-spacing="-1">
    ${cleanTitle.toUpperCase().slice(0, 32)}
  </text>

  <!-- Neon Highlight Accent -->
  <rect x="340" y="770" width="400" height="6" rx="3" fill="url(#textGrad)" />

  <!-- Question / Micro-hook -->
  <text x="540" y="980" text-anchor="middle" fill="#78E08F" font-family="Inter, sans-serif" font-size="44" font-weight="700">
    HOW DOES IT WORK? ⚡
  </text>

  <!-- Tech tags -->
  <rect x="390" y="1520" width="300" height="64" rx="16" fill="#0d1f14" stroke="#78E08F" stroke-width="2" />
  <text x="540" y="1562" text-anchor="middle" fill="#B8FF9C" font-family="JetBrains Mono, monospace" font-size="26" font-weight="600">IN 30 SECONDS</text>
</svg>
  `.trim();

  // If thumbnailPath ends in .jpg, write SVG to .svg or save as .svg fallback
  const svgPath = thumbnailPath.replace(/\.jpg$/, '.svg');
  fs.writeFileSync(svgPath, svgContent, 'utf-8');

  // Also write SVG as thumbnailPath if ffmpeg isn't available
  if (!fs.existsSync(thumbnailPath)) {
    fs.writeFileSync(thumbnailPath, svgContent, 'utf-8');
  }
}
