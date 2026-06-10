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
  const buttonColor = isSubscribed ? 'rgba(255,255,255,0.15)' : '#ff0000';
  const buttonTextColor = isSubscribed ? 'rgba(255,255,255,0.5)' : '#ffffff';
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

  // Render video if videoUrl is supplied
  if (videoUrl && videoUrl.trim() !== '') {
    return (
      <AbsoluteFill
        style={{
          background: template.backgroundGradient || template.backgroundColor,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
          <Video
            src={videoUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
            startFrom={0}
            volume={1.0}
          />
          {imageUrl && (
            <div
              style={{
                position: 'absolute',
                top: 40,
                right: 40,
                width: 80,
                height: 80,
                borderRadius: '50%',
                overflow: 'hidden',
                border: '3px solid rgba(255, 255, 255, 0.2)',
                boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                zIndex: 10,
              }}
            >
              <img
                src={imageUrl}
                alt="Logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
          )}
        </div>
      </AbsoluteFill>
    );
  }

  // Fallback high-end subscribe overlay sequence
  return (
    <AbsoluteFill
      style={{
        background: template.backgroundGradient || template.backgroundColor,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 60,
      }}
    >
      {/* Background glow */}
      {template.glowEffect && (
        <div
          style={{
            position: 'absolute',
            width: 700,
            height: 600,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${template.accentColor}20 0%, transparent 70%)`,
            filter: 'blur(100px)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}

      {/* Glassmorphic overlay card */}
      <div
        style={{
          transform: `scale(${cardScale})`,
          opacity: cardOpacity,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 24,
          padding: '40px 60px',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          gap: 40,
          zIndex: 1,
        }}
      >
        {/* Play icon or custom logo badge */}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Logo"
            style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid rgba(255, 255, 255, 0.15)',
              boxShadow: `0 8px 25px ${template.accentColor}30`,
            }}
          />
        ) : (
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: '50%',
              background: '#ff0000',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: 32,
              color: '#ffffff',
              boxShadow: '0 8px 25px rgba(255, 0, 0, 0.3)',
            }}
          >
            ▶
          </div>
        )}

        {/* Brand details */}
        <div>
          <h2
            style={{
              fontFamily: template.fontFamily,
              color: template.ctaColor || template.textColor,
              fontSize: template.ctaFontSize || 30,
              fontWeight: 800,
              margin: '0 0 4px 0',
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

        {/* Subscribe Action Button */}
        <button
          style={{
            transform: `scale(${buttonScale})`,
            background: buttonColor,
            color: buttonTextColor,
            fontFamily: template.fontFamily,
            border: 'none',
            borderRadius: 50,
            padding: '16px 36px',
            fontSize: template.ctaFontSize ? Math.min(template.ctaFontSize, 20) : 20,
            fontWeight: 800,
            cursor: 'pointer',
            boxShadow: !isSubscribed ? '0 10px 25px rgba(255, 0, 0, 0.3)' : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.25s, color 0.25s',
          }}
        >
          {buttonText}
        </button>

        {/* Bell Icon Notification Button */}
        <div
          style={{
            transform: `scale(${bellScale}) rotate(${bellRotation}deg)`,
            width: 58,
            height: 58,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill={isSubscribed ? template.accentColor : 'rgba(255, 255, 255, 0.5)'}
            style={{ transition: 'fill 0.2s' }}
          >
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
          </svg>

          {isRinging && (
            <div
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                border: `2px solid ${template.accentColor}`,
                opacity: interpolate(frame % 15, [0, 15], [0.6, 0]),
                transform: `scale(${interpolate(frame % 15, [0, 15], [1, 1.7])})`,
              }}
            />
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
export default SubscribeVideoScene;
