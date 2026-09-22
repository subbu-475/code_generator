// ============================================================
// Research Provider — Built-in tech topic knowledge base
// ============================================================

import type { ResearchProvider, ResearchResult, TopicCategory } from './types.js';

/** Keyword → category mapping */
const CATEGORY_KEYWORDS: Record<TopicCategory, string[]> = {
  'programming': ['javascript', 'python', 'java', 'typescript', 'react', 'vue', 'angular', 'closure', 'promise', 'async', 'await', 'function', 'variable', 'loop', 'recursion', 'oop', 'class', 'inheritance', 'polymorphism', 'abstraction', 'encapsulation', 'garbage collection', 'event loop', 'callback', 'hoisting', 'scope', 'prototype', 'this keyword', 'arrow function', 'destructuring', 'spread operator', 'rest parameter', 'template literal', 'map', 'filter', 'reduce', 'array', 'object', 'string', 'number', 'boolean', 'null', 'undefined', 'symbol', 'bigint', 'weakmap', 'weakset', 'proxy', 'reflect', 'generator', 'iterator', 'decorator', 'mixin', 'currying', 'memoization', 'debounce', 'throttle', 'race condition', 'deadlock', 'mutex', 'semaphore', 'thread', 'process', 'concurrency', 'parallelism', 'compiler', 'interpreter', 'jit', 'bytecode', 'ast', 'lexer', 'parser', 'regex', 'data structure', 'algorithm', 'linked list', 'stack', 'queue', 'tree', 'graph', 'hash', 'heap', 'sort', 'search', 'binary', 'dynamic programming', 'greedy', 'backtracking', 'rust', 'go', 'golang', 'c++', 'swift', 'kotlin', 'ruby', 'php', 'perl', 'scala', 'elixir', 'haskell', 'clojure'],
  'networking': ['dns', 'tcp', 'udp', 'http', 'https', 'ip', 'ip address', 'subnet', 'router', 'switch', 'firewall', 'vpn', 'proxy', 'nat', 'dhcp', 'arp', 'icmp', 'ping', 'traceroute', 'ssl', 'tls', 'certificate', 'handshake', 'websocket', 'grpc', 'rest', 'api', 'graphql', 'cors', 'cdn', 'load balancer', 'reverse proxy', 'nginx', 'packet', 'port', 'socket', 'bandwidth', 'latency', 'throughput', 'osi model', 'tcp/ip', 'url', 'domain', 'hostname', 'what happens when you type', 'browser request', 'network', 'internet', 'ethernet', 'wifi', 'protocol', 'http2', 'http3', 'quic'],
  'devops': ['docker', 'kubernetes', 'k8s', 'container', 'pod', 'service mesh', 'istio', 'envoy', 'ci/cd', 'jenkins', 'github actions', 'gitlab', 'terraform', 'ansible', 'puppet', 'chef', 'helm', 'deployment', 'rollback', 'blue-green', 'canary', 'rolling update', 'infrastructure as code', 'iac', 'monitoring', 'prometheus', 'grafana', 'logging', 'elk', 'elasticsearch', 'logstash', 'kibana', 'devops', 'sre', 'microservice', 'monolith', 'serverless', 'lambda', 'cloud function', 'fargate', 'ecs', 'eks', 'aks', 'gke', 'vagrant', 'packer', 'consul', 'vault'],
  'database': ['sql', 'nosql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'redis', 'cassandra', 'dynamodb', 'sqlite', 'oracle', 'database', 'index', 'query', 'join', 'transaction', 'acid', 'base', 'cap theorem', 'sharding', 'replication', 'normalization', 'denormalization', 'orm', 'migration', 'schema', 'primary key', 'foreign key', 'stored procedure', 'trigger', 'view', 'materialized view', 'caching', 'cache invalidation', 'write-ahead log', 'wal', 'b-tree', 'lsm tree', 'column store', 'document store', 'key-value store', 'graph database', 'neo4j', 'firebase', 'supabase', 'prisma', 'drizzle', 'sequelize'],
  'ai-ml': ['machine learning', 'deep learning', 'neural network', 'transformer', 'attention', 'gpt', 'llm', 'large language model', 'bert', 'embedding', 'vector', 'rag', 'fine-tuning', 'training', 'inference', 'model', 'dataset', 'feature', 'classification', 'regression', 'clustering', 'reinforcement learning', 'supervised', 'unsupervised', 'cnn', 'rnn', 'lstm', 'gan', 'diffusion', 'stable diffusion', 'midjourney', 'dall-e', 'openai', 'anthropic', 'gemini', 'claude', 'chatgpt', 'ai', 'artificial intelligence', 'natural language', 'nlp', 'computer vision', 'object detection', 'image recognition', 'sentiment analysis', 'tokenizer', 'prompt engineering', 'agent', 'chain of thought', 'hallucination'],
  'system-design': ['system design', 'architecture', 'scalability', 'availability', 'consistency', 'partition tolerance', 'distributed system', 'message queue', 'kafka', 'rabbitmq', 'pub/sub', 'event-driven', 'cqrs', 'event sourcing', 'saga pattern', 'circuit breaker', 'rate limiting', 'api gateway', 'service discovery', 'design pattern', 'singleton', 'factory', 'observer', 'strategy', 'adapter', 'facade', 'decorator pattern', 'proxy pattern', 'mvc', 'mvvm', 'clean architecture', 'hexagonal', 'onion architecture', 'domain-driven design', 'ddd', 'microservices', 'monorepo', 'microfrontend'],
  'security': ['security', 'authentication', 'authorization', 'oauth', 'jwt', 'token', 'session', 'cookie', 'xss', 'csrf', 'sql injection', 'cors', 'encryption', 'hashing', 'bcrypt', 'salt', 'pepper', 'aes', 'rsa', 'sha', 'md5', 'public key', 'private key', 'digital signature', 'certificate authority', 'password', 'mfa', '2fa', 'otp', 'sso', 'saml', 'ldap', 'rbac', 'abac', 'zero trust', 'pen testing', 'vulnerability', 'exploit', 'malware', 'ransomware', 'phishing', 'ddos', 'waf', 'firewall'],
  'web': ['html', 'css', 'dom', 'virtual dom', 'shadow dom', 'web component', 'pwa', 'service worker', 'web worker', 'indexeddb', 'local storage', 'session storage', 'cookie', 'spa', 'ssr', 'ssg', 'isr', 'hydration', 'next.js', 'nextjs', 'nuxt', 'remix', 'astro', 'svelte', 'sveltekit', 'vite', 'webpack', 'esbuild', 'turbopack', 'rollup', 'babel', 'postcss', 'tailwind', 'bootstrap', 'sass', 'less', 'styled-components', 'emotion', 'css modules', 'responsive', 'accessibility', 'a11y', 'seo', 'core web vitals', 'lighthouse', 'browser', 'rendering', 'paint', 'layout', 'compositing', 'critical rendering path', 'lazy loading', 'code splitting', 'tree shaking', 'hot module replacement'],
  'general-tech': []
};

function classifyTopic(topic: string): TopicCategory {
  const lower = topic.toLowerCase();
  let bestCategory: TopicCategory = 'general-tech';
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    let score = 0;
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        score += keyword.length; // longer matches are more specific
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category as TopicCategory;
    }
  }
  return bestCategory;
}

