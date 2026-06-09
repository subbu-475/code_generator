import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Audio,
  Img,
} from 'remotion';
import type { HookSceneProps } from '../types/index';
import { Caption } from './Caption';

/**
 * HookScene — full-screen attention-grabbing text for the video opener.
 *
 * Features:
 * - Large bold text with gradient or accent color
 * - Spring-based scale-up entrance (0.8 → 1.0)
 * - Opacity fade-in
 * - Subtle radial glow behind text
 * - Emoji support
 */
export const HookScene: React.FC<HookSceneProps> = ({
  title,
  template,
  durationInFrames,
  backendUrl,
  sfxWhoosh,
  hookBadge,
  hookBadgeStyle = 'heartbeat',
  hookCreatorName,
  hookCreatorHandle,
  hookCreatorAvatar,
  hookShowProgress,
  hookProgressStyle = 'bar',
  hookLayout = 'standard',
  hookImage,
  hookImageSize = 'medium',
  hookImageViewMode = 'contain',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const audioUrl = `${backendUrl || ''}/assets/sfx/whoosh.wav`;
  const playAudio = sfxWhoosh !== false;

  // Map hookImageSize to actual style properties
  let imgWidth = '85%';
  let imgMaxWidth = 680;
  let imgHeight = 360;

  if (hookImageSize === 'small') {
    imgWidth = '70%';
    imgMaxWidth = 520;
    imgHeight = 260;
  } else if (hookImageSize === 'large') {
    imgWidth = '95%';
    imgMaxWidth = 800;
    imgHeight = 460;
  }

  // Spring for smooth entrance
  const springValue = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 180,
      mass: 0.8,
      overshootClamping: false,
    },
  });

  const scale = interpolate(springValue, [0, 1], [0.8, 1]);
  const opacity = interpolate(springValue, [0, 1], [0, 1]);

  // Image spring entrance (slight delay)
  const imgSpringValue = spring({
    frame: frame - 8,
    fps,
    config: {
      damping: 12,
      stiffness: 150,
      mass: 0.9,
    },
  });
  const imgScale = interpolate(imgSpringValue, [0, 1], [0, 1], { extrapolateLeft: 'clamp' });

  // Subtle floating animation
  const floatY = Math.sin(frame * 0.05) * 6;
  const imgFloatY = Math.sin(frame * 0.04) * 8;

  // Glow pulse
  const glowOpacity = interpolate(
    Math.sin(frame * 0.08),
    [-1, 1],
    [0.3, 0.6],
  );

  // 1. Progress Visualizer calculations (significantly enlarged radius and stroke)
  const progress = durationInFrames > 0 ? frame / durationInFrames : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - progress * circumference;

  // 2. Attention Badge animation cycle calculations (increased scale bounds)
  const cycleFrame = frame % 30;
  let badgeScale = 1;
  let badgeRotate = 0;
  let badgeTranslateX = 0;
  let badgeTranslateY = 0;
  let badgeGlow = 'none';

  if (hookBadgeStyle === 'heartbeat') {
    if (cycleFrame < 4) {
      badgeScale = interpolate(cycleFrame, [0, 2, 4], [1, 1.25, 1]);
    } else if (cycleFrame < 8) {
      badgeScale = interpolate(cycleFrame, [4, 6, 8], [1, 1.15, 1]);
    }
  } else if (hookBadgeStyle === 'bounce') {
    badgeTranslateY = Math.sin(frame * 0.12) * 14;
  } else if (hookBadgeStyle === 'shake') {
    const shakeCycle = frame % 45;
    if (shakeCycle < 15) {
      badgeTranslateX = Math.sin(shakeCycle * 1.5) * 8;
      badgeRotate = Math.sin(shakeCycle * 1.5) * 5;
    }
  } else if (hookBadgeStyle === 'glow') {
    const glowRadius = interpolate(Math.sin(frame * 0.1), [-1, 1], [8, 28]);
    badgeGlow = `0 0 ${glowRadius}px ${template.accentColor}`;
  }

  // 3. Layout checks
  const isThumbnail = hookLayout === 'thumbnail';
  const isGlass = hookLayout === 'glassmorphic';

  return (
    <AbsoluteFill
      style={{
        background: template.backgroundGradient || template.backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 50,
      }}
    >
      {playAudio && <Audio src={audioUrl} volume={0.8} />}

      {/* Top Progress Bar (Thicker bar for better visibility) */}
      {hookShowProgress && hookProgressStyle === 'bar' && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: `${progress * 100}%`,
            height: 15,
            background: `linear-gradient(90deg, ${template.accentColor}, ${template.accentColor}dd)`,
            zIndex: 10,
            boxShadow: `0 0 16px ${template.accentColor}bb`,
          }}
        />
      )}

      {/* Circle Progress Ring (Enlarged size, thicker stroke, and larger font) */}
      {hookShowProgress && hookProgressStyle === 'ring' && (
        <div
          style={{
            position: 'absolute',
            top: 50,
            right: 50,
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0,0,0,0.45)',
            padding: 8,
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.08)',
            boxShadow: '0 8px 20px rgba(0,0,0,0.3)',
          }}
        >
          <svg width="100" height="100" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke="rgba(255,255,255,0.15)"
              strokeWidth="7"
              fill="none"
            />
            <circle
              cx="50"
              cy="50"
              r={radius}
              stroke={template.accentColor}
              strokeWidth="7"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.1s' }}
            />
          </svg>
          <span
            style={{
              position: 'absolute',
              fontFamily: template.fontFamily,
              fontSize: 20,
              fontWeight: 900,
              color: '#ffffff',
            }}
          >
            {Math.max(0, Math.ceil((durationInFrames - frame) / fps))}s
          </span>
        </div>
      )}

      {/* Attention Badge (Enlarged badge, bolder border, and larger text) */}
      {hookBadge && (
        <div
          style={{
            position: 'absolute',
            top: 130,
            transform: `scale(${badgeScale}) rotate(${badgeRotate}deg) translate(${badgeTranslateX}px, ${badgeTranslateY}px)`,
            zIndex: 5,
            textAlign: 'center',
          }}
        >
          <span
            style={{
              fontFamily: template.fontFamily,
              fontSize: 28,
              fontWeight: 900,
              textTransform: 'uppercase',
              color: '#ffffff',
              backgroundColor: template.accentColor,
              padding: '12px 36px',
              borderRadius: 50,
              letterSpacing: 3,
              boxShadow: badgeGlow !== 'none' ? badgeGlow : `0 10px 30px ${template.accentColor}50`,
              border: '3px solid rgba(255,255,255,0.3)',
              display: 'inline-block',
            }}
          >
            {hookBadge}
          </span>
        </div>
      )}

      {/* Background radial glow */}
      <div
        style={{
          position: 'absolute',
          width: 700,
          height: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${template.accentColor}${Math.round(glowOpacity * 255).toString(16).padStart(2, '0')} 0%, transparent 70%)`,
          filter: 'blur(100px)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Standard Layout Decorative Lines */}
      {hookLayout === 'standard' && (
        <div
          style={{
            position: 'absolute',
            top: 220,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: template.accentColor,
            opacity: opacity * 0.6,
          }}
        />
      )}

      {/* Main Layout & Content Wrapper */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 40,
          width: '100%',
          zIndex: 2,
          marginTop: hookBadge ? 60 : 0, // push content down if badge is present
        }}
      >
        {/* Title/Opener text section */}
        <div
          style={{
            transform: `scale(${scale}) translateY(${floatY}px)`,
            opacity,
            textAlign: 'center',
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          {isGlass ? (
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.025)',
                backdropFilter: 'blur(30px)',
                WebkitBackdropFilter: 'blur(30px)',
                border: `2px solid rgba(255, 255, 255, 0.1)`,
                borderRadius: 28,
                padding: '48px 40px',
                width: '90%',
                maxWidth: 800,
                boxShadow: `0 30px 60px rgba(0,0,0,0.4), 0 0 40px ${template.accentColor}20`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Caption
                text={title}
                template={template}
                durationInFrames={durationInFrames}
                fontSize={64}
              />
            </div>
          ) : isThumbnail ? (
            <div
              style={{
                border: `6px solid ${template.accentColor}`,
                boxShadow: `16px 16px 0px 0px ${template.accentColor}33`,
                background: '#0b0c10',
                borderRadius: 20,
                padding: '44px 32px',
                width: '90%',
                maxWidth: 800,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Caption
                text={title}
                template={{
                  ...template,
                  accentColor: '#ffff00', // yellow accent
                }}
                durationInFrames={durationInFrames}
                fontSize={64}
              />
            </div>
          ) : (
            <div>
              <Caption
                text={title}
                template={template}
                durationInFrames={durationInFrames}
                fontSize={76}
              />
              <div
                style={{
                  marginTop: 24,
                  height: 6,
                  width: interpolate(springValue, [0, 1], [0, 240]),
                  borderRadius: 3,
                  background: `linear-gradient(90deg, ${template.accentColor}, ${template.accentColor}80)`,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              />
            </div>
          )}
        </div>

        {/* Dynamic center graphics hookImage (High-Impact Audience Puller) */}
        {hookImage && (
          <div
            style={{
              transform: `scale(${imgScale}) translateY(${imgFloatY}px)`,
              opacity: imgScale,
              width: imgWidth,
              maxWidth: imgMaxWidth,
              height: imgHeight,
              borderRadius: 24,
              overflow: 'hidden',
              border: `3px solid ${template.accentColor}`,
              boxShadow: `0 20px 50px rgba(0,0,0,0.6), 0 0 35px ${template.accentColor}25`,
              background: 'rgba(0, 0, 0, 0.25)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Img
              src={hookImage}
              style={{
                width: '100%',
                height: '100%',
                objectFit: hookImageViewMode,
              }}
            />
          </div>
        )}
      </div>

      {/* Standard Layout bottom decorative line */}
      {hookLayout === 'standard' && !hookImage && (
        <div
          style={{
            position: 'absolute',
            bottom: 220,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 120,
            height: 5,
            borderRadius: 2.5,
            backgroundColor: template.accentColor,
            opacity: opacity * 0.6,
          }}
        />
      )}

      {/* Creator Profile Chip (Significantly enlarged and repositioned) */}
      {(hookCreatorName || hookCreatorHandle) && (
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 18,
            background: 'rgba(0,0,0,0.45)',
            backdropFilter: 'blur(25px)',
            WebkitBackdropFilter: 'blur(25px)',
            border: '2px solid rgba(255,255,255,0.12)',
            borderRadius: 60,
            padding: '12px 36px 12px 14px',
            boxShadow: '0 16px 45px rgba(0,0,0,0.4)',
            zIndex: 5,
          }}
        >
          {hookCreatorAvatar ? (
            <img
              src={hookCreatorAvatar}
              alt="Avatar"
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2.5px solid rgba(255,255,255,0.2)',
              }}
            />
          ) : (
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${template.accentColor}, ${template.accentColor}80)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 26,
                fontWeight: 900,
                color: '#ffffff',
                border: '2.5px solid rgba(255,255,255,0.2)',
              }}
            >
              {(hookCreatorName || hookCreatorHandle || 'C').charAt(0).toUpperCase()}
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {hookCreatorName && (
              <span
                style={{
                  fontFamily: template.fontFamily,
                  fontSize: 22,
                  fontWeight: 900,
                  color: '#ffffff',
                  lineHeight: '1.2',
                }}
              >
                {hookCreatorName}
              </span>
            )}
            {hookCreatorHandle && (
              <span
                style={{
                  fontFamily: template.fontFamily,
                  fontSize: 16,
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.65)',
                  lineHeight: '1.2',
                  marginTop: 3,
                }}
              >
                {hookCreatorHandle}
              </span>
            )}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
