import React from 'react';
import { AbsoluteFill, Video, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { VideoTheme } from '../types/index';

interface SubscribeVideoSceneProps {
  videoUrl?: string;
  imageUrl?: string;
  template: VideoTheme;
  durationInFrames: number;
}

export const SubscribeVideoScene: React.FC<SubscribeVideoSceneProps> = ({
  videoUrl,
  imageUrl,
  template,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for fallback UI card
  const entranceSpring = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 120,
      mass: 0.8,
    },
  });

  const cardScale = interpolate(entranceSpring, [0, 1], [0.85, 1]);
  const cardOpacity = interpolate(entranceSpring, [0, 1], [0, 1]);

  // Click animation timings
  const clickFrame = 45;
  const clickSpring = spring({
    frame: frame - clickFrame,
    fps,
    config: {
      damping: 8,
      stiffness: 200,
    },
  });
  const buttonScale = interpolate(clickSpring, [0, 0.5, 1], [1, 0.82, 1]);

  const isSubscribed = frame >= clickFrame + 5;
  const buttonBackground = isSubscribed
    ? 'rgba(255, 255, 255, 0.08)'
    : 'linear-gradient(135deg, #ff0055 0%, #ff5500 100%)';
  const buttonBorder = isSubscribed
    ? `2px solid ${template.accentColor}`
    : 'none';
  const buttonTextColor = isSubscribed ? 'rgba(255, 255, 255, 0.9)' : '#ffffff';
  const buttonText = isSubscribed ? '✓ Subscribed' : 'Subscribe';

  // Bell animation timings
  const bellFrame = 55;
  const bellSpring = spring({
    frame: frame - bellFrame,
    fps,
    config: {
      damping: 10,
      stiffness: 160,
    },
  });
  const bellScale = interpolate(bellSpring, [0, 1], [0, 1]);
  const isRinging = frame >= bellFrame && frame < bellFrame + 40;
  const bellRotation = isRinging ? Math.sin((frame - bellFrame) * 0.4) * 15 : 0;

  // Avatar pulse animation
  const avatarPulse = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.96, 1.04]
  );

  // Particles burst on subscribe click
  const particles = Array.from({ length: 12 }).map((_, index) => {
    const angle = (index / 12) * 2 * Math.PI;
    const distance = interpolate(clickSpring, [0, 1], [25, 140]);
    const opacity = interpolate(clickSpring, [0, 0.7, 1], [0, 1, 0]);
    const scale = interpolate(clickSpring, [0, 1], [0.3, 1.0]);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    const colors = [template.accentColor, '#ff0055', '#ffaa00', '#00ffcc', '#ffff00'];
    const color = colors[index % colors.length];
    return { x, y, opacity, scale, color };
  });

  const hasVideo = videoUrl && videoUrl.trim() !== '';

  return (
    <AbsoluteFill
      style={{
        background: template.backgroundGradient || template.backgroundColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
      }}
    >
      {/* Background Video */}
      {hasVideo && (
        <AbsoluteFill style={{ zIndex: 0 }}>
          <Video
            src={videoUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            startFrom={0}
            volume={1.0}
            loop
          />
          {/* Dark glass cover to preserve overlay text contrast */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(5, 5, 15, 0.45)',
            }}
          />
        </AbsoluteFill>
      )}

      {/* Ambient pulse glow behind card (only when no video is playing) */}
      {!hasVideo && (
        <div
          style={{
            position: 'absolute',
            width: 760,
            height: 200,
            borderRadius: 32,
            background: `radial-gradient(circle, ${template.accentColor}25 0%, transparent 70%)`,
            filter: 'blur(60px)',
            opacity: cardOpacity * 0.85,
            transform: `scale(${cardScale})`,
            zIndex: 0,
          }}
        />
      )}

      {/* Glassmorphic overlay card */}
      <div
        style={{
          transform: `scale(${cardScale})`,
          opacity: cardOpacity,
          background: hasVideo ? 'rgba(10, 10, 24, 0.78)' : 'rgba(12, 12, 28, 0.75)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          border: '2px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 32,
          padding: '44px 56px',
          boxShadow: `0 30px 80px rgba(0, 0, 0, 0.6), 0 0 40px ${template.accentColor}15`,
          display: 'flex',
          alignItems: 'center',
          gap: 40,
          zIndex: 1,
          position: 'relative',
          overflow: 'hidden',
          width: '90%',
          maxWidth: 920,
        }}
      >
        {/* Glow border overlay inside the card */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 32,
            border: `1.5px solid ${template.accentColor}25`,
            pointerEvents: 'none',
          }}
        />

        {/* Pulsing Avatar/Logo Container */}
        <div
          style={{
            position: 'relative',
            transform: `scale(${avatarPulse})`,
            flexShrink: 0,
          }}
        >
          {/* Outer Pulsing Glow Ring */}
          <div
            style={{
              position: 'absolute',
              top: -5,
              left: -5,
              right: -5,
              bottom: -5,
              borderRadius: '50%',
              border: `2.5px solid ${template.accentColor}`,
              opacity: interpolate(Math.sin(frame * 0.1), [-1, 1], [0.35, 0.75]),
              boxShadow: `0 0 15px ${template.accentColor}`,
            }}
          />
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Logo"
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: '#11111a',
              }}
            />
          ) : (
            <div
              style={{
                width: 76,
                height: 76,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${template.accentColor}, ${template.accentColor}80)`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: 32,
                fontWeight: 900,
                color: '#ffffff',
                border: '3px solid rgba(255, 255, 255, 0.2)',
                boxShadow: `0 8px 25px ${template.accentColor}30`,
              }}
            >
              ▶
            </div>
          )}
        </div>

        {/* Brand details */}
        <div style={{ flexGrow: 1 }}>
          <h2
            style={{
              fontFamily: template.fontFamily,
              color: template.ctaColor || template.textColor,
              fontSize: template.ctaFontSize || 30,
              fontWeight: 800,
              margin: '0 0 4px 0',
              letterSpacing: '0.5px',
            }}
          >
            Don't miss the next video!
          </h2>
          <p
            style={{
              fontFamily: template.fontFamily,
              color: template.explanationColor || 'rgba(255, 255, 255, 0.5)',
              fontSize: template.explanationFontSize ? Math.min(template.explanationFontSize, 18) : 18,
              margin: 0,
            }}
          >
            Click subscribe to join our coding community.
          </p>
        </div>

        {/* Subscribe Action Button Wrapper */}
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <button
            style={{
              transform: `scale(${buttonScale})`,
              background: buttonBackground,
              border: buttonBorder,
              color: buttonTextColor,
              fontFamily: template.fontFamily,
              borderRadius: 50,
              padding: '16px 40px',
              fontSize: template.ctaFontSize ? Math.min(template.ctaFontSize, 20) : 20,
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: !isSubscribed
                ? '0 10px 25px rgba(255, 0, 85, 0.4), 0 0 10px rgba(255, 0, 85, 0.15)'
                : `0 0 15px ${template.accentColor}30`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)',
            }}
          >
            {buttonText}
          </button>
          
          {/* Confetti particles burst */}
          {frame >= clickFrame && particles.map((p, idx) => (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: '50%',
                top: '50%',
                width: idx % 3 === 0 ? 10 : 6,
                height: idx % 3 === 0 ? 10 : 6,
                borderRadius: idx % 2 === 0 ? '50%' : '20%',
                backgroundColor: p.color,
                opacity: p.opacity,
                transform: `translate(-50%, -50%) translate(${p.x}px, ${p.y}px) scale(${p.scale}) rotate(${frame * 4}deg)`,
                pointerEvents: 'none',
                zIndex: 10,
              }}
            />
          ))}
        </div>

        {/* Bell Icon Notification Button */}
        <div
          style={{
            transform: `scale(${bellScale}) rotate(${bellRotation}deg)`,
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1.5px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            boxShadow: isRinging ? `0 0 20px ${template.accentColor}50` : 'none',
            transition: 'all 0.3s ease',
            flexShrink: 0,
          }}
        >
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill={isSubscribed ? template.accentColor : 'rgba(255, 255, 255, 0.5)'}
            style={{ transition: 'fill 0.2s' }}
          >
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
          </svg>

          {/* Soundwave Rings */}
          {isRinging && (
            <>
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: `2px solid ${template.accentColor}`,
                  opacity: interpolate((frame - bellFrame) % 15, [0, 15], [0.8, 0]),
                  transform: `scale(${interpolate((frame - bellFrame) % 15, [0, 15], [1, 1.8])})`,
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  border: `1px solid ${template.accentColor}bb`,
                  opacity: interpolate((frame - bellFrame + 7) % 15, [0, 15], [0.6, 0]),
                  transform: `scale(${interpolate((frame - bellFrame + 7) % 15, [0, 15], [1, 1.8])})`,
                }}
              />
            </>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default SubscribeVideoScene;
