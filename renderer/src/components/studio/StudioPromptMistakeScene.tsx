import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';

interface StudioPromptMistakeSceneProps {
  subtitle?: string;
  redCrossUrl?: string;
  durationInFrames: number;
}

export const StudioPromptMistakeScene: React.FC<StudioPromptMistakeSceneProps> = ({
  subtitle = `knows what you want, don't simply say "Build me an app". Instead, break it down...`,
  redCrossUrl = 'http://localhost:3001/assets/images/red_cross.png',
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring for the terminal window
  const terminalEntrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Red X spring entrance (delays slightly to highlight the bad prompt first)
  const redXSpring = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: { damping: 10, stiffness: 130, mass: 0.8 },
  });

  const redXScale = interpolate(redXSpring, [0, 1], [0, 1]);
  const redXOpacity = interpolate(redXSpring, [0, 1], [0, 1]);

  // Gentle studio idle bob
  const floatY = Math.sin(frame * 0.05) * 5;

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(ellipse at 50% 40%, #EDECE8 0%, #D8D8D2 100%)',
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
          top: 130,
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
        }}
      >
        {subtitle}
      </div>

      {/* 3D Dark Matte Studio Terminal */}
      <div
        style={{
          transform: `perspective(1200px) rotateX(3deg) rotateY(-1deg) scale(${terminalEntrance}) translateY(${floatY}px)`,
          opacity: terminalEntrance,
          width: 780,
          height: 780,
          borderRadius: 32,
          backgroundColor: '#181E1B',
          border: '3px solid rgba(255, 255, 255, 0.12)',
          boxShadow: `
            0 50px 100px -20px rgba(10, 20, 15, 0.5),
            0 25px 50px -10px rgba(0, 0, 0, 0.25)
          `,
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: '30px 36px',
        }}
      >
        {/* Window Top Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <div style={{ width: 15, height: 15, borderRadius: '50%', background: '#FF5F56' }} />
          <div style={{ width: 15, height: 15, borderRadius: '50%', background: '#FFBD2E' }} />
          <div style={{ width: 15, height: 15, borderRadius: '50%', background: '#27C93F' }} />
        </div>

        {/* Welcome Tag */}
        <div
          style={{
            alignSelf: 'flex-start',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 8,
            padding: '6px 14px',
            color: '#A0B5AA',
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 18,
            marginBottom: 24,
          }}
        >
          * Welcome to Claude Code
        </div>

        {/* Terminal Code Text */}
        <div
          style={{
            fontFamily: '"JetBrains Mono", "Courier New", monospace',
            fontSize: 24,
            lineHeight: 1.7,
            color: '#658877',
            flex: 1,
          }}
        >
          <div style={{ color: '#90B4A2', fontWeight: 600 }}>&gt; Think harder...</div>
          <div style={{ paddingLeft: 20 }}>
            <div>while (curious) &#123;</div>
            <div style={{ paddingLeft: 24, color: '#C0D8CC' }}>question_everything();</div>
            <div style={{ paddingLeft: 24, color: '#C0D8CC' }}>dig_deeper();</div>
            <div style={{ paddingLeft: 24, color: '#C0D8CC' }}>connect_dots(unexpected);</div>
            <div>&#125;</div>
            <div style={{ marginTop: 8 }}>if (stuck) &#123;</div>
            <div style={{ paddingLeft: 24, color: '#C0D8CC' }}>keep_thinking();</div>
            <div>&#125;</div>
          </div>
        </div>

        {/* Bottom Input Box ("Build me an app") */}
        <div
          style={{
            backgroundColor: '#D7E5DE',
            borderRadius: 16,
            padding: '20px 28px',
            boxShadow: 'inset 0 3px 6px rgba(0,0,0,0.15)',
            border: '1px solid rgba(255,255,255,0.4)',
            marginTop: 'auto',
          }}
        >
          <span
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 32,
              fontWeight: 800,
              color: '#1A3326',
              letterSpacing: '-0.5px',
            }}
          >
            Build me an app
          </span>
        </div>

        {/* 3D Red "X" Cross Stamp */}
        <div
          style={{
            position: 'absolute',
            bottom: 25,
            right: 40,
            transform: `scale(${redXScale}) rotate(-6deg)`,
            opacity: redXOpacity,
            width: 220,
            height: 220,
            pointerEvents: 'none',
            filter: 'drop-shadow(0 20px 30px rgba(0, 0, 0, 0.55))',
          }}
        >
          <Img
            src={redCrossUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};
