import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Audio,
} from 'remotion';
import type { OutputSceneProps } from '../types/index';

/**
 * OutputScene — terminal-style output display with typewriter animation.
 *
 * Features:
 * - "Output:" / "Result:" label
 * - Terminal container with green/accent text
 * - Arrow indicator
 * - Typewriter character-by-character reveal
 * - Dark container with subtle border
 */
export const OutputScene: React.FC<OutputSceneProps> = ({
  output,
  title,
  template,
  durationInFrames,
  sfxAchievement,
  backendUrl,
  explanation,
}) => {
  const frame = useCurrentFrame();
  const audioUrl = `${backendUrl || ''}/assets/sfx/success.mp3`;
  const playAudio = sfxAchievement !== false;

  // Entrance animation
  const entranceOpacity = interpolate(frame, [0, 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const entranceY = interpolate(frame, [0, 15], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Typewriter animation for output text
  const typingStart = 20;
  const typingEnd = Math.min(typingStart + output.length * 2, durationInFrames - 15);
  const visibleChars = Math.floor(
    interpolate(frame, [typingStart, typingEnd], [0, output.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const displayOutput = output.substring(0, visibleChars);

  // Cursor blink
  const cursorVisible = Math.floor(frame / 8) % 2 === 0;

  // Container style
  const borderRadius = template.containerStyle === 'sharp' ? 0
    : template.containerStyle === 'floating' ? 24 : 16;

  // Label text
  const labelText = title || 'Output';

  // Glow pulse for accent
  const glowIntensity = template.glowEffect
    ? interpolate(Math.sin(frame * 0.1), [-1, 1], [0.4, 0.8])
    : 0;

  // Explanation entrance animation (starts slightly after the output begins typing)
  const explanationStartFrame = 35;
  const explanationOpacity = interpolate(frame, [explanationStartFrame, explanationStartFrame + 15], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const explanationY = interpolate(frame, [explanationStartFrame, explanationStartFrame + 15], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: template.backgroundGradient || template.backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
        opacity: entranceOpacity,
        transform: `translateY(${entranceY}px)`,
      }}
    >
      {playAudio && <Audio src={audioUrl} volume={0.6} />}
      {/* Glow effect behind container */}
      {template.glowEffect && (
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 400,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${template.accentColor}${Math.round(glowIntensity * 80).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
            filter: 'blur(60px)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}

      {/* Result label */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          marginBottom: 30,
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontSize: 48,
            color: template.accentColor,
            fontWeight: 800,
            textShadow: template.glowEffect
              ? `0 0 20px ${template.accentColor}80`
              : 'none',
          }}
        >
          →
        </span>
        <span
          style={{
            fontFamily: template.fontFamily,
            fontSize: template.explanationFontSize ? template.explanationFontSize + 10 : 36,
            fontWeight: 700,
            color: template.explanationColor || template.textColor,
            textTransform: 'uppercase',
            letterSpacing: 3,
          }}
        >
          {labelText}
        </span>
      </div>

      {/* Terminal container */}
      <div
        style={{
          width: '100%',
          maxWidth: 920,
          borderRadius,
          overflow: 'hidden',
          boxShadow: `0 12px 40px rgba(0,0,0,0.5)${template.glowEffect ? `, 0 0 40px ${template.accentColor}15` : ''}`,
          border: `1px solid rgba(255,255,255,0.08)`,
          zIndex: 1,
        }}
      >
        {/* Terminal header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '10px 16px',
            background: 'rgba(0,0,0,0.5)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#ff5f56',
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#ffbd2e',
            }}
          />
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#27c93f',
            }}
          />
          <span
            style={{
              marginLeft: 12,
              fontFamily: template.fontFamily,
              fontSize: 12,
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            terminal
          </span>
        </div>

        {/* Output body */}
        <div
          style={{
            padding: '28px 28px',
            background: 'rgba(0,0,0,0.35)',
            minHeight: 160,
          }}
        >
          {/* Command line prompt */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              fontFamily: template.fontFamily,
              fontSize: (template.codeFontSize || template.fontSize) + 2,
              lineHeight: 1.8,
            }}
          >
            <span
              style={{
                color: template.accentColor,
                fontWeight: 700,
                flexShrink: 0,
                textShadow: template.glowEffect
                  ? `0 0 10px ${template.accentColor}60`
                  : 'none',
              }}
            >
              ▶
            </span>
            <span
              style={{
                color: template.codeColor || '#27c93f',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                textShadow: template.glowEffect
                  ? '0 0 8px rgba(39, 201, 63, 0.3)'
                  : 'none',
              }}
            >
              {displayOutput}
              {cursorVisible && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 2,
                    height: (template.codeFontSize || template.fontSize) + 2,
                    backgroundColor: '#27c93f',
                    marginLeft: 2,
                    verticalAlign: 'text-bottom',
                  }}
                />
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Explanation container (styled glassmorphic block) */}
      {explanation && explanation.trim() && (
        <div
          style={{
            marginTop: 40,
            width: '100%',
            maxWidth: 920,
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(12px)',
            borderLeft: `5px solid ${template.accentColor}`,
            borderTop: '1px solid rgba(255,255,255,0.06)',
            borderRight: '1px solid rgba(255,255,255,0.06)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 12,
            padding: '24px 32px',
            boxShadow: template.glowEffect
              ? `0 10px 30px rgba(0,0,0,0.3), 0 0 20px ${template.accentColor}10`
              : 'none',
            opacity: explanationOpacity,
            transform: `translateY(${explanationY}px)`,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>💡</span>
            <span
              style={{
                fontFamily: template.fontFamily,
                fontSize: 20,
                fontWeight: 800,
                color: template.accentColor,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
              }}
            >
              Quick Explanation
            </span>
          </div>
          <p
            style={{
              margin: 0,
              fontFamily: template.fontFamily,
              fontSize: template.explanationFontSize || 24,
              fontWeight: 500,
              color: template.explanationColor || 'rgba(255, 255, 255, 0.95)',
              lineHeight: 1.6,
            }}
          >
            {explanation}
          </p>
        </div>
      )}
    </AbsoluteFill>
  );
};
