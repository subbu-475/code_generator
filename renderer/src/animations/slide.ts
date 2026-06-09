import { interpolate } from 'remotion';
import type { AnimationResult } from '../types/index';

const ENTER_FRAMES = 15;
const EXIT_FRAMES = 10;

/**
 * Slide animation: translateY(100px)→0 on enter, translateY(0)→(-50px) on exit.
 */
export function slideAnimation(
  frame: number,
  totalFrames: number,
  _fps: number,
): AnimationResult {
  const exitStart = totalFrames - EXIT_FRAMES;

  let opacity: number;
  let translateY: number;

  if (frame < ENTER_FRAMES) {
    opacity = interpolate(frame, [0, ENTER_FRAMES], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    translateY = interpolate(frame, [0, ENTER_FRAMES], [100, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  } else if (frame >= exitStart) {
    opacity = interpolate(frame, [exitStart, totalFrames], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    translateY = interpolate(frame, [exitStart, totalFrames], [0, -50], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  } else {
    opacity = 1;
    translateY = 0;
  }

  return {
    opacity,
    transform: `translateY(${translateY}px)`,
  };
}
