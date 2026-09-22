// ============================================================
// Provider Type Interfaces — Abstraction layer for AI services
// ============================================================

/** Research result from topic analysis */
export interface ResearchResult {
  topic: string;
  category: TopicCategory;
  summary: string;
  keyFacts: string[];
  analogies: string[];
  visualMetaphors: string[];
  technicalTerms: Array<{ term: string; explanation: string }>;
  commonMisconceptions: string[];
  relatedTopics: string[];
}

export type TopicCategory =
  | 'programming'
  | 'networking'
  | 'devops'
  | 'database'
  | 'ai-ml'
  | 'system-design'
  | 'security'
  | 'web'
  | 'general-tech';

/** Generated script for a YouTube Short */
export interface GeneratedScript {
  title: string;
  hook: string;
  totalDurationTarget: number;
  wordCount: number;
  scenes: ScriptScene[];
}

export interface ScriptScene {
  id: string;
  sceneNumber: number;
  narration: string;
  caption: string;
  visualDescription: string;
  animationDescription: string;
  suggestedDuration: number;
  sceneType: SceneComponentType;
  assetRequirements: AssetRequirement[];
}

export type SceneComponentType =
  | 'hook'
  | 'diagram'
  | 'code-visualization'
  | 'concept-reveal'
  | 'split-comparison'
  | 'cinematic-image'
  | 'browser-sim'
  | 'cta-end';

export interface AssetRequirement {
  type: 'image' | 'icon' | 'diagram' | 'code-screenshot';
  description: string;
  prompt?: string;
  priority: 'required' | 'optional';
}

/** Scene plan with concrete visual specifications */
export interface PlannedScene {
  id: string;
  sceneNumber: number;
  narration: string;
  captionPhrases: CaptionPhrase[];
  durationFrames: number;
  componentType: SceneComponentType;
  visualConfig: Record<string, unknown>;
  animation: AnimationType;
  transition: TransitionType;
  cameraMovement: CameraMovement;
  assets: PlannedAsset[];
  background: BackgroundConfig;
}

export interface CaptionPhrase {
  text: string;
  startFrame: number;
  endFrame: number;
  highlight?: boolean;
}

export interface PlannedAsset {
  id: string;
  type: 'image' | 'svg-diagram' | 'icon';
  path?: string;
  prompt?: string;
  status: 'pending' | 'generated' | 'failed';
}

export type AnimationType = 'fade' | 'slide-up' | 'slide-left' | 'scale' | 'spring' | 'typewriter' | 'draw-path' | 'none';
export type TransitionType = 'fade' | 'slide' | 'zoom' | 'wipe' | 'none';
export type CameraMovement = 'none' | 'slow-zoom-in' | 'slow-zoom-out' | 'pan-left' | 'pan-right' | 'ken-burns';

export interface BackgroundConfig {
  type: 'solid' | 'gradient' | 'image' | 'particles';
  value: string;
}

/** Voice generation result */
export interface VoiceResult {
  sceneId: string;
  audioPath: string;
  audioUrl: string;
  durationSeconds: number;
}

/** Asset generation result */
export interface AssetResult {
  id: string;
  type: 'image' | 'svg-diagram' | 'icon';
  path: string;
  url: string;
  prompt?: string;
  provider: string;
  cached: boolean;
}

/** QA report for rendered video */
export interface QAReport {
  passed: boolean;
  checks: QACheck[];
  videoPath: string;
  timestamp: string;
}

export interface QACheck {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  severity: 'critical' | 'warning' | 'info';
}

/** YouTube metadata */
export interface YouTubeMetadata {
  title: string;
  description: string;
  tags: string[];
  hashtags: string[];
  category: string;
}

// ---- Provider Interfaces ----

export interface TextProvider {
  name: string;
  generateScript(topic: string, research: ResearchResult, options: ScriptOptions): Promise<GeneratedScript>;
}

export interface ScriptOptions {
  targetDuration: number;
  style: string;
  language: string;
}

export interface ImageProvider {
  name: string;
  generateImage(prompt: string, options: ImageOptions): Promise<AssetResult>;
  isAvailable(): boolean;
}

export interface ImageOptions {
  width: number;
  height: number;
  style?: string;
  outputPath: string;
}

export interface VoiceProvider {
  name: string;
  generateVoice(text: string, options: VoiceOptions): Promise<VoiceResult>;
  isAvailable(): Promise<boolean>;
}

export interface VoiceOptions {
  sceneId: string;
  voice?: string;
  rate?: string;
  outputPath: string;
}

export interface ResearchProvider {
  name: string;
  research(topic: string): Promise<ResearchResult>;
}

// ---- Job types ----

export type JobStatus =
  | 'queued'
  | 'researching'
  | 'scripting'
  | 'planning'
  | 'generating_assets'
  | 'generating_voice'
  | 'building_timeline'
  | 'rendering'
  | 'qa'
  | 'completed'
  | 'failed';

export interface VideoJob {
  id: string;
  topic: string;
  status: JobStatus;
  progress: number;
  currentStage: string;
  projectId?: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoProject {
  id: string;
  jobId: string;
  topic: string;
  title: string;
  status: JobStatus;
  version: number;
  research?: ResearchResult;
  script?: GeneratedScript;
  scenePlan?: PlannedScene[];
  voiceManifest?: VoiceResult[];
  qaReport?: QAReport;
  metadata?: YouTubeMetadata;
  renderPath?: string;
  thumbnailPath?: string;
  duration?: number;
  createdAt: string;
  updatedAt: string;
}
