import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import type { TipSceneProps } from '../types/index';
import { Caption } from './Caption';

/**
 * TipScene — numbered tip card with slide-up entrance.
 *
 * Features:
 * - "Tip #N" header badge
 * - Content text in a card container
 * - Slide-up spring entrance
 * - Card-style container with accent border
 */
export const TipScene: React.FC<TipSceneProps> = ({
  title,
  tipNumber,
  text,
  template,
  durationInFrames: _durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring entrance for the card
  const cardSpring = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 160,
      mass: 0.8,
    },
  });

  const cardY = interpolate(cardSpring, [0, 1], [120, 0]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  // Badge pop-in (delayed)
  const badgeSpring = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: {
      damping: 10,
      stiffness: 250,
      mass: 0.5,
    },
  });

  // Title fade-in (delayed more)
  const titleOpacity = interpolate(frame, [10, 22], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleY = interpolate(frame, [10, 22], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Content fade-in
  const contentOpacity = interpolate(frame, [18, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const contentY = interpolate(frame, [18, 30], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Floating animation
  const floatY = Math.sin(frame * 0.04) * 3;

  // Container styles
  const borderRadius = template.containerStyle === 'sharp' ? 0
    : template.containerStyle === 'floating' ? 28 : 20;

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
      {/* Background glow */}
      {template.glowEffect && (
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${template.accentColor}25 0%, transparent 70%)`,
            filter: 'blur(80px)',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}

      {/* Card container */}
      <div
        style={{
          opacity: cardOpacity,
          transform: `translateY(${cardY + floatY}px)`,
          width: '100%',
          maxWidth: 900,
          zIndex: 1,
        }}
      >
        {/* Tip badge */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 30,
            transform: `scale(${interpolate(badgeSpring, [0, 1], [0, 1])})`,
          }}
        >
          <div
            style={{
              background: template.accentColor,
              color: '#fff',
              fontFamily: template.fontFamily,
              fontSize: 22,
              fontWeight: 800,
              padding: '10px 32px',
              borderRadius: 50,
              letterSpacing: 2,
              textTransform: 'uppercase',
              boxShadow: `0 4px 20px ${template.accentColor}50`,
            }}
          >
            💡 Tip #{tipNumber}
          </div>
        </div>

        {/* Main card */}
        <div
          style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius,
            padding: '50px 45px',
            border: `2px solid ${template.accentColor}30`,
            boxShadow: `0 16px 50px rgba(0,0,0,0.3)${template.glowEffect ? `, 0 0 30px ${template.accentColor}10` : ''}`,
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Title */}
          <h2
            style={{
              fontFamily: template.fontFamily,
              fontSize: template.explanationFontSize ? template.explanationFontSize + 18 : 44,
              fontWeight: 800,
              color: template.explanationColor || template.textColor,
              lineHeight: 1.3,
              margin: 0,
              marginBottom: text ? 28 : 0,
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
              textShadow: template.glowEffect
                ? `0 0 20px ${template.accentColor}40`
                : 'none',
            }}
          >
            {title}
          </h2>

          {/* Content text */}
          {text && (
            <div
              style={{
                opacity: contentOpacity,
                transform: `translateY(${contentY}px)`,
                width: '100%',
              }}
            >
              <Caption
                text={text}
                template={template}
                durationInFrames={_durationInFrames}
                fontSize={template.explanationFontSize || 26}
                color={template.explanationColor}
              />
            </div>
          )}
        </div>

        {/* Accent line below card */}
        <div
          style={{
            marginTop: 24,
            height: 4,
            width: interpolate(cardSpring, [0, 1], [0, 200]),
            borderRadius: 2,
            background: `linear-gradient(90deg, transparent, ${template.accentColor}, transparent)`,
            marginLeft: 'auto',
            marginRight: 'auto',
          }}
        />
      </div>
    </AbsoluteFill>
  );
};
