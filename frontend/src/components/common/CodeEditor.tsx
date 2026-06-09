import { useRef, useCallback, type ChangeEvent, type KeyboardEvent } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  placeholder?: string;
  minHeight?: number;
  id?: string;
}

// Basic keyword highlighting for common languages
const KEYWORD_PATTERNS: Record<string, RegExp> = {
  keyword:
    /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|class|extends|import|export|from|default|new|this|try|catch|finally|throw|async|await|yield|typeof|instanceof|void|delete|in|of|def|self|print|lambda|with|as|elif|pass|raise|public|private|protected|static|final|abstract|interface|implements|package|throws|super|null|undefined|None|True|False|true|false)\b/g,
  string: /(["'`])(?:(?!\1|\\).|\\.)*?\1/g,
  comment: /\/\/.*$|\/\*[\s\S]*?\*\/|#.*$/gm,
  number: /\b\d+\.?\d*\b/g,
  func: /\b([a-zA-Z_]\w*)\s*(?=\()/g,
};

function highlightCode(code: string): string {
  // Escape HTML
  let html = code
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Apply highlighting in order (strings/comments first to avoid conflicts)
  html = html.replace(
    /(["'`])(?:(?!\1|\\).|\\.)*?\1/g,
    '<span style="color:#a5d6ff">$&</span>'
  );
  html = html.replace(
    /(?<!<[^>]*)\/\/.*$/gm,
    '<span style="color:#6b7280;font-style:italic">$&</span>'
  );
  html = html.replace(
    /(?<!<[^>]*)#[^&].*$/gm,
    '<span style="color:#6b7280;font-style:italic">$&</span>'
  );
  html = html.replace(
    /\b(const|let|var|function|return|if|else|for|while|class|import|export|from|default|new|async|await|def|self|print|public|private|static|final|abstract|interface|null|undefined|true|false|None|True|False)\b/g,
    '<span style="color:#c084fc">$1</span>'
  );
  html = html.replace(
    /(?<!<[^>]*)\b(\d+\.?\d*)\b/g,
    '<span style="color:#fbbf24">$1</span>'
  );

  return html;
}

export default function CodeEditor({
  value,
  onChange,
  language = 'javascript',
  placeholder = 'Enter your code here...',
  minHeight = 200,
  id = 'code-editor',
}: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const lines = value.split('\n');
  const lineCount = Math.max(lines.length, 1);

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e.target.value);
    },
    [onChange]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        onChange(newValue);
        // Set cursor after tab
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        });
      }
    },
    [value, onChange]
  );

  return (
    <Box
      sx={{
        position: 'relative',
        borderRadius: 3,
        overflow: 'hidden',
        border: '1px solid rgba(124, 58, 237, 0.2)',
        transition: 'border-color 0.2s ease',
        '&:focus-within': {
          borderColor: '#7c3aed',
          boxShadow: '0 0 0 3px rgba(124, 58, 237, 0.1)',
        },
      }}
    >
      {/* Language badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 2,
          px: 1.5,
          py: 0.25,
          borderRadius: 1.5,
          background: 'rgba(124, 58, 237, 0.15)',
          border: '1px solid rgba(124, 58, 237, 0.25)',
        }}
      >
        <Typography
          variant="caption"
          sx={{ color: '#a78bfa', fontFamily: '"JetBrains Mono", monospace', fontSize: '0.7rem' }}
        >
          {language}
        </Typography>
      </Box>

      <Box sx={{ display: 'flex', minHeight }}>
        {/* Line numbers */}
        <Box
          sx={{
            minWidth: 48,
            py: 2,
            px: 1,
            background: 'rgba(0, 0, 0, 0.3)',
            borderRight: '1px solid rgba(124, 58, 237, 0.1)',
            userSelect: 'none',
            textAlign: 'right',
          }}
        >
          {Array.from({ length: lineCount }, (_, i) => (
            <Typography
              key={i}
              component="div"
              sx={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.8rem',
                lineHeight: '1.6rem',
                color: 'rgba(148, 163, 184, 0.4)',
                height: '1.6rem',
              }}
            >
              {i + 1}
            </Typography>
          ))}
        </Box>

        {/* Editor area */}
        <Box sx={{ flex: 1, position: 'relative' }}>
          {/* Highlighted layer */}
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              py: 2,
              px: 2,
              pointerEvents: 'none',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.85rem',
              lineHeight: '1.6rem',
              color: '#e2e8f0',
              overflow: 'hidden',
            }}
            dangerouslySetInnerHTML={{ __html: highlightCode(value) || `<span style="color:#4b5563">${placeholder}</span>` }}
          />
          {/* Textarea */}
          <Box
            component="textarea"
            ref={textareaRef}
            id={id}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            spellCheck={false}
            sx={{
              width: '100%',
              minHeight: '100%',
              py: 2,
              px: 2,
              border: 'none',
              outline: 'none',
              resize: 'vertical',
              background: 'transparent',
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: '0.85rem',
              lineHeight: '1.6rem',
              color: 'transparent',
              caretColor: '#a78bfa',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              '&::placeholder': {
                color: 'transparent',
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}
