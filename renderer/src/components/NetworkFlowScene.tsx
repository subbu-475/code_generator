import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { VideoTheme, SceneConfig } from '../types/index';
import { Caption } from './Caption';

interface NetworkFlowSceneProps {
  title: string;
  text?: string;
  flowNodes?: SceneConfig['flowNodes'];
  flowActiveStep?: number;
  packetLabel?: string;
  telemetry?: SceneConfig['telemetry'];
  template: VideoTheme;
  durationInFrames: number;
}

export const NetworkFlowScene: React.FC<NetworkFlowSceneProps> = ({
  title,
  text,
  flowNodes = [
    { id: 'client', label: 'BROWSER', icon: '💻', status: 'done', detail: 'google.com' },
    { id: 'dns', label: 'DNS SERVER', icon: '🌐', status: 'active', detail: '8.8.8.8' },
    { id: 'server', label: 'WEB SERVER', icon: '⚡', status: 'pending', detail: '142.250.190.46' },
  ],
  flowActiveStep = 1,
  packetLabel = "What's the IP?",
  telemetry = { rtt: '14ms', protocol: 'UDP / 53', status: 'RESOLVING' },
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
  const warningRed = '#FF6B6B';
  const metricAmber = '#F4C95D';

  // Overall entrance spring
  const entrance = spring({ frame, fps, config: { damping: 14, stiffness: 120 } });

  // Packet animation progress: start immediately at frame 4 for instant kinetic movement
  const packetStart = 4;
  const packetEnd = Math.max(packetStart + 15, durationInFrames - 15);
  const packetProgress = interpolate(frame, [packetStart, packetEnd], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Impact ripple when packet arrives at target node
  const hasArrived = packetProgress >= 0.95;
  const arrivalSpring = spring({
    frame: Math.max(0, frame - packetEnd),
    fps,
    config: { damping: 10, stiffness: 140 },
  });
  const targetPulseScale = hasArrived ? interpolate(arrivalSpring, [0, 0.5, 1], [1, 1.08, 1]) : 1;

  // Node vertical positions in 720x1280 frame
  const totalNodes = flowNodes.length;
  const startY = 220;
  const nodeSpacing = Math.min(170, 680 / Math.max(1, totalNodes - 1));

  // Determine source and target node indices
  const sourceIndex = Math.max(0, Math.min(totalNodes - 1, flowActiveStep - 1));
  const targetIndex = Math.max(0, Math.min(totalNodes - 1, flowActiveStep));

  const sourceY = startY + sourceIndex * nodeSpacing;
  const targetY = startY + targetIndex * nodeSpacing;
  const packetCurrentY = interpolate(packetProgress, [0, 1], [sourceY + 36, targetY + 36]);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: bgDark,
        backgroundImage: `radial-gradient(ellipse at 50% 30%, #0d1e14 0%, ${bgDark} 85%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '40px 30px',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Subtle animated technical background grid */}
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

      {/* Top Section: Header & Step Tag */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 12,
          marginTop: 20,
          zIndex: 5,
          opacity: entrance,
          transform: `translateY(${interpolate(entrance, [0, 1], [-20, 0])}px)`,
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
            boxShadow: '0 0 15px rgba(120, 224, 143, 0.15)',
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: accentGreen,
              boxShadow: `0 0 8px ${brightLime}`,
            }}
          />
          <span
            style={{
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '1.5px',
              color: accentGreen,
              textTransform: 'uppercase',
            }}
          >
            {`STEP ${flowActiveStep} / ${totalNodes - 1}`}
          </span>
        </div>

        <h1
          style={{
            fontSize: 32,
            fontWeight: 800,
            color: textWhite,
            margin: 0,
            textAlign: 'center',
            letterSpacing: '-0.5px',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          }}
        >
          {title}
        </h1>
      </div>

      {/* Center Stage: Interactive Architecture Nodes & Animated Cable */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 580,
          flex: 1,
          marginTop: 20,
          zIndex: 4,
        }}
      >
        {/* SVG Connecting Cable */}
        <svg
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <defs>
            <linearGradient id="cableGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={accentGreen} stopOpacity="0.7" />
              <stop offset="100%" stopColor={brightLime} stopOpacity="0.9" />
            </linearGradient>
            <filter id="glowFilter">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background guide line */}
          <line
            x1="80"
            y1={startY + 36}
            x2="80"
            y2={startY + (totalNodes - 1) * nodeSpacing + 36}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth="3"
            strokeDasharray="6 6"
          />

          {/* Active connection line between source and target */}
          <line
            x1="80"
            y1={sourceY + 36}
            x2="80"
            y2={targetY + 36}
            stroke="url(#cableGlow)"
            strokeWidth="4"
            filter="url(#glowFilter)"
          />
        </svg>

        {/* Animated Data Packet */}
        {frame >= packetStart && (
          <div
            style={{
              position: 'absolute',
              left: 58,
              top: packetCurrentY - 18,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              zIndex: 10,
              transform: `scale(${interpolate(entrance, [0, 1], [0.5, 1])})`,
            }}
          >
            {/* Glowing Packet Bullet */}
            <div
              style={{
                width: 44,
                height: 36,
                borderRadius: 18,
                background: `linear-gradient(135deg, ${accentGreen}, ${brightLime})`,
                boxShadow: `0 0 20px ${brightLime}, 0 0 40px rgba(120, 224, 143, 0.8)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 18,
              }}
            >
              ⚡
            </div>

            {/* Packet Label Pill */}
            {packetLabel && (
              <div
                style={{
                  background: 'rgba(13, 27, 20, 0.95)',
                  border: `1px solid ${accentGreen}`,
                  boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
                  padding: '6px 14px',
                  borderRadius: 12,
                  whiteSpace: 'nowrap',
                }}
              >
                <span
                  style={{
                    fontSize: 14,
                    fontWeight: 700,
                    color: brightLime,
                    letterSpacing: '0.5px',
                  }}
                >
                  {packetLabel}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Render Node Cards */}
        {flowNodes.map((node, idx) => {
          const isSource = idx === sourceIndex;
          const isTarget = idx === targetIndex;
          const isPast = idx < sourceIndex;
          const isActive = isSource || isTarget;

          const cardY = startY + idx * nodeSpacing;
          const nodeScale = isTarget ? targetPulseScale : 1;

          return (
            <div
              key={node.id || idx}
              style={{
                position: 'absolute',
                left: 20,
                top: cardY,
                width: 'calc(100% - 40px)',
                height: 76,
                borderRadius: 18,
                background: isActive
                  ? 'linear-gradient(135deg, rgba(20, 42, 30, 0.85) 0%, rgba(10, 22, 16, 0.95) 100%)'
                  : 'rgba(18, 22, 20, 0.65)',
                border: isActive
                  ? `2px solid ${accentGreen}`
                  : '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: isActive
                  ? `0 8px 30px rgba(0, 0, 0, 0.6), 0 0 20px rgba(120, 224, 143, 0.25)`
                  : '0 4px 16px rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                alignItems: 'center',
                padding: '0 20px',
                gap: 16,
                transform: `scale(${nodeScale})`,
                transition: 'border 0.2s, box-shadow 0.2s',
              }}
            >
              {/* Icon Circle */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: isActive
                    ? `rgba(120, 224, 143, 0.18)`
                    : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${isActive ? accentGreen : 'rgba(255,255,255,0.1)'}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                }}
              >
                {node.icon || '📦'}
              </div>

              {/* Node Info */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span
                  style={{
                    fontSize: 16,
                    fontWeight: 800,
                    color: isActive ? textWhite : 'rgba(245, 242, 232, 0.6)',
                    letterSpacing: '0.8px',
                  }}
                >
                  {node.label}
                </span>
                {node.detail && (
                  <span
                    style={{
                      fontSize: 13,
                      fontFamily: 'JetBrains Mono, monospace',
                      color: isActive ? accentGreen : 'rgba(245, 242, 232, 0.4)',
                    }}
                  >
                    {node.detail}
                  </span>
                )}
              </div>

              {/* Status Badge */}
              <div
                style={{
                  padding: '4px 10px',
                  borderRadius: 8,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '1px',
                  background: (isTarget && hasArrived) || isPast
                    ? 'rgba(120, 224, 143, 0.2)'
                    : isActive
                      ? 'rgba(244, 201, 93, 0.2)'
                      : 'rgba(255, 255, 255, 0.05)',
                  color: (isTarget && hasArrived) || isPast
                    ? brightLime
                    : isActive
                      ? metricAmber
                      : 'rgba(255, 255, 255, 0.3)',
                  border: `1px solid ${(isTarget && hasArrived) || isPast ? accentGreen : 'transparent'}`,
                }}
              >
                {(isTarget && hasArrived) || isPast ? 'VERIFIED ✓' : isActive ? 'ACTIVE' : 'IDLE'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Telemetry HUD Panel */}
      {telemetry && (
        <div
          style={{
            width: '100%',
            maxWidth: 580,
            borderRadius: 14,
            background: 'rgba(12, 18, 15, 0.85)',
            border: '1px solid rgba(120, 224, 143, 0.2)',
            padding: '12px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            zIndex: 5,
            boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>SECURITY / LAYER</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: brightLime, fontFamily: 'monospace' }}>
              {telemetry.status === 'ENCRYPTED' ? 'TLS 1.3 AES-GCM' : (telemetry.protocol?.includes('UDP') ? 'L4 UDP / 53' : 'L7 APPLICATION')}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>PROTOCOL</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: textWhite, fontFamily: 'monospace' }}>
              {telemetry.protocol || 'TLS 1.3'}
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>STATUS</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: hasArrived ? accentGreen : metricAmber, fontFamily: 'monospace' }}>
              {hasArrived ? '200 OK' : (telemetry.status || 'CONNECTING')}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Kinetic Caption */}
      {text && (
        <div style={{ width: '100%', maxWidth: 580, zIndex: 6 }}>
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
