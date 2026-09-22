// ============================================================
// Text Provider — Built-in Script Generator for YouTube Shorts
// ============================================================

import type { TextProvider, GeneratedScript, ScriptScene, ResearchResult, ScriptOptions, SceneComponentType, AssetRequirement } from './types.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Built-in text provider that generates YouTube Shorts scripts
 * using the research data and structured templates.
 * No external API key required.
 */
export class BuiltInTextProvider implements TextProvider {
  name = 'built-in';

  async generateScript(
    topic: string,
    research: ResearchResult,
    options: ScriptOptions,
  ): Promise<GeneratedScript> {
    const { targetDuration } = options;
    const category = research.category;

    // Determine number of scenes based on target duration
    const sceneCount = targetDuration <= 30 ? 6 : targetDuration <= 45 ? 7 : 8;

    // Build the script structure
    const hook = this.generateHook(topic, research);
    const scenes = this.buildScenes(topic, research, sceneCount, category);

    // Calculate total words
    const wordCount = scenes.reduce((sum, s) => sum + s.narration.split(/\s+/).length, 0);

    return {
      title: this.generateTitle(topic, research),
      hook,
      totalDurationTarget: targetDuration,
      wordCount,
      scenes,
    };
  }

  private generateTitle(topic: string, research: ResearchResult): string {
    const lower = topic.toLowerCase();

    if (lower.startsWith('what is') || lower.startsWith('what are')) {
      return topic.replace(/\?$/, '') + ' — Explained Visually';
    }
    if (lower.startsWith('how does') || lower.startsWith('how do')) {
      return topic.replace(/\?$/, '') + ' — Visual Guide';
    }
    if (lower.includes(' vs ') || lower.includes(' versus ')) {
      return topic + ' — The Key Differences';
    }
    if (lower.includes('what happens when')) {
      return topic.replace(/\?$/, '') + ' ⚡';
    }

    // Clean up and title-case
    const cleaned = topic.replace(/\?$/, '').trim();
    return `${cleaned} — Explained in 60 Seconds`;
  }

  private generateHook(topic: string, research: ResearchResult): string {
    const lower = topic.toLowerCase();
    const analogy = research.analogies[0] || '';
    const misconception = research.commonMisconceptions[0] || '';

    // Topic-specific hooks
    if (lower.includes('docker')) return "Your app works on your machine but crashes on the server. Docker fixes this forever.";
    if (lower.includes('dns')) return "You type a website name. But computers only understand numbers. So who translates?";
    if (lower.includes('kubernetes') || lower.includes('k8s')) return "You have 500 containers running. One crashes. Who restarts it automatically?";
    if (lower.includes('race condition')) return "Two users click 'Buy' at the same time. Only one item left. What happens next?";
    if (lower.includes('api')) return "Every app you use talks to a server. But how? They don't speak the same language.";
    if (lower.includes('http') && lower.includes('https')) return "Your password just traveled across the internet. Was anyone watching?";
    if (lower.includes('closure')) return "This JavaScript function remembers something it shouldn't. Here's why.";
    if (lower.includes('event loop')) return "JavaScript is single-threaded. So how does it handle thousands of requests?";
    if (lower.includes('promise')) return "Your code asked for data. The server hasn't responded yet. Now what?";
    if (lower.includes('git')) return "You just deleted 200 lines of working code. No backup. Or is there?";
    if (lower.includes('redis')) return "Your database query takes 500ms. Your users won't wait. Here's the fix.";
    if (lower.includes('what happens when') && lower.includes('google')) return "You type google.com and press Enter. In the next 0.5 seconds, 10 different systems activate.";
    if (lower.includes('react')) return "Your UI has 1,000 elements. One changes. React knows exactly which one.";
    if (lower.includes('node') && !lower.includes('kube')) return "A single JavaScript thread handles 10,000 concurrent connections. How?";
    if (lower.includes('sql injection')) return "One line of user input just gave a hacker access to your entire database.";
    if (lower.includes('jwt') || lower.includes('json web token')) return "Your server doesn't remember who you are. But this token does.";
    if (lower.includes('graphql')) return "You asked for a user's name. The API returned their entire life story. There's a better way.";
    if (lower.includes('websocket')) return "HTTP sends one message and hangs up. What if you need a conversation?";
    if (lower.includes('microservice')) return "Your monolith is 2 million lines of code. One bug takes down everything.";
    if (lower.includes('cache') || lower.includes('caching')) return "Your database gets the same question 10,000 times a second. Why keep answering?";
    if (lower.includes('oauth')) return "A third-party app wants access to your data. You should NOT give it your password.";
    if (lower.includes('ci/cd')) return "You push code at 5pm. It's live in production by 5:02. No human touched it.";

    // Category-based fallback hooks
    const categoryHooks: Record<string, string[]> = {
      'programming': [
        `Most developers use ${topic.replace(/what is |how does |explain /i, '')} daily without understanding how it actually works.`,
        `This one concept separates junior from senior developers.`,
      ],
      'networking': [
        `Every time you load a webpage, this invisible process happens in milliseconds.`,
        `The internet seems simple. Under the hood, it's incredibly complex.`,
      ],
      'devops': [
        `Deploying code used to take days. Now it takes seconds. Here's how.`,
        `Your production server just went down. What happens next is critical.`,
      ],
      'database': [
        `Your database has a billion rows. Finding one takes 3 milliseconds. Here's how.`,
        `One wrong query and your entire application grinds to a halt.`,
      ],
      'security': [
        `This security vulnerability exists in 90% of web applications right now.`,
        `Your data is only as safe as your weakest security layer.`,
      ],
      'web': [
        `The browser does an insane amount of work before you see a single pixel.`,
        `Modern websites load in under 2 seconds. Here's the engineering behind it.`,
      ],
    };

    const hooks = categoryHooks[research.category] || [`Here's something about ${topic} that most people don't know.`];
    return hooks[0];
  }