/** Built-in research provider using curated tech knowledge */
export class BuiltInResearchProvider implements ResearchProvider {
  name = 'built-in';

  async research(topic: string): Promise<ResearchResult> {
    const category = classifyTopic(topic);
    const lower = topic.toLowerCase();

    // Generate contextual research based on category
    const result: ResearchResult = {
      topic,
      category,
      summary: this.generateSummary(topic, category),
      keyFacts: this.generateKeyFacts(topic, category),
      analogies: this.generateAnalogies(topic, category),
      visualMetaphors: this.generateVisualMetaphors(topic, category),
      technicalTerms: this.generateTechnicalTerms(topic, category),
      commonMisconceptions: this.generateMisconceptions(topic, category),
      relatedTopics: this.generateRelatedTopics(topic, category),
    };

    return result;
  }

  private generateSummary(topic: string, category: TopicCategory): string {
    const lower = topic.toLowerCase();
    
    // DNS-related
    if (lower.includes('dns')) {
      return 'DNS (Domain Name System) is the internet\'s phone book. It translates human-readable domain names like google.com into IP addresses that computers use to identify each other on the network. Every time you visit a website, a DNS lookup happens behind the scenes.';
    }
    if (lower.includes('docker')) {
      return 'Docker is a platform that packages applications and their dependencies into lightweight, portable containers. Unlike virtual machines, containers share the host OS kernel, making them fast to start and efficient with resources. Docker revolutionized how we build, ship, and run software.';
    }
    if (lower.includes('kubernetes') || lower.includes('k8s')) {
      return 'Kubernetes (K8s) is an open-source container orchestration platform. It automates deploying, scaling, and managing containerized applications across clusters of machines. Originally designed by Google, it handles load balancing, self-healing, rolling updates, and service discovery.';
    }
    if (lower.includes('race condition')) {
      return 'A race condition occurs when two or more operations try to access shared data simultaneously, and the final result depends on the timing of execution. This is one of the most common and dangerous bugs in concurrent programming.';
    }
    if (lower.includes('http') && lower.includes('https')) {
      return 'HTTP (Hypertext Transfer Protocol) sends data in plain text, while HTTPS adds TLS encryption. HTTPS prevents eavesdropping, tampering, and impersonation. The \'S\' stands for Secure — it uses certificates to verify server identity and encrypt all data in transit.';
    }
    if (lower.includes('api')) {
      return 'An API (Application Programming Interface) is a contract that allows two applications to communicate. Think of it as a waiter in a restaurant — you tell the waiter what you want, the waiter goes to the kitchen, and brings back your food. APIs work the same way between software systems.';
    }
    if (lower.includes('javascript') || lower.includes('js')) {
      if (lower.includes('closure')) {
        return 'A closure in JavaScript is a function that remembers variables from its outer scope even after that scope has finished executing. Closures are fundamental to JavaScript and power patterns like data privacy, function factories, and event handlers.';
      }
      if (lower.includes('event loop')) {
        return 'The JavaScript event loop is the mechanism that allows JavaScript to perform non-blocking operations despite being single-threaded. It continuously checks the call stack and task queue, executing callbacks when the stack is empty.';
      }
      if (lower.includes('promise')) {
        return 'A Promise in JavaScript represents the eventual completion or failure of an asynchronous operation. It has three states: pending, fulfilled, or rejected. Promises replaced callback hell with cleaner chaining and async/await syntax.';
      }
      return 'JavaScript is the programming language of the web. It runs in browsers and on servers (via Node.js), powering interactive websites, APIs, mobile apps, and even desktop applications. It\'s dynamically typed, prototype-based, and supports both functional and object-oriented programming.';
    }
    if (lower.includes('react')) {
      return 'React is a JavaScript library for building user interfaces. Created by Facebook, it uses a virtual DOM for efficient rendering, components for reusable UI pieces, and a unidirectional data flow. React\'s declarative approach makes complex UIs predictable and easy to debug.';
    }
    if (lower.includes('node') || lower.includes('nodejs')) {
      return 'Node.js is a JavaScript runtime built on Chrome\'s V8 engine that lets you run JavaScript on the server. It uses an event-driven, non-blocking I/O model that makes it lightweight and efficient for building scalable network applications.';
    }
    if (lower.includes('git')) {
      return 'Git is a distributed version control system that tracks changes in your code. Every developer has a full copy of the repository history. Git enables branching, merging, and collaboration, making it the foundation of modern software development workflows.';
    }
    if (lower.includes('redis')) {
      return 'Redis is an in-memory data store used as a database, cache, and message broker. It stores data in key-value pairs entirely in RAM, making it extremely fast. Redis supports various data structures including strings, lists, sets, sorted sets, and hashes.';
    }
    if (lower.includes('sql injection')) {
      return 'SQL Injection is a code injection attack where malicious SQL statements are inserted into application queries. Attackers can read, modify, or delete database data, bypass authentication, and even execute system commands. Parameterized queries and ORMs prevent it.';
    }
    if (lower.includes('what happens when') && lower.includes('google')) {
      return 'When you type google.com and press Enter, your browser performs DNS resolution to find Google\'s IP address, establishes a TCP connection, negotiates TLS encryption, sends an HTTP request, receives the response, and renders the page — all in under a second.';
    }
    if (lower.includes('microservice')) {
      return 'Microservices architecture structures an application as a collection of small, independent services that communicate over APIs. Each service owns its data, can be deployed independently, and can use different technologies. This contrasts with monolithic architecture where everything is in one codebase.';
    }
    if (lower.includes('graphql')) {
      return 'GraphQL is a query language for APIs that lets clients request exactly the data they need. Unlike REST where each endpoint returns a fixed structure, GraphQL has a single endpoint where clients specify the shape of the response, eliminating over-fetching and under-fetching.';
    }
    if (lower.includes('websocket')) {
      return 'WebSockets provide full-duplex, persistent communication between client and server over a single TCP connection. Unlike HTTP\'s request-response model, WebSockets allow both sides to send data at any time, making them ideal for real-time applications like chat, gaming, and live updates.';
    }
    if (lower.includes('jwt') || lower.includes('json web token')) {
      return 'JSON Web Tokens (JWT) are a compact, URL-safe way to represent claims between two parties. A JWT contains a header, payload, and signature. They\'re commonly used for stateless authentication — the server doesn\'t need to store session data because the token itself contains all the user information.';
    }
    if (lower.includes('oauth')) {
      return 'OAuth 2.0 is an authorization framework that allows third-party applications to access user resources without sharing passwords. Instead of giving your password, you grant a temporary access token with specific permissions. It powers "Login with Google/GitHub/Facebook" flows.';
    }
    if (lower.includes('ci/cd') || lower.includes('cicd')) {
      return 'CI/CD (Continuous Integration/Continuous Delivery) automates the process of building, testing, and deploying code changes. CI merges code frequently and runs automated tests. CD automatically deploys passing builds to production, reducing manual errors and speeding up delivery.';
    }
    if (lower.includes('cache') || lower.includes('caching')) {
      return 'Caching stores copies of frequently accessed data in a faster storage layer, reducing load on the primary data source and improving response times. Caches exist at every level: browser, CDN, application, and database. The hardest problem in caching is cache invalidation.';
    }
    
    // Generic fallback
    return `${topic} is a fundamental concept in modern technology. Understanding it is essential for developers and engineers working with contemporary systems and architectures.`;
  }

