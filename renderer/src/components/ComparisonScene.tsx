import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { VideoTheme, ProgrammingLanguage } from '../types/index';

interface ComparisonSceneProps {
  title: string;
  comparisonLeftTitle?: string;
  comparisonRightTitle?: string;
  comparisonLeftCode?: string;
  comparisonRightCode?: string;
  comparisonLeftLanguage?: ProgrammingLanguage;
  comparisonRightLanguage?: ProgrammingLanguage;
  comparisonVerdict?: string;
  template: VideoTheme;
  durationInFrames: number;
}

export const ComparisonScene: React.FC<ComparisonSceneProps> = ({
  title,
  comparisonLeftTitle = 'Approach A',
  comparisonRightTitle = 'Approach B',
  comparisonLeftCode = '// First approach',
  comparisonRightCode = '// Second approach',
  comparisonLeftLanguage = 'javascript',
  comparisonRightLanguage = 'javascript',
  comparisonVerdict = '',
  template,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title entrance
  const titleSpring = spring({ frame, fps, config: { damping: 14, stiffness: 110 } });

  // Left panel slides from left
  const leftSpring = spring({
    frame: Math.max(0, frame - 12),
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const leftX = interpolate(leftSpring, [0, 1], [-80, 0]);
  const leftOpacity = interpolate(leftSpring, [0, 1], [0, 1]);

  // Right panel slides from right
  const rightSpring = spring({
    frame: Math.max(0, frame - 18),
    fps,
    config: { damping: 14, stiffness: 90 },
  });
  const rightX = interpolate(rightSpring, [0, 1], [80, 0]);
  const rightOpacity = interpolate(rightSpring, [0, 1], [0, 1]);

  // VS badge
  const vsSpring = spring({
    frame: Math.max(0, frame - 25),
    fps,
    config: { damping: 10, stiffness: 120 },
  });
  const vsScale = interpolate(vsSpring, [0, 1], [0, 1]);

  // VS fire pulse
  const vsPulse = Math.sin(frame * 0.12) * 0.15 + 1;

  // Verdict entrance
  const verdictDelay = Math.floor(durationInFrames * 0.65);
  const showVerdict = frame >= verdictDelay && comparisonVerdict;
  const verdictSpring = spring({
    frame: Math.max(0, frame - verdictDelay),
    fps,
    config: { damping: 12, stiffness: 80 },
  });
  const verdictY = interpolate(verdictSpring, [0, 1], [25, 0]);
  const verdictOpacity = interpolate(verdictSpring, [0, 1], [0, 1]);

  const borderRadius =
    template.containerStyle === 'sharp' ? 0 : template.containerStyle === 'floating' ? 20 : 12;

  const renderCodePanel = (
    panelTitle: string,
    code: string,
    language: string,
    color: string,
    x: number,
    opacity: number,
  ) => (
    <div
      style={{
        flex: 1,
        transform: `translateX(${x}px)`,
        opacity,
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
      }}
    >
      {/* Panel header */}
      <div
        style={{
          background: `${color}15`,
          border: `1px solid ${color}40`,
          borderBottom: 'none',
          borderRadius: `${borderRadius}px ${borderRadius}px 0 0`,
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span
          style={{
            fontWeight: 800,
            fontSize: 14,
            color: color,
            textTransform: 'uppercase' as const,
            letterSpacing: 1,
          }}
        >
          {panelTitle}
        </span>
        <span
          style={{
            fontSize: 10,
            color: 'rgba(255,255,255,0.35)',
            fontFamily: 'monospace',
            textTransform: 'uppercase' as const,
          }}
        >
          {language}
        </span>
      </div>

      {/* Code block */}
      <div
        style={{
          background: 'rgba(0, 0, 0, 0.5)',
          border: `1px solid ${color}25`,
          borderTop: 'none',
          borderRadius: `0 0 ${borderRadius}px ${borderRadius}px`,
          padding: '18px 16px',
          flex: 1,
          backdropFilter: 'blur(12px)',
          boxShadow: template.glowEffect ? `0 8px 25px ${color}15` : '0 8px 24px rgba(0,0,0,0.3)',
        }}
      >
        <pre
          style={{
            margin: 0,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            fontSize: template.codeFontSize || template.fontSize || 15,
            lineHeight: 1.65,
            color: template.codeColor || '#e2e8f0',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {code}
        </pre>
      </div>
    </div>
  );

  return (
    <AbsoluteFill
      style={{
        background: template.backgroundGradient || template.backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        alignItems: 'center',
        padding: '50px 30px',
        fontFamily: template.fontFamily || 'Inter, sans-serif',
      }}
    >
      {/* Background glow */}
      {template.glowEffect && (
        <>
          <div
            style={{
              position: 'absolute',
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #3b82f618 0%, transparent 70%)',
              filter: 'blur(80px)',
              top: '35%',
              left: '20%',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: 400,
              height: 400,
              borderRadius: '50%',
              background: 'radial-gradient(circle, #f59e0b18 0%, transparent 70%)',
              filter: 'blur(80px)',
              top: '35%',
              right: '20%',
              pointerEvents: 'none',
              zIndex: 0,
            }}
          />
        </>
      )}

      <div
        style={{
          width: '100%',
          maxWidth: 900,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          zIndex: 1,
        }}
      >
        {/* Title badge */}
        <div
          style={{
            opacity: interpolate(titleSpring, [0, 1], [0, 1]),
            transform: `scale(${interpolate(titleSpring, [0, 1], [0.8, 1])})`,
            padding: '8px 20px',
            borderRadius: 24,
            background: `${template.accentColor}18`,
            border: `1px solid ${template.accentColor}40`,
            color: template.accentColor,
            fontWeight: 800,
            fontSize: 14,
            textTransform: 'uppercase' as const,
            letterSpacing: 2,
          }}
        >
          ⚔️ {title || 'COMPARISON'}
        </div>

        {/* Side-by-side panels with VS badge */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            gap: 16,
            alignItems: 'stretch',
            position: 'relative',
          }}
        >
          {renderCodePanel(comparisonLeftTitle, comparisonLeftCode, comparisonLeftLanguage, '#3b82f6', leftX, leftOpacity)}

          {/* VS divider */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) scale(${vsScale * vsPulse})`,
              zIndex: 10,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #ef4444, #f59e0b)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                fontWeight: 900,
                fontSize: 18,
                color: '#fff',
                boxShadow: template.glowEffect
                  ? '0 0 25px rgba(239, 68, 68, 0.5), 0 0 50px rgba(245, 158, 11, 0.3)'
                  : '0 4px 16px rgba(0,0,0,0.5)',
                border: '2.5px solid rgba(255,255,255,0.3)',
                letterSpacing: 1,
              }}
            >
              VS
            </div>
          </div>

          {renderCodePanel(comparisonRightTitle, comparisonRightCode, comparisonRightLanguage, '#f59e0b', rightX, rightOpacity)}
        </div>

        {/* Verdict banner */}
        {showVerdict && (
          <div
            style={{
              width: '100%',
              transform: `translateY(${verdictY}px)`,
              opacity: verdictOpacity,
            }}
          >
            <div
              style={{
                background: 'rgba(0, 0, 0, 0.45)',
                border: `1px solid ${template.accentColor}30`,
                borderRadius,
                padding: '20px 24px',
                textAlign: 'center' as const,
                boxShadow: template.glowEffect
                  ? `0 0 25px ${template.accentColor}15`
                  : '0 8px 24px rgba(0,0,0,0.3)',
                backdropFilter: 'blur(12px)',
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
                ⚡ VERDICT
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: template.explanationFontSize || 20,
                  fontWeight: 700,
                  lineHeight: 1.5,
                  color: template.explanationColor || template.textColor,
                  fontFamily: template.fontFamily,
                }}
              >
                {comparisonVerdict}
              </p>
            </div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

export default ComparisonScene;