  private buildScenes(
    topic: string,
    research: ResearchResult,
    sceneCount: number,
    category: string,
  ): ScriptScene[] {
    const scenes: ScriptScene[] = [];
    const facts = research.keyFacts;
    const terms = research.technicalTerms;
    const analogies = research.analogies;
    const hook = this.generateHook(topic, research);

    // Scene 1: HOOK (always)
    scenes.push({
      id: uuidv4(),
      sceneNumber: 1,
      narration: hook,
      caption: this.extractCaption(hook),
      visualDescription: `Bold hook text with attention-grabbing animation. Topic: ${topic}. Dark cinematic background with subtle particles.`,
      animationDescription: 'Text scales in with spring animation, subtle camera zoom',
      suggestedDuration: 3,
      sceneType: 'hook',
      assetRequirements: [],
    });

    // Scene 2: PROBLEM / CONTEXT
    const contextNarration = this.generateContextNarration(topic, research);
    scenes.push({
      id: uuidv4(),
      sceneNumber: 2,
      narration: contextNarration,
      caption: this.extractCaption(contextNarration),
      visualDescription: this.generateVisualDesc(topic, research, 'problem'),
      animationDescription: 'Animated diagram showing the problem scenario with progressive reveals',
      suggestedDuration: 5,
      sceneType: this.pickSceneType(category, 'problem'),
      assetRequirements: [{ type: 'diagram', description: `Problem visualization for ${topic}`, priority: 'required' }],
    });

    // Scenes 3-N-2: EXPLANATION (progressive)
    const explanationCount = sceneCount - 3; // Reserve last scene for CTA
    for (let i = 0; i < explanationCount; i++) {
      const fact = facts[i] || facts[facts.length - 1] || `Understanding ${topic} is key to building reliable systems.`;
      const term = terms[i];
      const isCodeScene = category === 'programming' && i === 0;
      const isComparisonScene = topic.toLowerCase().includes(' vs ') && i === 0;

      let narration: string;
      let sceneType: SceneComponentType;
      let visualDesc: string;
      let animDesc: string;

      if (isComparisonScene) {
        const parts = topic.toLowerCase().split(/ vs | versus /);
        narration = this.generateComparisonNarration(parts[0]?.trim() || '', parts[1]?.trim() || '', research, i);
        sceneType = 'split-comparison';
        visualDesc = `Side-by-side comparison: ${parts[0]} vs ${parts[1]}. Each side has distinct visual identity with pros/cons indicators.`;
        animDesc = 'Both panels slide in from opposite sides, comparison points appear one by one';
      } else if (isCodeScene) {
        narration = this.generateCodeNarration(topic, research, i);
        sceneType = 'code-visualization';
        visualDesc = `Code editor showing relevant ${topic} code example with syntax highlighting. Large font, dark theme.`;
        animDesc = 'Code appears with typewriter effect, key lines highlight with glow';
      } else if (i === explanationCount - 1) {
        // Key insight / reveal scene
        narration = this.generateRevealNarration(topic, research);
        sceneType = 'concept-reveal';
        visualDesc = `Key insight visualization: ${fact}. Large centered icon with supporting text. Premium glassmorphic card.`;
        animDesc = 'Card fades in with scale animation, icon pulses, text reveals line by line';
      } else {
        narration = this.generateExplanationNarration(topic, research, i);
        sceneType = 'diagram';
        visualDesc = this.generateVisualDesc(topic, research, 'explanation', i);
        animDesc = 'Nodes appear sequentially with connecting lines drawing between them, data packets flow along paths';
      }

      scenes.push({
        id: uuidv4(),
        sceneNumber: i + 3,
        narration,
        caption: this.extractCaption(narration),
        visualDescription: visualDesc,
        animationDescription: animDesc,
        suggestedDuration: 6,
        sceneType,
        assetRequirements: [
          { type: 'diagram', description: `Visual for: ${fact}`, priority: 'required' },
        ],
      });
    }

    // Final scene: CTA
    const ctaNarration = this.generateCTANarration(topic, research);
    scenes.push({
      id: uuidv4(),
      sceneNumber: sceneCount,
      narration: ctaNarration,
      caption: this.extractCaption(ctaNarration),
      visualDescription: 'Clean closing with channel branding. Key takeaway text with subscribe prompt.',
      animationDescription: 'Smooth fade transition, text slides up, follow button pulses',
      suggestedDuration: 4,
      sceneType: 'cta-end',
      assetRequirements: [],
    });

    return scenes;
  }

