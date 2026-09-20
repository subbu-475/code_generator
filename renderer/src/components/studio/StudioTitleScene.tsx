import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';

interface StudioTitleSceneProps {
  subtitle?: string;
  headerTop?: string;
  headerBottom?: string;
  promptText?: string;
  durationInFrames: number;
}

export const StudioTitleScene: React.FC<StudioTitleSceneProps> = ({
  subtitle = 'Claude Code Clearly Explained',
  headerTop = 'CLAUDE',
  headerBottom = 'CODE',
  promptText = '> Make me a meditation app',
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animation for the 3D card
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100, mass: 0.9 },
  });

  const scale = interpolate(entrance, [0, 1], [0.85, 1]);
  const opacity = interpolate(entrance, [0, 1], [0, 1]);
  const rotX = interpolate(entrance, [0, 1], [12, 3]);
  const rotY = interpolate(entrance, [0, 1], [-8, -2]);

  // Gentle studio idle floating bob
  const floatY = Math.sin(frame * 0.05) * 6;

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(ellipse at 50% 35%, #EDECE8 0%, #D8D8D0 100%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Top Studio Subtitle Pill */}
      <div
        style={{
          position: 'absolute',
          top: 130,
          background: 'rgba(28, 32, 30, 0.88)',
          backdropFilter: 'blur(16px)',
          color: '#F4F7F5',
          padding: '16px 36px',
          borderRadius: 40,
          fontSize: 30,
          fontWeight: 600,
          letterSpacing: '-0.5px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          maxWidth: '85%',
          textAlign: 'center',
        }}
      >
        {subtitle}
      </div>

      {/* Main 3D Sage Green Window Card */}
      <div
        style={{
          transform: `perspective(1200px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale}) translateY(${floatY}px)`,
          opacity,
          width: 780,
          height: 820,
          borderRadius: 36,
          backgroundColor: '#6A8E7E',
          border: '5px solid #82A797',
          boxShadow: `
            0 50px 100px -20px rgba(35, 55, 45, 0.45),
            0 25px 50px -10px rgba(0, 0, 0, 0.18),
            inset 0 2px 4px rgba(255, 255, 255, 0.3)
          `,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Top Window Bar with macOS-style pill dots */}
        <div
          style={{
            padding: '28px 36px 12px 36px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#547365' }} />
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#547365' }} />
          <div style={{ width: 16, height: 16, borderRadius: '50%', background: '#547365' }} />
        </div>

        {/* 3D Voxel / Block Text Header */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            lineHeight: 1.05,
            padding: '20px 0',
          }}
        >
          <span
            style={{
              fontSize: 110,
              fontWeight: 900,
              fontFamily: '"JetBrains Mono", "Courier New", monospace',
              color: '#F4F9F6',
              letterSpacing: 10,
              textShadow: `
                0 2px 0 #547365,
                0 4px 0 #466154,
                0 6px 0 #394F44,
                0 8px 0 #2D3E35,
                0 10px 0 #223029,
                0 18px 30px rgba(15, 30, 22, 0.45)
              `,
            }}
          >
            {headerTop}
          </span>
          <span
            style={{
              fontSize: 110,
              fontWeight: 900,
              fontFamily: '"JetBrains Mono", "Courier New", monospace',
              color: '#F4F9F6',
              letterSpacing: 10,
              textShadow: `
                0 2px 0 #547365,
                0 4px 0 #466154,
                0 6px 0 #394F44,
                0 8px 0 #2D3E35,
                0 10px 0 #223029,
                0 18px 30px rgba(15, 30, 22, 0.45)
              `,
            }}
          >
            {headerBottom}
          </span>
        </div>

        {/* Bottom Inset Drawer for Prompt */}
        <div
          style={{
            margin: '0 28px 28px 28px',
            backgroundColor: '#D9E8E0',
            borderRadius: 20,
            padding: '24px 32px',
            boxShadow: 'inset 0 4px 10px rgba(0,0,0,0.12), 0 2px 4px rgba(255,255,255,0.4)',
            border: '1px solid rgba(255,255,255,0.5)',
          }}
        >
          <span
            style={{
              fontFamily: 'Georgia, serif',
              fontStyle: 'italic',
              fontSize: 34,
              fontWeight: 700,
              color: '#1A3327',
              letterSpacing: '-0.3px',
              display: 'block',
            }}
          >
            {promptText}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
