import React from 'react';
import { useCurrentFrame } from 'remotion';
import type { VideoTheme } from '../types/index';

interface CaptionProps {
  text: string;
  template: VideoTheme;
  durationInFrames: number;
  fontSize?: number;
  color?: string;
}

export const Caption: React.FC<CaptionProps> = ({
  text,
  template,
  durationInFrames,
  fontSize = 54,
  color,
}) => {
  const frame = useCurrentFrame();
  const words = text ? text.trim().split(/\s+/) : [];

  if (words.length === 0) return null;

  const framesPerWord = durationInFrames / words.length;
  const activeWordIndex = Math.min(
    words.length - 1,
    Math.floor(frame / framesPerWord),
  );

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center',
        rowGap: 12,
        columnGap: 18,
        width: '100%',
        maxWidth: 900,
        margin: '0 auto',
        textAlign: 'center',
        padding: '0 20px',
      }}
    >
      {words.map((word, index) => {
        const isActive = index === activeWordIndex;
        
        return (
          <span
            key={index}
            style={{
              fontFamily: template.fontFamily,
              fontSize: fontSize,
              fontWeight: isActive ? 900 : 700,
              color: isActive ? template.accentColor : (color || template.textColor),
              opacity: isActive ? 1 : 0.4,
              transform: isActive ? 'scale(1.18)' : 'scale(1)',
              textShadow: isActive && template.glowEffect
                ? `0 0 30px ${template.accentColor}90, 0 0 60px ${template.accentColor}50`
                : 'none',
              transition: 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275), color 0.15s, opacity 0.15s',
              display: 'inline-block',
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
};