  private generateContextNarration(topic: string, research: ResearchResult): string {
    const lower = topic.toLowerCase();

    if (lower.includes('docker')) return "You deploy to production and it crashes. Different OS, missing dependencies, broken paths. The 'works on my machine' nightmare.";
    if (lower.includes('dns')) return "Domain names are for humans. But internet routers only understand numbers called IP addresses.";
    if (lower.includes('kubernetes') || lower.includes('k8s')) return "Running one container is easy. Running hundreds across servers with auto-healing is where Kubernetes shines.";
    if (lower.includes('race condition')) return "Two users click 'Buy' at the exact same millisecond. Only one item remains in stock.";
    if (lower.includes('api')) return "Your mobile app needs cloud data. But client and server speak different languages without an API.";
    if (lower.includes('http') && lower.includes('https')) return "HTTP sends data in plain text. Anyone on your Wi-Fi network can read your passwords.";
    if (lower.includes('closure')) return "In JavaScript, inner functions remember variables from their outer scope even after execution finishes.";
    if (lower.includes('event loop')) return "JavaScript has only one thread. Yet it handles thousands of network requests without freezing.";
    if (lower.includes('what happens when') && lower.includes('google')) return "You press Enter. Behind the scenes, your browser triggers a global cascade across distributed systems.";
    if (lower.includes('react')) return "Traditional web pages re-render everything when data changes. React only updates what actually changed.";
    if (lower.includes('git')) return "One accidental delete can wipe out weeks of work. Git tracks snapshots of your history.";
    if (lower.includes('redis')) return "Database queries take hundreds of milliseconds. When thousands of users request the same data, databases choke.";
    if (lower.includes('microservice')) return "Monoliths tangle millions of lines together. One bug in payments crashes the entire application.";
    if (lower.includes('jwt')) return "Storing sessions on one server breaks when you scale to ten. JWTs solve authentication statelessly.";
    if (lower.includes('websocket')) return "HTTP requests disconnect immediately. WebSockets keep an open bi-directional connection for instant real-time chat.";
    if (lower.includes('sql injection')) return "Unsanitized user inputs can execute destructive SQL queries directly on your database.";
    if (lower.includes('graphql')) return "REST endpoints return too much data. GraphQL lets clients request only the exact fields needed.";
    if (lower.includes('cache') || lower.includes('caching')) return "Fetching identical data repeatedly wastes database CPU. Caching serves instant answers from memory.";
    if (lower.includes('oauth')) return "Never share your password with third-party apps. OAuth grants secure, scoped temporary access tokens.";
    if (lower.includes('ci/cd')) return "Manual deployments are risky. CI/CD pipelines automatically test, build, and deploy code in minutes.";
    if (lower.includes('promise')) return "Async network calls take time. Promises represent values that will resolve in the future.";

    // Fallback using research data
    return `Here is the core technical challenge that ${topic} solves for software engineers.`;
  }

