// ============================================================
// Caption Overlay — Kinetic lower-third subtitle bar
// ============================================================

import React from 'react';
import { useCurrentFrame, interpolate, spring } from 'remotion';
import type { VideoTheme } from '../types/index.js';

export interface CaptionPhrase {
  text: string;
  startFrame: number;
  endFrame: number;
  highlight?: boolean;
}

interface CaptionOverlayProps {
  text?: string;
  phrases?: CaptionPhrase[];
  template: VideoTheme;
  durationInFrames: number;
  bottomOffset?: number;
}

export const CaptionOverlay: React.FC<CaptionOverlayProps> = ({
  text,
  phrases,
  template,
  durationInFrames,
  bottomOffset = 240,
}) => {
  const frame = useCurrentFrame();

  // If concrete phrases provided, find active phrase
  if (phrases && phrases.length > 0) {
    const activePhrase = phrases.find(
      (p) => frame >= p.startFrame && frame < p.endFrame,
    ) || phrases[phrases.length - 1];

    if (!activePhrase) return null;

    const progressInPhrase = Math.max(0, frame - activePhrase.startFrame);
    const phraseDuration = Math.max(1, activePhrase.endFrame - activePhrase.startFrame);

    const scale = spring({
      frame: progressInPhrase,
      fps: 30,
      config: { damping: 14, stiffness: 180, mass: 0.6 },
    });

    const opacity = interpolate(
      progressInPhrase,
      [0, 4, phraseDuration - 4, phraseDuration],
      [0, 1, 1, 0.8],
      { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );

    const words = activePhrase.text.trim().split(/\s+/);
    const framesPerWord = phraseDuration / Math.max(1, words.length);
    const activeWordIdx = Math.min(words.length - 1, Math.floor(progressInPhrase / framesPerWord));

    return (
      <div
        style={{
          position: 'absolute',
          bottom: bottomOffset,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 90,
          pointerEvents: 'none',
          padding: '0 40px',
        }}
      >
        <div
          style={{
            background: 'rgba(8, 11, 10, 0.88)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1.5px solid rgba(120, 224, 143, 0.35)',
            borderRadius: 24,
            padding: '16px 32px',
            maxWidth: 960,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.6), 0 0 30px rgba(120, 224, 143, 0.15)',
            transform: `scale(${interpolate(scale, [0, 1], [0.92, 1])})`,
            opacity,
          }}
        >
          {words.map((word, wIdx) => {
            const isWordActive = wIdx === activeWordIdx;
            const isKeyword = activePhrase.highlight || /^[A-Z0-9_-]{3,}$/.test(word);

            let color = '#F5F2E8';
            if (isWordActive) {
              color = '#B8FF9C';
            } else if (isKeyword) {
              color = '#78E08F';
            }

            return (
              <span
                key={wIdx}
                style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 34,
                  fontWeight: isWordActive ? 900 : 700,
                  color,
                  textShadow: isWordActive ? '0 0 24px rgba(184, 255, 156, 0.7)' : 'none',
                  letterSpacing: '0.01em',
                  transform: isWordActive ? 'scale(1.08)' : 'scale(1)',
                  display: 'inline-block',
                  transition: 'transform 0.1s ease, color 0.1s ease',
                }}
              >
                {word}
              </span>
            );
          })}
        </div>
      </div>
    );
  }

  // Fallback if no phrase timeline
  if (!text) return null;
  const words = text.trim().split(/\s+/);
  const framesPerWord = durationInFrames / Math.max(1, words.length);
  const activeWordIndex = Math.min(words.length - 1, Math.floor(frame / framesPerWord));

  return (
    <div
      style={{
        position: 'absolute',
        bottom: bottomOffset,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 90,
        pointerEvents: 'none',
        padding: '0 40px',
      }}
    >
      <div
        style={{
          background: 'rgba(8, 11, 10, 0.88)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1.5px solid rgba(120, 224, 143, 0.35)',
          borderRadius: 24,
          padding: '16px 32px',
          maxWidth: 960,
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 12,
          boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
        }}
      >
        {words.map((word, index) => {
          const isActive = index === activeWordIndex;
          return (
            <span
              key={index}
              style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 32,
                fontWeight: isActive ? 900 : 700,
                color: isActive ? '#B8FF9C' : '#F5F2E8',
                textShadow: isActive ? '0 0 20px rgba(184, 255, 156, 0.6)' : 'none',
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </div>
  );
};
