// ============================================================
// Animation System — Kinetic typography, spring motion, transitions
// ============================================================

import { interpolate, spring } from 'remotion';
import { fadeAnimation } from './fade.js';
import { slideAnimation } from './slide.js';
import { zoomAnimation } from './zoom.js';
import { popAnimation } from './pop.js';
import { bounceAnimation } from './bounce.js';
import type { AnimationStyle, AnimationResult } from '../types/index.js';

export { fadeAnimation } from './fade.js';
export { slideAnimation } from './slide.js';
export { zoomAnimation } from './zoom.js';
export { popAnimation } from './pop.js';
export { bounceAnimation } from './bounce.js';

/**
 * Resolve standard animation styles for any scene frame.
 */
export function getAnimationStyle(
  style: AnimationStyle | string,
  frame: number,
  totalFrames: number,
  fps = 30,
): AnimationResult {
  switch (style) {
    case 'slide':
      return slideAnimation(frame, totalFrames, fps);
    case 'zoom':
      return zoomAnimation(frame, totalFrames, fps);
    case 'pop':
      return popAnimation(frame, totalFrames, fps);
    case 'bounce':
      return bounceAnimation(frame, totalFrames, fps);
    case 'fade':
    default:
      return fadeAnimation(frame, totalFrames, fps);
  }
}

/**
 * Spring entrance utility for smooth popups and cards.
 */
export function springEnter(
  frame: number,
  fps = 30,
  delay = 0,
  config = { damping: 14, stiffness: 120, mass: 0.8 },
): number {
  return spring({
    frame: Math.max(0, frame - delay),
    fps,
    config,
  });
}

/**
 * Smooth continuous camera push (Ken Burns subtle zoom) for high retention.
 * Starts at 1.0 and drifts to 1.06 over duration.
 */
export function cameraDrift(frame: number, totalFrames: number, maxScale = 1.06): number {
  return interpolate(frame, [0, totalFrames], [1, maxScale], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}

/**
 * Traveling pulse along a line (0 to 1 progress).
 */
export function packetTravel(
  frame: number,
  startFrame: number,
  durationFrames = 30,
): number {
  return interpolate(frame, [startFrame, startFrame + durationFrames], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
}
