// ============================================================
// CodeShorts Generator — Shared Type Definitions
// ============================================================

// ---- Database Models ----

export interface Project {
  id: string;
  title: string;
  language: ProgrammingLanguage;
  hook_text: string;
  code_snippets: string; // JSON string of CodeSnippet[]
  output: string;
  cta: string;
  template_id: string | null;
  scene_config: string; // JSON string of SceneConfig[]
  audio_mode: AudioMode;
  music_file: string | null;
  status: ProjectStatus;
  explanation_template: 'none' | 'step_by_step' | 'refactor' | 'spotlight' | 'quiz_generator' | 'guess_output' | 'interview_question' | 'bugfix' | 'oneliner' | 'comparison' | 'roadmap';
  sfx_whoosh: boolean;
  sfx_typing: boolean;
  sfx_achievement: boolean;
  tts_explanation: boolean;
  tts_output: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectInput {
  title: string;
  language: ProgrammingLanguage;
  hook_text: string;
  code_snippets: CodeSnippet[];
  output: string;
  cta: string;
  template_id?: string;
  audio_mode?: AudioMode;
  music_file?: string;
  explanation_template?: 'none' | 'step_by_step' | 'refactor' | 'spotlight' | 'quiz_generator' | 'guess_output' | 'interview_question' | 'bugfix' | 'oneliner' | 'comparison' | 'roadmap';
  sfx_whoosh?: boolean;
  sfx_typing?: boolean;
  sfx_achievement?: boolean;
  tts_explanation?: boolean;
  tts_output?: boolean;
}

export interface CodeSnippet {
  id: string;
  title: string;
  code: string;
  language: ProgrammingLanguage;
  output?: string;
  hook?: string;
  explanation?: string;

  // Quiz
  quizQuestion?: string;
  quizOptions?: string[];
  quizCorrectIndex?: number;
  quizExplanation?: string;
  quizRevealDelay?: number;

  // Guess The Output
  guessCode?: string;
  guessLanguage?: ProgrammingLanguage;
  guessAnswer?: string;
  guessRevealDelay?: number;

  // Interview Question
  interviewDifficulty?: 'easy' | 'medium' | 'hard';
  interviewCategory?: string;
  interviewAnswer?: string;

  // Bug Fix
  buggyCode?: string;
  fixedCode?: string;
  bugLanguage?: ProgrammingLanguage;
  bugExplanation?: string;

  // One-Liner
  onelinerCode?: string;
  onelinerLanguage?: ProgrammingLanguage;
  onelinerExplanation?: string;

  // Comparison
  comparisonLeftTitle?: string;
  comparisonRightTitle?: string;
  comparisonLeftCode?: string;
  comparisonRightCode?: string;
  comparisonLeftLanguage?: ProgrammingLanguage;
  comparisonRightLanguage?: ProgrammingLanguage;
  comparisonVerdict?: string;

  // Roadmap Step
  roadmapStepNumber?: number;
  roadmapTotalSteps?: number;
  roadmapIcon?: string;
  roadmapDescription?: string;
}

export interface Scene {
  id: string;
  project_id: string;
  scene_order: number;
  type: SceneType;
  title: string;
  content: string; // JSON string of scene-specific data
  duration_frames: number;
  animation: AnimationStyle;
  transition: TransitionStyle;
  created_at: string;
}

export interface SceneConfig {
  id: string;
  type: SceneType;
  title: string;
  code?: string;
  language?: ProgrammingLanguage;
  output?: string;
  text?: string;
  duration_frames: number;
  animation: AnimationStyle;
  transition: TransitionStyle;
  channelName?: string;
  channelHandle?: string;
  subscriberCount?: string;
  socials?: Array<{ platform: string; handle: string }>;
  imageUrl?: string;
  videoUrl?: string;
  hookBadge?: string;
  hookBadgeStyle?: 'heartbeat' | 'bounce' | 'shake' | 'glow';
  hookCreatorName?: string;
  hookCreatorHandle?: string;
  hookCreatorAvatar?: string;
  hookShowProgress?: boolean;
  hookProgressStyle?: 'bar' | 'ring';
  hookLayout?: 'standard' | 'thumbnail' | 'glassmorphic';
  hookImage?: string;
  hookImageSize?: 'small' | 'medium' | 'large';
  hookImageViewMode?: 'cover' | 'contain';
  explanation?: string;
  quizQuestion?: string;
  quizOptions?: string[];
  quizCorrectIndex?: number;
  quizExplanation?: string;
  quizRevealDelay?: number;

