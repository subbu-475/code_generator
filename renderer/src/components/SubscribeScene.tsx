import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import type { VideoTheme } from '../types/index';

export interface SubscribeSceneProps {
  channelName?: string;
  channelHandle?: string;
  subscriberCount?: string;
  imageUrl?: string;
  template: VideoTheme;
  durationInFrames: number;
}

export const SubscribeScene: React.FC<SubscribeSceneProps> = ({
  channelName = 'CodeShorts',
  channelHandle = '@codeshorts',
  subscriberCount = '100K',
  imageUrl,
  template,
  durationInFrames: _durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entranceSpring = spring({
    frame,
    fps,
    config: {
      damping: 12,
      stiffness: 120,
      mass: 0.9,
    },
  });

  const cardScale = interpolate(entranceSpring, [0, 1], [0.5, 1]);
  const cardOpacity = interpolate(entranceSpring, [0, 1], [0, 1]);

  const clickFrame = 35;
  const clickSpring = spring({
    frame: frame - clickFrame,
    fps,
    config: {
      damping: 8,
      stiffness: 200,
    },
  });

  const buttonScale = interpolate(clickSpring, [0, 0.5, 1], [1, 0.85, 1]);

  const isSubscribed = frame >= clickFrame + 5;
  const buttonBackground = isSubscribed
    ? 'rgba(255, 255, 255, 0.08)'
    : 'linear-gradient(135deg, #ff0055 0%, #ff5500 100%)';
  const buttonBorder = isSubscribed
    ? `2px solid ${template.accentColor}`
    : 'none';
  const buttonTextColor = isSubscribed ? 'rgba(255, 255, 255, 0.9)' : '#ffffff';
  const buttonText = isSubscribed ? '✓ Subscribed' : 'Subscribe';

  const bellFrame = 45;
  const bellSpring = spring({
    frame: frame - bellFrame,
    fps,
    config: {
      damping: 10,
      stiffness: 150,
    },
  });

  const bellScale = interpolate(bellSpring, [0, 1], [0, 1]);

  const isRinging = frame >= bellFrame && frame < bellFrame + 40;
  const bellRotation = isRinging
    ? Math.sin((frame - bellFrame) * 0.4) * 18 
    : 0;

  // Avatar pulse animation
  const avatarPulse = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.97, 1.04]
  );

  // Floating "+1" badge when subscription triggers
  const plusOneSpring = spring({
    frame: frame - clickFrame,
    fps,
    config: { damping: 12, stiffness: 100 },
  });
  const plusOneY = interpolate(plusOneSpring, [0, 1], [0, -60]);
  const plusOneOpacity = interpolate(plusOneSpring, [0, 0.8, 1], [0, 1, 0]);
  const plusOneScale = interpolate(plusOneSpring, [0, 1], [0.8, 1.2]);

  // Particles burst on subscribe click
  const particles = Array.from({ length: 12 }).map((_, index) => {
    const angle = (index / 12) * 2 * Math.PI;
    const distance = interpolate(clickSpring, [0, 1], [30, 180]);
    const opacity = interpolate(clickSpring, [0, 0.7, 1], [0, 1, 0]);
    const scale = interpolate(clickSpring, [0, 1], [0.4, 1.2]);
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;
    
    // Choose particle colors
    const colors = [template.accentColor, '#ff0055', '#ffaa00', '#00ffcc', '#ffff00'];
    const color = colors[index % colors.length];

    return { x, y, opacity, scale, color };
  });

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
        background: 'transparent',
      }}
    >
      {/* Ambient pulse glow behind card */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 420,
          borderRadius: 32,
          background: `radial-gradient(circle, ${template.accentColor}25 0%, transparent 70%)`,
          filter: 'blur(70px)',
          opacity: cardOpacity * 0.85,
          transform: `scale(${cardScale})`,
          zIndex: 0,
        }}
      />

      {/* Main Glassmorphic Card */}
      <div
        style={{
          transform: `scale(${cardScale})`,
          opacity: cardOpacity,
          width: 800,
          background: 'rgba(12, 12, 28, 0.75)',
          backdropFilter: 'blur(25px)',
          WebkitBackdropFilter: 'blur(25px)',
          border: `2px solid rgba(255, 255, 255, 0.08)`,
          borderRadius: 32,
          padding: 56,
          boxShadow: `0 30px 80px rgba(0, 0, 0, 0.6), 0 0 40px ${template.accentColor}15`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 36,
          zIndex: 1,
          position: 'relative',
          overflow: 'hidden',
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

        {/* Pulsing Avatar Container */}
        <div
          style={{
            position: 'relative',
            transform: `scale(${avatarPulse})`,
          }}
        >
          {/* Outer Pulsing Glow Ring */}
          <div
            style={{
              position: 'absolute',
              top: -8,
              left: -8,
              right: -8,
              bottom: -8,
              borderRadius: '50%',
              border: `3px solid ${template.accentColor}`,
              opacity: interpolate(Math.sin(frame * 0.1), [-1, 1], [0.35, 0.75]),
              boxShadow: `0 0 20px ${template.accentColor}`,
            }}
          />
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Logo"
              style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '4px solid rgba(255, 255, 255, 0.2)',
                backgroundColor: '#11111a',
              }}
            />
          ) : (
            <div
              style={{
                width: 140,
                height: 140,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${template.accentColor}, ${template.accentColor}dd)`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: 58,
                fontWeight: 900,
                color: '#ffffff',
                textShadow: '0 4px 10px rgba(0,0,0,0.3)',
                border: '4px solid rgba(255, 255, 255, 0.2)',
              }}
            >
              {channelName.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Text Section */}
        <div style={{ textAlign: 'center', position: 'relative' }}>
          <h2
            style={{
              fontFamily: template.fontFamily,
              color: template.ctaColor || template.textColor,
              fontSize: template.ctaFontSize || 38,
              fontWeight: 800,
              margin: '0 0 8px 0',
              letterSpacing: '0.5px',
            }}
          >
            {channelName}
          </h2>
          <div style={{ display: 'inline-flex', alignItems: 'center', position: 'relative' }}>
            <p
              style={{
                fontFamily: template.fontFamily,
                color: template.explanationColor || 'rgba(255, 255, 255, 0.5)',
                fontSize: template.explanationFontSize ? Math.min(template.explanationFontSize, 22) : 22,
                margin: 0,
              }}
            >
              {channelHandle} • {subscriberCount} subscribers
            </p>
            
            {/* Pop-up +1 animation */}
            {frame >= clickFrame && (
              <span
                style={{
                  position: 'absolute',
                  right: -45,
                  top: -24,
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#22c55e',
                  transform: `translateY(${plusOneY}px) scale(${plusOneScale})`,
                  opacity: plusOneOpacity,
                  textShadow: '0 0 10px rgba(34, 197, 94, 0.5)',
                }}
              >
                +1
              </span>
            )}
          </div>
        </div>

        {/* Buttons Row with Confetti */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginTop: 10,
            position: 'relative',
          }}
        >
          {/* Subscribe Action Wrapper */}
          <div style={{ position: 'relative' }}>
            <button
              style={{
                transform: `scale(${buttonScale})`,
                background: buttonBackground,
                border: buttonBorder,
                color: buttonTextColor,
                fontFamily: template.fontFamily,
                borderRadius: 50,
                padding: '18px 54px',
                fontSize: template.ctaFontSize ? Math.min(template.ctaFontSize, 24) : 24,
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: !isSubscribed
                  ? '0 12px 35px rgba(255, 0, 85, 0.45), 0 0 15px rgba(255, 0, 85, 0.2)'
                  : `0 0 20px ${template.accentColor}30`,
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
                  width: idx % 3 === 0 ? 12 : 8,
                  height: idx % 3 === 0 ? 12 : 8,
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

          {/* Bell Notification Ring */}
          <div
            style={{
              transform: `scale(${bellScale}) rotate(${bellRotation}deg)`,
              width: 66,
              height: 66,
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1.5px solid rgba(255, 255, 255, 0.12)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              position: 'relative',
              boxShadow: isRinging ? `0 0 25px ${template.accentColor}50` : 'none',
              transition: 'all 0.3s ease',
            }}
          >
            <svg
              width="30"
              height="30"
              viewBox="0 0 24 24"
              fill={isSubscribed ? template.accentColor : 'rgba(255, 255, 255, 0.5)'}
              style={{ transition: 'fill 0.2s' }}
            >
              <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
            </svg>

            {/* Staggered Bell Ringing Soundwaves */}
            {isRinging && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: `2.5px solid ${template.accentColor}`,
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
                    border: `1.5px solid ${template.accentColor}bb`,
                    opacity: interpolate((frame - bellFrame + 7) % 15, [0, 15], [0.6, 0]),
                    transform: `scale(${interpolate((frame - bellFrame + 7) % 15, [0, 15], [1, 1.8])})`,
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