  private generateExplanationNarration(topic: string, research: ResearchResult, index: number): string {
    const facts = research.keyFacts;
    const explanations = this.getTopicExplanations(topic, research);
    if (explanations.length > index) return explanations[index];

    // Fallback to facts (short first sentence)
    if (facts[index]) {
      const firstSentence = facts[index].split('.')[0];
      return `${firstSentence}.`;
    }

    return `This is the fundamental building block of ${topic}.`;
  }

  private getTopicExplanations(topic: string, research: ResearchResult): string[] {
    const lower = topic.toLowerCase();

    if (lower.includes('docker')) return [
      "Docker packages your code, runtime, and system libraries into one isolated container.",
      "Unlike heavy virtual machines, containers share the OS kernel with near-zero overhead.",
      "Define everything in a Dockerfile. Run docker build. Your reproducible image is ready.",
      "Run the exact same container on your laptop, staging server, or AWS Kubernetes.",
    ];
    if (lower.includes('dns')) return [
      "Your browser checks its local cache. If missing, it queries your ISP's DNS resolver.",
      "The resolver queries root servers, then .com TLD servers, reaching the authoritative server.",
      "The authoritative server returns the IP address, cached at every layer for instant lookups.",
      "With the IP address secured, your browser connects directly to the server and loads.",
    ];
    if (lower.includes('kubernetes') || lower.includes('k8s')) return [
      "Kubernetes organizes containers into Pods and maintains your desired replica count automatically.",
      "If a container or server crashes, Kubernetes instantly restarts it on a healthy node.",
      "Built-in load balancers distribute incoming traffic evenly across all active pods.",
      "Declarative YAML configs let you update software with zero downtime rolling deployments.",
    ];
    if (lower.includes('race condition')) return [
      "Two threads read the same counter before either writes back. Data becomes corrupted.",
      "A mutex lock forces threads to queue up, ensuring only one writes at a time.",
      "Locks prevent corruption, but improper locking can cause deadlocks where threads freeze forever.",
      "Modern languages use atomic operations and immutable state to prevent race conditions safely.",
    ];
    if (lower.includes('api')) return [
      "When your app needs data, it sends an HTTP request to the API endpoint. The request includes the method — GET to read, POST to create, PUT to update, DELETE to remove.",
      "The server processes the request, interacts with the database if needed, and sends back a response. The response includes a status code and usually JSON data.",
      "A well-designed API is predictable. Same request, same response. It's documented, versioned, and has clear error messages when something goes wrong.",
      "API rate limiting protects the server. Too many requests from one client get throttled, ensuring fair access for everyone.",
    ];
    if (lower.includes('http') && lower.includes('https')) return [
      "HTTPS adds TLS encryption on top of HTTP. Before any data is sent, the client and server perform a TLS handshake to establish a secure encrypted channel.",
      "During the handshake, the server presents a digital certificate. The client verifies this certificate with a trusted Certificate Authority to confirm the server's identity.",
      "Once the secure channel is established, all data is encrypted. Even if someone intercepts the traffic, they see only scrambled, unreadable bytes.",
      "The padlock icon in your browser's address bar means the connection is encrypted. No padlock? Your data is traveling in plain text for anyone to read.",
    ];
    if (lower.includes('what happens when') && lower.includes('google')) return [
      "First, DNS resolution. Your browser looks up the IP address of google.com through a chain of DNS servers — cache, resolver, root, TLD, and authoritative.",
      "With the IP address, your browser opens a TCP connection using a three-way handshake. Then it negotiates TLS encryption to secure the connection.",
      "Your browser sends an HTTP GET request. Google's servers process it in milliseconds — querying search indexes, ranking results, personalizing the response.",
      "The server sends back HTML, CSS, and JavaScript. Your browser parses the HTML, builds the DOM, fetches additional resources, and renders the page pixel by pixel.",
    ];
    if (lower.includes('closure')) return [
      "When you declare a function inside another function, the inner function captures a reference to the outer function's variables. This captured environment is the closure.",
      "Even after the outer function returns, the closure keeps those variables alive in memory. The inner function can still read and modify them.",
      "This enables powerful patterns like data privacy. You can create variables that are completely hidden from the outside world, accessible only through specific functions.",
      "Closures are everywhere in JavaScript — event handlers, callbacks, timers, and the module pattern all rely on closures to work correctly.",
    ];
    if (lower.includes('event loop')) return [
      "When JavaScript encounters an async operation like a network request or timer, it sends it to the browser's Web APIs. The main thread keeps running.",
      "When the async operation completes, its callback is placed into the task queue. It doesn't interrupt whatever is currently running on the main thread.",
      "The event loop continuously checks: is the call stack empty? If yes, it takes the first callback from the task queue and pushes it onto the stack for execution.",
      "This is why a setTimeout of zero milliseconds doesn't run immediately — it has to wait for the current execution stack to clear first.",
    ];
    if (lower.includes('react')) return [
      "React uses a Virtual DOM — a lightweight JavaScript copy of the actual DOM. When state changes, React creates a new Virtual DOM and compares it with the previous one.",
      "This comparison process is called reconciliation. React's diffing algorithm identifies exactly what changed — which components, which properties, which text.",
      "Instead of updating the entire page, React batches the minimal set of changes and applies them to the real DOM in one efficient operation.",
      "Components are the building blocks. Each component manages its own state and renders its own UI. When state changes, only that component and its children re-render.",
    ];
    if (lower.includes('git')) return [
      "Git tracks changes as snapshots, not differences. Each commit is a complete picture of all your files at that moment. This makes switching between versions instant.",
      "Branching in Git is incredibly lightweight. Creating a branch is just creating a pointer to a commit. You can experiment freely without affecting the main codebase.",
      "When your feature is ready, you merge it back. Git intelligently combines changes. If the same line was modified in both branches, it flags a conflict for you to resolve.",
      "The distributed model means every developer has the full history. If the central server goes down, any developer's copy can restore the entire repository.",
    ];
    if (lower.includes('redis')) return [
      "Redis stores everything in memory — RAM, not disk. This makes read and write operations incredibly fast. Microseconds instead of milliseconds.",
      "You can use Redis as a cache layer between your application and database. First check Redis. If the data is there, return it immediately. If not, query the database and store the result in Redis.",
      "Redis isn't just key-value pairs. It supports lists, sets, sorted sets, hashes, and streams. This makes it versatile for leaderboards, queues, sessions, and real-time analytics.",
      "The trade-off is memory. RAM is expensive and limited. You need a strategy for what to cache and when to expire it. Redis supports TTL — time-to-live — on every key.",
    ];

    return [];
  }

