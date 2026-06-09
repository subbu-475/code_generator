import { interpolate, spring } from 'remotion';
import type { AnimationResult } from '../types/index';

const EXIT_FRAMES = 10;

/**
 * Bounce animation: spring-based translateY(-50px→0) on enter, translateY(0→30px) on exit.
 */
export function bounceAnimation(
  frame: number,
  totalFrames: number,
  fps: number,
): AnimationResult {
  const exitStart = totalFrames - EXIT_FRAMES;

  let opacity: number;
  let translateY: number;

  if (frame >= exitStart) {
    // Exit phase
    opacity = interpolate(frame, [exitStart, totalFrames], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    translateY = interpolate(frame, [exitStart, totalFrames], [0, 30], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  } else {
    // Enter with spring bounce
    const springValue = spring({
      frame,
      fps,
      config: {
        damping: 8,
        stiffness: 300,
        mass: 0.5,
        overshootClamping: false,
      },
    });

    translateY = interpolate(springValue, [0, 1], [-50, 0]);
    opacity = interpolate(springValue, [0, 0.3], [0, 1], {
      extrapolateRight: 'clamp',
    });
  }

  return {
    opacity,
    transform: `translateY(${translateY}px)`,
  };
}
