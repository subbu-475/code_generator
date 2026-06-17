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
  summaryShowSubscribe = true,
  imageUrl,
  text,
  template,
  durationInFrames: _durationInFrames,
  explanationFontSize,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const finalExplanationFontSize = explanationFontSize || template.explanationFontSize;

  // Like particles burst (starts at frame 30)
  const likeClickSpring = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const heartParticles = Array.from({ length: 8 }).map((_, i) => {
    const angle = (i / 8) * 2 * Math.PI;
    const distance = interpolate(likeClickSpring, [0, 1], [15, 60]);
    const opacity = interpolate(likeClickSpring, [0, 0.7, 1], [0, 1, 0]);
    const scale = interpolate(likeClickSpring, [0, 1], [0.3, 1.0]);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    return { x, y, opacity, scale };
  });

  // Subscribe confetti particles burst (starts at frame 65)
  const subConfettiSpring = spring({
    frame: Math.max(0, frame - 65),
    fps,
    config: { damping: 10, stiffness: 120 },
  });
  const subscribeParticles = Array.from({ length: 12 }).map((_, i) => {
    const angle = (i / 12) * 2 * Math.PI;
    const distance = interpolate(subConfettiSpring, [0, 1], [25, 100]);
    const opacity = interpolate(subConfettiSpring, [0, 0.8, 1], [0, 1, 0]);
    const scale = interpolate(subConfettiSpring, [0, 1], [0.4, 1.2]);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const colors = ['#ff0055', '#ffaa00', '#00ffcc', template.accentColor, '#ffff00'];
    const color = colors[i % colors.length];
    return { x, y, opacity, scale, color };
  });

  // Bell scaling & entrance
  const bellEntranceSpring = spring({
    frame: Math.max(0, frame - 65),
    fps,
    config: { damping: 10, stiffness: 120 },
  });
  const bellScale = interpolate(bellEntranceSpring, [0, 1], [0, 1], { extrapolateLeft: 'clamp' });

  const bellClickSpring = spring({
    frame: Math.max(0, frame - 85),
    fps,
    config: { damping: 8, stiffness: 200 },
  });
  const bellClickScale = interpolate(bellClickSpring, [0, 0.5, 1], [1, 0.8, 1]);

  const isBellRinging = frame >= 90 && frame < 120;
  const bellRotation = isBellRinging
    ? Math.sin((frame - 90) * 0.5) * 16 * interpolate(frame - 90, [0, 30], [1, 0])
    : 0;

  const ringFrame = 90;
  const ripple1Opacity = frame >= ringFrame ? interpolate((frame - ringFrame) % 15, [0, 15], [0.8, 0]) : 0;
  const ripple1Scale = frame >= ringFrame ? interpolate((frame - ringFrame) % 15, [0, 15], [1, 1.8]) : 1;
  const ripple2Opacity = frame >= ringFrame + 7 ? interpolate((frame - ringFrame - 7) % 15, [0, 15], [0.6, 0]) : 0;
  const ripple2Scale = frame >= ringFrame + 7 ? interpolate((frame - ringFrame - 7) % 15, [0, 15], [1, 1.8]) : 1;

  // Cursor pointer coordinates
  let cursorX = 780;
  let cursorY = 150;
  let cursorOpacity = 0;
  let cursorScale = 1.0;

  if (frame >= 0 && frame < 30) {
    cursorOpacity = interpolate(frame, [0, 10], [0, 1], { extrapolateLeft: 'clamp' });
    cursorX = interpolate(frame, [0, 30], [780, 235]);
    cursorY = interpolate(frame, [0, 30], [150, 55]);
  } else if (frame >= 30 && frame < 35) {
    cursorOpacity = 1;
    cursorX = 235;
    cursorY = 55;
    cursorScale = interpolate(frame, [30, 32, 35], [1.0, 0.75, 1.0]);
  } else if (frame >= 35 && frame < 60) {
    cursorOpacity = 1;
    cursorX = interpolate(frame, [35, 60], [235, 475]);
    cursorY = interpolate(frame, [35, 60], [55, 55]);
  } else if (frame >= 60 && frame < 65) {
    cursorOpacity = 1;
    cursorX = 475;
    cursorY = 55;
    cursorScale = interpolate(frame, [60, 62, 65], [1.0, 0.75, 1.0]);
  } else if (frame >= 65 && frame < 85) {
    cursorOpacity = 1;
    cursorX = interpolate(frame, [65, 85], [475, 695]);
    cursorY = interpolate(frame, [65, 85], [55, 55]);
  } else if (frame >= 85 && frame < 90) {
    cursorOpacity = 1;
    cursorX = 695;
    cursorY = 55;
    cursorScale = interpolate(frame, [85, 87, 90], [1.0, 0.75, 1.0]);
  } else if (frame >= 90 && frame < 115) {
    cursorOpacity = interpolate(frame, [105, 115], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    cursorX = interpolate(frame, [90, 115], [695, 780]);
    cursorY = interpolate(frame, [90, 115], [55, 150]);
  }

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

      {/* Floating Like & Subscribe Overlay Bar */}
      {summaryShowSubscribe !== false && (
        <div
          style={{
            position: 'absolute',
            top: 120,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 800,
            height: 128,
            background: 'rgba(12, 12, 28, 0.75)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1.5px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 64,
            display: 'flex',
            alignItems: 'center',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            zIndex: 10,
            overflow: 'hidden',
          }}
        >
          {/* Channel Logo / Avatar (optional provision) */}
          <div
            style={{
              position: 'absolute',
              left: 80,
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Channel Logo"
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `3.5px solid ${template.accentColor}`,
                  boxShadow: `0 0 16px ${template.accentColor}50`,
                }}
              />
            ) : (
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${template.accentColor}, ${template.accentColor}dd)`,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  fontSize: 32,
                  fontWeight: 800,
                  color: '#ffffff',
                  border: '2px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.3)',
                }}
              >
                👤
              </div>
            )}
          </div>

          {/* Like Section */}
          <div
            style={{
              position: 'absolute',
              left: 240,
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
            }}
          >
            <div
              style={{
                transform: `scale(${frame >= 30 ? interpolate(spring({ frame: frame - 30, fps, config: { damping: 10, stiffness: 150 } }), [0, 1], [1, 1.35], { extrapolateRight: 'clamp' }) : 1})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <svg width="48" height="48" viewBox="0 0 24 24" fill={frame >= 33 ? '#ff0055' : 'rgba(255, 255, 255, 0.4)'} style={{ transition: 'fill 0.1s ease' }}>
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
              </svg>
            </div>
            
            {/* Like Particle Burst */}
            {frame >= 33 && heartParticles.map((p, idx) => (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: 24,
                  top: 24,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: '#ff0055',
                  opacity: p.opacity,
                  transform: `translate(-50%, -50%) translate(${p.x * 1.2}px, ${p.y * 1.2}px) scale(${p.scale})`,
                  pointerEvents: 'none',
                }}
              />
            ))}
            
            <span style={{ fontFamily: template.fontFamily, color: 'rgba(255, 255, 255, 0.85)', fontSize: 22, fontWeight: 700 }}>Like</span>
          </div>

          {/* Subscribe Action Wrapper */}
          <div
            style={{
              position: 'absolute',
              left: 480,
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <button
              style={{
                transform: `scale(${frame >= 60 ? interpolate(spring({ frame: frame - 60, fps, config: { damping: 8, stiffness: 200 } }), [0, 0.5, 1], [1, 0.85, 1]) : 1})`,
                background: frame >= 65 ? 'rgba(255, 255, 255, 0.08)' : `linear-gradient(135deg, ${template.accentColor} 0%, ${template.accentColor}dd 100%)`,
                border: frame >= 65 ? `2px solid ${template.accentColor}` : 'none',
                color: frame >= 65 ? 'rgba(255, 255, 255, 0.9)' : '#ffffff',
                fontFamily: template.fontFamily,
                borderRadius: 32,
                padding: '12px 36px',
                fontSize: 22,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: frame >= 65 ? 'none' : `0 8px 24px ${template.accentColor}40`,
                transition: 'all 0.3s ease',
              }}
            >
              {frame >= 65 ? '✓ Subscribed' : 'Subscribe'}
            </button>
            
            {/* Confetti particles */}
            {frame >= 65 && subscribeParticles.map((p, idx) => (
              <div
                key={idx}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: idx % 2 === 0 ? 10 : 8,
                  height: idx % 2 === 0 ? 10 : 8,
                  borderRadius: idx % 2 === 0 ? '50%' : '20%',
                  backgroundColor: p.color,
                  opacity: p.opacity,
                  transform: `translate(-50%, -50%) translate(${p.x * 1.3}px, ${p.y * 1.3}px) scale(${p.scale})`,
                  pointerEvents: 'none',
                }}
              />
            ))}
          </div>

          {/* Bell Container */}
          <div
            style={{
              position: 'absolute',
              left: 700,
              transform: 'translateX(-50%)',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                transform: `scale(${bellScale})`,
                opacity: bellScale,
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <div
                style={{
                  transform: `scale(${bellClickScale}) rotate(${bellRotation}deg)`,
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1.5px solid rgba(255, 255, 255, 0.12)',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  cursor: 'pointer',
                  boxShadow: isBellRinging ? `0 0 20px ${template.accentColor}40` : 'none',
                  transition: 'all 0.3s ease',
                }}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill={frame >= 90 ? template.accentColor : 'rgba(255, 255, 255, 0.5)'}
                  style={{ transition: 'fill 0.2s' }}
                >
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
                </svg>
                
                {/* Ripple Ring Wave animations */}
                {frame >= ringFrame && (
                  <>
                    <div
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: `2.5px solid ${template.accentColor}`,
                        opacity: ripple1Opacity,
                        transform: `scale(${ripple1Scale})`,
                        pointerEvents: 'none',
                      }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        borderRadius: '50%',
                        border: `1.5px solid ${template.accentColor}bb`,
                        opacity: ripple2Opacity,
                        transform: `scale(${ripple2Scale})`,
                        pointerEvents: 'none',
                      }}
                    />
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Mouse Cursor Pointer overlay */}
          <div
            style={{
              position: 'absolute',
              left: cursorX,
              top: cursorY,
              opacity: cursorOpacity,
              transform: `scale(${cursorScale}) translate(-5px, -5px)`,
              pointerEvents: 'none',
              zIndex: 100,
              transition: 'opacity 0.1s ease',
            }}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M4.5 3v15.3l4.4-4.1 3.2 7.2 2.6-1.2-3.2-7.2 5.5-.3L4.5 3z"
                fill="rgba(0,0,0,0.5)"
              />
              <path
                d="M3 1.5v15.3l4.4-4.1 3.2 7.2 2.6-1.2-3.2-7.2 5.5-.3L3 1.5z"
                fill="#ffffff"
                stroke="#000000"
                strokeWidth="1.5"
                strokeLinejoin="miter"
              />
            </svg>
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
