const FONT_FALLBACKS = {
  mono: '"Consolas", "Courier New", monospace',
  sans: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
};

const FONT_ALIASES: Record<string, string> = {
  'JetBrains Mono': `"JetBrains Mono", "Fira Code", ${FONT_FALLBACKS.mono}`,
  'Fira Code': `"Fira Code", "JetBrains Mono", ${FONT_FALLBACKS.mono}`,
  'Space Mono': `"Space Mono", ${FONT_FALLBACKS.mono}`,
  'SF Mono': `"SF Mono", "Menlo", ${FONT_FALLBACKS.mono}`,
  Consolas: `"Consolas", "Courier New", monospace`,
  Inter: `"Inter", ${FONT_FALLBACKS.sans}`,
};

export function withFontFallback(fontFamily: string | undefined): string {
  const normalized = fontFamily?.trim();

  if (!normalized) {
    return FONT_ALIASES['JetBrains Mono'];
  }

  if (normalized.includes(',')) {
    return normalized;
  }

  return FONT_ALIASES[normalized] ?? `"${normalized}", ${FONT_FALLBACKS.mono}`;
}
