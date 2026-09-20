import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring, Img } from 'remotion';

interface StudioSliderSceneProps {
  subtitle?: string;
  robotMascotUrl?: string;
  durationInFrames: number;
}

export const StudioSliderScene: React.FC<StudioSliderSceneProps> = ({
  subtitle = 'instructions at around 50%. So, whenever you hit the 40 to 50% mark,',
  robotMascotUrl = 'http://localhost:3001/assets/images/robot_mascot.jpg',
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring animation for the track
  const entrance = spring({
    frame,
    fps,
    config: { damping: 14, stiffness: 100 },
  });

  // Slider animation: robot head slides smoothly to 50% mark
  const slideProgress = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 13, stiffness: 70 },
  });

  // Progress percentage (0% to 50%)
  const currentPercent = interpolate(slideProgress, [0, 1], [8, 50]);

  // Subtle floating idle bobbing
  const floatY = Math.sin(frame * 0.08) * 6;

  return (
    <AbsoluteFill
      style={{
        background: 'radial-gradient(ellipse at 50% 45%, #ECECE7 0%, #D7D7D1 100%)',
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
          fontSize: 28,
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

      {/* Main 3D Slider Container */}
      <div
        style={{
          width: 840,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          transform: `translateY(${floatY}px) scale(${entrance})`,
          opacity: entrance,
        }}
      >
        {/* The Track */}
        <div
          style={{
            width: '100%',
            height: 52,
            borderRadius: 26,
            background: `linear-gradient(90deg, #A2DEC8 0%, #68C7A9 ${currentPercent}%, #2C3531 ${currentPercent}%, #1E2522 100%)`,
            border: '3px solid rgba(255, 255, 255, 0.6)',
            boxShadow: `
              0 30px 60px -15px rgba(25, 40, 32, 0.28),
              inset 0 4px 10px rgba(0, 0, 0, 0.35)
            `,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* 3D Robot Mascot Knob */}
          <div
            style={{
              position: 'absolute',
              left: `${currentPercent}%`,
              transform: 'translate(-50%, 0)',
              width: 140,
              height: 140,
              borderRadius: '50%',
              backgroundColor: '#FFFFFF',
              boxShadow: `
                0 20px 40px rgba(0, 0, 0, 0.35),
                0 0 30px rgba(104, 199, 169, 0.6),
                inset 0 2px 4px rgba(255, 255, 255, 0.8)
              `,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
              border: '4px solid #FFFFFF',
              zIndex: 10,
            }}
          >
            <Img
              src={robotMascotUrl}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        </div>

        {/* Labels below and on the track */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginTop: 28,
            position: 'relative',
          }}
        >
          {/* 100K Label under the 50% midpoint */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              textAlign: 'center',
            }}
          >
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 42,
                fontWeight: 900,
                color: '#214234',
                letterSpacing: 2,
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                display: 'block',
              }}
            >
              100K
            </span>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: '#527768',
                letterSpacing: 1,
                textTransform: 'uppercase',
              }}
            >
              Safe Context Limit
            </span>
          </div>

          {/* 200K Label at the end */}
          <div
            style={{
              position: 'absolute',
              right: 0,
              textAlign: 'right',
            }}
          >
            <span
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: 36,
                fontWeight: 800,
                color: '#65907E',
                letterSpacing: 2,
                display: 'block',
              }}
            >
              200K
            </span>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#839E92',
                letterSpacing: 1,
              }}
            >
              Max Limit
            </span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
