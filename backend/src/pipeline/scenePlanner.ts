// ============================================================
// Scene Planner — Converts script scenes into concrete visual specs
// ============================================================

import type { GeneratedScript, ScriptScene, ResearchResult, PlannedScene, AnimationType, TransitionType, CameraMovement, BackgroundConfig } from '../providers/types.js';
import { v4 as uuidv4 } from 'uuid';
import path from 'node:path';
import fs from 'node:fs';

/**
 * Convert script scenes into planned scenes with concrete visual configurations
 * suitable for Remotion rendering.
 */
export function buildScenePlan(
  script: GeneratedScript,
  research: ResearchResult,
  projectDir: string,
): PlannedScene[] {
  return script.scenes.map((scene, index) => {
    const isFirst = index === 0;
    const isLast = index === script.scenes.length - 1;

    return {
      id: scene.id,
      sceneNumber: scene.sceneNumber,
      narration: scene.narration,
      captionPhrases: buildCaptionPhrases(scene.narration, scene.suggestedDuration),
      durationFrames: scene.suggestedDuration * 30, // Will be adjusted by timeline builder
      componentType: scene.sceneType,
      visualConfig: buildVisualConfig(scene, research, index, script.scenes.length),
      animation: pickAnimation(scene.sceneType, isFirst),
      transition: isLast ? 'fade' as TransitionType : pickTransition(index),
      cameraMovement: pickCamera(scene.sceneType, isFirst),
      assets: scene.assetRequirements.map(req => ({
        id: uuidv4(),
        type: req.type === 'image' ? 'image' as const : 'svg-diagram' as const,
        prompt: req.description,
        status: 'pending' as const,
      })),
      background: {
        type: 'gradient',
        value: 'radial-gradient(ellipse at 50% 30%, #111827 0%, #0a0a0f 70%)',
      },
    };
  });
}

function buildCaptionPhrases(narration: string, durationSec: number): Array<{ text: string; startFrame: number; endFrame: number; highlight?: boolean }> {
  // Split narration into sentences, then into short phrases
  const sentences = narration.split(/(?<=[.!?])\s+/).filter(s => s.trim());
  const totalFrames = durationSec * 30;
  const phrases: Array<{ text: string; startFrame: number; endFrame: number; highlight?: boolean }> = [];

  const framesPerSentence = Math.floor(totalFrames / Math.max(sentences.length, 1));

  sentences.forEach((sentence, i) => {
    // Break long sentences into 2-6 word chunks
    const words = sentence.split(/\s+/);
    const chunkSize = Math.min(6, Math.max(2, Math.ceil(words.length / 2)));
    const chunks: string[] = [];

    for (let j = 0; j < words.length; j += chunkSize) {
      chunks.push(words.slice(j, j + chunkSize).join(' '));
    }

    const sentenceStart = i * framesPerSentence;
    const framesPerChunk = Math.floor(framesPerSentence / Math.max(chunks.length, 1));

    chunks.forEach((chunk, k) => {
      const start = sentenceStart + k * framesPerChunk;
      phrases.push({
        text: chunk,
        startFrame: start,
        endFrame: start + framesPerChunk,
        highlight: k === 0, // highlight first chunk of each sentence
      });
    });
  });

  return phrases;
}

function buildVisualConfig(
  scene: ScriptScene,
  research: ResearchResult,
  index: number,
  totalScenes: number,
): Record<string, unknown> {
  const lower = research.topic.toLowerCase();

  switch (scene.sceneType) {
    case 'hook':
      return {
        title: scene.caption.toUpperCase(),
        text: scene.narration,
        hookLayout: 'glassmorphic',
        hookBadge: '⚡',
        hookBadgeStyle: 'glow',
      };

    case 'diagram':
      return buildDiagramConfig(scene, research, index);

    case 'code-visualization':
      return buildCodeConfig(scene, research);

    case 'concept-reveal':
      return {
        title: scene.caption,
        text: scene.narration,
        icon: getTopicIcon(research.topic),
        badge: research.category.toUpperCase(),
      };

    case 'split-comparison':
      return buildComparisonConfig(scene, research);

    case 'cinematic-image':
      return {
        title: scene.caption,
        text: scene.narration,
        cinematicZoom: true,
      };

    case 'browser-sim':
      return {
        title: scene.caption,
        text: scene.narration,
        browserUrl: getBrowserUrl(research.topic),
        browserSimState: 'loading',
        browserPageTitle: scene.caption,
      };

    case 'cta-end':
      return {
        title: scene.caption,
        text: scene.narration,
        channelName: 'CodeWithSundresh',
        channelHandle: '@CodeWithSundresh',
      };

    default:
      return {
        title: scene.caption,
        text: scene.narration,
      };
  }
}

