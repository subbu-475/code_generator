import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { VideoTheme, ProgrammingLanguage } from '../types/index';

interface BugFixSceneProps {
  title: string;
  buggyCode?: string;
  fixedCode?: string;
  bugLanguage?: ProgrammingLanguage;
  bugExplanation?: string;
  template: VideoTheme;
  durationInFrames: number;
}

export const BugFixScene: React.FC<BugFixSceneProps> = ({
  title,
  buggyCode = '// Buggy code here',
  fixedCode = '// Fixed code here',
  bugLanguage = 'javascript',
  bugExplanation = 'The bug was caused by...',
  template,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phase timing
  const fixRevealFrame = Math.floor(durationInFrames * 0.5);
  const explanationRevealFrame = Math.floor(durationInFrames * 0.7);
  const showingBuggy = frame < fixRevealFrame;
  const showingFix = frame >= fixRevealFrame;
  const showingExplanation = frame >= explanationRevealFrame;

  // Buggy code entrance
  const buggySpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const buggyY = interpolate(buggySpring, [0, 1], [50, 0]);
  const buggyOpacity = interpolate(buggySpring, [0, 1], [0, 1]);

  // Fix reveal
  const fixSpring = spring({
    frame: Math.max(0, frame - fixRevealFrame),
    fps,
    config: { damping: 12, stiffness: 90 },
  });
  const fixScale = interpolate(fixSpring, [0, 1], [0.9, 1]);
  const fixOpacity = interpolate(fixSpring, [0, 1], [0, 1]);

  // Explanation
  const explainSpring = spring({
    frame: Math.max(0, frame - explanationRevealFrame),
    fps,
    config: { damping: 12, stiffness: 80 },
  });
  const explainY = interpolate(explainSpring, [0, 1], [30, 0]);
  const explainOpacity = interpolate(explainSpring, [0, 1], [0, 1]);

  // Bug pulse animation
  const bugPulse = Math.sin(frame * 0.15) * 0.3 + 0.7;

  const borderRadius =
    template.containerStyle === 'sharp' ? 0 : template.containerStyle === 'floating' ? 24 : 16;

  const renderCodeBlock = (
    code: string,
    isBuggy: boolean,
    y: number,
    opacity: number,
    scale?: number,
  ) => {
    const borderColor = isBuggy ? '#ef4444' : '#22c55e';
    const labelColor = isBuggy ? '#ef4444' : '#22c55e';
    const labelText = isBuggy ? '🐛 BUGGY CODE' : '✅ FIXED CODE';
    const bgTint = isBuggy ? 'rgba(239, 68, 68, 0.05)' : 'rgba(34, 197, 94, 0.05)';

    return (
      <div
        style={{
          width: '100%',
          transform: `translateY(${y}px)${scale ? ` scale(${scale})` : ''}`,
          opacity,
        }}
      >
        <div
          style={{
            background: bgTint,
            border: `2px solid ${borderColor}${isBuggy && showingBuggy ? Math.round(bugPulse * 255).toString(16).padStart(2, '0') : ''}`,
            borderRadius,
            padding: '20px 24px',
            boxShadow: template.glowEffect
              ? `0 0 ${isBuggy ? 25 : 35}px ${borderColor}${isBuggy ? '30' : '25'}`
              : '0 8px 28px rgba(0,0,0,0.3)',
            backdropFilter: 'blur(12px)',
            position: 'relative' as const,
            overflow: 'hidden',
          }}
        >
          {/* Label */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
              borderBottom: '1px solid rgba(255,255,255,0.06)',
              paddingBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 13,
                fontWeight: 800,
                color: labelColor,
                textTransform: 'uppercase' as const,
                letterSpacing: 1.5,
              }}
            >
              {labelText}
            </span>
            <span
              style={{
                fontSize: 11,
                color: 'rgba(255,255,255,0.35)',
                fontFamily: 'monospace',
                textTransform: 'uppercase' as const,
              }}
            >
              {bugLanguage}
            </span>
          </div>

          {/* Code */}
          <pre
            style={{
              margin: 0,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              fontSize: template.codeFontSize || 18,
              lineHeight: 1.7,
              color: template.codeColor || '#e2e8f0',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {code}
          </pre>

          {/* Red danger stripe for buggy code */}
          {isBuggy && showingBuggy && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 4,
                height: '100%',
                background: `linear-gradient(180deg, #ef4444, #dc2626)`,
                boxShadow: '0 0 8px #ef4444',
              }}
            />
          )}
        </div>
      </div>
    );
  };

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
            background: `radial-gradient(circle, ${showingFix ? '#22c55e' : '#ef4444'}15 0%, transparent 70%)`,
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
          gap: 20,
          zIndex: 1,
        }}
      >
        {/* Title badge */}
        <div
          style={{
            padding: '8px 20px',
            borderRadius: 24,
            background: showingFix ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)',
            border: `1px solid ${showingFix ? '#22c55e' : '#ef4444'}50`,
            color: showingFix ? '#22c55e' : '#ef4444',
            fontWeight: 800,
            fontSize: 15,
            textTransform: 'uppercase' as const,
            letterSpacing: 2,
            opacity: interpolate(buggySpring, [0, 1], [0, 1]),
          }}
        >
          {showingFix ? '✅ ' : '🐛 '}{title || 'SPOT THE BUG'}
        </div>

        {/* Buggy code block */}
        {showingBuggy && renderCodeBlock(buggyCode, true, buggyY, buggyOpacity)}

        {/* Fixed code block */}
        {showingFix && renderCodeBlock(fixedCode, false, 0, fixOpacity, fixScale)}

        {/* Explanation card */}
        {showingExplanation && bugExplanation && (
          <div
            style={{
              width: '100%',
              transform: `translateY(${explainY}px)`,
              opacity: explainOpacity,
            }}
          >
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                padding: '22px 26px',
                borderRadius,
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div
                style={{
                  fontWeight: 800,
                  fontSize: 13,
                  color: '#22c55e',
                  textTransform: 'uppercase' as const,
                  letterSpacing: 1.5,
                  marginBottom: 8,
                }}
              >
                💡 FIX EXPLANATION
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: template.explanationFontSize || 18,
                  lineHeight: 1.55,
                  color: template.explanationColor || 'rgba(255, 255, 255, 0.85)',
                  fontFamily: template.fontFamily,
                }}
              >
                {bugExplanation}
              </p>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default BugFixScene;
