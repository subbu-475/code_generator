import { interpolate, spring } from 'remotion';
import type { AnimationResult } from '../types/index';

const EXIT_FRAMES = 10;

/**
 * Pop animation: spring-based scale 0→1.1→1 on enter, scale 1→0.8 on exit.
 */
export function popAnimation(
  frame: number,
  totalFrames: number,
  fps: number,
): AnimationResult {
  const exitStart = totalFrames - EXIT_FRAMES;

  let opacity: number;
  let scale: number;

  if (frame >= exitStart) {
    // Exit phase
    opacity = interpolate(frame, [exitStart, totalFrames], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    scale = interpolate(frame, [exitStart, totalFrames], [1, 0.8], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  } else {
    // Enter phase using spring for elastic pop
    const springValue = spring({
      frame,
      fps,
      config: {
        damping: 10,
        stiffness: 200,
        mass: 0.6,
        overshootClamping: false,
      },
    });

    scale = interpolate(springValue, [0, 1], [0, 1]);
    opacity = interpolate(springValue, [0, 0.3], [0, 1], {
      extrapolateRight: 'clamp',
    });
  }

  return {
    opacity,
    transform: `scale(${scale})`,
  };
}
