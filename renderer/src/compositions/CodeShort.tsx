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
import { QuizScene } from '../components/QuizScene';
import { GuessOutputScene } from '../components/GuessOutputScene';
import { InterviewQuestionScene } from '../components/InterviewQuestionScene';
import { BugFixScene } from '../components/BugFixScene';
import { OneLinerScene } from '../components/OneLinerScene';
import { ComparisonScene } from '../components/ComparisonScene';
import { RoadmapStepScene } from '../components/RoadmapStepScene';
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
  musicVolume,
  voiceVolume,
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
      case 'quiz':
        return (
          <QuizScene
            title={scene.title}
            quizQuestion={scene.quizQuestion}
            quizOptions={scene.quizOptions}
            quizCorrectIndex={scene.quizCorrectIndex}
            quizExplanation={scene.quizExplanation}
            quizRevealDelay={scene.quizRevealDelay}
            template={resolvedTemplate}
            durationInFrames={scene.duration_frames}
          />
        );
      case 'guess_output':
        return (
          <GuessOutputScene
            title={scene.title}
            guessCode={scene.guessCode}
            guessLanguage={scene.guessLanguage}
            guessAnswer={scene.guessAnswer}
            guessRevealDelay={scene.guessRevealDelay}
            template={resolvedTemplate}
            durationInFrames={scene.duration_frames}
          />
        );
      case 'interview_question':
        return (
          <InterviewQuestionScene
            title={scene.title}
            text={scene.text}
            interviewDifficulty={scene.interviewDifficulty}
            interviewCategory={scene.interviewCategory}
            interviewAnswer={scene.interviewAnswer}
            template={resolvedTemplate}
            durationInFrames={scene.duration_frames}
          />
        );
      case 'bugfix':
        return (
          <BugFixScene
            title={scene.title}
            buggyCode={scene.buggyCode}
            fixedCode={scene.fixedCode}
            bugLanguage={scene.bugLanguage}
            bugExplanation={scene.bugExplanation}
            template={resolvedTemplate}
            durationInFrames={scene.duration_frames}
          />
        );
      case 'oneliner':
        return (
          <OneLinerScene
            title={scene.title}
            onelinerCode={scene.onelinerCode}
            onelinerLanguage={scene.onelinerLanguage}
            onelinerExplanation={scene.onelinerExplanation}
            template={resolvedTemplate}
            durationInFrames={scene.duration_frames}
          />
        );
      case 'comparison':
        return (
          <ComparisonScene
            title={scene.title}
            comparisonLeftTitle={scene.comparisonLeftTitle}
            comparisonRightTitle={scene.comparisonRightTitle}
            comparisonLeftCode={scene.comparisonLeftCode}
            comparisonRightCode={scene.comparisonRightCode}
            comparisonLeftLanguage={scene.comparisonLeftLanguage}
            comparisonRightLanguage={scene.comparisonRightLanguage}
            comparisonVerdict={scene.comparisonVerdict}
            template={resolvedTemplate}
            durationInFrames={scene.duration_frames}
          />
        );
      case 'roadmap_step':
        return (
          <RoadmapStepScene
            title={scene.title}
            text={scene.text}
            roadmapStepNumber={scene.roadmapStepNumber}
            roadmapTotalSteps={scene.roadmapTotalSteps}
            roadmapIcon={scene.roadmapIcon}
            roadmapDescription={scene.roadmapDescription}
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
          volume={musicVolume !== undefined ? musicVolume : (audioMode === 'voice_music' ? 0.15 : 0.6)}
          loop
        />
      )}

      {/* Voice Narration (if pre-rendered and provided) */}
      {audioMode === 'voice_music' && voiceUrls && voiceUrls.length > 0 && (
        <>
          {voiceUrls.map((url, idx) => {
            const scene = scenes[idx];
            // Calculate starting frame for each voice URL based on scene durations
            let startFrame = scenes
              .slice(0, idx)
              .reduce((sum, s) => sum + s.duration_frames, 0);

            // Slightly delay voice narration to align with visual entrance animations
            if (scene) {
              if (scene.type === 'tip') {
                startFrame += 15; // 0.5s delay to sync with card entry and text fade-in
              } else if (scene.type === 'output') {
                startFrame += 20; // 0.67s delay to sync with typewriter start
              } else if (
                scene.type === 'quiz' ||
                scene.type === 'guess_output' ||
                scene.type === 'bugfix' ||
                scene.type === 'interview_question' ||
                scene.type === 'oneliner' ||
                scene.type === 'comparison' ||
                scene.type === 'roadmap_step'
              ) {
                startFrame += 15; // Align with question/layout entrance
              }
            }

            return (
              <Sequence key={idx} from={startFrame} layout="none">
                {url ? (
                  <Audio
                    src={url}
                    startFrom={0}
                    volume={voiceVolume !== undefined ? voiceVolume : 1.0}
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
