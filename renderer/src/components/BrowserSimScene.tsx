import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { VideoTheme } from '../types/index';
import { Caption } from './Caption';

interface BrowserSimSceneProps {
  title: string;
  text?: string;
  browserUrl?: string;
  browserSimState?: 'typing' | 'enter' | 'loading' | 'rendered';
  browserPageTitle?: string;
  template: VideoTheme;
  durationInFrames: number;
}

export const BrowserSimScene: React.FC<BrowserSimSceneProps> = ({
  title,
  text,
  browserUrl = 'google.com',
  browserSimState = 'typing',
  browserPageTitle = 'Google',
  template,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Color Palette (CodeWithSundresh)
  const bgDark = '#080B0A';
  const textWhite = '#F5F2E8';
  const accentGreen = '#78E08F';
  const brightLime = '#B8FF9C';

  // Window entrance: instantaneous visibility at frame 0 (No blank frames)
  const windowEntrance = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });

  // Typewriter effect for URL starts immediately at frame 2
  const typingStart = 2;
  const typingSpeed = 2; // fast kinetic typing (frames per char)
  const typedLength = Math.max(
    0,
    Math.min(browserUrl.length, Math.floor((frame - typingStart) / typingSpeed)),
  );
  const currentTypedUrl = browserUrl.slice(0, typedLength);

  // Blinking cursor
  const showCursor = Math.floor(frame / 10) % 2 === 0;

  // Enter key press animation (triggers after URL is typed, around frame 20 / 0.7s)
  const enterFrame = typingStart + browserUrl.length * typingSpeed + 4;
  const enterPressed = frame >= enterFrame;
  const enterSpring = spring({
    frame: Math.max(0, frame - enterFrame),
    fps,
    config: { damping: 12, stiffness: 160 },
  });
  const enterScale = enterPressed ? interpolate(enterSpring, [0, 0.5, 1], [1, 0.85, 1]) : 1;

  // Rendered payoff animation (if browserSimState is 'rendered')
  const isRenderedMode = browserSimState === 'rendered';
  const contentRevealSpring = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 14, stiffness: 90 },
  });

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgDark,
        backgroundImage: `radial-gradient(ellipse at 50% 30%, #0d1e14 0%, ${bgDark} 85%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '50px 30px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Subtle background tech grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `
            linear-gradient(rgba(120, 224, 143, 0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(120, 224, 143, 0.04) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          pointerEvents: 'none',
          opacity: 0.8,
        }}
      />

      {/* Top Header Tag */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          marginTop: 20,
          zIndex: 5,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 20,
            background: 'rgba(120, 224, 143, 0.12)',
            border: `1px solid rgba(120, 224, 143, 0.3)`,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: accentGreen, letterSpacing: '1px' }}>
            {isRenderedMode ? 'PAYOFF: 200 OK' : 'REAL-WORLD ACTION'}
          </span>
        </div>

        <h1
          style={{
            fontSize: 34,
            fontWeight: 800,
            color: textWhite,
            margin: 0,
            textAlign: 'center',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}
        >
          {title}
        </h1>
      </div>

      {/* Center Stage: Modern Floating Browser Window */}
      <div
        style={{
          width: '100%',
          maxWidth: 620,
          flex: 1,
          marginTop: 35,
          marginBottom: 20,
          borderRadius: 22,
          background: 'rgba(15, 23, 19, 0.95)',
          border: `2px solid rgba(120, 224, 143, 0.4)`,
          boxShadow: `0 20px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(120, 224, 143, 0.2)`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          zIndex: 4,
          transform: `scale(${interpolate(windowEntrance, [0, 1], [0.97, 1])})`,
          opacity: 1,
        }}
      >
        {/* Browser Top Chrome / Title Bar */}
        <div
          style={{
            height: 52,
            background: 'rgba(10, 15, 12, 0.98)',
            borderBottom: '1px solid rgba(120, 224, 143, 0.15)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 18px',
            gap: 12,
          }}
        >
          {/* macOS traffic light window dots */}
          <div style={{ display: 'flex', gap: 8 }}>
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FF5F56' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#FFBD2E' }} />
            <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#27C93F' }} />
          </div>

          {/* Active Tab */}
          <div
            style={{
              padding: '6px 16px',
              borderRadius: '8px 8px 0 0',
              background: 'rgba(20, 32, 26, 0.9)',
              border: '1px solid rgba(120, 224, 143, 0.2)',
              borderBottom: 'none',
              fontSize: 13,
              fontWeight: 600,
              color: textWhite,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>🌐</span>
            <span>{browserPageTitle}</span>
          </div>
        </div>

        {/* Address Bar Area */}
        <div
          style={{
            padding: '16px 20px',
            background: 'rgba(13, 20, 16, 0.95)',
            borderBottom: '1px solid rgba(120, 224, 143, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {/* Security Padlock Icon */}
          <div
            style={{
              fontSize: 16,
              color: accentGreen,
              display: 'flex',
              alignItems: 'center',
            }}
          >
            🔒
          </div>

          {/* URL Input Box */}
          <div
            style={{
              flex: 1,
              height: 44,
              borderRadius: 12,
              background: 'rgba(8, 12, 10, 0.8)',
              border: `1.5px solid ${enterPressed ? brightLime : 'rgba(120, 224, 143, 0.3)'}`,
              boxShadow: enterPressed ? `0 0 15px rgba(120, 224, 143, 0.4)` : 'none',
              display: 'flex',
              alignItems: 'center',
              padding: '0 16px',
              gap: 4,
              fontFamily: 'JetBrains Mono, monospace',
            }}
          >
            <span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.4)' }}>https://</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: textWhite }}>
              {isRenderedMode ? browserUrl : currentTypedUrl}
            </span>
            {!isRenderedMode && showCursor && (
              <span style={{ width: 2, height: 20, background: brightLime, display: 'inline-block' }} />
            )}
          </div>

          {/* Enter Button Simulation */}
          <div
            style={{
              padding: '8px 14px',
              borderRadius: 10,
              background: enterPressed ? accentGreen : 'rgba(255, 255, 255, 0.08)',
              color: enterPressed ? '#080B0A' : textWhite,
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: '1px',
              transform: `scale(${enterScale})`,
              boxShadow: enterPressed ? `0 0 20px ${brightLime}` : 'none',
              transition: 'background 0.2s',
            }}
          >
            ENTER ↵
          </div>
        </div>

        {/* Browser Page Body */}
        <div
          style={{
            flex: 1,
            background: 'rgba(8, 12, 10, 0.95)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 30,
            position: 'relative',
          }}
        >
          {isRenderedMode ? (
            /* Rendered Google Webpage Simulation */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 24,
                width: '100%',
                opacity: contentRevealSpring,
                transform: `scale(${interpolate(contentRevealSpring, [0, 1], [0.92, 1])})`,
              }}
            >
              {/* Google Stylized Logo */}
              <div
                style={{
                  fontSize: 48,
                  fontWeight: 900,
                  letterSpacing: '-1px',
                  display: 'flex',
                  gap: 2,
                }}
              >
                <span style={{ color: '#4285F4' }}>G</span>
                <span style={{ color: '#EA4335' }}>o</span>
                <span style={{ color: '#FBBC05' }}>o</span>
                <span style={{ color: '#4285F4' }}>g</span>
                <span style={{ color: '#34A853' }}>l</span>
                <span style={{ color: '#EA4335' }}>e</span>
              </div>

              {/* Mock Search Box */}
              <div
                style={{
                  width: '100%',
                  maxWidth: 420,
                  height: 48,
                  borderRadius: 24,
                  background: 'rgba(255, 255, 255, 0.06)',
                  border: '1px solid rgba(255, 255, 255, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0 20px',
                  gap: 12,
                }}
              >
                <span style={{ fontSize: 16 }}>🔍</span>
                <span style={{ fontSize: 14, color: 'rgba(255, 255, 255, 0.4)' }}>
                  Search Google or type a URL
                </span>
              </div>

              {/* Status Pill */}
              <div
                style={{
                  padding: '6px 14px',
                  borderRadius: 16,
                  background: 'rgba(120, 224, 143, 0.15)',
                  border: `1px solid ${accentGreen}`,
                  color: brightLime,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '1px',
                }}
              >
                HTTP 200 OK • DOM RENDERED ✓
              </div>
            </div>
          ) : (
            /* Typing / Transition Radar Screen */
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 16,
              }}
            >
              {enterPressed ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: '50%',
                      border: `3px solid ${accentGreen}`,
                      borderTopColor: 'transparent',
                      transform: `rotate(${frame * 15}deg)`,
                    }}
                  />
                  <span style={{ fontSize: 16, fontWeight: 700, color: brightLime }}>
                    INITIALIZING DNS LOOKUP...
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 36 }}>⌨️</span>
                  <span style={{ fontSize: 15, color: 'rgba(255, 255, 255, 0.5)' }}>
                    Type domain name and press Enter...
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Kinetic Caption */}
      {text && (
        <div style={{ width: '100%', maxWidth: 580, zIndex: 6 }}>
          <Caption
            text={text}
            template={template}
            durationInFrames={durationInFrames}
            fontSize={25}
            color={textWhite}
          />
        </div>
      )}
    </AbsoluteFill>
  );
};
