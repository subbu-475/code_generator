import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { VideoTheme } from '../types/index';
import { Caption } from './Caption';

interface ArchitectureOverviewSceneProps {
  title: string;
  text?: string;
  template: VideoTheme;
  durationInFrames: number;
}

export const ArchitectureOverviewScene: React.FC<ArchitectureOverviewSceneProps> = ({
  title,
  text,
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
  const metricAmber = '#F4C95D';

  const steps = [
    { label: 'USER INPUT', icon: '⌨️', badge: 'STEP 01' },
    { label: 'DNS RESOLUTION', icon: '🌐', badge: 'STEP 02' },
    { label: 'TCP/TLS HANDSHAKE', icon: '🔒', badge: 'STEP 03' },
    { label: 'WEB SERVER ROUTING', icon: '⚡', badge: 'STEP 04' },
    { label: 'DATABASE QUERY', icon: '🗄️', badge: 'STEP 05' },
    { label: 'DOM PARSE & RENDER', icon: '🎉', badge: 'STEP 06' },
  ];

  // Title entrance
  const titleEntrance = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });

  // Progressive illumination across the 6 steps
  const activeIndex = Math.min(
    steps.length - 1,
    Math.floor(interpolate(frame, [10, durationInFrames - 20], [0, steps.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    })),
  );

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
      {/* Background tech grid */}
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

      {/* Header Tag */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          marginTop: 20,
          zIndex: 5,
          opacity: titleEntrance,
          transform: `translateY(${interpolate(titleEntrance, [0, 1], [-20, 0])}px)`,
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
          <span style={{ fontSize: 13, fontWeight: 700, color: accentGreen, letterSpacing: '1.5px' }}>
            THE BIG TAKEAWAY
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

      {/* Main Flow Grid */}
      <div
        style={{
          width: '100%',
          maxWidth: 600,
          flex: 1,
          marginTop: 25,
          marginBottom: 15,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: 14,
          zIndex: 4,
        }}
      >
        {steps.map((step, idx) => {
          const isCurrent = idx === activeIndex;
          const isCompleted = idx < activeIndex;

          const stepSpring = spring({
            frame: Math.max(0, frame - (8 + idx * 4)),
            fps,
            config: { damping: 14, stiffness: 120 },
          });

          return (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 20px',
                borderRadius: 14,
                background: isCurrent
                  ? 'linear-gradient(90deg, rgba(20, 42, 30, 0.95), rgba(10, 22, 16, 0.95))'
                  : isCompleted
                    ? 'rgba(15, 25, 20, 0.7)'
                    : 'rgba(14, 18, 16, 0.5)',
                border: isCurrent
                  ? `2px solid ${accentGreen}`
                  : isCompleted
                    ? '1px solid rgba(120, 224, 143, 0.4)'
                    : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isCurrent ? `0 0 20px rgba(120, 224, 143, 0.3)` : 'none',
                transform: `scale(${interpolate(stepSpring, [0, 1], [0.85, 1])})`,
                opacity: stepSpring,
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <span style={{ fontSize: 24 }}>{step.icon}</span>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: isCurrent ? brightLime : isCompleted ? textWhite : 'rgba(245, 242, 232, 0.5)',
                    letterSpacing: '0.5px',
                  }}
                >
                  {step.label}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    color: isCurrent ? metricAmber : isCompleted ? accentGreen : 'rgba(255, 255, 255, 0.4)',
                    letterSpacing: '1px',
                  }}
                >
                  {step.badge}
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: isCompleted || isCurrent ? accentGreen : 'rgba(255,255,255,0.2)',
                  }}
                >
                  {isCompleted ? '✓' : isCurrent ? '⚡' : '○'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Summary Pill */}
      <div
        style={{
          width: '100%',
          maxWidth: 600,
          padding: '10px 18px',
          borderRadius: 14,
          background: 'rgba(120, 224, 143, 0.1)',
          border: `1px solid ${accentGreen}`,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 16,
          zIndex: 5,
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontWeight: 800,
            color: brightLime,
            letterSpacing: '1px',
            textAlign: 'center',
          }}
        >
          END-TO-END SYSTEM PIPELINE VERIFIED ⚡
        </span>
      </div>

      {/* Bottom Caption */}
      {text && (
        <div style={{ width: '100%', maxWidth: 600, zIndex: 6 }}>
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