  private generateKeyFacts(topic: string, category: TopicCategory): string[] {
    const lower = topic.toLowerCase();
    
    if (lower.includes('docker')) {
      return [
        'Docker containers share the host OS kernel, unlike VMs which need a full OS',
        'A Dockerfile is a text file with instructions to build a container image',
        'Docker images are built in layers — each instruction creates a new layer',
        'Containers are ephemeral by default — data is lost when they stop',
        'Docker Hub is the largest public registry with millions of pre-built images',
        'Docker Compose orchestrates multi-container applications with a YAML file',
      ];
    }
    if (lower.includes('dns')) {
      return [
        'DNS uses a hierarchical system: Root → TLD → Authoritative servers',
        'DNS queries typically use UDP on port 53',
        'DNS records include A (IPv4), AAAA (IPv6), CNAME, MX, TXT, and NS',
        'DNS results are cached at multiple levels to reduce lookup time',
        'The first DNS query may take 20-120ms, cached queries are near-instant',
        'There are 13 root DNS server clusters worldwide',
      ];
    }
    if (lower.includes('kubernetes') || lower.includes('k8s')) {
      return [
        'A Pod is the smallest deployable unit in Kubernetes',
        'Kubernetes uses declarative configuration — you describe the desired state',
        'Services provide stable networking for Pods that may be created and destroyed',
        'Kubernetes can auto-scale based on CPU, memory, or custom metrics',
        'kubectl is the command-line tool for interacting with Kubernetes clusters',
        'Originally developed by Google, now maintained by the CNCF',
      ];
    }
    if (lower.includes('race condition')) {
      return [
        'Race conditions occur when multiple threads access shared data concurrently',
        'The outcome depends on the non-deterministic ordering of operations',
        'Mutexes and locks are common solutions to prevent race conditions',
        'Race conditions can cause data corruption, crashes, and security vulnerabilities',
        'Even simple operations like counter++ are not atomic in most languages',
        'Testing for race conditions is difficult because they may not reproduce consistently',
      ];
    }
    if (lower.includes('javascript') && lower.includes('closure')) {
      return [
        'A closure captures variables from its enclosing scope',
        'Closures keep references to variables, not copies of their values',
        'Every JavaScript function creates a closure',
        'Closures enable data privacy through the module pattern',
        'Event handlers and callbacks rely heavily on closures',
        'Understanding closures is key to mastering JavaScript',
      ];
    }
    if (lower.includes('api')) {
      return [
        'REST APIs use HTTP methods: GET, POST, PUT, PATCH, DELETE',
        'APIs define a contract between client and server',
        'Status codes indicate success (2xx), client error (4xx), or server error (5xx)',
        'API versioning prevents breaking changes for existing clients',
        'Rate limiting protects APIs from abuse and overload',
        'API documentation (like OpenAPI/Swagger) describes available endpoints',
      ];
    }
    
    // Generic facts based on category
    const categoryFacts: Record<TopicCategory, string[]> = {
      'programming': [
        'Modern programming emphasizes clean, readable, and maintainable code',
        'Understanding fundamentals is more valuable than memorizing syntax',
        'Best practices evolve — what was standard 5 years ago may be outdated now',
        'Testing and debugging are as important as writing new code',
        'Code is read more often than it is written',
      ],
      'networking': [
        'The internet is built on layers of protocols (OSI model / TCP/IP stack)',
        'Data travels as packets across the network',
        'Encryption protects data in transit from interception',
        'Latency and bandwidth are the two key network performance metrics',
        'Every device on the internet has a unique IP address',
      ],
      'devops': [
        'DevOps bridges the gap between development and operations teams',
        'Infrastructure as Code makes environments reproducible and version-controlled',
        'Monitoring and observability are critical for production systems',
        'Automation reduces human error and speeds up delivery',
        'The goal is to ship reliable software faster and more frequently',
      ],
      'database': [
        'ACID properties ensure reliable database transactions',
        'Indexes speed up queries but slow down writes',
        'Normalization reduces data redundancy, denormalization improves read performance',
        'CAP theorem states you can only have 2 of 3: Consistency, Availability, Partition tolerance',
        'Choosing the right database depends on your data model and access patterns',
      ],
      'ai-ml': [
        'Machine learning models learn patterns from data rather than being explicitly programmed',
        'Training requires large amounts of quality data',
        'Overfitting occurs when a model memorizes training data instead of learning patterns',
        'Neural networks are inspired by the structure of biological brains',
        'The transformer architecture powers modern language models like GPT',
      ],
      'system-design': [
        'There is no single correct answer in system design — it depends on requirements',
        'Scalability, reliability, and maintainability are the three pillars',
        'Trade-offs are inevitable — every design decision has pros and cons',
        'Start simple and add complexity only when needed',
        'Understanding bottlenecks is key to scaling systems',
      ],
      'security': [
        'Security should be built in from the start, not added as an afterthought',
        'The principle of least privilege limits access to only what is needed',
        'Never store passwords in plain text — always hash them',
        'Defense in depth uses multiple layers of security',
        'Regular security audits and updates are essential',
      ],
      'web': [
        'The browser is one of the most complex pieces of software ever built',
        'Performance optimization directly impacts user experience and conversion rates',
        'Accessibility ensures your application works for everyone',
        'Progressive enhancement builds on a solid baseline experience',
        'Modern web apps can work offline using Service Workers',
      ],
      'general-tech': [
        'Technology evolves rapidly — continuous learning is essential',
        'Understanding fundamentals helps you adapt to new technologies quickly',
        'Solving real problems matters more than using trendy tools',
        'Good documentation is as important as good code',
        'Collaboration and communication are crucial in tech',
      ],
    };

    return categoryFacts[category] || categoryFacts['general-tech'];
  }

