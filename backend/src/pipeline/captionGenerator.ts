// ============================================================
// Caption Generator — Creates synchronized word & phrase captions
// ============================================================

import type { CaptionPhrase, PlannedScene } from '../providers/types.js';

export interface CaptionWord {
  word: string;
  startFrame: number;
  endFrame: number;
  highlight: boolean;
}

export interface GeneratedCaptionResult {
  sceneId: string;
  phrases: CaptionPhrase[];
  words: CaptionWord[];
}

/**
 * Generate synchronized caption phrases and words for a given narration and duration.
 */
export function generateCaptions(
  narration: string,
  durationSec: number,
  fps = 30,
): { phrases: CaptionPhrase[]; words: CaptionWord[] } {
  const clean = narration.trim().replace(/\s+/g, ' ');
  if (!clean) return { phrases: [], words: [] };

  const totalFrames = Math.max(1, Math.round(durationSec * fps));
  const rawWords = clean.split(' ');
  const wordCount = rawWords.length;

  // Frame allocation per word (with slight leading and trailing silence)
  const leadInFrames = Math.min(10, Math.floor(totalFrames * 0.05));
  const leadOutFrames = Math.min(15, Math.floor(totalFrames * 0.08));
  const speakableFrames = Math.max(1, totalFrames - leadInFrames - leadOutFrames);
  const framesPerWord = speakableFrames / Math.max(1, wordCount);

  const keywords = new Set([
    'docker', 'container', 'containers', 'image', 'images', 'dns', 'ip', 'server', 'client',
    'database', 'redis', 'cache', 'api', 'http', 'https', 'tls', 'ssl', 'k8s', 'kubernetes',
    'race', 'condition', 'thread', 'lock', 'mutex', 'deadlock', 'asynchronous', 'promise',
    'event', 'loop', 'closure', 'scope', 'memory', 'cpu', 'port', 'packet', 'network',
    'nginx', 'proxy', 'reverse', 'load', 'balancer', 'query', 'sql', 'injection', 'git',
    'branch', 'merge', 'rebase', 'commit', 'auth', 'jwt', 'token', 'oauth', 'websocket',
  ]);

  const words: CaptionWord[] = rawWords.map((rawWord, index) => {
    const startFrame = leadInFrames + Math.round(index * framesPerWord);
    const endFrame = leadInFrames + Math.round((index + 1) * framesPerWord);
    const normalized = rawWord.toLowerCase().replace(/[^a-z0-9]/g, '');
    const isKeyword = keywords.has(normalized) || /^[A-Z0-9_-]{3,}$/.test(rawWord);

    return {
      word: rawWord,
      startFrame,
      endFrame,
      highlight: isKeyword,
    };
  });

  // Group words into short, punchy 3-5 word phrases (ideal for shorts kinetic typography)
  const phrases: CaptionPhrase[] = [];
  const chunkSize = 4;
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize);
    const text = chunk.map(w => w.word).join(' ');
    const startFrame = chunk[0].startFrame;
    const endFrame = chunk[chunk.length - 1].endFrame;
    const hasHighlight = chunk.some(w => w.highlight);

    phrases.push({
      text,
      startFrame,
      endFrame,
      highlight: hasHighlight,
    });
  }

  return { phrases, words };
}

/**
 * Generate captions across all planned scenes.
 */
export function buildSceneCaptions(scenes: PlannedScene[], fps = 30): GeneratedCaptionResult[] {
  return scenes.map((scene) => {
    const durationSec = scene.durationFrames / fps;
    const { phrases, words } = generateCaptions(scene.narration, durationSec, fps);
    return {
      sceneId: scene.id,
      phrases,
      words,
    };
  });
}
