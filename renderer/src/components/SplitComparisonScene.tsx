// ============================================================
// Split Comparison Scene — Side-by-side or stacked tech comparison
// ============================================================

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import type { VideoTheme } from '../types/index.js';
import { CaptionOverlay, type CaptionPhrase } from './CaptionOverlay.js';

interface SplitComparisonSceneProps {
  title: string;
  text?: string;
  comparisonLeftTitle?: string;
  comparisonRightTitle?: string;
  comparisonLeftCode?: string;
  comparisonRightCode?: string;
  comparisonVerdict?: string;
  captionPhrases?: CaptionPhrase[];
  template: VideoTheme;
  durationInFrames: number;
}

export const SplitComparisonScene: React.FC<SplitComparisonSceneProps> = ({
  title,
  text,
  comparisonLeftTitle = 'OPTION A',
  comparisonRightTitle = 'OPTION B',
  comparisonLeftCode,
  comparisonRightCode,
  comparisonVerdict,
  captionPhrases,
  template,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  const leftSpring = spring({
    frame,
    fps: 30,
    config: { damping: 14, stiffness: 120 },
  });

  const rightSpring = spring({
    frame: Math.max(0, frame - 8),
    fps: 30,
    config: { damping: 14, stiffness: 120 },
  });

  const verdictSpring = spring({
    frame: Math.max(0, frame - 18),
    fps: 30,
    config: { damping: 12, stiffness: 150 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#080B0A',
        backgroundImage: 'radial-gradient(ellipse at 50% 25%, #141b24 0%, #080B0A 75%)',
        color: '#F5F2E8',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '130px 48px 280px 48px',
        }}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: 46,
            fontWeight: 900,
            color: '#F5F2E8',
            textAlign: 'center',
            marginBottom: 40,
            letterSpacing: '-0.5px',
          }}
        >
          {title}
        </h2>

        {/* Stacked Comparison Cards for 9:16 Vertical Screen */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 28,
            width: '100%',
            maxWidth: 760,
          }}
        >
          {/* Left Card (Problem / Alternative) */}
          <div
            style={{
              background: 'rgba(28, 18, 20, 0.85)',
              border: '2px solid rgba(255, 107, 107, 0.6)',
              borderRadius: 20,
              padding: '24px 30px',
              boxShadow: '0 8px 30px rgba(255, 107, 107, 0.15)',
              transform: `scale(${interpolate(leftSpring, [0, 1], [0.9, 1])})`,
              opacity: leftSpring,
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: '#FF6B6B',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span>❌</span> {comparisonLeftTitle}
            </div>
            <pre
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 20,
                color: '#E2E8F0',
                margin: 0,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
              }}
            >
              {comparisonLeftCode || 'Traditional Architecture'}
            </pre>
          </div>

          {/* Right Card (Solution / Recommended) */}
          <div
            style={{
              background: 'rgba(16, 32, 22, 0.85)',
              border: '2px solid #78E08F',
              borderRadius: 20,
              padding: '24px 30px',
              boxShadow: '0 8px 35px rgba(120, 224, 143, 0.25)',
              transform: `scale(${interpolate(rightSpring, [0, 1], [0.9, 1])})`,
              opacity: rightSpring,
            }}
          >
            <div
              style={{
                fontSize: 24,
                fontWeight: 800,
                color: '#78E08F',
                marginBottom: 12,
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
            >
              <span>⚡</span> {comparisonRightTitle}
            </div>
            <pre
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 20,
                color: '#B8FF9C',
                margin: 0,
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
              }}
            >
              {comparisonRightCode || 'Modern Solution'}
            </pre>
          </div>
        </div>

        {/* Verdict Badge */}
        {comparisonVerdict && (
          <div
            style={{
              marginTop: 36,
              background: 'rgba(120, 224, 143, 0.15)',
              border: '1.5px solid #78E08F',
              borderRadius: 16,
              padding: '12px 28px',
              color: '#B8FF9C',
              fontFamily: 'Inter, sans-serif',
              fontSize: 22,
              fontWeight: 800,
              letterSpacing: '0.5px',
              boxShadow: '0 0 25px rgba(120, 224, 143, 0.2)',
              transform: `scale(${interpolate(verdictSpring, [0, 1], [0.85, 1])})`,
              opacity: verdictSpring,
            }}
          >
            🎯 {comparisonVerdict}
          </div>
        )}
      </div>

      <CaptionOverlay
        text={text}
        phrases={captionPhrases}
        template={template}
        durationInFrames={durationInFrames}
        bottomOffset={160}
      />
    </AbsoluteFill>
  );
};
