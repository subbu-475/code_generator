export interface Project {
    id: string;
    title: string;
    language: ProgrammingLanguage;
    hook_text: string;
    code_snippets: string;
    output: string;
    cta: string;
    template_id: string | null;
    scene_config: string;
    audio_mode: AudioMode;
    music_file: string | null;
    status: ProjectStatus;
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
}
export interface CodeSnippet {
    id: string;
    title: string;
    code: string;
    language: ProgrammingLanguage;
    output?: string;
}
export interface Scene {
    id: string;
    project_id: string;
    scene_order: number;
    type: SceneType;
    title: string;
    content: string;
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
    created_at: string;
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
export type ProgrammingLanguage = 'javascript' | 'typescript' | 'jsx' | 'tsx' | 'python' | 'java' | 'csharp' | 'php';
export type SceneType = 'hook' | 'code' | 'output' | 'tip' | 'cta' | 'subscribe' | 'end_screen' | 'image' | 'video' | 'subscribe_video';
export type AnimationStyle = 'fade' | 'zoom' | 'slide' | 'pop' | 'bounce';
export type TransitionStyle = 'fade' | 'slide' | 'zoom' | 'none';
export type AudioMode = 'none' | 'music' | 'voice_music';
export type ProjectStatus = 'draft' | 'rendering' | 'completed' | 'error';
export type ExportFormat = 'mp4' | 'webm';
export type ExportResolution = '720p' | '1080p' | '4k';
export type CodeTheme = 'github-dark' | 'vitesse-dark' | 'tokyo-night' | 'dracula';
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
    progress: number;
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
export interface VideoProps {
    scenes: SceneConfig[];
    template: VideoTheme;
    audioMode: AudioMode;
    musicUrl?: string;
    voiceUrls?: string[];
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
}
export declare const RESOLUTION_CONFIG: {
    readonly '720p': {
        readonly width: 720;
        readonly height: 1280;
    };
    readonly '1080p': {
        readonly width: 1080;
        readonly height: 1920;
    };
    readonly '4k': {
        readonly width: 2160;
        readonly height: 3840;
    };
};
export declare const FPS = 30;
export declare const SUPPORTED_LANGUAGES: {
    value: ProgrammingLanguage;
    label: string;
}[];
export declare const CODE_THEMES: {
    value: CodeTheme;
    label: string;
}[];
export declare const ANIMATION_STYLES: {
    value: AnimationStyle;
    label: string;
}[];
export declare const TRANSITION_STYLES: {
    value: TransitionStyle;
    label: string;
}[];
//# sourceMappingURL=types.d.ts.map