import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import type { CTASceneProps } from '../types/index';
import { Caption } from './Caption';

/**
 * CTAScene — call-to-action ending scene with pulsing animation.
 *
 * Features:
 * - Large centered CTA text
 * - Accent-colored gradient text
 * - Pulsing scale oscillation (Math.sin based)
 * - Social media icon placeholders
 * - Subscribe button animation
 */
export const CTAScene: React.FC<CTASceneProps> = ({
  text,
  template,
  durationInFrames: _durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spring entrance
  const springValue = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 150,
      mass: 0.7,
    },
  });

  const entranceScale = interpolate(springValue, [0, 1], [0.6, 1]);
  const entranceOpacity = interpolate(springValue, [0, 1], [0, 1]);

  // Pulsing animation (subtle scale oscillation)
  const pulse = 1 + Math.sin(frame * 0.1) * 0.03;

  // Button slide-up
  const buttonDelay = 15;
  const buttonSpring = spring({
    frame: Math.max(0, frame - buttonDelay),
    fps,
    config: {
      damping: 14,
      stiffness: 180,
      mass: 0.6,
    },
  });
  const buttonY = interpolate(buttonSpring, [0, 1], [60, 0]);
  const buttonOpacity = interpolate(buttonSpring, [0, 1], [0, 1]);

  // Social icons stagger
  const iconDelay = 25;
  const iconSpring = spring({
    frame: Math.max(0, frame - iconDelay),
    fps,
    config: {
      damping: 10,
      stiffness: 200,
      mass: 0.5,
    },
  });

  // Glow pulse
  const glowOpacity = interpolate(
    Math.sin(frame * 0.06),
    [-1, 1],
    [0.2, 0.5],
  );

  return (
    <AbsoluteFill
      style={{
        background: template.backgroundGradient || template.backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 60,
      }}
    >
      {/* Background glow */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${template.accentColor}${Math.round(glowOpacity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          filter: 'blur(100px)',
          top: '45%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Main CTA text */}
      <div
        style={{
          opacity: entranceOpacity,
          transform: `scale(${entranceScale * pulse})`,
          textAlign: 'center',
          zIndex: 1,
          marginBottom: 60,
        }}
      >
        <Caption
          text={text}
          template={template}
          durationInFrames={_durationInFrames}
          fontSize={64}
        />
      </div>

      {/* Subscribe button */}
      <div
        style={{
          opacity: buttonOpacity,
          transform: `translateY(${buttonY}px)`,
          zIndex: 1,
          marginBottom: 50,
        }}
      >
        <div
          style={{
            background: template.accentColor,
            color: '#fff',
            fontFamily: template.fontFamily,
            fontSize: 24,
            fontWeight: 700,
            padding: '18px 48px',
            borderRadius: 50,
            textTransform: 'uppercase',
            letterSpacing: 2,
            boxShadow: `0 8px 30px ${template.accentColor}60`,
            transform: `scale(${1 + Math.sin(frame * 0.12) * 0.02})`,
          }}
        >
          Subscribe
        </div>
      </div>

      {/* Social icons row */}
      <div
        style={{
          display: 'flex',
          gap: 30,
          opacity: interpolate(iconSpring, [0, 1], [0, 0.7]),
          transform: `translateY(${interpolate(iconSpring, [0, 1], [30, 0])}px)`,
          zIndex: 1,
        }}
      >
        {/* YouTube icon placeholder */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 20,
            color: template.textColor,
            border: `1px solid rgba(255,255,255,0.1)`,
          }}
        >
          ▶
        </div>

        {/* GitHub icon placeholder */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 20,
            color: template.textColor,
            border: `1px solid rgba(255,255,255,0.1)`,
          }}
        >
          ⌘
        </div>

        {/* Twitter/X icon placeholder */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            backgroundColor: 'rgba(255,255,255,0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            fontSize: 20,
            color: template.textColor,
            border: `1px solid rgba(255,255,255,0.1)`,
          }}
        >
          ✕
        </div>
      </div>

      {/* Bottom accent line */}
      <div
        style={{
          position: 'absolute',
          bottom: 100,
          width: interpolate(springValue, [0, 1], [0, 300]),
          height: 3,
          borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${template.accentColor}, transparent)`,
        }}
      />
    </AbsoluteFill>
  );
};
