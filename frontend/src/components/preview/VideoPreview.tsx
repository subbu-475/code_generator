// ============================================================
// Real-time Video Preview Player using Remotion Player
// ============================================================

import React, { useEffect, useState } from 'react';
import { Player, PlayerRef } from '@remotion/player';
import { Box, Paper, Typography, CircularProgress } from '@mui/material';
import { CodeShort } from '../../../../renderer/src/compositions/CodeShort.js';
import type { Project, Scene, Template, SceneConfig, VideoTheme } from '../../types/index.js';

interface VideoPreviewProps {
  project: Project;
  scenes: Scene[];
  template: Template | null;
}

export default React.forwardRef<PlayerRef, VideoPreviewProps>(function VideoPreview(
  { project, scenes, template },
  ref
) {
  const [voiceUrls, setVoiceUrls] = useState<string[]>([]);
  const [audioLoading, setAudioLoading] = useState(false);

  // Fetch pre-generated TTS audio URLs when voice narration is enabled
  useEffect(() => {
    if (project.audio_mode !== 'voice_music') {
      setVoiceUrls([]);
      return;
    }

    let cancelled = false;

    const fetchPreviewAudio = async () => {
      try {
        setAudioLoading(true);
        const res = await fetch(`/api/projects/${project.id}/preview-audio`);
        if (!res.ok) return;
        const json = await res.json();
        if (!cancelled && json.success && Array.isArray(json.data)) {
          setVoiceUrls(json.data);
        }
      } catch (e) {
        console.warn('[VideoPreview] Failed to load preview audio:', e);
      } finally {
        if (!cancelled) setAudioLoading(false);
      }
    };

    fetchPreviewAudio();

    return () => {
      cancelled = true;
    };
  }, [project.id, project.audio_mode, project.tts_explanation, project.tts_output, scenes]);

  // Reconstruct scene configs for Remotion composition
  const sceneConfigs: SceneConfig[] = scenes.map((s) => {
    let content: any = {};
    try {
      content = JSON.parse(s.content);
    } catch (e) {
      console.error('Failed to parse scene content:', e);
    }

    return {
      id: s.id,
      type: s.type,
      title: s.title,
      code: content.code,
      language: content.language,
      output: content.output,
      text: content.text,
      duration_frames: s.duration_frames,
      animation: s.animation,
      transition: s.transition || 'fade',
      channelName: content.channelName,
      channelHandle: content.channelHandle,
      subscriberCount: content.subscriberCount,
      socials: content.socials,
      imageUrl: content.imageUrl,
      videoUrl: content.videoUrl,
      hookBadge: content.hookBadge,
      hookBadgeStyle: content.hookBadgeStyle,
      hookCreatorName: content.hookCreatorName,
      hookCreatorHandle: content.hookCreatorHandle,
      hookCreatorAvatar: content.hookCreatorAvatar,
      hookShowProgress: content.hookShowProgress,
      hookProgressStyle: content.hookProgressStyle,
      hookLayout: content.hookLayout,
      hookImage: content.hookImage,
      hookImageSize: content.hookImageSize,
      hookImageViewMode: content.hookImageViewMode,
      explanation: content.explanation,
      quizQuestion: content.quizQuestion,
      quizOptions: content.quizOptions,
      quizCorrectIndex: content.quizCorrectIndex,
      quizExplanation: content.quizExplanation,
      quizRevealDelay: content.quizRevealDelay,
    };
  });

  const totalFrames = sceneConfigs.reduce((sum, s) => sum + (s.duration_frames || 90), 0);

  // Build videoTheme mirroring renderService.ts exactly — so preview === download
  const videoTheme: VideoTheme = {
    backgroundColor: template?.background_color ?? '#1a1a2e',
    fontFamily: template?.font_family ?? 'JetBrains Mono',
    fontSize: template?.font_size ?? 16,
    accentColor: template?.accent_color ?? '#7c3aed',
    textColor: template?.text_color ?? '#ffffff',
    codeTheme: (template?.code_theme ?? 'github-dark') as any,
    containerStyle: (template?.container_style ?? 'rounded') as any,
    glowEffect: template?.glow_effect !== 0,
    backgroundEffect: (template?.background_effect ?? 'none') as any,
    backgroundGradient: template?.background_gradient || undefined,
    hookFontSize: template?.hook_font_size ?? 64,
    hookColor: template?.hook_color ?? '#ffffff',
    codeFontSize: template?.code_font_size ?? 16,
    codeColor: template?.code_color ?? '#ffffff',
    explanationFontSize: template?.explanation_font_size ?? 26,
    explanationColor: template?.explanation_color ?? '#ffffff',
    ctaFontSize: template?.cta_font_size ?? 24,
    ctaColor: template?.cta_color ?? '#ffffff',
  };

  const videoProps = {
    scenes: sceneConfigs,
    template: videoTheme,
    audioMode: project.audio_mode,
    musicUrl: project.music_file ? `/assets/music/${project.music_file}` : undefined,
    voiceUrls: voiceUrls.length > 0 ? voiceUrls : undefined,
    sfxWhoosh: project.sfx_whoosh,
    sfxTyping: project.sfx_typing,
    sfxAchievement: project.sfx_achievement,
    ttsExplanation: project.tts_explanation,
    ttsOutput: project.tts_output,
    musicVolume: project.music_volume,
    voiceVolume: project.voice_volume,
  };

  if (scenes.length === 0) {
    return (
      <Paper sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', minHeight: 400, border: '1px solid rgba(255,255,255,0.06)' }}>
        <Typography color="text.secondary">No scenes available for preview</Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
      {/* Phone Mockup Frame */}
      <Box
        sx={{
          width: '100%',
          maxWidth: 320,
          aspectRatio: '9/16',
          borderRadius: 4.5,
          overflow: 'hidden',
          border: '10px solid #1e1e28',
          boxShadow: '0 24px 72px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,255,255,0.05)',
          bgcolor: '#000',
          position: 'relative',
        }}
      >
        <Player
          ref={ref}
          component={CodeShort}
          inputProps={videoProps}
          durationInFrames={totalFrames}
          fps={30}
          compositionWidth={1080}
          compositionHeight={1920}
          style={{
            width: '100%',
            height: '100%',
          }}
          controls
          loop
          numberOfSharedAudioTags={30}
        />
      </Box>
      <Typography variant="caption" sx={{ mt: 2, color: 'text.secondary' }}>
        Preview Player (9:16 Aspect Ratio • {Math.round((totalFrames / 30) * 10) / 10} seconds)
        {audioLoading && (
          <Box component="span" sx={{ ml: 1, display: 'inline-flex', alignItems: 'center', gap: 0.5 }}>
            <CircularProgress size={10} />
            <span>Loading voiceover…</span>
          </Box>
        )}
      </Typography>
    </Box>
  );
});