  private generateComparisonNarration(left: string, right: string, research: ResearchResult, index: number): string {
    if (index === 0) {
      return `Let's compare ${left} and ${right} side by side. They might seem similar, but the differences are critical.`;
    }
    if (index === 1) {
      return `${left} ${research.keyFacts[0] || 'has specific strengths'}. ${right} ${research.keyFacts[1] || 'takes a different approach'}.`;
    }
    return `Understanding when to use each one is what separates beginners from experienced developers.`;
  }

  private generateCodeNarration(topic: string, research: ResearchResult, _index: number): string {
    const lower = topic.toLowerCase();
    if (lower.includes('closure')) return "Here's a closure in action. The counter variable is trapped inside the outer function. Only the returned function can access it. That's data privacy through closures.";
    if (lower.includes('promise')) return "Here's how promises work. You call fetch, which returns a promise. You chain .then to handle the result, and .catch to handle errors. Clean, readable async code.";
    if (lower.includes('async') || lower.includes('await')) return "Async await is syntactic sugar over promises. The await keyword pauses execution until the promise resolves, making asynchronous code look and feel synchronous.";
    if (lower.includes('event loop')) return "Look at this code. A setTimeout of zero milliseconds. A console log before it. A console log after it. What's the output order? Not what you'd expect.";
    if (lower.includes('react')) return "Here's a React component. It manages its own state with useState. When the button is clicked, the state updates, and React re-renders only this component.";
    return `Let's look at the code. This is a practical example of ${topic} that you can use in your own projects.`;
  }