function buildDiagramConfig(scene: ScriptScene, research: ResearchResult, index: number): Record<string, unknown> {
  const lower = research.topic.toLowerCase();

  // Generate flow nodes based on topic
  let flowNodes: Array<{ id: string; label: string; icon: string; status: string; detail: string }> = [];

  if (lower.includes('docker')) {
    const configs = [
      [
        { id: 'app', label: 'APPLICATION', icon: '📦', status: 'active', detail: 'Your Code' },
        { id: 'deps', label: 'DEPENDENCIES', icon: '📚', status: 'active', detail: 'Libraries' },
        { id: 'container', label: 'CONTAINER', icon: '🐳', status: 'pending', detail: 'Docker' },
      ],
      [
        { id: 'dev', label: 'DEVELOPMENT', icon: '💻', status: 'done', detail: 'Local Machine' },
        { id: 'image', label: 'DOCKER IMAGE', icon: '📋', status: 'active', detail: 'Build' },
        { id: 'prod', label: 'PRODUCTION', icon: '🌐', status: 'pending', detail: 'Server' },
      ],
      [
        { id: 'dockerfile', label: 'DOCKERFILE', icon: '📄', status: 'done', detail: 'Instructions' },
        { id: 'build', label: 'BUILD', icon: '🔨', status: 'active', detail: 'docker build' },
        { id: 'registry', label: 'REGISTRY', icon: '📦', status: 'pending', detail: 'Docker Hub' },
      ],
    ];
    flowNodes = configs[Math.min(index - 1, configs.length - 1)] || configs[0];
  } else if (lower.includes('dns')) {
    const configs = [
      [
        { id: 'browser', label: 'BROWSER', icon: '🌐', status: 'active', detail: 'google.com' },
        { id: 'cache', label: 'LOCAL CACHE', icon: '💾', status: 'active', detail: 'Check First' },
        { id: 'resolver', label: 'DNS RESOLVER', icon: '🔍', status: 'pending', detail: 'ISP Server' },
      ],
      [
        { id: 'resolver', label: 'RESOLVER', icon: '🔍', status: 'done', detail: 'Querying' },
        { id: 'root', label: 'ROOT SERVER', icon: '🏛️', status: 'active', detail: '13 Worldwide' },
        { id: 'tld', label: 'TLD SERVER', icon: '📂', status: 'pending', detail: '.com Zone' },
      ],
      [
        { id: 'tld', label: '.COM TLD', icon: '📂', status: 'done', detail: 'Found Zone' },
        { id: 'auth', label: 'AUTHORITATIVE', icon: '✅', status: 'active', detail: 'google.com' },
        { id: 'ip', label: 'IP ADDRESS', icon: '🎯', status: 'pending', detail: '142.250.x.x' },
      ],
    ];
    flowNodes = configs[Math.min(index - 1, configs.length - 1)] || configs[0];
  } else if (lower.includes('api')) {
    const configs = [
      [
        { id: 'client', label: 'CLIENT APP', icon: '📱', status: 'active', detail: 'Frontend' },
        { id: 'api', label: 'API ENDPOINT', icon: '🔗', status: 'active', detail: '/api/users' },
        { id: 'server', label: 'SERVER', icon: '🖥️', status: 'pending', detail: 'Backend' },
      ],
      [
        { id: 'request', label: 'HTTP REQUEST', icon: '📤', status: 'done', detail: 'GET /users' },
        { id: 'server', label: 'SERVER LOGIC', icon: '⚙️', status: 'active', detail: 'Process' },
        { id: 'db', label: 'DATABASE', icon: '🗄️', status: 'pending', detail: 'Query' },
      ],
    ];
    flowNodes = configs[Math.min(index - 1, configs.length - 1)] || configs[0];
  } else if (lower.includes('race condition')) {
    flowNodes = [
      { id: 'user_a', label: 'THREAD A', icon: '👤', status: 'active', detail: 'Read Balance' },
      { id: 'shared', label: 'SHARED DATA', icon: '🗄️', status: 'active', detail: '$100' },
      { id: 'user_b', label: 'THREAD B', icon: '👤', status: 'active', detail: 'Read Balance' },
    ];
  } else if (lower.includes('kubernetes') || lower.includes('k8s')) {
    flowNodes = [
      { id: 'user', label: 'USER TRAFFIC', icon: '👥', status: 'done', detail: 'Requests' },
      { id: 'lb', label: 'LOAD BALANCER', icon: '⚖️', status: 'active', detail: 'Ingress' },
      { id: 'pods', label: 'PODS', icon: '🐳', status: 'pending', detail: '3 Replicas' },
    ];
  } else if (lower.includes('http') && lower.includes('https')) {
    flowNodes = [
      { id: 'client', label: 'BROWSER', icon: '🌐', status: 'active', detail: 'Client' },
      { id: 'tls', label: 'TLS HANDSHAKE', icon: '🔒', status: 'active', detail: 'Encrypt' },
      { id: 'server', label: 'WEB SERVER', icon: '🖥️', status: 'pending', detail: 'HTTPS' },
    ];
  } else {
    // Generic diagram
    flowNodes = [
      { id: 'input', label: 'INPUT', icon: '📥', status: 'done', detail: 'Request' },
      { id: 'process', label: 'PROCESS', icon: '⚙️', status: 'active', detail: 'Core Logic' },
      { id: 'output', label: 'OUTPUT', icon: '📤', status: 'pending', detail: 'Response' },
    ];
  }

  return {
    title: scene.caption,
    text: scene.narration,
    flowNodes,
    flowActiveStep: 1,
    packetLabel: scene.caption,
    telemetry: {
      protocol: getProtocolLabel(research.topic),
      status: 'ACTIVE',
    },
  };
}

