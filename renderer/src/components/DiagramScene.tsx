// ============================================================
// Diagram Scene — Universal tech diagram & network flow component
// ============================================================

import React from 'react';
import { AbsoluteFill, useCurrentFrame, interpolate, spring } from 'remotion';
import type { VideoTheme } from '../types/index.js';
import { CaptionOverlay, type CaptionPhrase } from './CaptionOverlay.js';

export interface DiagramNode {
  id: string;
  label: string;
  icon?: string;
  status?: 'done' | 'active' | 'pending' | string;
  detail?: string;
  color?: string;
}

export interface TelemetryData {
  rtt?: string;
  protocol?: string;
  payload?: string;
  status?: string;
}

interface DiagramSceneProps {
  title: string;
  text?: string;
  flowNodes?: DiagramNode[];
  flowActiveStep?: number;
  packetLabel?: string;
  telemetry?: TelemetryData;
  captionPhrases?: CaptionPhrase[];
  template: VideoTheme;
  durationInFrames: number;
}

export const DiagramScene: React.FC<DiagramSceneProps> = ({
  title,
  text,
  flowNodes = [],
  flowActiveStep = 1,
  packetLabel = 'DATA PACKET',
  telemetry,
  captionPhrases,
  template,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();

  // Subtle continuous camera drift
  const cameraScale = interpolate(frame, [0, durationInFrames], [1, 1.05], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const nodes = flowNodes.length > 0
    ? flowNodes
    : [
        { id: 'client', label: 'CLIENT', icon: '📱', status: 'done', detail: 'Request' },
        { id: 'gateway', label: 'GATEWAY', icon: '⚡', status: 'active', detail: 'Routing' },
        { id: 'server', label: 'SERVER', icon: '🖥️', status: 'pending', detail: 'Response' },
      ];

  // Dynamic packet motion between active nodes
  const packetProgress = interpolate(
    (frame % 45),
    [0, 45],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );

  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#080B0A',
        backgroundImage: 'radial-gradient(ellipse at 50% 25%, #112318 0%, #080B0A 75%)',
        color: '#F5F2E8',
        fontFamily: 'Inter, sans-serif',
        overflow: 'hidden',
      }}
    >
      {/* Background Animated Tech Grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(120, 224, 143, 0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(120, 224, 143, 0.05) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
          opacity: 0.7,
        }}
      />

      {/* Main Diagram Area with Camera Drift */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '120px 48px 280px 48px',
          transform: `scale(${cameraScale})`,
          transformOrigin: '50% 40%',
        }}
      >
        {/* Top Telemetry HUD Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            background: 'rgba(20, 34, 26, 0.8)',
            border: '1.5px solid rgba(120, 224, 143, 0.4)',
            borderRadius: 30,
            padding: '10px 24px',
            marginBottom: 24,
            boxShadow: '0 0 20px rgba(120, 224, 143, 0.15)',
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#78E08F',
              boxShadow: '0 0 12px #78E08F',
            }}
          />
          <span
            style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 20,
              fontWeight: 700,
              color: '#78E08F',
              letterSpacing: '1px',
            }}
          >
            {telemetry?.protocol || 'SYSTEM FLOW'}
          </span>
          {telemetry?.status && (
            <span
              style={{
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 18,
                color: '#B8FF9C',
                background: 'rgba(184, 255, 156, 0.15)',
                padding: '4px 10px',
                borderRadius: 8,
              }}
            >
              {telemetry.status}
            </span>
          )}
        </div>

        {/* Scene Title */}
        <h2
          style={{
            fontSize: 44,
            fontWeight: 900,
            color: '#F5F2E8',
            textAlign: 'center',
            marginBottom: 48,
            letterSpacing: '-0.5px',
            textShadow: '0 4px 20px rgba(0,0,0,0.8)',
          }}
        >
          {title}
        </h2>

        {/* Flow Nodes Container (Vertical Stack for 9:16 layout) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 40,
            width: '100%',
            maxWidth: 720,
            position: 'relative',
          }}
        >
          {nodes.map((node, index) => {
            const isLast = index === nodes.length - 1;
            const nodeSpring = spring({
              frame: Math.max(0, frame - index * 6),
              fps: 30,
              config: { damping: 14, stiffness: 120 },
            });

            const isActive = node.status === 'active' || index === flowActiveStep;
            const isDone = node.status === 'done' || index < flowActiveStep;

            const borderColor = isActive
              ? '#78E08F'
              : isDone
              ? 'rgba(184, 255, 156, 0.4)'
              : 'rgba(255, 255, 255, 0.1)';

            const glow = isActive
              ? '0 0 35px rgba(120, 224, 143, 0.35), inset 0 0 20px rgba(120, 224, 143, 0.1)'
              : 'none';

            return (
              <React.Fragment key={node.id || index}>
                {/* Node Card */}
                <div
                  style={{
                    width: '100%',
                    background: isActive ? 'rgba(18, 35, 25, 0.9)' : 'rgba(14, 20, 17, 0.85)',
                    backdropFilter: 'blur(12px)',
                    border: `2px solid ${borderColor}`,
                    borderRadius: 20,
                    padding: '24px 32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    boxShadow: glow,
                    transform: `scale(${interpolate(nodeSpring, [0, 1], [0.85, 1])})`,
                    opacity: nodeSpring,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <span style={{ fontSize: 48 }}>{node.icon || '⚡'}</span>
                    <div>
                      <div
                        style={{
                          fontSize: 28,
                          fontWeight: 800,
                          color: isActive ? '#B8FF9C' : '#F5F2E8',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {node.label}
                      </div>
                      {node.detail && (
                        <div
                          style={{
                            fontFamily: 'JetBrains Mono, monospace',
                            fontSize: 19,
                            color: '#9EABB2',
                            marginTop: 4,
                          }}
                        >
                          {node.detail}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div
                    style={{
                      background: isActive
                        ? 'rgba(120, 224, 143, 0.2)'
                        : isDone
                        ? 'rgba(184, 255, 156, 0.1)'
                        : 'rgba(255, 255, 255, 0.05)',
                      border: `1px solid ${borderColor}`,
                      padding: '6px 14px',
                      borderRadius: 12,
                      fontSize: 16,
                      fontWeight: 700,
                      color: isActive ? '#78E08F' : isDone ? '#B8FF9C' : '#718096',
                      fontFamily: 'JetBrains Mono, monospace',
                    }}
                  >
                    {isActive ? '● ACTIVE' : isDone ? '✓ DONE' : 'WAITING'}
                  </div>
                </div>

                {/* Animated Connector Arrow with Glowing Packet */}
                {!isLast && (
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      position: 'relative',
                      height: 52,
                    }}
                  >
                    <div
                      style={{
                        width: 4,
                        height: '100%',
                        background: 'linear-gradient(to bottom, #78E08F, #B8FF9C)',
                        opacity: 0.4,
                      }}
                    />
                    {/* Traveling Glowing Packet */}
                    <div
                      style={{
                        position: 'absolute',
                        top: `${packetProgress * 100}%`,
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        backgroundColor: '#B8FF9C',
                        boxShadow: '0 0 16px #B8FF9C, 0 0 30px #78E08F',
                        transform: 'translateY(-50%)',
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Synchronized Kinetic Captions */}
      <CaptionOverlay
        text={text}
        phrases={captionPhrases}
        template={template}
        durationInFrames={durationInFrames}
        bottomOffset={160}
      />
    </AbsoluteFill>
  );
};
