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
  const buttonColor = isSubscribed ? 'rgba(255, 255, 255, 0.15)' : '#ef4444';
  const buttonTextColor = isSubscribed ? 'rgba(255, 255, 255, 0.6)' : '#ffffff';
  const buttonText = isSubscribed ? 'Subscribed' : 'Subscribe';

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

  return (
    <AbsoluteFill
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
      }}
    >
      <div
        style={{
          transform: `scale(${cardScale})`,
          opacity: cardOpacity,
          width: 800,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 24,
          padding: 48,
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 32,
          zIndex: 1,
        }}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Logo"
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              objectFit: 'cover',
              boxShadow: `0 0 40px ${template.accentColor}40`,
              border: '4px solid rgba(255, 255, 255, 0.1)',
            }}
          />
        ) : (
          <div
            style={{
              width: 140,
              height: 140,
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${template.accentColor}, ${template.accentColor}80)`,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              fontSize: 54,
              fontWeight: 800,
              color: '#ffffff',
              boxShadow: `0 0 40px ${template.accentColor}40`,
              border: '4px solid rgba(255, 255, 255, 0.1)',
            }}
          >
            {channelName.charAt(0).toUpperCase()}
          </div>
        )}

        <div style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: template.fontFamily,
              color: template.textColor,
              fontSize: 38,
              fontWeight: 800,
              margin: '0 0 8px 0',
            }}
          >
            {channelName}
          </h2>
          <p
            style={{
              fontFamily: template.fontFamily,
              color: 'rgba(255, 255, 255, 0.5)',
              fontSize: 22,
              margin: 0,
            }}
          >
            {channelHandle} • {subscriberCount} subscribers
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 20,
            marginTop: 10,
          }}
        >
          <button
            style={{
              transform: `scale(${buttonScale})`,
              background: buttonColor,
              color: buttonTextColor,
              fontFamily: template.fontFamily,
              border: 'none',
              borderRadius: 50,
              padding: '16px 48px',
              fontSize: 24,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: !isSubscribed ? '0 10px 25px rgba(239, 68, 68, 0.4)' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {buttonText}
          </button>

          <div
            style={{
              transform: `scale(${bellScale}) rotate(${bellRotation}deg)`,
              width: 62,
              height: 62,
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
              width="28"
              height="28"
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
      </div>
    </AbsoluteFill>
  );
};