  private generateRevealNarration(topic: string, research: ResearchResult): string {
    const lower = topic.toLowerCase();
    if (lower.includes('docker')) return "Docker makes environments reproducible. Build once, deploy anywhere, runs identically every single time.";
    if (lower.includes('dns')) return "All of this happens globally in under twenty milliseconds. The invisible backbone of the web.";
    if (lower.includes('kubernetes')) return "Kubernetes handles self-healing, scaling, and rolling updates declaratively without human intervention.";
    if (lower.includes('race condition')) return "Whenever you share mutable state across concurrent threads, synchronization is mandatory.";
    if (lower.includes('api')) return "APIs are the connective tissue powering every modern mobile and web application.";

    // Use research misconception or analogy as reveal
    if (research.commonMisconceptions[0]) return `Remember this key fact: ${research.commonMisconceptions[0]}`;
    return `That is the fundamental architectural takeaway behind ${topic}.`;
  }

  private generateCTANarration(topic: string, research: ResearchResult): string {
    const related = research.relatedTopics[0] || 'more systems architecture';
    return `Want to learn about ${related}? Subscribe to CodeWithSundresh for daily tech explainers.`;
  }

  private extractCaption(narration: string): string {
    // Take first sentence or first 8 words as the caption
    const firstSentence = narration.split(/[.!?]/)[0] || narration;
    const words = firstSentence.split(/\s+/);
    if (words.length <= 8) return firstSentence;
    return words.slice(0, 6).join(' ') + '...';
  }

  private pickSceneType(category: string, purpose: string): SceneComponentType {
    if (purpose === 'problem') {
      if (category === 'networking') return 'diagram';
      if (category === 'programming') return 'code-visualization';
      if (category === 'devops') return 'diagram';
      if (category === 'database') return 'diagram';
      return 'concept-reveal';
    }
    return 'diagram';
  }

  private generateVisualDesc(topic: string, research: ResearchResult, purpose: string, index?: number): string {
    const lower = topic.toLowerCase();

    if (purpose === 'problem') {
      if (lower.includes('docker')) return 'Developer laptop showing "works on my machine" with green checkmark. Server showing red X with error. Frustrated developer icon.';
      if (lower.includes('dns')) return 'Browser address bar with google.com typed. Question mark connecting to a chain of DNS servers. Each server glows when queried.';
      if (lower.includes('race condition')) return 'Two user icons connected to one shared database. Both reading "Balance: $100". Arrows showing simultaneous writes. Red warning indicator.';
      if (lower.includes('api')) return 'Phone app on one side, cloud server on the other. Dotted line between them with a question mark. Different "languages" shown.';
      if (lower.includes('kubernetes')) return 'Grid of container boxes, some green (healthy), some red (crashed), some yellow (overloaded). No orchestrator present.';
      return `Visual representation of the problem that ${topic} solves. Dark themed diagram with glowing nodes.`;
    }

    // Explanation visuals
    if (lower.includes('docker') && index !== undefined) {
      const visuals = [
        'Docker container diagram: Application + Dependencies + Runtime packaged together. Ship icon on the side.',
        'Side-by-side comparison: VM with full OS layer vs Container sharing host kernel. Container is much thinner.',
        'Dockerfile code flowing into a Docker image, then deploying as multiple identical containers.',
        'Docker Compose YAML with arrows connecting web, database, and redis containers.',
      ];
      return visuals[index] || visuals[0];
    }
    if (lower.includes('dns') && index !== undefined) {
      const visuals = [
        'Browser → Local Cache check. Green checkmark if cached, red X if not. Arrow continues to OS resolver.',
        'Hierarchical tree: Root servers at top, TLD servers (.com, .org) in middle, Authoritative server at bottom.',
        'DNS response packet flowing back through the chain. Each level caches the response. TTL timer shown.',
        'Final connection: Browser with IP address → TCP handshake → Web server. Page loads.',
      ];
      return visuals[index] || visuals[0];
    }

    return `Animated technical diagram for ${topic}. Glassmorphic nodes with neon accent connections on dark background.`;
  }
}