  // Guess The Output
  guessCode?: string;
  guessLanguage?: ProgrammingLanguage;
  guessAnswer?: string;
  guessRevealDelay?: number;

  // Interview Question
  interviewDifficulty?: 'easy' | 'medium' | 'hard';
  interviewCategory?: string;
  interviewAnswer?: string;

  // Bug Fix
  buggyCode?: string;
  fixedCode?: string;
  bugLanguage?: ProgrammingLanguage;
  bugExplanation?: string;

  // One-Line Trick
  onelinerCode?: string;
  onelinerLanguage?: ProgrammingLanguage;
  onelinerExplanation?: string;

  // Comparison
  comparisonLeftTitle?: string;
  comparisonRightTitle?: string;
  comparisonLeftCode?: string;
  comparisonRightCode?: string;
  comparisonLeftLanguage?: ProgrammingLanguage;
  comparisonRightLanguage?: ProgrammingLanguage;
  comparisonVerdict?: string;

  // Roadmap Step
  roadmapStepNumber?: number;
  roadmapTotalSteps?: number;
  roadmapIcon?: string;
  roadmapDescription?: string;
}

export interface Template {
  id: string;
  name: string;
  background_color: string;
  font_family: string;
  font_size: number;
  accent_color: string;
  text_color: string;
  animation_style: AnimationStyle;
  transition_style: TransitionStyle;
  code_theme: CodeTheme;
  custom_css: string | null;
  is_default: number;
  background_effect: string;
  background_gradient: string | null;
  container_style: 'rounded' | 'sharp' | 'floating';
  glow_effect: number;
  created_at: string;
  hook_font_size: number;
  hook_color: string;
  code_font_size: number;
  code_color: string;
  explanation_font_size: number;
  explanation_color: string;
  cta_font_size: number;
  cta_color: string;
}

export interface TemplateInput {
  name: string;
  background_color?: string;
  font_family?: string;
  font_size?: number;
  accent_color?: string;
  text_color?: string;
  animation_style?: AnimationStyle;
  transition_style?: TransitionStyle;
  code_theme?: CodeTheme;
  custom_css?: string;
  background_effect?: string;
  background_gradient?: string | null;
  container_style?: 'rounded' | 'sharp' | 'floating';
  glow_effect?: boolean;
  hook_font_size?: number;
  hook_color?: string;
  code_font_size?: number;
  code_color?: string;
  explanation_font_size?: number;
  explanation_color?: string;
  cta_font_size?: number;
  cta_color?: string;
}

export interface ExportRecord {
  id: string;
  project_id: string;
  file_path: string;
  format: ExportFormat;
  resolution: ExportResolution;
  file_size: number | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface Settings {
  theme: 'light' | 'dark';
  default_font: string;
  default_animation: AnimationStyle;
  default_music: string;
  default_resolution: ExportResolution;
}

// ---- Enums / Unions ----

export type ProgrammingLanguage =
  | 'javascript'
  | 'typescript'
  | 'jsx'
  | 'tsx'
  | 'python'
  | 'java'
  | 'csharp'
  | 'php';

export type SceneType =
  | 'hook'
  | 'code'
  | 'output'
  | 'tip'
  | 'cta'
  | 'subscribe'
  | 'end_screen'
  | 'image'
  | 'video'
  | 'subscribe_video'
  | 'quiz'
  | 'guess_output'
  | 'interview_question'
  | 'bugfix'
  | 'oneliner'
  | 'comparison'
  | 'roadmap_step';

export type AnimationStyle = 'fade' | 'zoom' | 'slide' | 'pop' | 'bounce';

export type TransitionStyle = 'fade' | 'slide' | 'zoom' | 'none';

export type AudioMode = 'none' | 'music' | 'voice_music';

export type ProjectStatus = 'draft' | 'rendering' | 'completed' | 'error';

export type ExportFormat = 'mp4' | 'webm';

export type ExportResolution = '720p' | '1080p' | '4k';

export type CodeTheme =
  | 'github-dark'
  | 'vitesse-dark'
  | 'tokyo-night'
  | 'dracula';

// ---- API Types ----

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface RenderRequest {
  project_id: string;
  format: ExportFormat;
  resolution: ExportResolution;
}

export interface RenderProgress {
  status: 'bundling' | 'rendering' | 'encoding' | 'complete' | 'error';
  progress: number; // 0-100
  message: string;
  output_path?: string;
}

export interface CodeImageRequest {
  code: string;
  language: ProgrammingLanguage;
  theme: CodeTheme;
  font_size?: number;
  padding?: number;
}

export interface CodeImageResponse {
  image_path: string;
  image_url: string;
  width: number;
  height: number;
}

export interface AudioRequest {
  text: string;
  voice_model?: string;
  output_filename?: string;
}

export interface AudioResponse {
  audio_path: string;
  audio_url: string;
  duration_seconds: number;
}

export interface HealthCheck {
  status: 'ok' | 'degraded';
  ffmpeg: boolean;
  piper: boolean;
  database: boolean;
  version: string;
}

// ---- Remotion Video Props ----

export interface VideoProps {
  scenes: SceneConfig[];
  template: VideoTheme;
  audioMode: AudioMode;
  musicUrl?: string;
  voiceUrls?: string[];
  backendUrl?: string;
  sfxWhoosh?: boolean;
  sfxTyping?: boolean;
  sfxAchievement?: boolean;
  ttsExplanation?: boolean;
  ttsOutput?: boolean;
}

export interface VideoTheme {
  backgroundColor: string;
  backgroundGradient?: string;
  fontFamily: string;
  fontSize: number;
  accentColor: string;
  textColor: string;
  codeTheme: CodeTheme;
  containerStyle: 'rounded' | 'sharp' | 'floating';
  glowEffect: boolean;
  backgroundEffect?: 'none' | 'particles' | 'matrix' | 'grid';
  hookFontSize: number;
  hookColor: string;
  codeFontSize: number;
  codeColor: string;
  explanationFontSize: number;
  explanationColor: string;
  ctaFontSize: number;
  ctaColor: string;
}

// ---- Resolution Config ----

export const RESOLUTION_CONFIG = {
  '720p': { width: 720, height: 1280 },
  '1080p': { width: 1080, height: 1920 },
  '4k': { width: 2160, height: 3840 },
} as const;

export const FPS = 30;

export const SUPPORTED_LANGUAGES: { value: ProgrammingLanguage; label: string }[] = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'jsx', label: 'React (JSX)' },
  { value: 'tsx', label: 'React (TSX)' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'php', label: 'PHP' },
];

