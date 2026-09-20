import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';
import type { VideoTheme } from '../types/index';
import { Caption } from './Caption';

interface CinematicImageSceneProps {
  title: string;
  text?: string;
  imageUrl?: string;
  template: VideoTheme;
  durationInFrames: number;
  cinematicZoom?: boolean;
}

export const CinematicImageScene: React.FC<CinematicImageSceneProps> = ({
  title,
  text,
  imageUrl,
  template,
  durationInFrames,
  cinematicZoom = true,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Color Palette (CodeWithSundresh)
  const bgDark = '#080B0A';
  const textWhite = '#F5F2E8';
  const accentGreen = '#78E08F';

  // Smooth continuous camera zoom (100% to 108%)
  const zoom = cinematicZoom
    ? interpolate(frame, [0, durationInFrames], [1, 1.08], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 1;

  // Gentle float drift
  const driftY = Math.sin(frame * 0.04) * 5;

  // Text entrance spring
  const textEntrance = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgDark,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '50px 30px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Background Image with Cinematic Camera Zoom & Vignette */}
      {imageUrl && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            overflow: 'hidden',
            zIndex: 1,
          }}
        >
          <Img
            src={imageUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${zoom}) translateY(${driftY}px)`,
              filter: 'brightness(0.85) contrast(1.1)',
            }}
          />
          {/* Cinematic Vignette Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `radial-gradient(ellipse at 50% 50%, rgba(8, 11, 10, 0.2) 0%, ${bgDark} 90%)`,
              pointerEvents: 'none',
            }}
          />
        </div>
      )}

      {/* Top Header Tag */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          marginTop: 20,
          zIndex: 5,
          opacity: textEntrance,
          transform: `translateY(${interpolate(textEntrance, [0, 1], [-20, 0])}px)`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 20,
            background: 'rgba(120, 224, 143, 0.15)',
            border: `1px solid rgba(120, 224, 143, 0.35)`,
            backdropFilter: 'blur(8px)',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: accentGreen, letterSpacing: '1.5px' }}>
            SYSTEM VISUALIZATION
          </span>
        </div>

        <h1
          style={{
            fontSize: 34,
            fontWeight: 800,
            color: textWhite,
            margin: 0,
            textAlign: 'center',
            textShadow: '0 4px 16px rgba(0,0,0,0.8)',
          }}
        >
          {title}
        </h1>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom Kinetic Caption */}
      {text && (
        <div style={{ width: '100%', maxWidth: 580, zIndex: 6, marginBottom: 10 }}>
          <Caption
            text={text}
            template={template}
            durationInFrames={durationInFrames}
            fontSize={25}
            color={textWhite}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
