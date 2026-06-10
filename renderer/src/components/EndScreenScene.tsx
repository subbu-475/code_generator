import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from 'remotion';
import type { VideoTheme } from '../types/index';

export interface EndScreenSceneProps {
  title?: string;
  imageUrl?: string;
  socials?: Array<{ platform: string; handle: string }>;
  template: VideoTheme;
  durationInFrames: number;
}

export const EndScreenScene: React.FC<EndScreenSceneProps> = ({
  title = 'Thanks for watching!',
  socials = [
    { platform: 'github', handle: 'username' },
    { platform: 'twitter', handle: 'username' },
  ],
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
      damping: 15,
      stiffness: 100,
    },
  });

  const cardY = interpolate(entranceSpring, [0, 1], [150, 0]);
  const cardOpacity = interpolate(entranceSpring, [0, 1], [0, 1]);

  const getSocialIcon = (platform: string) => {
    const fill = template.accentColor;
    switch (platform.toLowerCase()) {
      case 'github':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill={fill}>
            <path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
          </svg>
        );
      case 'twitter':
      case 'x':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill={fill}>
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      case 'youtube':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill={fill}>
            <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.108C19.53 3.5 12 3.5 12 3.5s-7.53 0-9.388.555A3.003 3.003 0 0 0 .502 6.163C0 8.07 0 12 0 12s0 3.93.502 5.837a3.003 3.003 0 0 0 2.11 2.108C4.47 20.5 12 20.5 12 20.5s7.53 0 9.388-.555a3.003 3.003 0 0 0 2.11-2.108C24 15.93 24 12 24 12s0-3.93-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      default:
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill={fill}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
        );
    }
  };

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
          transform: `translateY(${cardY}px)`,
          opacity: cardOpacity,
          width: 800,
          background: 'rgba(255, 255, 255, 0.03)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 24,
          padding: '64px 48px',
          boxShadow: '0 30px 60px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 40,
          zIndex: 1,
        }}
      >
        <div style={{ position: 'relative', width: 90, height: 90 }}>
          {imageUrl ? (
            <img
              src={imageUrl}
              alt="Logo"
              style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                objectFit: 'cover',
                boxShadow: `0 0 30px ${template.accentColor}50`,
                zIndex: 2,
                position: 'relative',
                border: '2px solid rgba(255, 255, 255, 0.1)',
              }}
            />
          ) : (
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${template.accentColor}, ${template.accentColor}80)`,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                boxShadow: `0 0 30px ${template.accentColor}50`,
                zIndex: 2,
                position: 'relative',
              }}
            >
              <svg width="40" height="40" viewBox="0 0 24 24" fill="#ffffff">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: 90,
              height: 90,
              borderRadius: '50%',
              border: `2px solid ${template.accentColor}`,
              opacity: interpolate(frame % 30, [0, 30], [0.5, 0]),
              transform: `scale(${interpolate(frame % 30, [0, 30], [1, 1.5])})`,
            }}
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <h2
            style={{
              fontFamily: template.fontFamily,
              color: template.ctaColor || template.textColor,
              fontSize: template.ctaFontSize || 42,
              fontWeight: 900,
              margin: '0 0 16px 0',
              letterSpacing: -1,
            }}
          >
            {title}
          </h2>
          <p
            style={{
              fontFamily: template.fontFamily,
              color: template.explanationColor || 'rgba(255, 255, 255, 0.4)',
              fontSize: template.explanationFontSize ? Math.min(template.explanationFontSize, 20) : 20,
              margin: 0,
            }}
          >
            Follow for more bite-sized coding tutorials!
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            width: '100%',
            maxWidth: 450,
            marginTop: 10,
          }}
        >
          {socials.map((soc, index) => {
            const itemSpring = spring({
              frame: frame - (15 + index * 8),
              fps,
              config: {
                damping: 12,
                stiffness: 120,
              },
            });

            const slideX = interpolate(itemSpring, [0, 1], [-100, 0]);
            const itemOpacity = interpolate(itemSpring, [0, 1], [0, 1]);

            return (
              <div
                key={index}
                style={{
                  transform: `translateX(${slideX}px)`,
                  opacity: itemOpacity,
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: 14,
                  padding: '14px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                {getSocialIcon(soc.platform)}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span
                    style={{
                      fontFamily: template.fontFamily,
                      color: template.explanationColor || 'rgba(255, 255, 255, 0.3)',
                      fontSize: 12,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                    }}
                  >
                    {soc.platform}
                  </span>
                  <span
                    style={{
                      fontFamily: template.fontFamily,
                      color: template.ctaColor || template.textColor,
                      fontSize: template.ctaFontSize ? Math.min(template.ctaFontSize, 20) : 20,
                      fontWeight: 600,
                    }}
                  >
                    {soc.handle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
