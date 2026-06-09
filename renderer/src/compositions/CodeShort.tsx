// ============================================================
// Main Video Composition
// ============================================================

import React from 'react';
import { Series, Audio, AbsoluteFill, Sequence } from 'remotion';
import type { VideoProps, SceneConfig } from '../types/index';
import { TransitionWrapper } from '../components/TransitionWrapper';
import { HookScene } from '../components/HookScene';
import { CodeScene } from '../components/CodeScene';
import { OutputScene } from '../components/OutputScene';
import { CTAScene } from '../components/CTAScene';
import { TipScene } from '../components/TipScene';
import { ParticleBackground } from '../components/ParticleBackground';
import { SubscribeScene } from '../components/SubscribeScene';
import { EndScreenScene } from '../components/EndScreenScene';
import { ImageScene } from '../components/ImageScene';
import { SubscribeVideoScene } from '../components/SubscribeVideoScene';
import { VideoScene } from '../components/VideoScene';
import { FontReady } from '../components/FontReady';
import { withFontFallback } from '../utils/fontFallback';

export const CodeShort: React.FC<VideoProps> = ({
  scenes,
  template,
  audioMode,
  musicUrl,
  voiceUrls,
  backendUrl,
  sfxWhoosh,
  sfxTyping,
  sfxAchievement,
  ttsExplanation,
}) => {
  const resolvedTemplate = {
    ...template,
    fontFamily: withFontFallback(template.fontFamily),
  };

  const resolveUrl = (url: string | undefined) => {
    if (!url) return url;
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
      return url;
    }
    if (backendUrl) {
      const base = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
      const path = url.startsWith('/') ? url : `/${url}`;
      return `${base}${path}`;
    }
    return url;
  };

  // Render a scene component based on type
  const renderSceneComponent = (scene: SceneConfig) => {
    switch (scene.type) {
      case 'hook':
        return (
          <HookScene
            title={scene.title}
            text={scene.text}
            template={resolvedTemplate}
            durationInFrames={scene.duration_frames}
            backendUrl={backendUrl}
            sfxWhoosh={sfxWhoosh}
            hookBadge={scene.hookBadge}
            hookBadgeStyle={scene.hookBadgeStyle}
            hookCreatorName={scene.hookCreatorName}
            hookCreatorHandle={scene.hookCreatorHandle}
            hookCreatorAvatar={resolveUrl(scene.hookCreatorAvatar)}
            hookShowProgress={scene.hookShowProgress}
            hookProgressStyle={scene.hookProgressStyle}
            hookLayout={scene.hookLayout}
            hookImage={resolveUrl(scene.hookImage)}
            hookImageSize={scene.hookImageSize}
            hookImageViewMode={scene.hookImageViewMode}
          />
        );
      case 'code':
        return (
          <CodeScene
            title={scene.title}
            code={scene.code || ''}
            language={scene.language || 'javascript'}
            output={scene.output}
            template={resolvedTemplate}
            durationInFrames={scene.duration_frames}
            backendUrl={backendUrl}
            sfxTyping={sfxTyping}
          />
        );
      case 'output':
        return (
          <OutputScene
            title={scene.title}
            output={scene.text || ''} // Using text/content for output string
            template={resolvedTemplate}
            durationInFrames={scene.duration_frames}
            sfxAchievement={sfxAchievement}
            backendUrl={backendUrl}
            explanation={scene.explanation}
          />
        );
      case 'cta':
        return (
          <CTAScene
            text={scene.text || ''}
            template={resolvedTemplate}
            durationInFrames={scene.duration_frames}
          />
        );
      case 'tip':
        return (
          <TipScene
            title={scene.title}
            tipNumber={1}
            text={scene.text}
            template={resolvedTemplate}
            durationInFrames={scene.duration_frames}
          />
        );
      case 'subscribe':
        return (
          <SubscribeScene
            channelName={scene.channelName}
            channelHandle={scene.channelHandle}
            subscriberCount={scene.subscriberCount}
            imageUrl={resolveUrl(scene.imageUrl)}
            template={resolvedTemplate}
            durationInFrames={scene.duration_frames}
          />
        );
      case 'end_screen':
        return (
          <EndScreenScene
            title={scene.text} // using content text field for custom screen title
            socials={scene.socials}
            imageUrl={resolveUrl(scene.imageUrl)}
            template={resolvedTemplate}
            durationInFrames={scene.duration_frames}
          />
        );
      case 'image':
        return (
          <ImageScene
            title={scene.title}
            text={scene.text}
            imageUrl={resolveUrl(scene.imageUrl)}
            template={resolvedTemplate}
            durationInFrames={scene.duration_frames}
          />
        );
      case 'video':
        return (
          <VideoScene
            title={scene.title}
            text={scene.text}
            videoUrl={resolveUrl(scene.videoUrl)}
            template={resolvedTemplate}
            durationInFrames={scene.duration_frames}
          />
        );
      case 'subscribe_video':
        return (
          <SubscribeVideoScene
            videoUrl={resolveUrl(scene.videoUrl)}
            imageUrl={resolveUrl(scene.imageUrl)}
            template={resolvedTemplate}
            durationInFrames={scene.duration_frames}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AbsoluteFill style={{ backgroundColor: resolvedTemplate.backgroundColor }}>
      <FontReady />
      {/* Background Particle/Grid Effect */}
      <ParticleBackground effect={resolvedTemplate.backgroundEffect} />
      {/* Background Music */}
      {(audioMode === 'music' || audioMode === 'voice_music') && musicUrl && (
        <Audio
          src={musicUrl}
          volume={audioMode === 'voice_music' ? 0.15 : 0.6} // Duck music during voiceovers
          loop
        />
      )}

      {/* Voice Narration (if pre-rendered and provided) */}
      {audioMode === 'voice_music' && voiceUrls && voiceUrls.length > 0 && (
        <>
          {voiceUrls.map((url, idx) => {
            // Calculate starting frame for each voice URL based on scene durations
            const startFrame = scenes
              .slice(0, idx)
              .reduce((sum, s) => sum + s.duration_frames, 0);

            return (
              <Sequence key={idx} from={startFrame} layout="none">
                {url ? (
                  <Audio
                    src={url}
                    startFrom={0}
                    volume={1.0}
                  />
                ) : null}
              </Sequence>
            );
          })}
        </>
      )}

      {/* Main Scenes Sequence */}
      <Series>
        {scenes.map((scene) => (
          <Series.Sequence
            key={scene.id}
            durationInFrames={scene.duration_frames}
          >
            <TransitionWrapper
              animation={scene.animation}
              durationInFrames={scene.duration_frames}
            >
              {renderSceneComponent(scene)}
            </TransitionWrapper>
          </Series.Sequence>
        ))}
      </Series>
    </AbsoluteFill>
  );
};
