import { interpolate } from 'remotion';
import type { AnimationResult } from '../types/index';

const ENTER_FRAMES = 15;
const EXIT_FRAMES = 10;

/**
 * Fade animation: simple opacity transition in/out.
 */
export function fadeAnimation(
  frame: number,
  totalFrames: number,
  _fps: number,
): AnimationResult {
  const exitStart = totalFrames - EXIT_FRAMES;

  let opacity: number;

  if (frame < ENTER_FRAMES) {
    // Enter: 0 → 1
    opacity = interpolate(frame, [0, ENTER_FRAMES], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  } else if (frame >= exitStart) {
    // Exit: 1 → 0
    opacity = interpolate(frame, [exitStart, totalFrames], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  } else {
    // Hold
    opacity = 1;
  }

  return {
    opacity,
    transform: 'scale(1)',
  };
}