function buildCodeConfig(scene: ScriptScene, research: ResearchResult): Record<string, unknown> {
  const lower = research.topic.toLowerCase();
  let code = '';
  let language = 'javascript';

  if (lower.includes('closure')) {
    code = `function createCounter() {
  let count = 0;
  return {
    increment: () => ++count,
    getCount: () => count
  };
}

const counter = createCounter();
counter.increment(); // 1
counter.increment(); // 2`;
  } else if (lower.includes('promise')) {
    code = `fetch('/api/users')
  .then(response => response.json())
  .then(users => {
    console.log(users);
  })
  .catch(error => {
    console.error('Failed:', error);
  });`;
  } else if (lower.includes('event loop')) {
    code = `console.log('First');

setTimeout(() => {
  console.log('Second');
}, 0);

console.log('Third');

// Output: First, Third, Second`;
  } else if (lower.includes('docker')) {
    code = `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]`;
    language = 'dockerfile';
  } else if (lower.includes('react')) {
    code = `function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Clicked {count} times
    </button>
  );
}`;
    language = 'jsx';
  } else if (lower.includes('python')) {
    code = `# Python example
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

print(fibonacci(10))  # 55`;
    language = 'python';
  } else {
    code = `// ${research.topic}
const result = await process(input);
console.log(result);`;
  }

  return {
    title: scene.caption,
    text: scene.narration,
    code,
    language,
    output: '',
  };
}

function buildComparisonConfig(scene: ScriptScene, research: ResearchResult): Record<string, unknown> {
  const lower = research.topic.toLowerCase();
  let leftTitle = 'Option A';
  let rightTitle = 'Option B';

  if (lower.includes(' vs ') || lower.includes(' versus ')) {
    const parts = research.topic.split(/ vs | versus /i);
    leftTitle = parts[0]?.trim() || leftTitle;
    rightTitle = parts[1]?.trim() || rightTitle;
  }

  return {
    title: scene.caption,
    text: scene.narration,
    comparisonLeftTitle: leftTitle.toUpperCase(),
    comparisonRightTitle: rightTitle.toUpperCase(),
    comparisonVerdict: scene.narration,
  };
}

function getTopicIcon(topic: string): string {
  const lower = topic.toLowerCase();
  if (lower.includes('docker')) return '🐳';
  if (lower.includes('dns')) return '🌐';
  if (lower.includes('kubernetes') || lower.includes('k8s')) return '☸️';
  if (lower.includes('react')) return '⚛️';
  if (lower.includes('javascript') || lower.includes('js')) return '📜';
  if (lower.includes('python')) return '🐍';
  if (lower.includes('api')) return '🔗';
  if (lower.includes('git')) return '📂';
  if (lower.includes('database') || lower.includes('sql')) return '🗄️';
  if (lower.includes('security') || lower.includes('https')) return '🔒';
  if (lower.includes('redis') || lower.includes('cache')) return '⚡';
  if (lower.includes('ai') || lower.includes('machine learning')) return '🤖';
  if (lower.includes('race condition')) return '🏁';
  return '💡';
}

function getBrowserUrl(topic: string): string {
  const lower = topic.toLowerCase();
  if (lower.includes('google')) return 'https://google.com';
  if (lower.includes('docker')) return 'https://hub.docker.com';
  if (lower.includes('dns')) return 'https://example.com';
  if (lower.includes('api')) return 'https://api.example.com/v1/users';
  return 'https://example.com';
}

function getProtocolLabel(topic: string): string {
  const lower = topic.toLowerCase();
  if (lower.includes('dns')) return 'DNS / UDP 53';
  if (lower.includes('http') && lower.includes('https')) return 'TLS 1.3 / HTTPS';
  if (lower.includes('docker')) return 'Docker Engine API';
  if (lower.includes('kubernetes')) return 'Kubernetes API';
  if (lower.includes('api')) return 'HTTP / REST';
  if (lower.includes('websocket')) return 'WebSocket / WS';
  if (lower.includes('grpc') || lower.includes('graphql')) return 'HTTP/2';
  return 'TCP / IP';
}

function pickAnimation(sceneType: string, isFirst: boolean): AnimationType {
  if (isFirst) return 'scale';
  switch (sceneType) {
    case 'code-visualization': return 'typewriter';
    case 'diagram': return 'draw-path';
    case 'concept-reveal': return 'spring';
    case 'split-comparison': return 'slide-left';
    default: return 'fade';
  }
}

function pickTransition(index: number): TransitionType {
  const transitions: TransitionType[] = ['fade', 'slide', 'zoom', 'fade'];
  return transitions[index % transitions.length];
}

function pickCamera(sceneType: string, isFirst: boolean): CameraMovement {
  if (isFirst) return 'slow-zoom-in';
  if (sceneType === 'cinematic-image') return 'ken-burns';
  if (sceneType === 'diagram') return 'slow-zoom-in';
  return 'none';
}
