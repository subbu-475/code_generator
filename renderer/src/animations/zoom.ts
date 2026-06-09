import { interpolate } from 'remotion';
import type { AnimationResult } from '../types/index';

const ENTER_FRAMES = 15;
const EXIT_FRAMES = 10;

/**
 * Zoom animation: scale 0.5→1 on enter, scale 1→0.8 on exit.
 */
export function zoomAnimation(
  frame: number,
  totalFrames: number,
  _fps: number,
): AnimationResult {
  const exitStart = totalFrames - EXIT_FRAMES;

  let opacity: number;
  let scale: number;

  if (frame < ENTER_FRAMES) {
    opacity = interpolate(frame, [0, ENTER_FRAMES], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    scale = interpolate(frame, [0, ENTER_FRAMES], [0.5, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  } else if (frame >= exitStart) {
    opacity = interpolate(frame, [exitStart, totalFrames], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
    scale = interpolate(frame, [exitStart, totalFrames], [1, 0.8], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    });
  } else {
    opacity = 1;
    scale = 1;
  }

  return {
    opacity,
    transform: `scale(${scale})`,
  };
}
