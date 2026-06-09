import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';
import type { VideoTheme } from '../types/index';
import { Caption } from './Caption';

interface ImageSceneProps {
  title: string;
  text?: string;
  imageUrl?: string;
  template: VideoTheme;
  durationInFrames: number;
}

export const ImageScene: React.FC<ImageSceneProps> = ({
  title,
  text,
  imageUrl = 'https://picsum.photos/800/600',
  template,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Scale and fade-in transitions for entrance
  const entranceSpring = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 120,
      mass: 0.8,
    },
  });

  const imageScale = interpolate(entranceSpring, [0, 1], [0.85, 1]);
  const imageOpacity = interpolate(entranceSpring, [0, 1], [0, 1]);

  // Subtle floating animation for premium feel
  const floatY = Math.sin(frame * 0.05) * 6;

  // Visual container styles from the active theme
  const borderRadius = template.containerStyle === 'sharp' ? 0
    : template.containerStyle === 'floating' ? 24 : 16;

  return (
    <AbsoluteFill
      style={{
        background: template.backgroundGradient || template.backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
      }}
    >
      {/* Soft background glow */}
      {template.glowEffect && (
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${template.accentColor}20 0%, transparent 70%)`,
            filter: 'blur(80px)',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}

      {/* Main card container */}
      <div
        style={{
          transform: `scale(${imageScale}) translateY(${floatY}px)`,
          opacity: imageOpacity,
          width: '100%',
          maxWidth: 800,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          zIndex: 1,
        }}
      >
        {/* Scene Title */}
        {title && (
          <h2
            style={{
              fontFamily: template.fontFamily,
              fontSize: 38,
              fontWeight: 800,
              color: template.textColor,
              textAlign: 'center',
              margin: 0,
              textShadow: template.glowEffect ? `0 0 15px ${template.accentColor}50` : 'none',
            }}
          >
            {title}
          </h2>
        )}

        {/* Image Display Frame */}
        <div
          style={{
            width: '100%',
            height: 450,
            borderRadius,
            overflow: 'hidden',
            border: `2px solid ${template.accentColor}40`,
            boxShadow: `0 16px 40px rgba(0,0,0,0.5)${template.glowEffect ? `, 0 0 25px ${template.accentColor}15` : ''}`,
            background: 'rgba(0,0,0,0.2)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Img
            src={imageUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>

        {/* Kinetic captions */}
        {text && (
          <div style={{ width: '100%', marginTop: 8 }}>
            <Caption
              text={text}
              template={template}
              durationInFrames={durationInFrames}
              fontSize={24}
            />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
export default ImageScene;
