import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { VideoTheme, ProgrammingLanguage } from '../types/index';

interface GuessOutputSceneProps {
  title: string;
  guessCode?: string;
  guessLanguage?: ProgrammingLanguage;
  guessAnswer?: string;
  guessRevealDelay?: number;
  template: VideoTheme;
  durationInFrames: number;
}

export const GuessOutputScene: React.FC<GuessOutputSceneProps> = ({
  title,
  guessCode = 'console.log(typeof null);',
  guessLanguage = 'javascript',
  guessAnswer = '"object"',
  guessRevealDelay = 90,
  template,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Code block entrance
  const codeSpring = spring({ frame, fps, config: { damping: 15, stiffness: 100 } });
  const codeY = interpolate(codeSpring, [0, 1], [60, 0]);
  const codeOpacity = interpolate(codeSpring, [0, 1], [0, 1]);

  // Reveal state
  const isRevealed = frame >= guessRevealDelay;

  // Badge entrance
  const badgeSpring = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 12, stiffness: 120 },
  });

  // Answer reveal animation
  const revealSpring = spring({
    frame: Math.max(0, frame - guessRevealDelay),
    fps,
    config: { damping: 12, stiffness: 80 },
  });
  const answerScale = interpolate(revealSpring, [0, 1], [0.5, 1]);
  const answerOpacity = interpolate(revealSpring, [0, 1], [0, 1]);

  // Countdown progress
  const countdownProgress = Math.max(0, Math.min(1, (guessRevealDelay - frame) / guessRevealDelay));

  // Thinking dots animation
  const dotCount = Math.floor((frame % 60) / 20) + 1;
  const thinkingDots = '.'.repeat(dotCount);

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
            background: `radial-gradient(circle, ${
              isRevealed ? '#22c55e' : '#f59e0b'
            }18 0%, transparent 70%)`,
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
          gap: 24,
          zIndex: 1,
        }}
      >
        {/* Badge */}
        {title && (
          <div
            style={{
              opacity: interpolate(badgeSpring, [0, 1], [0, 1]),
              transform: `scale(${interpolate(badgeSpring, [0, 1], [0.8, 1])})`,
              padding: '8px 20px',
              borderRadius: 24,
              background: `linear-gradient(135deg, #f59e0b20, #ef444420)`,
              border: '1px solid #f59e0b50',
              color: '#f59e0b',
              fontWeight: 800,
              fontSize: 15,
              textTransform: 'uppercase' as const,
              letterSpacing: '2px',
            }}
          >
            🤔 {title}
          </div>
        )}

        {/* Question prompt */}
        <h2
          style={{
            fontFamily: template.fontFamily,
            fontSize: template.explanationFontSize ? template.explanationFontSize + 4 : 30,
            fontWeight: 800,
            color: template.explanationColor || template.textColor,
            textAlign: 'center',
            margin: '0 0 8px 0',
            lineHeight: 1.3,
            opacity: interpolate(codeSpring, [0, 1], [0, 1]),
          }}
        >
          What does this code output?
        </h2>

        {/* Code block */}
        <div
          style={{
            transform: `translateY(${codeY}px)`,
            opacity: codeOpacity,
            width: '100%',
            background: 'rgba(0, 0, 0, 0.5)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius,
            padding: '28px 32px',
            boxShadow: template.glowEffect
              ? `0 0 30px ${template.accentColor}20`
              : '0 8px 32px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)',
          }}
        >
          {/* Terminal header */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f56' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#27c93f' }} />
            <span
              style={{
                marginLeft: 12,
                fontSize: 11,
                color: 'rgba(255,255,255,0.4)',
                fontFamily: 'monospace',
                textTransform: 'uppercase' as const,
                letterSpacing: 1,
              }}
            >
              {guessLanguage}
            </span>
          </div>
          <pre
            style={{
              margin: 0,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: template.codeFontSize || template.fontSize || 22,
              lineHeight: 1.6,
              color: template.codeColor || '#e2e8f0',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {guessCode}
          </pre>
        </div>

        {/* Countdown timer */}
        {!isRevealed && (
          <div style={{ width: '100%' }}>
            <div
              style={{
                width: '100%',
                height: 6,
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 3,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${countdownProgress * 100}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, #f59e0b, #ef4444)`,
                  boxShadow: '0 0 12px #f59e0b80',
                  borderRadius: 3,
                }}
              />
            </div>
            <p
              style={{
                textAlign: 'center',
                color: 'rgba(255,255,255,0.5)',
                fontSize: 16,
                marginTop: 12,
                fontWeight: 600,
                fontFamily: template.fontFamily,
              }}
            >
              Think about it{thinkingDots}
            </p>
          </div>
        )}

        {/* Answer reveal */}
        {isRevealed && (
          <div
            style={{
              width: '100%',
              transform: `scale(${answerScale})`,
              opacity: answerOpacity,
            }}
          >
            <div
              style={{
                background: 'rgba(34, 197, 94, 0.1)',
                border: '2px solid #22c55e',
                borderRadius,
                padding: '28px 32px',
                boxShadow: template.glowEffect
                  ? '0 0 40px rgba(34, 197, 94, 0.25)'
                  : '0 8px 32px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(12px)',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 800,
                  color: '#22c55e',
                  textTransform: 'uppercase' as const,
                  letterSpacing: 2,
                  marginBottom: 12,
                }}
              >
                ✅ OUTPUT
              </div>
              <div
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: 32,
                  fontWeight: 800,
                  color: '#22c55e',
                  textShadow: template.glowEffect ? '0 0 20px rgba(34, 197, 94, 0.5)' : 'none',
                }}
              >
                {guessAnswer}
              </div>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default GuessOutputScene;