export const CODE_THEMES: { value: CodeTheme; label: string }[] = [
  { value: 'github-dark', label: 'GitHub Dark' },
  { value: 'vitesse-dark', label: 'Vitesse Dark' },
  { value: 'tokyo-night', label: 'Tokyo Night' },
  { value: 'dracula', label: 'Dracula' },
];

export const ANIMATION_STYLES: { value: AnimationStyle; label: string }[] = [
  { value: 'fade', label: 'Fade' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'slide', label: 'Slide' },
  { value: 'pop', label: 'Pop' },
  { value: 'bounce', label: 'Bounce' },
];

export const TRANSITION_STYLES: { value: TransitionStyle; label: string }[] = [
  { value: 'fade', label: 'Fade' },
  { value: 'slide', label: 'Slide' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'none', label: 'None' },
];

// ---- Batch Generation Types ----

export interface Batch {
  id: string;
  name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  total_videos: number;
  completed_videos: number;
  failed_videos: number;
  created_at: string;
}

export interface BatchItem {
  id: string;
  batch_id: string;
  title: string;
  hook: string;
  code: string;
  output: string;
  cta: string;
  language: ProgrammingLanguage;
  template: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  video_path: string | null;
  error_message: string | null;
  created_at: string;
}

export interface BatchProgress {
  total: number;
  completed: number;
  failed: number;
  remaining: number;
  percentage: number;
}
