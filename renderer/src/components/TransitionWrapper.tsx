import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import type { AnimationStyle } from '../types/index';
import type { AnimationResult } from '../types/index';
import { fadeAnimation } from '../animations/fade';
import { zoomAnimation } from '../animations/zoom';
import { slideAnimation } from '../animations/slide';
import { popAnimation } from '../animations/pop';
import { bounceAnimation } from '../animations/bounce';

interface TransitionWrapperProps {
  animation: AnimationStyle;
  children: React.ReactNode;
  durationInFrames: number;
}

/**
 * Look up the correct animation function for the given style.
 */
function getAnimationFn(
  style: AnimationStyle,
): (frame: number, totalFrames: number, fps: number) => AnimationResult {
  switch (style) {
    case 'fade':
      return fadeAnimation;
    case 'zoom':
      return zoomAnimation;
    case 'slide':
      return slideAnimation;
    case 'pop':
      return popAnimation;
    case 'bounce':
      return bounceAnimation;
    default:
      return fadeAnimation;
  }
}

/**
 * Generic wrapper that applies enter/exit animations to any child scene.
 */
export const TransitionWrapper: React.FC<TransitionWrapperProps> = ({
  animation,
  children,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const animFn = getAnimationFn(animation);
  const { opacity, transform } = animFn(frame, durationInFrames, fps);

  return (
    <AbsoluteFill
      style={{
        opacity,
        transform,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {children}
    </AbsoluteFill>
  );
};
