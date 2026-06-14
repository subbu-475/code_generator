import React from 'react';
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Audio,
  Sequence,
} from 'remotion';
import type { CodeSceneProps, ProgrammingLanguage } from '../types/index';

// ---- Syntax highlighting utilities ----

interface TokenStyle {
  color: string;
  fontWeight?: string;
  fontStyle?: string;
}

/**
 * Keyword sets per language family for basic syntax highlighting.
 */
const JS_KEYWORDS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
  'do', 'switch', 'case', 'break', 'continue', 'class', 'extends', 'new',
  'this', 'import', 'export', 'default', 'from', 'async', 'await', 'try',
  'catch', 'finally', 'throw', 'typeof', 'instanceof', 'in', 'of', 'yield',
  'true', 'false', 'null', 'undefined', 'void', 'delete', 'super',
]);

const PYTHON_KEYWORDS = new Set([
  'def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'import',
  'from', 'as', 'try', 'except', 'finally', 'raise', 'with', 'yield',
  'lambda', 'pass', 'break', 'continue', 'and', 'or', 'not', 'is', 'in',
  'True', 'False', 'None', 'self', 'async', 'await', 'print',
]);

const JAVA_KEYWORDS = new Set([
  'public', 'private', 'protected', 'static', 'final', 'abstract', 'class',
  'interface', 'extends', 'implements', 'new', 'return', 'if', 'else', 'for',
  'while', 'do', 'switch', 'case', 'break', 'continue', 'try', 'catch',
  'finally', 'throw', 'throws', 'void', 'int', 'long', 'double', 'float',
  'boolean', 'char', 'byte', 'short', 'String', 'true', 'false', 'null',
  'this', 'super', 'import', 'package', 'instanceof',
]);

const CSHARP_KEYWORDS = new Set([
  'using', 'namespace', 'class', 'struct', 'interface', 'enum', 'public',
  'private', 'protected', 'internal', 'static', 'readonly', 'const', 'new',
  'return', 'if', 'else', 'for', 'foreach', 'while', 'do', 'switch', 'case',
  'break', 'continue', 'try', 'catch', 'finally', 'throw', 'async', 'await',
  'var', 'void', 'int', 'long', 'double', 'float', 'bool', 'string', 'char',
  'true', 'false', 'null', 'this', 'base', 'override', 'virtual', 'abstract',
]);

const PHP_KEYWORDS = new Set([
  'function', 'class', 'public', 'private', 'protected', 'static', 'return',
  'if', 'else', 'elseif', 'for', 'foreach', 'while', 'do', 'switch', 'case',
  'break', 'continue', 'try', 'catch', 'finally', 'throw', 'new', 'echo',
  'print', 'var', 'const', 'use', 'namespace', 'extends', 'implements',
  'true', 'false', 'null', 'array', 'isset', 'unset',
]);

function getKeywords(language: ProgrammingLanguage): Set<string> {
  switch (language) {
    case 'javascript':
    case 'typescript':
    case 'jsx':
    case 'tsx':
      return JS_KEYWORDS;
    case 'python':
      return PYTHON_KEYWORDS;
    case 'java':
      return JAVA_KEYWORDS;
    case 'csharp':
      return CSHARP_KEYWORDS;
    case 'php':
      return PHP_KEYWORDS;
    default:
      return JS_KEYWORDS;
  }
}

/** Accent-aware token colors */
function getTokenColors(accentColor: string, codeColor?: string) {
  return {
    keyword: { color: '#c792ea', fontWeight: 'bold' } as TokenStyle,
    string: { color: '#c3e88d' } as TokenStyle,
    number: { color: '#f78c6c' } as TokenStyle,
    comment: { color: '#546e7a', fontStyle: 'italic' } as TokenStyle,
    function: { color: '#82aaff' } as TokenStyle,
    operator: { color: '#89ddff' } as TokenStyle,
    bracket: { color: '#ffd700' } as TokenStyle,
    property: { color: accentColor } as TokenStyle,
    type: { color: '#ffcb6b' } as TokenStyle,
    plain: { color: codeColor || '#d4d4d4' } as TokenStyle,
  };
}

