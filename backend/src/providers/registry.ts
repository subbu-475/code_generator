// ============================================================
// Provider Registry — Instantiates and manages providers
// ============================================================

import type { TextProvider, ImageProvider, VoiceProvider, ResearchProvider } from './types.js';
import { BuiltInTextProvider } from './textProvider.js';
import { BuiltInImageProvider } from './imageProvider.js';
import { EdgeTTSVoiceProvider } from './voiceProvider.js';
import { BuiltInResearchProvider } from './researchProvider.js';

let _textProvider: TextProvider | null = null;
let _imageProvider: ImageProvider | null = null;
let _voiceProvider: VoiceProvider | null = null;
let _researchProvider: ResearchProvider | null = null;

export function getTextProvider(): TextProvider {
  if (!_textProvider) {
    const providerName = process.env.TEXT_PROVIDER || 'built-in';
    switch (providerName) {
      // Future: add 'gemini', 'openai' cases
      default:
        _textProvider = new BuiltInTextProvider();
    }
    console.log(`[Providers] Text provider: ${_textProvider.name}`);
  }
  return _textProvider;
}

export function getImageProvider(): ImageProvider {
  if (!_imageProvider) {
    const providerName = process.env.IMAGE_PROVIDER || 'built-in';
    switch (providerName) {
      default:
        _imageProvider = new BuiltInImageProvider();
    }
    console.log(`[Providers] Image provider: ${_imageProvider.name}`);
  }
  return _imageProvider;
}

export function getVoiceProvider(): VoiceProvider {
  if (!_voiceProvider) {
    const providerName = process.env.VOICE_PROVIDER || 'edge-tts';
    switch (providerName) {
      default:
        _voiceProvider = new EdgeTTSVoiceProvider();
    }
    console.log(`[Providers] Voice provider: ${_voiceProvider.name}`);
  }
  return _voiceProvider;
}

export function getResearchProvider(): ResearchProvider {
  if (!_researchProvider) {
    _researchProvider = new BuiltInResearchProvider();
    console.log(`[Providers] Research provider: ${_researchProvider.name}`);
  }
  return _researchProvider;
}