  private generateAnalogies(topic: string, _category: TopicCategory): string[] {
    const lower = topic.toLowerCase();
    
    if (lower.includes('docker')) return ['Docker is like shipping containers for software — standardized boxes that work everywhere', 'A Docker image is like a recipe, a container is the dish you cook from it'];
    if (lower.includes('dns')) return ['DNS is like a phone book for the internet — you look up a name, it gives you a number', 'DNS is like asking for directions — you ask several people until you find someone who knows'];
    if (lower.includes('kubernetes') || lower.includes('k8s')) return ['Kubernetes is like an air traffic controller for containers — managing takeoffs, landings, and routing', 'Kubernetes Pods are like apartments in a building — each has its own address but shares infrastructure'];
    if (lower.includes('race condition')) return ['A race condition is like two people trying to edit the same document at the same time without knowing about each other', 'Imagine two bank tellers processing withdrawals from the same account simultaneously'];
    if (lower.includes('api')) return ['An API is like a restaurant menu — it tells you what you can order and what you\'ll get back', 'An API is like a universal adapter — it lets different systems plug into each other'];
    if (lower.includes('cache') || lower.includes('caching')) return ['Caching is like keeping your favorite books on your desk instead of walking to the library each time', 'A cache is like a sticky note with the answer — faster than looking it up again'];
    if (lower.includes('closure')) return ['A closure is like a backpack — the function carries its surrounding variables wherever it goes', 'Closures are like memories — the function remembers the environment where it was created'];
    if (lower.includes('event loop')) return ['The event loop is like a single chef managing multiple orders — handling one task at a time but never sitting idle', 'Think of it as a to-do list where you process items one by one, but long tasks get moved to a waiting area'];
    if (lower.includes('git')) return ['Git is like a time machine for your code — you can go back to any point in history', 'Branching in Git is like creating a parallel universe where you can experiment without affecting the main timeline'];
    if (lower.includes('microservice')) return ['Microservices are like a team of specialists vs. one person doing everything', 'Think of it as a food court vs. one big restaurant — each stall specializes in one cuisine'];

    return ['Think of it as a building block in a larger system', 'Like learning to drive — once you understand the fundamentals, everything else builds on top'];
  }

