// ============================================================
// Code Visualization Scene — Syntax-highlighted code with terminal chrome
// ============================================================

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import type { VideoTheme } from '../types/index.js';
import { CaptionOverlay, type CaptionPhrase } from './CaptionOverlay.js';

interface CodeVisualizationSceneProps {
  title: string;
  text?: string;
  code?: string;
  language?: string;
  output?: string;
  captionPhrases?: CaptionPhrase[];
  template: VideoTheme;
  durationInFrames: number;
}

export const CodeVisualizationScene: React.FC<CodeVisualizationSceneProps> = ({
  title,
  text,
  code = '// Loading code...',
  language = 'typescript',
  output,
  captionPhrases,
  template,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  const editorSpring = spring({
    frame,
    fps: 30,
    config: { damping: 14, stiffness: 120 },
  });

  const lines = code.trim().split('\n');
  const activeLineIdx = Math.floor(
    interpolate(frame, [0, durationInFrames], [0, lines.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#080B0A',
        backgroundImage: 'radial-gradient(ellipse at 50% 25%, #0d1e15 0%, #080B0A 75%)',
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
          padding: '120px 48px 280px 48px',
        }}
      >
        {/* Title */}
        <h2
          style={{
            fontSize: 44,
            fontWeight: 900,
            color: '#F5F2E8',
            textAlign: 'center',
            marginBottom: 36,
          }}
        >
          {title}
        </h2>

        {/* Code Editor Window */}
        <div
          style={{
            width: '100%',
            maxWidth: 780,
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1.5px solid rgba(120, 224, 143, 0.4)',
            borderRadius: 20,
            overflow: 'hidden',
            boxShadow: '0 16px 50px rgba(0,0,0,0.7), 0 0 30px rgba(120, 224, 143, 0.15)',
            transform: `scale(${interpolate(editorSpring, [0, 1], [0.9, 1])})`,
            opacity: editorSpring,
          }}
        >
          {/* Window Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              background: 'rgba(30, 41, 59, 0.8)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#EF4444' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#F59E0B' }} />
              <span style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: '#10B981' }} />
            </div>
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 16,
                color: '#94A3B8',
                fontWeight: 600,
              }}
            >
              snippet.{language === 'dockerfile' ? 'Dockerfile' : language === 'python' ? 'py' : 'ts'}
            </span>
            <span
              style={{
                fontSize: 13,
                fontFamily: 'JetBrains Mono, monospace',
                background: 'rgba(120, 224, 143, 0.2)',
                color: '#78E08F',
                padding: '2px 8px',
                borderRadius: 6,
              }}
            >
              {language.toUpperCase()}
            </span>
          </div>

          {/* Code Lines */}
          <div style={{ padding: '24px 24px', fontFamily: 'JetBrains Mono, monospace', fontSize: 22 }}>
            {lines.map((line, idx) => {
              const isCurrent = idx === activeLineIdx;
              return (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '4px 12px',
                    borderRadius: 8,
                    background: isCurrent ? 'rgba(120, 224, 143, 0.12)' : 'transparent',
                    borderLeft: isCurrent ? '3px solid #78E08F' : '3px solid transparent',
                    color: isCurrent ? '#B8FF9C' : '#E2E8F0',
                  }}
                >
                  <span style={{ color: '#475569', fontSize: 16, width: 24, textAlign: 'right', userSelect: 'none' }}>
                    {idx + 1}
                  </span>
                  <span style={{ whiteSpace: 'pre' }}>{line}</span>
                </div>
              );
            })}
          </div>

          {/* Terminal Output section if present */}
          {output && (
            <div
              style={{
                background: 'rgba(2, 6, 23, 0.95)',
                borderTop: '1px solid rgba(120, 224, 143, 0.3)',
                padding: '14px 20px',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 18,
                color: '#78E08F',
              }}
            >
              <div style={{ color: '#64748B', fontSize: 13, marginBottom: 4 }}>OUTPUT</div>
              <div>❯ {output}</div>
            </div>
          )}
        </div>
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
