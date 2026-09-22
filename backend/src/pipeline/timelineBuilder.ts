// ============================================================
// Timeline Builder — Audio-driven frame-accurate timeline calculation
// ============================================================

import type { PlannedScene, VoiceResult, GeneratedScript, SceneComponentType } from '../providers/types.js';

export interface TimelineResult {
  sceneConfigs: any[];
  totalFrames: number;
}

/**
 * Map pipeline component type to Remotion scene type.
 */
export function mapComponentTypeToSceneType(componentType: SceneComponentType): string {
  switch (componentType) {
    case 'hook':
      return 'hook';
    case 'diagram':
      return 'diagram';
    case 'code-visualization':
      return 'code_visualization';
    case 'concept-reveal':
      return 'concept_reveal';
    case 'split-comparison':
      return 'split_comparison';
    case 'cinematic-image':
      return 'cinematic_image';
    case 'browser-sim':
      return 'browser_sim';
    case 'cta-end':
      return 'cta_end';
    default:
      return 'cinematic_image';
  }
}

/**
 * Build frame-accurate Remotion scene configurations where audio is the source of truth.
 */
export function buildTimeline(
  scenePlan: PlannedScene[],
  voices: VoiceResult[],
  script: GeneratedScript,
  fps = 30,
): TimelineResult {
  const sceneConfigs: any[] = [];
  let totalFrames = 0;

  for (let i = 0; i < scenePlan.length; i++) {
    const scene = scenePlan[i];
    const voice = voices.find((v) => v.sceneId === scene.id);

    // Audio-visual synchronization rule:
    // Audio duration is source of truth. Duration must be >= audio length + padding (15-24 frames)
    // so narration completes cleanly before transition.
    let durationFrames: number;
    if (voice && voice.durationSeconds > 0) {
      const audioFrames = Math.ceil(voice.durationSeconds * fps);
      // Add 14 frames (~0.47s) padding: 5 frames settle-in + 9 frames trail-off
      durationFrames = Math.max(60, audioFrames + 14);
    } else {
      // Fallback if no voice
      durationFrames = Math.max(60, scene.durationFrames || 90);
    }

    const sceneType = mapComponentTypeToSceneType(scene.componentType);

    // Build complete SceneConfig combining planned visual config and audio timing
    const sceneConfig: Record<string, any> = {
      id: scene.id,
      scene_order: i,
      type: sceneType,
      title: scene.visualConfig.title || script.title,
      text: scene.visualConfig.text || scene.narration,
      duration_frames: durationFrames,
      animation: scene.animation || 'fade',
      transition: scene.transition || (i === scenePlan.length - 1 ? 'fade' : 'none'),
      voiceNarration: scene.narration,
      voiceUrl: voice?.audioUrl || '',
      captionPhrases: scene.captionPhrases,
      ...scene.visualConfig,
    };

    // Ensure type is preserved as mapped
    sceneConfig.type = sceneType;
    sceneConfig.duration_frames = durationFrames;

    sceneConfigs.push(sceneConfig);
    totalFrames += durationFrames;
  }

  return {
    sceneConfigs,
    totalFrames,
  };
}