  private generateVisualMetaphors(topic: string, _category: TopicCategory): string[] {
    const lower = topic.toLowerCase();
    
    if (lower.includes('docker')) return ['shipping_container_on_ship', 'box_in_box_layers', 'factory_assembly_line'];
    if (lower.includes('dns')) return ['phone_book_lookup', 'address_directory', 'postal_routing'];
    if (lower.includes('kubernetes')) return ['air_traffic_control_tower', 'orchestra_conductor', 'city_traffic_management'];
    if (lower.includes('race condition')) return ['two_runners_same_finish_line', 'two_hands_reaching_for_same_object', 'traffic_intersection_collision'];
    if (lower.includes('api')) return ['restaurant_waiter', 'electrical_outlet_plug', 'bridge_between_islands'];
    if (lower.includes('cache')) return ['desk_vs_library', 'quick_access_drawer', 'speed_highway_vs_backroad'];
    
    return ['technical_architecture_diagram', 'connected_nodes_network', 'layered_system'];
  }

  private generateTechnicalTerms(topic: string, _category: TopicCategory): Array<{ term: string; explanation: string }> {
    const lower = topic.toLowerCase();
    
    if (lower.includes('docker')) return [
      { term: 'Container', explanation: 'A lightweight, standalone package that includes everything needed to run a piece of software' },
      { term: 'Image', explanation: 'A read-only template used to create containers — like a snapshot of an application' },
      { term: 'Dockerfile', explanation: 'A text document containing instructions to build a Docker image' },
      { term: 'Volume', explanation: 'Persistent storage that survives container restarts' },
      { term: 'Registry', explanation: 'A repository for storing and distributing Docker images' },
    ];
    if (lower.includes('dns')) return [
      { term: 'A Record', explanation: 'Maps a domain name to an IPv4 address' },
      { term: 'CNAME', explanation: 'An alias that points one domain to another domain' },
      { term: 'TTL', explanation: 'Time To Live — how long a DNS response is cached before re-querying' },
      { term: 'Resolver', explanation: 'The DNS client that sends queries on behalf of the user' },
      { term: 'Authoritative Server', explanation: 'The DNS server that holds the actual records for a domain' },
    ];
    if (lower.includes('race condition')) return [
      { term: 'Mutex', explanation: 'A locking mechanism that ensures only one thread can access a resource at a time' },
      { term: 'Atomic Operation', explanation: 'An operation that completes entirely or not at all — no partial state' },
      { term: 'Critical Section', explanation: 'The code segment where shared resources are accessed' },
      { term: 'Deadlock', explanation: 'A situation where two threads are each waiting for the other to release a lock' },
      { term: 'Thread Safety', explanation: 'Code that functions correctly when accessed by multiple threads simultaneously' },
    ];
    
    return [
      { term: topic.split(' ').pop() || topic, explanation: `A fundamental concept in modern technology` },
    ];
  }

