import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { VideoTheme } from '../types/index';

interface InterviewQuestionSceneProps {
  title: string;
  text?: string;
  interviewDifficulty?: 'easy' | 'medium' | 'hard';
  interviewCategory?: string;
  interviewAnswer?: string;
  template: VideoTheme;
  durationInFrames: number;
}

const DIFFICULTY_CONFIG = {
  easy: { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', label: 'EASY', icon: '🟢' },
  medium: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'MEDIUM', icon: '🟡' },
  hard: { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', label: 'HARD', icon: '🔴' },
};

export const InterviewQuestionScene: React.FC<InterviewQuestionSceneProps> = ({
  title,
  text = 'What is a closure in JavaScript?',
  interviewDifficulty = 'medium',
  interviewCategory = 'JavaScript',
  interviewAnswer = 'A closure is a function that has access to variables from its outer (enclosing) function scope, even after the outer function has returned.',
  template,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const difficulty = DIFFICULTY_CONFIG[interviewDifficulty] || DIFFICULTY_CONFIG.medium;

  // Entrance animation
  const entranceSpring = spring({ frame, fps, config: { damping: 15, stiffness: 100 } });
  const entranceY = interpolate(entranceSpring, [0, 1], [-40, 0]);

  // Category chip
  const categorySpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 14, stiffness: 120 },
  });

  // Question text typewriter
  const questionChars = Math.min(text.length, Math.floor(frame * 1.5));
  const displayedQuestion = text.slice(0, questionChars);

  // Answer reveal (at 60% of duration)
  const answerDelay = Math.floor(durationInFrames * 0.55);
  const isAnswerRevealed = frame >= answerDelay;

  const answerSpring = spring({
    frame: Math.max(0, frame - answerDelay),
    fps,
    config: { damping: 12, stiffness: 80 },
  });
  const answerY = interpolate(answerSpring, [0, 1], [40, 0]);
  const answerOpacity = interpolate(answerSpring, [0, 1], [0, 1]);

  const borderRadius =
    template.containerStyle === 'sharp' ? 0 : template.containerStyle === 'floating' ? 24 : 16;

  return (
    <AbsoluteFill
      style={{
        background: template.backgroundGradient || template.backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
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
            width: 600,
            height: 600,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${difficulty.color}18 0%, transparent 70%)`,
            filter: 'blur(80px)',
            top: '30%',
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
          gap: 20,
          zIndex: 1,
        }}
      >
        {/* Title badge */}
        <div
          style={{
            opacity: interpolate(entranceSpring, [0, 1], [0, 1]),
            transform: `translateY(${entranceY}px)`,
            padding: '8px 20px',
            borderRadius: 24,
            background: `${template.accentColor}18`,
            border: `1px solid ${template.accentColor}40`,
            color: template.accentColor,
            fontWeight: 800,
            fontSize: 14,
            textTransform: 'uppercase' as const,
            letterSpacing: '2px',
          }}
        >
          💼 {title || 'INTERVIEW QUESTION'}
        </div>

        {/* Difficulty + Category row */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'center',
            opacity: interpolate(categorySpring, [0, 1], [0, 1]),
            transform: `scale(${interpolate(categorySpring, [0, 1], [0.8, 1])})`,
          }}
        >
          {/* Difficulty badge */}
          <div
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              background: difficulty.bg,
              border: `1px solid ${difficulty.color}50`,
              color: difficulty.color,
              fontWeight: 800,
              fontSize: 13,
              letterSpacing: 1.5,
            }}
          >
            {difficulty.icon} {difficulty.label}
          </div>

          {/* Category pill */}
          {interviewCategory && (
            <div
              style={{
                padding: '6px 16px',
                borderRadius: 20,
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: 'rgba(255,255,255,0.7)',
                fontWeight: 600,
                fontSize: 13,
                letterSpacing: 0.5,
              }}
            >
              {interviewCategory}
            </div>
          )}
        </div>

        {/* Question card */}
        <div
          style={{
            width: '100%',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius,
            padding: '36px 32px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)',
            marginTop: 8,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: template.explanationFontSize ? template.explanationFontSize + 2 : 28,
              fontWeight: 700,
              color: template.explanationColor || template.textColor,
              lineHeight: 1.45,
              fontFamily: template.fontFamily,
              textShadow: template.glowEffect ? `0 0 15px ${template.textColor}15` : 'none',
            }}
          >
            {displayedQuestion}
            {questionChars < text.length && (
              <span
                style={{
                  display: 'inline-block',
                  width: 3,
                  height: 28,
                  background: template.accentColor,
                  marginLeft: 3,
                  animation: 'none',
                  opacity: frame % 30 > 15 ? 1 : 0.3,
                }}
              />
            )}
          </p>
        </div>

        {/* Answer card */}
        {isAnswerRevealed && (
          <div
            style={{
              width: '100%',
              transform: `translateY(${answerY}px)`,
              opacity: answerOpacity,
            }}
          >
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: `1px solid ${difficulty.color}40`,
                borderRadius,
                padding: '24px 28px',
                boxShadow: template.glowEffect
                  ? `0 0 30px ${difficulty.color}20`
                  : '0 8px 32px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 13,
                  color: difficulty.color,
                  textTransform: 'uppercase' as const,
                  letterSpacing: 1.5,
                  marginBottom: 10,
                }}
              >
                ✅ ANSWER
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: template.explanationFontSize || 19,
                  lineHeight: 1.55,
                  color: template.explanationColor || 'rgba(255, 255, 255, 0.88)',
                  fontFamily: template.fontFamily,
                }}
              >
                {interviewAnswer}
              </p>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default InterviewQuestionScene;
