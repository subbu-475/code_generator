import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { VideoTheme } from '../types/index';

interface RoadmapStepSceneProps {
  title: string;
  text?: string;
  roadmapStepNumber?: number;
  roadmapTotalSteps?: number;
  roadmapIcon?: string;
  roadmapDescription?: string;
  template: VideoTheme;
  durationInFrames: number;
}

export const RoadmapStepScene: React.FC<RoadmapStepSceneProps> = ({
  title,
  text,
  roadmapStepNumber = 1,
  roadmapTotalSteps = 5,
  roadmapIcon = '📚',
  roadmapDescription = 'Start learning the fundamentals',
  template,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Progress ring
  const progress = roadmapTotalSteps > 0 ? roadmapStepNumber / roadmapTotalSteps : 0;
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference * (1 - progress);

  // Entrance animation
  const entranceSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const entranceScale = interpolate(entranceSpring, [0, 1], [0.8, 1]);
  const entranceOpacity = interpolate(entranceSpring, [0, 1], [0, 1]);

  // Icon bounce
  const iconSpring = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 8, stiffness: 150 },
  });
  const iconScale = interpolate(iconSpring, [0, 1], [0, 1]);

  // Title slide in
  const titleSpring = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: { damping: 14, stiffness: 100 },
  });
  const titleX = interpolate(titleSpring, [0, 1], [40, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  // Description fade
  const descSpring = spring({
    frame: Math.max(0, frame - 28),
    fps,
    config: { damping: 14, stiffness: 80 },
  });
  const descY = interpolate(descSpring, [0, 1], [20, 0]);
  const descOpacity = interpolate(descSpring, [0, 1], [0, 1]);

  // Progress ring animation
  const ringSpring = spring({
    frame: Math.max(0, frame - 5),
    fps,
    config: { damping: 20, stiffness: 60 },
  });
  const animatedOffset = circumference - (circumference - strokeDashoffset) * ringSpring;

  // Subtle glow pulse
  const glowPulse = Math.sin(frame * 0.08) * 0.15 + 0.85;

  const borderRadius =
    template.containerStyle === 'sharp' ? 0 : template.containerStyle === 'floating' ? 24 : 16;

  // Generate step color based on progress
  const stepHue = 120 + (roadmapStepNumber - 1) * (200 / Math.max(1, roadmapTotalSteps - 1));
  const stepColor = `hsl(${stepHue % 360}, 70%, 55%)`;

  return (
    <AbsoluteFill
      style={{
        background: template.backgroundGradient || template.backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '50px 40px',
        fontFamily: template.fontFamily || 'Inter, sans-serif',
      }}
    >
      {/* Background glow */}
      {template.glowEffect && (
        <div
          style={{
            position: 'absolute',
            width: 500,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${template.accentColor}${Math.round(glowPulse * 18).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
            filter: 'blur(80px)',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      <div
        style={{
          width: '100%',
          maxWidth: 800,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          zIndex: 1,
          transform: `scale(${entranceScale})`,
          opacity: entranceOpacity,
        }}
      >
        {/* Step indicator with progress ring */}
        <div
          style={{
            position: 'relative',
            width: 100,
            height: 100,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {/* Progress ring SVG */}
          <svg
            width="100"
            height="100"
            viewBox="0 0 100 100"
            style={{
              position: 'absolute',
              transform: 'rotate(-90deg)',
            }}
          >
            {/* Background ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="4"
            />
            {/* Progress ring */}
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke={template.accentColor}
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={animatedOffset}
              style={{
                filter: template.glowEffect ? `drop-shadow(0 0 6px ${template.accentColor})` : 'none',
              }}
            />
          </svg>

          {/* Icon in center */}
          <div
            style={{
              transform: `scale(${iconScale})`,
              fontSize: 38,
              lineHeight: 1,
              zIndex: 1,
            }}
          >
            {roadmapIcon}
          </div>
        </div>

        {/* Step number label */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            opacity: interpolate(titleSpring, [0, 1], [0, 1]),
          }}
        >
          <div
            style={{
              padding: '5px 14px',
              borderRadius: 20,
              background: `${template.accentColor}18`,
              border: `1px solid ${template.accentColor}35`,
              color: template.accentColor,
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: 1.5,
            }}
          >
            STEP {roadmapStepNumber} OF {roadmapTotalSteps}
          </div>
        </div>

        {/* Title */}
        <h2
          style={{
            transform: `translateX(${titleX}px)`,
            opacity: titleOpacity,
            fontFamily: template.fontFamily,
            fontSize: template.explanationFontSize ? template.explanationFontSize + 10 : 36,
            fontWeight: 900,
            color: template.explanationColor || template.textColor,
            textAlign: 'center',
            margin: 0,
            lineHeight: 1.3,
            textShadow: template.glowEffect ? `0 0 20px ${template.textColor}15` : 'none',
          }}
        >
          {title || `Step ${roadmapStepNumber}`}
        </h2>

        {/* Description card */}
        <div
          style={{
            width: '100%',
            transform: `translateY(${descY}px)`,
            opacity: descOpacity,
          }}
        >
          <div
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius,
              padding: '28px 32px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
              backdropFilter: 'blur(12px)',
              textAlign: 'center' as const,
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: template.explanationFontSize || 22,
                lineHeight: 1.6,
                color: template.explanationColor || 'rgba(255, 255, 255, 0.82)',
                fontFamily: template.fontFamily,
              }}
            >
              {roadmapDescription || text || ''}
            </p>
          </div>
        </div>

        {/* Bottom timeline dots */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            opacity: interpolate(descSpring, [0, 1], [0, 0.7]),
          }}
        >
          {Array.from({ length: roadmapTotalSteps }, (_, i) => (
            <div
              key={i}
              style={{
                width: i + 1 === roadmapStepNumber ? 24 : 8,
                height: 8,
                borderRadius: 4,
                background: i + 1 <= roadmapStepNumber
                  ? template.accentColor
                  : 'rgba(255,255,255,0.15)',
                boxShadow: i + 1 === roadmapStepNumber && template.glowEffect
                  ? `0 0 8px ${template.accentColor}`
                  : 'none',
                transition: 'all 0.3s ease',
              }}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

export default RoadmapStepScene;
