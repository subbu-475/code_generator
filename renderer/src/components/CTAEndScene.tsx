// ============================================================
// CTA End Scene — Closing channel branding & curiosity loop
// ============================================================

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import type { VideoTheme } from '../types/index.js';
import { CaptionOverlay, type CaptionPhrase } from './CaptionOverlay.js';

interface CTAEndSceneProps {
  title?: string;
  text?: string;
  channelName?: string;
  channelHandle?: string;
  captionPhrases?: CaptionPhrase[];
  template: VideoTheme;
  durationInFrames: number;
}

export const CTAEndScene: React.FC<CTAEndSceneProps> = ({
  title = 'Want to see what happens next?',
  text,
  channelName = 'CodeWithSundresh',
  channelHandle = '@CodeWithSundresh',
  captionPhrases,
  template,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  const entrance = spring({
    frame,
    fps: 30,
    config: { damping: 13, stiffness: 140 },
  });

  const pulse = interpolate(
    Math.sin((frame / 20) * Math.PI * 2),
    [-1, 1],
    [0.98, 1.04],
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#080B0A',
        backgroundImage: 'radial-gradient(ellipse at 50% 35%, #102a1d 0%, #080B0A 75%)',
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
          padding: '60px 48px 240px 48px',
          textAlign: 'center',
          transform: `scale(${interpolate(entrance, [0, 1], [0.88, 1])})`,
          opacity: entrance,
        }}
      >
        {/* Glowing Channel Avatar */}
        <div
          style={{
            position: 'relative',
            width: 140,
            height: 140,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: -8,
              borderRadius: '50%',
              border: '2px dashed #78E08F',
              opacity: 0.8,
              transform: `rotate(${frame * 2}deg)`,
            }}
          />
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #14281d 0%, #0d1a13 100%)',
              border: '3px solid #78E08F',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 54,
              boxShadow: '0 0 40px rgba(120, 224, 143, 0.4)',
            }}
          >
            👨‍💻
          </div>
        </div>

        {/* Channel Name & Handle */}
        <h2
          style={{
            fontSize: 48,
            fontWeight: 900,
            color: '#F5F2E8',
            marginBottom: 6,
            letterSpacing: '-0.5px',
          }}
        >
          {channelName}
        </h2>
        <div
          style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 24,
            color: '#78E08F',
            fontWeight: 700,
            marginBottom: 40,
          }}
        >
          {channelHandle}
        </div>

        {/* Next Question / Curiosity Bridge */}
        <div
          style={{
            background: 'rgba(20, 32, 24, 0.9)',
            border: '1.5px solid rgba(120, 224, 143, 0.4)',
            borderRadius: 20,
            padding: '24px 32px',
            maxWidth: 680,
            marginBottom: 44,
            boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 18,
              color: '#B8FF9C',
              fontWeight: 700,
              marginBottom: 8,
              letterSpacing: '1px',
            }}
          >
            NEXT UP ⚡
          </div>
          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              color: '#F5F2E8',
              lineHeight: 1.25,
            }}
          >
            {title}
          </div>
        </div>

        {/* Subscribe Button with Pulse */}
        <div
          style={{
            background: 'linear-gradient(135deg, #78E08F 0%, #B8FF9C 100%)',
            color: '#080B0A',
            fontFamily: 'Inter, sans-serif',
            fontSize: 26,
            fontWeight: 900,
            padding: '18px 48px',
            borderRadius: 40,
            letterSpacing: '1px',
            boxShadow: '0 0 35px rgba(120, 224, 143, 0.5)',
            transform: `scale(${pulse})`,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span>SUBSCRIBE</span>
          <span>🔔</span>
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
