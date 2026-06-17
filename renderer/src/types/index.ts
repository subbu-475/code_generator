// ============================================================
// Renderer-specific types + re-exports from shared
// ============================================================

import type {
  VideoTheme,
  ProgrammingLanguage,
} from './sharedTypes';

export type {
  VideoProps,
  VideoTheme,
  SceneConfig,
  SceneType,
  AnimationStyle,
  TransitionStyle,
  AudioMode,
  ProgrammingLanguage,
  CodeTheme,
} from './sharedTypes';

export { FPS, RESOLUTION_CONFIG } from './sharedTypes';

// ---- Renderer-specific types ----

/** Result returned by every animation function */
export interface AnimationResult {
  opacity: number;
  transform: string;
}

/** Animation function signature */
export type AnimationFn = (
  frame: number,
  totalFrames: number,
  fps: number,
) => AnimationResult;

/** Common props shared by all scene components */
export interface SceneComponentProps {
  title: string;
  template: VideoTheme;
  durationInFrames: number;
  codeFontSize?: number;
  explanationFontSize?: number;
}

/** Props specific to the HookScene */
export interface HookSceneProps extends SceneComponentProps {
  text?: string;
  backendUrl?: string;
  sfxWhoosh?: boolean;
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
}

/** Props specific to the CodeScene */
export interface CodeSceneProps extends SceneComponentProps {
  code: string;
  language: ProgrammingLanguage;
  output?: string;
  backendUrl?: string;
  sfxTyping?: boolean;
}

/** Props specific to the OutputScene */
export interface OutputSceneProps {
  output: string;
  title?: string;
  template: VideoTheme;
  durationInFrames: number;
  sfxAchievement?: boolean;
  backendUrl?: string;
  explanation?: string;
}

/** Props specific to the CTAScene */
export interface CTASceneProps {
  text: string;
  template: VideoTheme;
  durationInFrames: number;
}

/** Props specific to the TipScene */
export interface TipSceneProps extends SceneComponentProps {
  tipNumber: number;
  text?: string;
}

/** Props specific to the QuizScene */
export interface QuizSceneProps extends SceneComponentProps {
  quizQuestion?: string;
  quizOptions?: string[];
  quizCorrectIndex?: number;
  quizExplanation?: string;
  quizRevealDelay?: number;
  backendUrl?: string;
}

/** Props specific to the GuessOutputScene */
export interface GuessOutputSceneProps extends SceneComponentProps {
  guessCode?: string;
  guessLanguage?: ProgrammingLanguage;
  guessAnswer?: string;
  guessRevealDelay?: number;
}

/** Props specific to the InterviewQuestionScene */
export interface InterviewQuestionSceneProps extends SceneComponentProps {
  text?: string;
  interviewDifficulty?: 'easy' | 'medium' | 'hard';
  interviewCategory?: string;
  interviewAnswer?: string;
}

/** Props specific to the BugFixScene */
export interface BugFixSceneProps extends SceneComponentProps {
  buggyCode?: string;
  fixedCode?: string;
  bugLanguage?: ProgrammingLanguage;
  bugExplanation?: string;
}

/** Props specific to the OneLinerScene */
export interface OneLinerSceneProps extends SceneComponentProps {
  onelinerCode?: string;
  onelinerLanguage?: ProgrammingLanguage;
  onelinerExplanation?: string;
}

/** Props specific to the ComparisonScene */
export interface ComparisonSceneProps extends SceneComponentProps {
  comparisonLeftTitle?: string;
  comparisonRightTitle?: string;
  comparisonLeftCode?: string;
  comparisonRightCode?: string;
  comparisonLeftLanguage?: ProgrammingLanguage;
  comparisonRightLanguage?: ProgrammingLanguage;
  comparisonVerdict?: string;
}

/** Props specific to the RoadmapStepScene */
export interface RoadmapStepSceneProps extends SceneComponentProps {
  roadmapStepNumber?: number;
  roadmapTotalSteps?: number;
  roadmapIcon?: string;
  roadmapDescription?: string;
  text?: string;
}

/** Props specific to the SummaryScene */
export interface SummarySceneProps extends SceneComponentProps {
  summaryTitle?: string;
  summaryPoints?: string[];
  summaryVoiceOver?: boolean;
  summaryLayout?: 'points' | 'paragraph';
  summaryShowSubscribe?: boolean;
  text?: string;
  imageUrl?: string;
}


