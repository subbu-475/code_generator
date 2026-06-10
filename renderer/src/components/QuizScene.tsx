import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { VideoTheme } from '../types/index';

interface QuizSceneProps {
  title: string;
  quizQuestion?: string;
  quizOptions?: string[];
  quizCorrectIndex?: number;
  quizExplanation?: string;
  quizRevealDelay?: number;
  template: VideoTheme;
  durationInFrames: number;
}

export const QuizScene: React.FC<QuizSceneProps> = ({
  title,
  quizQuestion = 'What is the output of this code?',
  quizOptions = ['Option A', 'Option B', 'Option C', 'Option D'],
  quizCorrectIndex = 0,
  quizExplanation = 'This is because...',
  quizRevealDelay = 90,
  template,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // 1. Question entrance (Slide down + Fade in)
  const questionSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const questionY = interpolate(questionSpring, [0, 1], [-50, 0]);
  const questionOpacity = interpolate(questionSpring, [0, 1], [0, 1]);

  // 2. Reveal State
  const isRevealed = frame >= quizRevealDelay;

  // 3. Reveal animation (for green glow, checkmark, and explanation entrance)
  const revealSpring = spring({
    frame: Math.max(0, frame - quizRevealDelay),
    fps,
    config: { damping: 12, stiffness: 90 },
  });

  const explanationY = interpolate(revealSpring, [0, 1], [30, 0]);
  const explanationOpacity = interpolate(revealSpring, [0, 1], [0, 1]);

  // 4. Countdown progress (shrinks from 100% to 0% at quizRevealDelay)
  const countdownProgress = Math.max(
    0,
    Math.min(1, (quizRevealDelay - frame) / quizRevealDelay)
  );

  // Styling helpers
  const borderRadius =
    template.containerStyle === 'sharp'
      ? 0
      : template.containerStyle === 'floating'
      ? 24
      : 16;

  return (
    <AbsoluteFill
      style={{
        background: template.backgroundGradient || template.backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '60px 40px',
        fontFamily: template.fontFamily || 'Inter, sans-serif',
      }}
    >
      {/* Soft background glow */}
      {template.glowEffect && (
        <div
          style={{
            position: 'absolute',
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${
              isRevealed ? '#22c55e' : template.accentColor
            }15 0%, transparent 70%)`,
            filter: 'blur(100px)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            transition: 'background 0.5s ease',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}

      {/* Content wrapper */}
      <div
        style={{
          width: '100%',
          maxWidth: 800,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 28,
          zIndex: 1,
        }}
      >
        {/* Title / Badge */}
        {title && (
          <div
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              background: `${template.accentColor}20`,
              border: `1px solid ${template.accentColor}40`,
              color: template.accentColor,
              fontWeight: 700,
              fontSize: 16,
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
            }}
          >
            {title}
          </div>
        )}

        {/* Question Panel */}
        <div
          style={{
            transform: `translateY(${questionY}px)`,
            opacity: questionOpacity,
            width: '100%',
            textAlign: 'center',
          }}
        >
          <h2
            style={{
              fontFamily: template.fontFamily,
              fontSize: template.explanationFontSize ? template.explanationFontSize + 8 : 34,
              fontWeight: 800,
              color: template.explanationColor || template.textColor,
              margin: '10px 0 20px 0',
              lineHeight: 1.3,
              textShadow: template.glowEffect
                ? `0 0 20px ${template.textColor}20`
                : 'none',
            }}
          >
            {quizQuestion}
          </h2>
        </div>

        {/* Countdown Timer Line */}
        {!isRevealed && (
          <div
            style={{
              width: '100%',
              height: 6,
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 3,
              overflow: 'hidden',
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)',
            }}
          >
            <div
              style={{
                width: `${countdownProgress * 100}%`,
                height: '100%',
                background: `linear-gradient(90deg, ${template.accentColor}, #f43f5e)`,
                boxShadow: `0 0 10px ${template.accentColor}`,
              }}
            />
          </div>
        )}

        {/* Options list */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            marginTop: 10,
          }}
        >
          {quizOptions.map((option, idx) => {
            // Staggered spring animations for option cards
            const optionSpring = spring({
              frame: Math.max(0, frame - 15 - idx * 6),
              fps,
              config: { damping: 14, stiffness: 110 },
            });
            const optionX = interpolate(optionSpring, [0, 1], [-40, 0]);
            const optionOpacity = interpolate(optionSpring, [0, 1], [0, 1]);

            const isCorrect = idx === quizCorrectIndex;
            
            // Visual behavior when revealed
            let borderStyle = '1px solid rgba(255, 255, 255, 0.15)';
            let backgroundStyle = 'rgba(255, 255, 255, 0.05)';
            let textWeight = 500;
            let optionOpacityRevealed = optionOpacity;

            if (isRevealed) {
              if (isCorrect) {
                // Correct choice gets a green glowing border and background
                borderStyle = '2.5px solid #22c55e';
                backgroundStyle = 'rgba(34, 197, 94, 0.15)';
                textWeight = 700;
              } else {
                // Wrong choices are dimmed
                borderStyle = '1px solid rgba(255, 255, 255, 0.05)';
                backgroundStyle = 'rgba(255, 255, 255, 0.01)';
                optionOpacityRevealed = optionOpacity * 0.4;
              }
            }

            return (
              <div
                key={idx}
                style={{
                  transform: `translateX(${optionX}px)`,
                  opacity: optionOpacityRevealed,
                  display: 'flex',
                  alignItems: 'center',
                  padding: '20px 24px',
                  borderRadius,
                  background: backgroundStyle,
                  border: borderStyle,
                  boxShadow: isRevealed && isCorrect && template.glowEffect
                    ? '0 0 25px rgba(34, 197, 94, 0.35)'
                    : '0 8px 32px 0 rgba(0, 0, 0, 0.2)',
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Option letter badge */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: '50%',
                    background: isRevealed && isCorrect
                      ? '#22c55e'
                      : 'rgba(255, 255, 255, 0.1)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginRight: 18,
                    fontWeight: 700,
                    fontSize: 18,
                    color: isRevealed && isCorrect ? '#ffffff' : template.textColor,
                    transition: 'all 0.4s ease',
                  }}
                >
                  {String.fromCharCode(65 + idx)}
                </div>

                {/* Option text */}
                <span
                  style={{
                    fontSize: template.explanationFontSize || 22,
                    color: isRevealed && !isCorrect ? 'rgba(255,255,255,0.4)' : (template.explanationColor || template.textColor),
                    fontWeight: textWeight,
                    fontFamily: template.fontFamily,
                    transition: 'color 0.4s ease',
                  }}
                >
                  {option}
                </span>

                {/* Neon green glow border line for correct choice */}
                {isRevealed && isCorrect && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 24,
                      display: 'flex',
                      alignItems: 'center',
                      color: '#22c55e',
                    }}
                  >
                    <svg
                      width="28"
                      height="28"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Explanation Card */}
        {isRevealed && quizExplanation && (
          <div
            style={{
              transform: `translateY(${explanationY}px)`,
              opacity: explanationOpacity,
              width: '100%',
              marginTop: 12,
            }}
          >
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '24px 28px',
                borderRadius,
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: 16,
                  color: '#22c55e',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  marginBottom: 8,
                  fontFamily: template.fontFamily,
                }}
              >
                Explanation
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: template.explanationFontSize || 20,
                  lineHeight: 1.5,
                  color: template.explanationColor || 'rgba(255, 255, 255, 0.85)',
                  fontFamily: template.fontFamily,
                }}
              >
                {quizExplanation}
              </p>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default QuizScene;
