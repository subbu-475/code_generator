import React from 'react';
import { useCurrentFrame, useVideoConfig, AbsoluteFill } from 'remotion';

interface ParticleBackgroundProps {
  effect?: 'none' | 'particles' | 'matrix' | 'grid';
}

/**
 * ParticleBackground — synchronous, frame-deterministic background effects.
 *
 * Uses inline divs (for CSS gradient particles) and SVG (for matrix/grid).
 * No canvas, no useEffect — fully compatible with Remotion's per-frame rendering.
 */
export const ParticleBackground: React.FC<ParticleBackgroundProps> = ({ effect = 'none' }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  if (effect === 'none') return null;

  // ── Particles ─────────────────────────────────────────────────────────────
  if (effect === 'particles') {
    const numParticles = 35;
    const particles: React.ReactNode[] = [];

    for (let i = 0; i < numParticles; i++) {
      const seedX = (Math.sin(i * 9283.12) * 0.5 + 0.5);
      const seedY = (Math.cos(i * 2943.43) * 0.5 + 0.5);
      const sizeSeed = Math.sin(i * 1234.56) * 0.5 + 0.5;
      const speedSeed = Math.cos(i * 8765.43) * 0.5 + 0.5;

      const size = sizeSeed * 120 + 60; // 60–180px radius
      const speed = speedSeed * 0.4 + 0.1;

      // Deterministic position based on frame
      const rawX = (seedX * width + frame * speed) % (width + size * 2) - size;
      const y = seedY * height + Math.sin(frame * 0.01 + i) * 50;

      // Pick accent colour alternating purple / cyan
      const color = i % 3 === 0
        ? '0,212,255'    // cyan
        : i % 3 === 1
          ? '124,58,237' // purple
          : '168,85,247'; // violet

      particles.push(
        <div
          key={i}
          style={{
            position: 'absolute',
            left: rawX - size,
            top: y - size,
            width: size * 2,
            height: size * 2,
            borderRadius: '50%',
            background: `radial-gradient(circle, rgba(${color},0.18) 0%, rgba(${color},0.06) 45%, transparent 70%)`,
            filter: `blur(${Math.round(size * 0.25)}px)`,
            pointerEvents: 'none',
          }}
        />,
      );
    }

    return (
      <AbsoluteFill style={{ overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        {particles}
      </AbsoluteFill>
    );
  }

  // ── Matrix ────────────────────────────────────────────────────────────────
  if (effect === 'matrix') {
    const CHARS = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ<>/{}[]=*';
    const numColumns = 18;
    const charW = width / numColumns;
    const fontSize = 22;
    const elements: React.ReactNode[] = [];

    for (let col = 0; col < numColumns; col++) {
      const seedY = Math.sin(col * 4123.4) * 0.5 + 0.5;
      const speedSeed = Math.cos(col * 9876.5) * 0.5 + 0.5;
      const speed = speedSeed * 10 + 5;
      const startY = seedY * height;
      const y = (startY + frame * speed) % (height + 100);

      const trailLength = 10;
      for (let j = 0; j < trailLength; j++) {
        const charY = y - j * (fontSize + 2);
        if (charY < -fontSize || charY > height + fontSize) continue;

        const alpha = Math.max(0, (1 - j / trailLength) * 0.2);
        if (alpha <= 0) continue;

        // Always positive, safe char index
        const raw = Math.sin((frame + col * 13 + j * 7) * 0.983);
        const charIndex = Math.abs(Math.round(raw * 1000)) % CHARS.length;
        const char = CHARS[charIndex] ?? '0';

        elements.push(
          <text
            key={`${col}-${j}`}
            x={col * charW + charW * 0.25}
            y={charY}
            fontFamily="monospace"
            fontSize={fontSize}
            fill={`rgba(0,255,70,${alpha.toFixed(3)})`}
          >
            {char}
          </text>,
        );
      }
    }

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {elements}
      </svg>
    );
  }

  // ── Grid ──────────────────────────────────────────────────────────────────
  if (effect === 'grid') {
    const horizon = height * 0.45;
    const numPerspLines = 16;
    const numHorizLines = 12;
    const scrollSpeed = 1.5;
    const rowSpacing = 55;
    const offset = (frame * scrollSpeed) % rowSpacing;
    const lines: React.ReactNode[] = [];

    // Horizon line
    lines.push(
      <line key="hor" x1={0} y1={horizon} x2={width} y2={horizon}
        stroke="rgba(124,58,237,0.3)" strokeWidth={2} />,
    );

    // Perspective lines from vanishing point
    for (let i = 0; i <= numPerspLines; i++) {
      const xBottom = (i / numPerspLines) * width;
      lines.push(
        <line key={`p${i}`} x1={width / 2} y1={horizon} x2={xBottom} y2={height}
          stroke="rgba(124,58,237,0.18)" strokeWidth={1.5} />,
      );
    }

    // Horizontal receding grid lines
    for (let i = 0; i < numHorizLines; i++) {
      const rawY = horizon + i * rowSpacing + offset;
      if (rawY > height) continue;
      const progress = Math.max(0, (rawY - horizon) / (height - horizon));
      const y = horizon + progress * progress * (height - horizon);
      lines.push(
        <line key={`g${i}`} x1={0} y1={y} x2={width} y2={y}
          stroke={`rgba(124,58,237,${(progress * 0.28).toFixed(3)})`} strokeWidth={2} />,
      );
    }

    return (
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        height="100%"
        style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {lines}
      </svg>
    );
  }

  return null;
};
