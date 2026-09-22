// ============================================================
// Concept Reveal Scene — Dramatic concept introduction card
// ============================================================

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import type { VideoTheme } from '../types/index.js';
import { CaptionOverlay, type CaptionPhrase } from './CaptionOverlay.js';

interface ConceptRevealSceneProps {
  title: string;
  text?: string;
  badge?: string;
  icon?: string;
  imageUrl?: string;
  captionPhrases?: CaptionPhrase[];
  template: VideoTheme;
  durationInFrames: number;
}

export const ConceptRevealScene: React.FC<ConceptRevealSceneProps> = ({
  title,
  text,
  badge = 'TECH EXPLAINER',
  icon = '💡',
  imageUrl,
  captionPhrases,
  template,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  const cardSpring = spring({
    frame,
    fps: 30,
    config: { damping: 13, stiffness: 140 },
  });

  const iconScale = interpolate(
    Math.sin((frame / 30) * Math.PI * 2),
    [-1, 1],
    [0.96, 1.04],
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#080B0A',
        backgroundImage: 'radial-gradient(ellipse at 50% 30%, #11281c 0%, #080B0A 75%)',
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
          justifyContent: 'center',
          padding: '80px 48px 260px 48px',
        }}
      >
        {/* Category Badge */}
        <div
          style={{
            background: 'rgba(120, 224, 143, 0.15)',
            border: '1.5px solid #78E08F',
            borderRadius: 30,
            padding: '8px 24px',
            color: '#78E08F',
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 20,
            fontWeight: 800,
            letterSpacing: '2px',
            marginBottom: 32,
            boxShadow: '0 0 20px rgba(120, 224, 143, 0.2)',
          }}
        >
          {badge.toUpperCase()}
        </div>

        {/* Hero Card */}
        <div
          style={{
            background: 'rgba(18, 28, 22, 0.9)',
            border: '2px solid rgba(120, 224, 143, 0.5)',
            borderRadius: 28,
            padding: '48px 40px',
            maxWidth: 720,
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(120, 224, 143, 0.15)',
            transform: `scale(${interpolate(cardSpring, [0, 1], [0.88, 1])})`,
            opacity: cardSpring,
          }}
        >
          {/* Hero Icon or Image */}
          {imageUrl ? (
            <img
              src={imageUrl}
              alt=""
              style={{
                width: 220,
                height: 220,
                objectFit: 'contain',
                marginBottom: 32,
                filter: 'drop-shadow(0 0 24px rgba(120, 224, 143, 0.4))',
              }}
            />
          ) : (
            <div
              style={{
                fontSize: 100,
                marginBottom: 24,
                transform: `scale(${iconScale})`,
                filter: 'drop-shadow(0 0 30px rgba(120, 224, 143, 0.5))',
              }}
            >
              {icon}
            </div>
          )}

          {/* Title */}
          <h2
            style={{
              fontSize: 52,
              fontWeight: 900,
              color: '#F5F2E8',
              letterSpacing: '-1px',
              lineHeight: 1.15,
              marginBottom: 16,
            }}
          >
            {title}
          </h2>

          <div
            style={{
              width: 80,
              height: 4,
              backgroundColor: '#78E08F',
              borderRadius: 2,
              boxShadow: '0 0 12px #78E08F',
            }}
          />
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
