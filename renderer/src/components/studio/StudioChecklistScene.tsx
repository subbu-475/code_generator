import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';

interface StudioChecklistSceneProps {
  subtitle?: string;
  asteriskUrl?: string;
  durationInFrames: number;
}

export const StudioChecklistScene: React.FC<StudioChecklistSceneProps> = ({
  subtitle = 'every single technical detail, trade-off, and edge case before writing code.',
  asteriskUrl = 'http://localhost:3001/assets/images/green_asterisk.png',
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animation for the folder card
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 95 },
  });

  // Staggered reveals for the checklist sections
  const check1 = spring({ frame: Math.max(0, frame - 10), fps, config: { damping: 12, stiffness: 100 } });
  const check2 = spring({ frame: Math.max(0, frame - 25), fps, config: { damping: 12, stiffness: 100 } });
  const check3 = spring({ frame: Math.max(0, frame - 40), fps, config: { damping: 12, stiffness: 100 } });

  // Floating 3D Asterisk rotation
  const asteriskRotate = frame * 0.75;
  const floatY = Math.sin(frame * 0.05) * 5;

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, #EDECE8 0%, #D7D7CF 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Top Subtitle Pill */}
      <div
        style={{
          position: 'absolute',
          top: 110,
          background: 'rgba(28, 32, 30, 0.88)',
          backdropFilter: 'blur(16px)',
          color: '#F4F7F5',
          padding: '16px 36px',
          borderRadius: 40,
          fontSize: 27,
          fontWeight: 600,
          letterSpacing: '-0.3px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          maxWidth: '85%',
          textAlign: 'center',
          lineHeight: 1.35,
          zIndex: 20,
        }}
      >
        {subtitle}
      </div>

      {/* Floating 3D Mint Green Asterisk Starburst */}
      <div
        style={{
          position: 'absolute',
          top: 235,
          width: 130,
          height: 130,
          transform: `rotate(${asteriskRotate}deg)`,
          filter: 'drop-shadow(0 15px 25px rgba(45, 85, 65, 0.35))',
          zIndex: 10,
        }}
      >
        <Img
          src={asteriskUrl}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
          }}
        />
      </div>

      {/* 3D Forest Green Tabbed Folder Card */}
      <div
        style={{
          transform: `perspective(1200px) rotateX(4deg) scale(${entrance}) translateY(${floatY + 80}px)`,
          opacity: entrance,
          width: 780,
          borderRadius: '20px 24px 32px 32px',
          backgroundColor: '#16281E',
          border: '3px solid #284736',
          boxShadow: `
            0 50px 100px -20px rgba(10, 25, 18, 0.55),
            0 25px 50px -10px rgba(0, 0, 0, 0.25)
          `,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Top Folder Tabs Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: '#0F1C15',
            padding: '12px 18px 0 18px',
            gap: 8,
            borderBottom: '2px solid #284736',
          }}
        >
          {/* Tab 1 */}
          <div
            style={{
              padding: '8px 16px',
              borderRadius: '8px 8px 0 0',
              border: '1px solid rgba(255,255,255,0.15)',
              borderBottom: 'none',
              color: '#7F9E8F',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            TECHNICAL DETAILS
          </div>

          {/* Tab 2 (Active Mint Tab) */}
          <div
            style={{
              padding: '10px 20px',
              borderRadius: '10px 10px 0 0',
              backgroundColor: '#86D1B6',
              color: '#12241A',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 15,
              fontWeight: 900,
              boxShadow: '0 -2px 8px rgba(134, 209, 182, 0.3)',
            }}
          >
            TRADE OFFS
          </div>

          {/* Tab 3 */}
          <div
            style={{
              padding: '8px 16px',
              borderRadius: '8px 8px 0 0',
              border: '1px solid rgba(255,255,255,0.15)',
              borderBottom: 'none',
              color: '#7F9E8F',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 14,
              fontWeight: 700,
            }}
          >
            EDGE CASES
          </div>
        </div>

        {/* Card Content - 3 Checklist Sections */}
        <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Item 1 */}
          <div style={{ opacity: check1, transform: `translateY(${interpolate(check1, [0, 1], [15, 0])}px)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 24, color: '#86D1B6' }}>☑</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#86D1B6' }}>Audio-Specific Edge Cases</span>
            </div>
            <div style={{ paddingLeft: 38, marginTop: 6, fontSize: 19, color: '#A0BDB0', lineHeight: 1.5 }}>
              Audio doesn't preload fully • Volume jumps suddenly • Loop point clicks
            </div>
          </div>

          {/* Item 2 */}
          <div style={{ opacity: check2, transform: `translateY(${interpolate(check2, [0, 1], [15, 0])}px)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 24, color: '#86D1B6' }}>☑</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#86D1B6' }}>Time &amp; Context Problems</span>
            </div>
            <div style={{ paddingLeft: 38, marginTop: 6, fontSize: 19, color: '#A0BDB0', lineHeight: 1.5 }}>
              User crosses time zones • Daylight saving shift • Meditates past midnight
            </div>
          </div>

          {/* Item 3 */}
          <div style={{ opacity: check3, transform: `translateY(${interpolate(check3, [0, 1], [15, 0])}px)` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span style={{ fontSize: 24, color: '#86D1B6' }}>☑</span>
              <span style={{ fontSize: 24, fontWeight: 800, color: '#86D1B6' }}>Life Interrupts the Session</span>
            </div>
            <div style={{ paddingLeft: 38, marginTop: 6, fontSize: 19, color: '#A0BDB0', lineHeight: 1.5 }}>
              Incoming phone call • Alarm goes off • Notification hijacks audio
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
