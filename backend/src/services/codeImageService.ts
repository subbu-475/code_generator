// ============================================================
// Code image service — Shiki-based syntax highlighting
// ============================================================

import { createHighlighter, type Highlighter, type BundledLanguage, type BundledTheme } from 'shiki';
import { v4 as uuidv4 } from 'uuid';
import fs from 'node:fs';
import path from 'node:path';
import { GENERATED_CODE_IMAGES_DIR } from '../utils/paths.js';
import type { ProgrammingLanguage, CodeTheme } from '../types/sharedTypes.js';

let highlighterInstance: Highlighter | null = null;

// Map our language names to Shiki language IDs
const LANGUAGE_MAP: Record<ProgrammingLanguage, BundledLanguage> = {
  javascript: 'javascript',
  typescript: 'typescript',
  jsx: 'jsx',
  tsx: 'tsx',
  python: 'python',
  java: 'java',
  csharp: 'csharp',
  php: 'php',
};

// Map our theme names to Shiki theme IDs
const THEME_MAP: Record<CodeTheme, BundledTheme> = {
  'github-dark': 'github-dark',
  'vitesse-dark': 'vitesse-dark',
  'tokyo-night': 'tokyo-night',
  'dracula': 'dracula',
};

/**
 * Initialize and cache the Shiki highlighter with all needed
 * languages and themes loaded.
 */
async function getHighlighter(): Promise<Highlighter> {
  if (highlighterInstance) return highlighterInstance;

  highlighterInstance = await createHighlighter({
    themes: Object.values(THEME_MAP),
    langs: Object.values(LANGUAGE_MAP),
  });

  console.log('[CodeImage] Shiki highlighter initialized');
  return highlighterInstance;
}

export interface GenerateCodeHtmlResult {
  id: string;
  html: string;
  htmlPath: string;
  htmlUrl: string;
}

/**
 * Generate syntax-highlighted HTML from a code snippet.
 * The HTML is self-contained and can be rendered by the frontend.
 */
export async function generateCodeHtml(
  code: string,
  language: ProgrammingLanguage,
  theme: CodeTheme,
  fontSize: number = 16,
  padding: number = 24,
): Promise<GenerateCodeHtmlResult> {
  const highlighter = await getHighlighter();
  const id = uuidv4();

  const shikiLang = LANGUAGE_MAP[language] || 'javascript';
  const shikiTheme = THEME_MAP[theme] || 'github-dark';

  const highlightedHtml = highlighter.codeToHtml(code, {
    lang: shikiLang,
    theme: shikiTheme,
  });

  // Build a self-contained HTML document
  const fullHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: transparent;
    }
    .code-container {
      padding: ${padding}px;
      border-radius: 12px;
      overflow: hidden;
    }
    .code-container pre {
      margin: 0;
      padding: ${padding}px;
      border-radius: 8px;
      overflow-x: auto;
    }
    .code-container code {
      font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
      font-size: ${fontSize}px;
      line-height: 1.6;
    }
  </style>
</head>
<body>
  <div class="code-container">
    ${highlightedHtml}
  </div>
</body>
</html>`;

  // Save the HTML to disk
  const fileName = `${id}.html`;
  const filePath = path.join(GENERATED_CODE_IMAGES_DIR, fileName);
  fs.writeFileSync(filePath, fullHtml, 'utf-8');

  return {
    id,
    html: highlightedHtml,
    htmlPath: filePath,
    htmlUrl: `/generated/code-images/${fileName}`,
  };
}

/**
 * Get just the highlighted HTML fragment (no wrapping document).
 */
export async function getHighlightedHtml(
  code: string,
  language: ProgrammingLanguage,
  theme: CodeTheme,
): Promise<string> {
  const highlighter = await getHighlighter();
  const shikiLang = LANGUAGE_MAP[language] || 'javascript';
  const shikiTheme = THEME_MAP[theme] || 'github-dark';

  return highlighter.codeToHtml(code, {
    lang: shikiLang,
    theme: shikiTheme,
  });
}