interface Token {
  text: string;
  style: TokenStyle;
}

/**
 * Tokenize a line of code into styled segments.
 * This is a simplified tokenizer — enough for compelling visual output.
 */
function tokenizeLine(
  line: string,
  keywords: Set<string>,
  colors: ReturnType<typeof getTokenColors>,
): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < line.length) {
    // Skip whitespace — preserve it as plain
    if (line[i] === ' ' || line[i] === '\t') {
      let ws = '';
      while (i < line.length && (line[i] === ' ' || line[i] === '\t')) {
        ws += line[i];
        i++;
      }
      tokens.push({ text: ws, style: colors.plain });
      continue;
    }

    // Single-line comments
    if (
      (line[i] === '/' && line[i + 1] === '/') ||
      (line[i] === '#' && i === line.trimStart().length - line.trimStart().length + line.indexOf('#'))
    ) {
      if (line[i] === '/' && line[i + 1] === '/') {
        tokens.push({ text: line.slice(i), style: colors.comment });
        break;
      }
      if (line[i] === '#') {
        tokens.push({ text: line.slice(i), style: colors.comment });
        break;
      }
    }

    // Strings (double or single or backtick)
    if (line[i] === '"' || line[i] === "'" || line[i] === '`') {
      const quote = line[i];
      let str = quote;
      i++;
      while (i < line.length && line[i] !== quote) {
        if (line[i] === '\\') {
          str += line[i];
          i++;
          if (i < line.length) {
            str += line[i];
            i++;
          }
          continue;
        }
        str += line[i];
        i++;
      }
      if (i < line.length) {
        str += line[i];
        i++;
      }
      tokens.push({ text: str, style: colors.string });
      continue;
    }

    // Numbers
    if (/[0-9]/.test(line[i])) {
      let num = '';
      while (i < line.length && /[0-9.]/.test(line[i])) {
        num += line[i];
        i++;
      }
      tokens.push({ text: num, style: colors.number });
      continue;
    }

    // Words (identifiers / keywords)
    if (/[a-zA-Z_$@]/.test(line[i])) {
      let word = '';
      while (i < line.length && /[a-zA-Z0-9_$]/.test(line[i])) {
        word += line[i];
        i++;
      }
      if (keywords.has(word)) {
        tokens.push({ text: word, style: colors.keyword });
      } else if (i < line.length && line[i] === '(') {
        tokens.push({ text: word, style: colors.function });
      } else if (word[0] === word[0].toUpperCase() && /^[A-Z]/.test(word)) {
        tokens.push({ text: word, style: colors.type });
      } else {
        tokens.push({ text: word, style: colors.plain });
      }
      continue;
    }

    // Brackets
    if ('()[]{}' .includes(line[i])) {
      tokens.push({ text: line[i], style: colors.bracket });
      i++;
      continue;
    }

    // Operators
    if ('=+-*/<>!&|%^~?:;,.'.includes(line[i])) {
      let op = line[i];
      i++;
      // Grab multi-char operators
      if (i < line.length && '=+-*/<>!&|'.includes(line[i])) {
        op += line[i];
        i++;
        if (i < line.length && '='.includes(line[i])) {
          op += line[i];
          i++;
        }
      }
      tokens.push({ text: op, style: colors.operator });
      continue;
    }

    // Catch-all
    tokens.push({ text: line[i], style: colors.plain });
    i++;
  }

  return tokens;
}

/**
 * Language display labels.
 */
function getLanguageLabel(lang: ProgrammingLanguage): string {
  const labels: Record<ProgrammingLanguage, string> = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    jsx: 'React JSX',
    tsx: 'React TSX',
    python: 'Python',
    java: 'Java',
    csharp: 'C#',
    php: 'PHP',
  };
  return labels[lang] || lang;
}

/**
 * Language file extension icons.
 */
