// Re-export all shared types
export type {
  Project,
  ProjectInput,
  CodeSnippet,
  Scene,
  SceneConfig,
  Template,
  TemplateInput,
  ExportRecord,
  Settings,
  ProgrammingLanguage,
  SceneType,
  AnimationStyle,
  TransitionStyle,
  AudioMode,
  ProjectStatus,
  ExportFormat,
  ExportResolution,
  CodeTheme,
  ApiResponse,
  RenderRequest,
  RenderProgress,
  CodeImageRequest,
  CodeImageResponse,
  AudioRequest,
  AudioResponse,
  HealthCheck,
  VideoProps,
  VideoTheme,
  Batch,
  BatchItem,
  BatchProgress,
} from '../../../shared/types.js';

export {
  RESOLUTION_CONFIG,
  FPS,
  SUPPORTED_LANGUAGES,
  CODE_THEMES,
  ANIMATION_STYLES,
  TRANSITION_STYLES,
} from '../../../shared/types.js';

// ---- Frontend-specific types ----

export interface NavItem {
  label: string;
  path: string;
  icon: string;
}

export interface DashboardStats {
  totalProjects: number;
  videosRendered: number;
  templatesAvailable: number;
  totalExports: number;
}

export interface FilterState {
  search: string;
  status: string;
  language: string;
}
