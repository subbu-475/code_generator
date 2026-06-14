import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { VideoTheme, ProgrammingLanguage } from '../types/index';

interface OneLinerSceneProps {
  title: string;
  onelinerCode?: string;
  onelinerLanguage?: ProgrammingLanguage;
  onelinerExplanation?: string;
  template: VideoTheme;
  durationInFrames: number;
}

export const OneLinerScene: React.FC<OneLinerSceneProps> = ({
  title,
  onelinerCode = 'const unique = [...new Set(arr)];',
  onelinerLanguage = 'javascript',
  onelinerExplanation = 'The Set constructor removes duplicates, and the spread operator converts it back to an array.',
  template,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Badge entrance
  const badgeSpring = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });

  // Code typewriter effect
  const typewriterProgress = Math.min(1, frame / (durationInFrames * 0.35));
  const visibleChars = Math.floor(typewriterProgress * onelinerCode.length);
  const displayedCode = onelinerCode.slice(0, visibleChars);
  const isTypingDone = visibleChars >= onelinerCode.length;

  // Code container entrance
  const codeSpring = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const codeScale = interpolate(codeSpring, [0, 1], [0.85, 1]);
  const codeOpacity = interpolate(codeSpring, [0, 1], [0, 1]);

  // Neon glow pulse when typing is done
  const glowPulse = isTypingDone ? Math.sin(frame * 0.1) * 0.3 + 0.7 : 0;

  // Explanation entrance
  const explanationDelay = Math.floor(durationInFrames * 0.5);
  const showExplanation = frame >= explanationDelay;
  const explainSpring = spring({
    frame: Math.max(0, frame - explanationDelay),
    fps,
    config: { damping: 12, stiffness: 80 },
  });
  const explainY = interpolate(explainSpring, [0, 1], [30, 0]);
  const explainOpacity = interpolate(explainSpring, [0, 1], [0, 1]);

  const borderRadius =
    template.containerStyle === 'sharp' ? 0 : template.containerStyle === 'floating' ? 24 : 16;

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
      {/* Background neon glow */}
      {template.glowEffect && (
        <div
          style={{
            position: 'absolute',
            width: 700,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${template.accentColor}${Math.round(glowPulse * 20 + 8).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
            filter: 'blur(100px)',
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
        }}
      >
        {/* Badge */}
        <div
          style={{
            opacity: interpolate(badgeSpring, [0, 1], [0, 1]),
            transform: `scale(${interpolate(badgeSpring, [0, 1], [0.7, 1])})`,
            padding: '10px 24px',
            borderRadius: 28,
            background: `linear-gradient(135deg, ${template.accentColor}25, #f59e0b20)`,
            border: `1.5px solid ${template.accentColor}60`,
            color: template.accentColor,
            fontWeight: 900,
            fontSize: 16,
            textTransform: 'uppercase' as const,
            letterSpacing: 2.5,
            textShadow: template.glowEffect ? `0 0 12px ${template.accentColor}40` : 'none',
          }}
        >
          ⚡ {title || 'ONE-LINE TRICK'}
        </div>

        {/* Language pill */}
        <div
          style={{
            padding: '5px 14px',
            borderRadius: 12,
            background: 'rgba(255,255,255,0.06)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'rgba(255,255,255,0.55)',
            fontWeight: 700,
            fontSize: 12,
            textTransform: 'uppercase' as const,
            letterSpacing: 1,
            fontFamily: 'monospace',
            opacity: interpolate(codeSpring, [0, 1], [0, 1]),
          }}
        >
          {onelinerLanguage}
        </div>

        {/* Code container — oversized and centered */}
        <div
          style={{
            width: '100%',
            transform: `scale(${codeScale})`,
            opacity: codeOpacity,
          }}
        >
          <div
            style={{
              background: 'rgba(0, 0, 0, 0.55)',
              border: `2px solid ${template.accentColor}${isTypingDone ? '80' : '30'}`,
              borderRadius,
              padding: '40px 36px',
              boxShadow: template.glowEffect && isTypingDone
                ? `0 0 ${40 + glowPulse * 20}px ${template.accentColor}30, inset 0 0 30px ${template.accentColor}08`
                : '0 12px 40px rgba(0,0,0,0.4)',
              backdropFilter: 'blur(16px)',
              textAlign: 'center' as const,
              position: 'relative' as const,
              overflow: 'hidden',
              transition: 'border-color 0.3s ease, box-shadow 0.5s ease',
            }}
          >
            <pre
              style={{
                margin: 0,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                fontSize: template.codeFontSize || template.fontSize || 24,
                lineHeight: 1.7,
                color: template.codeColor || '#e2e8f0',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
              }}
            >
              {displayedCode}
              {!isTypingDone && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 2.5,
                    height: (template.codeFontSize || template.fontSize || 24) + 2,
                    background: template.accentColor,
                    marginLeft: 2,
                    opacity: frame % 30 > 15 ? 1 : 0.2,
                    verticalAlign: 'middle',
                  }}
                />
              )}
            </pre>

            {/* Bottom neon line */}
            {isTypingDone && template.glowEffect && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: '10%',
                  width: '80%',
                  height: 2,
                  background: `linear-gradient(90deg, transparent, ${template.accentColor}, transparent)`,
                  boxShadow: `0 0 10px ${template.accentColor}`,
                  opacity: glowPulse,
                }}
              />
            )}
          </div>
        </div>

        {/* Explanation */}
        {showExplanation && onelinerExplanation && (
          <div
            style={{
              width: '100%',
              transform: `translateY(${explainY}px)`,
              opacity: explainOpacity,
            }}
          >
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.35)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                padding: '22px 26px',
                borderRadius,
                boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 12,
                  color: template.accentColor,
                  textTransform: 'uppercase' as const,
                  letterSpacing: 1.5,
                  marginBottom: 8,
                }}
              >
                💡 HOW IT WORKS
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: template.explanationFontSize || 18,
                  lineHeight: 1.55,
                  color: template.explanationColor || 'rgba(255, 255, 255, 0.82)',
                  fontFamily: template.fontFamily,
                }}
              >
                {onelinerExplanation}
              </p>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default OneLinerScene;