function getLanguageIcon(lang: ProgrammingLanguage): string {
  const icons: Record<ProgrammingLanguage, string> = {
    javascript: 'JS',
    typescript: 'TS',
    jsx: 'JSX',
    tsx: 'TSX',
    python: 'PY',
    java: 'JV',
    csharp: 'C#',
    php: 'PHP',
  };
  return icons[lang] || '{ }';
}

// ---- Component ----

/**
 * CodeScene — IDE-style code display with typing animation and syntax highlighting.
 */
export const CodeScene: React.FC<CodeSceneProps> = ({
  title,
  code,
  language,
  output,
  template,
  durationInFrames,
  backendUrl,
  sfxTyping,
}) => {
  const frame = useCurrentFrame();
  const audioUrl = `${backendUrl || ''}/assets/sfx/typing.wav`;
  const playAudio = sfxTyping !== false;

  const keywords = getKeywords(language);
  const tokenColors = getTokenColors(template.accentColor, template.codeColor);

  // Inline output is disabled inside the CodeScene so it only renders in the separate OutputScene.
  const hasOutput = false;
  const typingFrames = Math.floor(durationInFrames * 0.85);

  // Typing animation
  const visibleChars = Math.floor(
    interpolate(frame, [8, typingFrames], [0, code.length], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }),
  );
  const displayCode = code.substring(0, visibleChars);
  const lines = displayCode.split('\n');

  // Cursor blink
  const cursorVisible = Math.floor(frame / 8) % 2 === 0 && frame < typingFrames;

  // Output reveal
  const outputStartFrame = typingFrames + 10;
  const outputChars = hasOutput
    ? Math.floor(
        interpolate(
          frame,
          [outputStartFrame, outputStartFrame + (output!.length * 0.6)],
          [0, output!.length],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
        ),
      )
    : 0;
  const displayOutput = hasOutput ? output!.substring(0, outputChars) : '';

  // Container styles based on template
  const borderRadius =
    template.containerStyle === 'sharp'
      ? 0
      : template.containerStyle === 'floating'
        ? 24
        : 16;

  const containerShadow =
    template.containerStyle === 'floating'
      ? `0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)`
      : '0 8px 32px rgba(0,0,0,0.4)';

  const glowShadow = template.glowEffect
    ? `, 0 0 60px ${template.accentColor}20`
    : '';

  // Entrance animation
  const entranceOpacity = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const entranceY = interpolate(frame, [0, 12], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <AbsoluteFill
      style={{
        background: template.backgroundGradient || template.backgroundColor,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 40,
        opacity: entranceOpacity,
        transform: `translateY(${entranceY}px)`,
      }}
    >
      {playAudio && (
        <Sequence durationInFrames={typingFrames} layout="none">
          <Audio src={audioUrl} volume={0.4} loop />
        </Sequence>
      )}
      {/* Scene title */}
      {title && (
        <div
          style={{
            fontFamily: template.fontFamily,
            fontSize: 32,
            fontWeight: 700,
            color: template.codeColor || template.textColor,
            marginBottom: 24,
            textAlign: 'center',
            opacity: 0.9,
            letterSpacing: -0.5,
          }}
        >
          {title}
        </div>
      )}

      {/* Code editor container */}
      <div
        style={{
          width: '100%',
          maxWidth: 960,
          borderRadius,
          overflow: 'hidden',
          boxShadow: containerShadow + glowShadow,
          border: `1px solid rgba(255,255,255,0.08)`,
        }}
      >
        {/* Title bar (VS Code style) */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '12px 16px',
            background: 'rgba(0,0,0,0.4)',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          {/* Traffic lights */}
          <div style={{ display: 'flex', gap: 8, marginRight: 16 }}>
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#ff5f56',
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#ffbd2e',
              }}
            />
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#27c93f',
              }}
            />
          </div>

          {/* Language badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flex: 1,
            }}
          >
            <div
              style={{
                background: template.accentColor,
                color: '#fff',
                padding: '2px 8px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 700,
                fontFamily: template.fontFamily,
                letterSpacing: 0.5,
              }}
            >
              {getLanguageIcon(language)}
            </div>
            <span
              style={{
                fontSize: 13,
                color: 'rgba(255,255,255,0.5)',
                fontFamily: template.fontFamily,
              }}
            >
              {getLanguageLabel(language)}
            </span>
          </div>
        </div>

        {/* Code area */}
        <div
          style={{
            padding: '20px 0',
            background: 'rgba(0,0,0,0.25)',
            minHeight: 200,
            overflowX: 'hidden',
          }}
        >
          {lines.map((line, lineIndex) => {
            const tokens = tokenizeLine(line, keywords, tokenColors);
            const isLastLine = lineIndex === lines.length - 1;

            return (
              <div
                key={lineIndex}
                style={{
                  display: 'flex',
                  fontFamily: template.fontFamily,
                  fontSize: template.codeFontSize || template.fontSize,
                  lineHeight: 1.7,
                  minHeight: (template.codeFontSize || template.fontSize) * 1.7,
                }}
              >
                {/* Line number */}
                <span
                  style={{
                    width: 52,
                    textAlign: 'right',
                    paddingRight: 16,
                    color: 'rgba(255,255,255,0.2)',
                    fontSize: (template.codeFontSize || template.fontSize) - 2,
                    userSelect: 'none',
                    flexShrink: 0,
                  }}
                >
                  {lineIndex + 1}
                </span>

                {/* Code content */}
                <span style={{ flex: 1, paddingRight: 20 }}>
                  {tokens.map((token, tokenIndex) => (
                    <span
                      key={tokenIndex}
                      style={{
                        color: token.style.color,
                        fontWeight: token.style.fontWeight as React.CSSProperties['fontWeight'],
                        fontStyle: token.style.fontStyle as React.CSSProperties['fontStyle'],
                        whiteSpace: 'pre',
                      }}
                    >
                      {token.text}
                    </span>
                  ))}
                  {/* Cursor */}
                  {isLastLine && cursorVisible && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: 2,
                        height: (template.codeFontSize || template.fontSize) + 4,
                        backgroundColor: template.accentColor,
                        marginLeft: 1,
                        verticalAlign: 'text-bottom',
                        boxShadow: template.glowEffect
                          ? `0 0 8px ${template.accentColor}`
                          : 'none',
                      }}
                    />
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Output section */}
      {hasOutput && frame >= outputStartFrame && (
        <div
          style={{
            width: '100%',
            maxWidth: 960,
            marginTop: 20,
            borderRadius: borderRadius > 0 ? borderRadius - 4 : 0,
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.06)',
            opacity: interpolate(
              frame,
              [outputStartFrame, outputStartFrame + 10],
              [0, 1],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
            ),
            transform: `translateY(${interpolate(
              frame,
              [outputStartFrame, outputStartFrame + 10],
              [10, 0],
              { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
            )}px)`,
          }}
        >
          {/* Output header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              background: 'rgba(0,0,0,0.5)',
              borderBottom: '1px solid rgba(255,255,255,0.06)',
            }}
          >
            <span style={{ color: '#27c93f', fontSize: 14 }}>▶</span>
            <span
              style={{
                fontFamily: template.fontFamily,
                fontSize: 12,
                color: 'rgba(255,255,255,0.5)',
                textTransform: 'uppercase',
                letterSpacing: 1,
              }}
            >
              Output
            </span>
          </div>

          {/* Output content */}
          <div
            style={{
              padding: '16px 20px',
              background: 'rgba(0,0,0,0.35)',
              fontFamily: template.fontFamily,
              fontSize: template.fontSize - 1,
              color: '#27c93f',
              lineHeight: 1.6,
              whiteSpace: 'pre-wrap',
            }}
          >
            {displayOutput}
            {/* Output cursor */}
            {outputChars < (output?.length ?? 0) && Math.floor(frame / 6) % 2 === 0 && (
              <span
                style={{
                  display: 'inline-block',
                  width: 2,
                  height: template.fontSize,
                  backgroundColor: '#27c93f',
                  marginLeft: 2,
                  verticalAlign: 'text-bottom',
                }}
              />
            )}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