  private generateMisconceptions(topic: string, _category: TopicCategory): string[] {
    const lower = topic.toLowerCase();
    
    if (lower.includes('docker')) return ['Docker is NOT a virtual machine — containers share the host kernel', 'Docker doesn\'t replace Kubernetes — they solve different problems', 'Containers are not inherently more secure than VMs'];
    if (lower.includes('dns')) return ['DNS doesn\'t just translate names to IPs — it handles mail routing, verification, and more', 'DNS is not a single server — it\'s a distributed, hierarchical system', 'Changing DNS records doesn\'t take effect instantly — propagation takes time'];
    if (lower.includes('race condition')) return ['Race conditions don\'t only happen in multi-threaded code — async code can have them too', 'Adding more locks doesn\'t always fix race conditions — it can cause deadlocks', 'Race conditions are not just performance issues — they can cause data corruption'];
    if (lower.includes('api')) return ['REST is not the only API style — GraphQL, gRPC, and WebSocket are alternatives', 'APIs are not just for web — they exist between any software components', 'A 200 status code doesn\'t always mean the operation succeeded at the business level'];
    
    return ['Common misconceptions often arise from oversimplifying complex concepts', 'Understanding edge cases is as important as understanding the happy path'];
  }

  private generateRelatedTopics(topic: string, _category: TopicCategory): string[] {
    const lower = topic.toLowerCase();
    
    if (lower.includes('docker')) return ['Kubernetes', 'Container Orchestration', 'Docker Compose', 'CI/CD Pipelines', 'Microservices'];
    if (lower.includes('dns')) return ['HTTP/HTTPS', 'TCP/IP', 'CDN', 'Domain Registration', 'SSL/TLS'];
    if (lower.includes('kubernetes')) return ['Docker', 'Helm Charts', 'Service Mesh', 'Cloud-Native', 'GitOps'];
    if (lower.includes('race condition')) return ['Concurrency', 'Mutexes', 'Semaphores', 'Deadlocks', 'Thread Safety'];
    if (lower.includes('api')) return ['REST', 'GraphQL', 'gRPC', 'WebSockets', 'API Gateway'];
    if (lower.includes('javascript')) return ['TypeScript', 'Node.js', 'React', 'Event Loop', 'V8 Engine'];
    if (lower.includes('react')) return ['Virtual DOM', 'Hooks', 'Next.js', 'State Management', 'Component Lifecycle'];
    
    return ['System Design', 'Best Practices', 'Performance Optimization', 'Security Considerations'];
  }
}
