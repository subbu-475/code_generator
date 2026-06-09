import React from 'react';
import { AbsoluteFill, Video, useCurrentFrame, useVideoConfig, interpolate, spring } from 'remotion';
import type { VideoTheme } from '../types/index';
import { Caption } from './Caption';

interface VideoSceneProps {
  title: string;
  text?: string;
  videoUrl?: string;
  template: VideoTheme;
  durationInFrames: number;
}

export const VideoScene: React.FC<VideoSceneProps> = ({
  title,
  text,
  videoUrl,
  template,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Entrance spring scaling/fade-in
  const entranceSpring = spring({
    frame,
    fps,
    config: {
      damping: 14,
      stiffness: 120,
      mass: 0.8,
    },
  });

  const scale = interpolate(entranceSpring, [0, 1], [0.85, 1]);
  const opacity = interpolate(entranceSpring, [0, 1], [0, 1]);

  // Subtle floating animation
  const floatY = Math.sin(frame * 0.05) * 6;

  // Custom border styling from the active design template
  const borderRadius = template.containerStyle === 'sharp' ? 0
    : template.containerStyle === 'floating' ? 24 : 16;

  // Standard sample fallback video if no video is uploaded
  const resolvedVideoUrl = videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4';

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
      {/* Glow effect behind the video player frame */}
      {template.glowEffect && (
        <div
          style={{
            position: 'absolute',
            width: 600,
            height: 500,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${template.accentColor}20 0%, transparent 70%)`,
            filter: 'blur(80px)',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
      )}

      {/* Main layout container */}
      <div
        style={{
          transform: `scale(${scale}) translateY(${floatY}px)`,
          opacity: opacity,
          width: '100%',
          maxWidth: 800,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 24,
          zIndex: 1,
        }}
      >
        {/* Title */}
        {title && (
          <h2
            style={{
              fontFamily: template.fontFamily,
              fontSize: 38,
              fontWeight: 800,
              color: template.textColor,
              textAlign: 'center',
              margin: 0,
              textShadow: template.glowEffect ? `0 0 15px ${template.accentColor}50` : 'none',
            }}
          >
            {title}
          </h2>
        )}

        {/* Video Player Frame */}
        <div
          style={{
            width: '100%',
            height: 450,
            borderRadius,
            overflow: 'hidden',
            border: `2px solid ${template.accentColor}40`,
            boxShadow: `0 16px 40px rgba(0,0,0,0.5)${template.glowEffect ? `, 0 0 25px ${template.accentColor}15` : ''}`,
            background: '#000000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
          }}
        >
          <Video
            src={resolvedVideoUrl}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            startFrom={0}
            volume={0.5} // slightly duck audio so overlay voiceovers take priority
          />
        </div>

        {/* Dynamic kinetic word captions */}
        {text && (
          <div style={{ width: '100%', marginTop: 8 }}>
            <Caption
              text={text}
              template={template}
              durationInFrames={durationInFrames}
              fontSize={24}
            />
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
export default VideoScene;
