import type { VideoTheme } from '../types/index';

/**
 * Coding Dark — deep indigo tones, purple accent.
 */
export const codingDark: VideoTheme = {
  backgroundColor: '#1a1a2e',
  backgroundGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
  fontSize: 18,
  accentColor: '#7c3aed',
  textColor: '#e2e8f0',
  codeTheme: 'tokyo-night',
  containerStyle: 'rounded',
  glowEffect: false,
  hookFontSize: 64,
  hookColor: '#ffffff',
  codeFontSize: 16,
  codeColor: '#e2e8f0',
  explanationFontSize: 26,
  explanationColor: '#ffffff',
  ctaFontSize: 24,
  ctaColor: '#ffffff',
};

/**
 * VSCode Theme — authentic editor feel.
 */
export const vscodeTheme: VideoTheme = {
  backgroundColor: '#1e1e1e',
  backgroundGradient: 'linear-gradient(135deg, #1e1e1e 0%, #252526 100%)',
  fontFamily: "'Consolas', 'Courier New', monospace",
  fontSize: 18,
  accentColor: '#007acc',
  textColor: '#d4d4d4',
  codeTheme: 'github-dark',
  containerStyle: 'sharp',
  glowEffect: false,
  hookFontSize: 60,
  hookColor: '#d4d4d4',
  codeFontSize: 16,
  codeColor: '#d4d4d4',
  explanationFontSize: 24,
  explanationColor: '#858585',
  ctaFontSize: 24,
  ctaColor: '#d4d4d4',
};

/**
 * Neon Blue — electric blues with glow.
 */
export const neonBlue: VideoTheme = {
  backgroundColor: '#0a0a2e',
  backgroundGradient: 'linear-gradient(135deg, #0a0a2e 0%, #000033 100%)',
  fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
  fontSize: 18,
  accentColor: '#00d4ff',
  textColor: '#e0f7ff',
  codeTheme: 'vitesse-dark',
  containerStyle: 'floating',
  glowEffect: true,
  hookFontSize: 68,
  hookColor: '#e0f7ff',
  codeFontSize: 16,
  codeColor: '#00d4ff',
  explanationFontSize: 28,
  explanationColor: '#00d4ff',
  ctaFontSize: 28,
  ctaColor: '#00d4ff',
};

/**
 * Cyberpunk — vibrant pink/magenta on deep purple.
 */
export const cyberpunk: VideoTheme = {
  backgroundColor: '#0d0221',
  backgroundGradient: 'linear-gradient(135deg, #0d0221 0%, #150050 100%)',
  fontFamily: "'Space Mono', 'Fira Code', monospace",
  fontSize: 18,
  accentColor: '#ff2079',
  textColor: '#f0e6ff',
  codeTheme: 'dracula',
  containerStyle: 'floating',
  glowEffect: true,
  hookFontSize: 72,
  hookColor: '#ff2079',
  codeFontSize: 16,
  codeColor: '#f0e6ff',
  explanationFontSize: 28,
  explanationColor: '#f0e6ff',
  ctaFontSize: 32,
  ctaColor: '#ff2079',
};

/**
 * Minimal — light, clean, distraction-free.
 */
export const minimal: VideoTheme = {
  backgroundColor: '#fafafa',
  backgroundGradient: 'linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%)',
  fontFamily: "'SF Mono', 'Menlo', 'Consolas', monospace",
  fontSize: 18,
  accentColor: '#333333',
  textColor: '#1a1a1a',
  codeTheme: 'github-dark',
  containerStyle: 'rounded',
  glowEffect: false,
  hookFontSize: 56,
  hookColor: '#1a1a1a',
  codeFontSize: 16,
  codeColor: '#1a1a1a',
  explanationFontSize: 22,
  explanationColor: '#333333',
  ctaFontSize: 24,
  ctaColor: '#1a1a1a',
};

/** All built-in themes by name */
export const themes: Record<string, VideoTheme> = {
  'coding-dark': codingDark,
  'vscode': vscodeTheme,
  'neon-blue': neonBlue,
  'cyberpunk': cyberpunk,
  'minimal': minimal,
};

/** Default theme used when none is specified */
export const defaultTheme = codingDark;
