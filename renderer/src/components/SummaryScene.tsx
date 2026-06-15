import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import { SummarySceneProps } from '../types/index';

/**
 * SummaryScene — slide showcasing the key takeaways / summary points of the video.
 *
 * Features:
 * - "Summary" badge or "Key Takeaways" header
 * - Glassmorphic card container with accent borders
 * - Staggered entrance animations for each bullet point
 * - Checkmark icons highlighted with the template's accent color
 */
export const SummaryScene: React.FC<SummarySceneProps> = ({
  summaryTitle = 'Key Takeaways',
  summaryPoints = [],
  summaryLayout = 'points',
  summaryVoiceOver = true,
  text,
  template,
  durationInFrames: _durationInFrames,
  explanationFontSize,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const finalExplanationFontSize = explanationFontSize || template.explanationFontSize;

  // Spring entrance for the card container
  const cardSpring = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 160,
      mass: 0.8,
    },
  });

  const cardY = interpolate(cardSpring, [0, 1], [150, 0]);
  const cardOpacity = interpolate(cardSpring, [0, 1], [0, 1]);

  // Floating animation for a premium feel
  const floatY = Math.sin(frame * 0.04) * 4;

  // Title fade-in (delayed slightly)
  const titleOpacity = interpolate(frame, [8, 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleY = interpolate(frame, [8, 20], [15, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Paragraph fade-in / slide-up animations
  const paragraphOpacity = interpolate(frame, [18, 30], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const paragraphY = interpolate(frame, [18, 30], [20, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Default points fallback if empty
  const points = summaryPoints.length > 0 ? summaryPoints : [
    'First important lesson details',
    'Second key takeaway to remember',
    'Third summary point or best practice'
  ];

  // Container style setup
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
      {/* Background glow overlay */}
      {template.glowEffect && (
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${template.accentColor}20 0%, transparent 70%)`,
            filter: 'blur(90px)',
            top: '45%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}

      {/* Card wrapper */}
      <div
        style={{
          opacity: cardOpacity,
          transform: `translateY(${cardY + floatY}px)`,
          width: '100%',
          maxWidth: 900,
          zIndex: 1,
        }}
      >
        {/* Summary badge */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: 24,
            transform: `scale(${interpolate(cardSpring, [0, 1], [0.8, 1])})`,
          }}
        >
          <div
            style={{
              background: template.accentColor,
              color: '#fff',
              fontFamily: template.fontFamily,
              fontSize: 20,
              fontWeight: 800,
              padding: '8px 28px',
              borderRadius: 50,
              letterSpacing: 2,
              textTransform: 'uppercase',
              boxShadow: `0 4px 20px ${template.accentColor}40`,
            }}
          >
              📋 Summary
          </div>
        </div>

        {/* Main Card */}
        <div
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius,
            padding: '45px 40px',
            border: `2px solid ${template.accentColor}30`,
            boxShadow: `0 16px 50px rgba(0, 0, 0, 0.3)${template.glowEffect ? `, 0 0 30px ${template.accentColor}10` : ''}`,
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Title */}
          <h2
            style={{
              fontFamily: template.fontFamily,
              fontSize: finalExplanationFontSize ? finalExplanationFontSize + 14 : 40,
              fontWeight: 800,
              color: template.explanationColor || template.textColor,
              lineHeight: 1.3,
              margin: 0,
              marginBottom: 35,
              opacity: titleOpacity,
              transform: `translateY(${titleY}px)`,
              textAlign: 'center',
              textShadow: template.glowEffect
                ? `0 0 20px ${template.accentColor}30`
                : 'none',
            }}
          >
            {summaryTitle}
          </h2>

          {/* Main Content */}
          {summaryLayout === 'paragraph' ? (
            <div
              style={{
                opacity: paragraphOpacity,
                transform: `translateY(${paragraphY}px)`,
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                lineHeight: 1.6,
              }}
            >
              <p
                style={{
                  fontFamily: template.fontFamily,
                  fontSize: finalExplanationFontSize || 26,
                  color: template.textColor,
                  fontWeight: 500,
                  lineHeight: 1.65,
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.25)',
                  margin: '0 auto',
                  textAlign: 'center',
                  whiteSpace: 'pre-wrap',
                  maxWidth: 800,
                }}
              >
                {text || 'No summary text provided.'}
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {points.map((point, index) => {
                // Staggered spring animation for each point
                // Starts popping up at frame 15, then 27, then 39, etc.
                const pointSpring = spring({
                  frame: Math.max(0, frame - 15 - index * 12),
                  fps,
                  config: {
                    damping: 13,
                    stiffness: 170,
                    mass: 0.6,
                  },
                });

                const pointOpacity = interpolate(pointSpring, [0, 1], [0, 1]);
                const pointX = interpolate(pointSpring, [0, 1], [-20, 0]);

                return (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      opacity: pointOpacity,
                      transform: `translateX(${pointX}px)`,
                    }}
                  >
                    {/* Accent colored checkmark circle */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        backgroundColor: `${template.accentColor}20`,
                        border: `2px solid ${template.accentColor}`,
                        color: template.accentColor,
                        marginRight: 20,
                        marginTop: 3,
                        flexShrink: 0,
                        fontSize: 16,
                        fontWeight: 900,
                        boxShadow: `0 0 10px ${template.accentColor}30`,
                        transform: `scale(${interpolate(pointSpring, [0, 1], [0.5, 1])})`,
                      }}
                    >
                      ✓
                    </div>
                    {/* Point Text */}
                    <div
                      style={{
                        fontFamily: template.fontFamily,
                        fontSize: finalExplanationFontSize || 26,
                        color: template.textColor,
                        fontWeight: 500,
                        lineHeight: 1.45,
                        textShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                      }}
                    >
                      {point}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Dynamic accent line under the card */}
        <div
          style={{
            marginTop: 24,
            height: 4,
            width: interpolate(cardSpring, [0, 1], [0, 240]),
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
