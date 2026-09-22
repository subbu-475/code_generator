// ============================================================
// AI Topic Engine — Dynamic Technical Explainer Synthesis
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/connection.js';
import { generateAudio } from './audioService.js';
import type { SceneConfig, ProgrammingLanguage } from '../types/sharedTypes.js';
import type { ProjectWithScenes } from './projectService.js';
import { FPS } from '../types/sharedTypes.js';

export interface GenerateTopicOptions {
  audioMode?: 'none' | 'music' | 'voice_music';
  voiceModel?: string;
  musicFile?: string;
}

interface TopicArchetypeData {
  title: string;
  hookText: string;
  language: ProgrammingLanguage;
  scenes: Array<Omit<SceneConfig, 'id' | 'duration_frames'> & {
    voiceNarration: string;
  }>;
}

/**
 * Classify a user prompt/topic into a dedicated technical archetype
 * and synthesize customized scenes with realistic protocols, telemetry,
 * code/config snippets, and synchronized voice narration.
 */
function synthesizeTopicArchetype(topic: string): TopicArchetypeData {
  const t = topic.toLowerCase().trim();

  // 1. NGINX / REVERSE PROXY / LOAD BALANCER / GATEWAY
  if (t.includes('nginx') || t.includes('reverse proxy') || t.includes('load balancer') || t.includes('api gateway') || t.includes('caddy') || t.includes('haproxy')) {
    return {
      title: 'Nginx in 30 Seconds ⚡ (Reverse Proxy & Load Balancing)',
      hookText: 'What happens when 100,000 users hit your server at once? 💥',
      language: 'javascript',
      scenes: [
        {
          type: 'browser_sim',
          title: 'TRAFFIC SURGE DETECTED ⚠️',
          text: '100,000 concurrent requests hitting a single server crashes your app!',
          voiceNarration: 'What happens when a hundred thousand users hit your web app at the exact same second? A single backend node instantly crashes under the load.',
          browserUrl: 'api.service.io/checkout',
          browserSimState: 'loading',
          browserPageTitle: 'Server Overload 503',
          animation: 'fade',
          transition: 'fade',
        },
        {
          type: 'cinematic_image',
          title: 'ENTER NGINX REVERSE PROXY',
          text: 'Nginx sits at the edge, intercepting and distributing all traffic.',
          voiceNarration: 'Enter Nginx: a high-performance reverse proxy that sits at the perimeter of your infrastructure, intercepting every single incoming connection.',
          imageUrl: '/assets/images/nginx_reverse_proxy.jpg',
          cinematicZoom: true,
          animation: 'zoom',
          transition: 'fade',
        },
        {
          type: 'network_flow',
          title: 'ROUND-ROBIN BALANCING',
          text: 'Traffic evenly distributed across healthy upstream worker nodes.',
          voiceNarration: 'Instead of overwhelming one server, Nginx executes intelligent round-robin load balancing, routing traffic seamlessly across your server cluster.',
          flowActiveStep: 2,
          packetLabel: 'HTTP Request ➔ Node 02',
          flowNodes: [
            { id: 'client', label: '100K CLIENTS', icon: '👥', status: 'done', detail: 'Public Traffic' },
            { id: 'nginx', label: 'NGINX PROXY', icon: '⚡', status: 'active', detail: 'Port 80/443' },
            { id: 'cluster', label: 'APP CLUSTER', icon: '🖥️', status: 'pending', detail: '3 Upstreams' },
          ],
          telemetry: {
            protocol: 'HTTP/2 • TCP 443',
            status: 'LOAD BALANCED',
            rtt: '2ms',
          },
          animation: 'fade',
          transition: 'slide',
        },
        {
          type: 'code',
          title: 'NGINX.CONF UPSTREAM',
          text: 'Declare upstream backends with automatic failover.',
          voiceNarration: 'In just five lines of nginx configuration, you define an upstream server pool and proxy all requests with instant failover.',
          code: `upstream backend_cluster {
    server srv1.internal:3000;
    server srv2.internal:3000;
    server srv3.internal:3000;
}
server {
    listen 443 ssl http2;
    location / {
        proxy_pass http://backend_cluster;
    }
}`,
          language: 'javascript',
          animation: 'fade',
          transition: 'fade',
        },
        {
          type: 'network_flow',
          title: 'SSL TERMINATION & CACHE',
          text: 'Nginx decrypts TLS and serves static assets from memory cache.',
          voiceNarration: 'Here is the kicker: Nginx handles SSL termination and in-memory gzip caching, offloading heavy cryptographic math from your application servers.',
          flowActiveStep: 2,
          packetLabel: 'TLS 1.3 Decrypted 🔓',
          flowNodes: [
            { id: 'edge', label: 'TLS TERMINATION', icon: '🔒', status: 'done', detail: 'AES-256-GCM' },
            { id: 'cache', label: 'RAM CACHE', icon: '⚡', status: 'active', detail: 'Hit Ratio 94%' },
            { id: 'origin', label: 'ORIGIN BACKEND', icon: '📦', status: 'pending', detail: 'Zero Load' },
          ],
          telemetry: {
            protocol: 'GZIP Compression',
            status: 'CACHE HIT 200 OK',
            payload: 'Compressed 75%',
          },
          animation: 'fade',
          transition: 'slide',
        },
        {
          type: 'architecture_overview',
          title: 'THE HIGH-SPEED PIPELINE',
          text: 'Client ➔ Nginx Edge ➔ Microservices ➔ Instant Payoff.',
          voiceNarration: 'Client, SSL termination, load balancer, upstream cluster, and instant response. Your system can now handle millions of requests.',
          architectureSteps: [
            { label: 'CLIENT TRAFFIC', icon: '📱', badge: 'STEP 01' },
            { label: 'SSL TERMINATION', icon: '🔒', badge: 'STEP 02' },
            { label: 'ROUND ROBIN PROXY', icon: '⚡', badge: 'STEP 03' },
            { label: 'UPSTREAM CLUSTER', icon: '🖥️', badge: 'STEP 04' },
            { label: 'GZIP RAM CACHE', icon: '🚀', badge: 'STEP 05' },
            { label: '200 OK PAYOFF', icon: '🎉', badge: 'STEP 06' },
          ],
          animation: 'bounce',
          transition: 'fade',
        },
        {
          type: 'network_flow',
          title: 'WHAT ABOUT DDOS ATTACKS? 🔄',
          text: 'How does Nginx stop 10 million botnet packets? That brings us to...',
          voiceNarration: 'That handles regular traffic. But how does Nginx block malicious ten-million-request botnet attacks? That brings us to rate limiting...',
          flowActiveStep: 2,
          packetLabel: 'Botnet Rate Limit 🛡️',
          flowNodes: [
            { id: 'bots', label: 'BOTNET ATTACK', icon: '🤖', status: 'done', detail: '10M SYN floods' },
            { id: 'filter', label: 'LEAKY BUCKET', icon: '🛡️', status: 'active', detail: 'limit_req_zone' },
            { id: 'drop', label: '429 TOO MANY', icon: '❌', status: 'active', detail: 'Dropped' },
          ],
          telemetry: {
            protocol: 'IP Throttling',
            status: 'MITIGATED 429',
          },
          animation: 'fade',
          transition: 'none',
        },
      ],
    };
  }

  // 2. DOCKER / CONTAINERS / KUBERNETES / VMS
  if (t.includes('docker') || t.includes('container') || t.includes('kubernetes') || t.includes('k8s') || t.includes('virtual machine') || t.includes('vm ')) {
    return {
      title: 'Docker in 30 Seconds 🐳 (Containerization Explained)',
      hookText: 'Works on your laptop... crashes in production! 💥',
      language: 'javascript',
      scenes: [
        {
          type: 'browser_sim',
          title: 'WORKS ON MY MACHINE? ❌',
          text: 'Works on your laptop... crashes in production! 💥',
          voiceNarration: 'Works on your machine, but crashes the moment you deploy to production? Here is how Docker solves this classic developer nightmare in thirty seconds.',
          browserUrl: 'localhost:8080/error',
          browserSimState: 'enter',
          browserPageTitle: 'Deploy Crash 500',
          animation: 'fade',
          transition: 'fade',
        },
        {
          type: 'cinematic_image',
          title: 'VIRTUAL MACHINES VS DOCKER',
          text: 'Old way: Heavy Virtual Machines wasting gigabytes of RAM.',
          voiceNarration: 'Traditional Virtual Machines package an entire guest operating system, wasting gigabytes of memory and minutes of boot time.',
          imageUrl: '/assets/images/docker_container_tech.jpg',
          cinematicZoom: true,
          animation: 'zoom',
          transition: 'fade',
        },
        {
          type: 'network_flow',
          title: 'SHARED HOST KERNEL',
          text: 'Docker shares the host Linux kernel directly via Namespaces.',
          voiceNarration: 'Wait. Here is the secret: Docker does not run a second OS. It shares the host Linux kernel directly, isolating processes using Namespaces and cgroups.',
          flowActiveStep: 2,
          packetLabel: 'Namespaces + cgroups 🔒',
          flowNodes: [
            { id: 'app', label: 'APP PROCESS', icon: '📦', status: 'done', detail: 'Isolated App' },
            { id: 'docker', label: 'DOCKER ENGINE', icon: '🐳', status: 'active', detail: 'Containerd' },
            { id: 'kernel', label: 'HOST OS KERNEL', icon: '⚡', status: 'done', detail: 'Shared Kernel' },
          ],
          telemetry: {
            protocol: 'Linux Namespaces',
            status: 'ISOLATED PID',
          },
          animation: 'fade',
          transition: 'slide',
        },
        {
          type: 'code',
          title: 'IMMUTABLE IMAGE LAYERS',
          text: 'Your Dockerfile stacks code into cached, read-only layers.',
          voiceNarration: 'Your Dockerfile stacks your dependencies, binaries, and code into lightweight, immutable image layers that are permanently cached.',
          code: `FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]`,
          language: 'javascript',
          animation: 'fade',
          transition: 'fade',
        },
        {
          type: 'browser_sim',
          title: 'docker run -p 8080:80 ✓',
          text: 'Container launches in milliseconds with zero OS boot time! ⚡',
          voiceNarration: 'Run one command: docker run. An isolated container spins up in fifty milliseconds with predictable, identical execution everywhere.',
          browserUrl: 'localhost:8080',
          browserSimState: 'rendered',
          browserPageTitle: 'Container Running',
          animation: 'zoom',
          transition: 'fade',
        },
        {
          type: 'architecture_overview',
          title: 'THE DOCKER PIPELINE',
          text: 'Build once. Ship anywhere. Cloud, server, or edge.',
          voiceNarration: 'Build once, ship anywhere. The exact same container image runs flawlessly on your MacBook, Linux servers, or AWS.',
          architectureSteps: [
            { label: 'WRITE CODE', icon: '💻', badge: 'STEP 01' },
            { label: 'DOCKERFILE RECIPE', icon: '📝', badge: 'STEP 02' },
            { label: 'LAYERED IMAGE BUILD', icon: '📦', badge: 'STEP 03' },
            { label: 'CONTAINER RUNTIME', icon: '🐳', badge: 'STEP 04' },
            { label: 'PORT FORWARDING', icon: '⚡', badge: 'STEP 05' },
            { label: 'PRODUCTION READY', icon: '🚀', badge: 'STEP 06' },
          ],
          animation: 'bounce',
          transition: 'fade',
        },
        {
          type: 'network_flow',
          title: 'SCALING TO THOUSANDS? 🔄',
          text: 'How do you coordinate 10,000 containers across the globe?',
          voiceNarration: 'That is one container. But how do you automatically coordinate and heal ten thousand containers in production? That brings us to Kubernetes...',
          flowActiveStep: 2,
          packetLabel: 'Cluster Discovery 🌐',
          flowNodes: [
            { id: 'c1', label: 'CONTAINER 01', icon: '🐳', status: 'done', detail: 'Running' },
            { id: 'cluster', label: 'CLUSTER MESH', icon: '🌐', status: 'active', detail: 'Kubernetes' },
            { id: 'c2', label: 'CONTAINER 10k', icon: '🐳', status: 'active', detail: 'Auto-Scaling' },
          ],
          telemetry: {
            protocol: 'RAFT Consensus',
            status: 'ORCHESTRATED',
          },
          animation: 'fade',
          transition: 'none',
        },
      ],
    };
  }

  // 3. HTTP VS HTTPS / PROTOCOL DUEL / ENCRYPTION
  if (t.includes('http vs https') || t.includes('https') || t.includes('ssl') || t.includes('tls') || t.includes('encryption')) {
    return {
      title: 'HTTP vs HTTPS Explained 🔒 (Why Plaintext is Dangerous)',
      hookText: 'Is someone reading your passwords right now on public Wi-Fi? ⚠️',
      language: 'javascript',
      scenes: [
        {
          type: 'hook',
          title: 'UNENCRYPTED DATA LEAK ⚠️',
          text: 'Is your password being broadcast in plaintext right now?',
          voiceNarration: 'Is someone eavesdropping on your passwords right now on public Wi-Fi? Here is the crucial difference between HTTP and HTTPS in thirty seconds.',
          snippetHookEmoji: '⚠️',
          snippetHookColor: '#FF6B6B',
          animation: 'pop',
          transition: 'fade',
        },
        {
          type: 'comparison',
          title: 'THE CLEAR DANGER: HTTP VS HTTPS',
          comparisonLeftTitle: 'HTTP (Port 80)',
          comparisonRightTitle: 'HTTPS (Port 443)',
          comparisonLeftCode: `// Plaintext over Port 80
POST /api/login HTTP/1.1
Host: bank.com
Content-Type: application/json

{"pass": "super_secret_123"}
// ❌ Visible to anyone on Wi-Fi!`,
          comparisonRightCode: `// Encrypted over Port 443 (TLS 1.3)
POST /api/login HTTP/3
Host: bank.com
Cipher: AES-256-GCM

7f4a9b...c8e192...d90f23...
// 🔒 Completely unbreakable!`,
          comparisonLeftLanguage: 'javascript',
          comparisonRightLanguage: 'javascript',
          comparisonVerdict: 'HTTP is plain text. HTTPS is cryptographically locked with TLS 1.3!',
          voiceNarration: 'With HTTP on Port 80, your passwords and cookies travel as open cleartext. Any router or hacker on your network can read them instantly. HTTPS encrypts every byte.',
          animation: 'fade',
          transition: 'fade',
        },
        {
          type: 'cinematic_image',
          title: 'TLS 1.3 CRYPTOGRAPHIC SHIELD',
          text: 'Military-grade asymmetric cryptography protects every packet.',
          voiceNarration: 'HTTPS wraps standard HTTP inside Transport Layer Security, creating a bulletproof cryptographic tunnel using modern TLS 1.3.',
          imageUrl: '/assets/images/http_vs_https_security.jpg',
          cinematicZoom: true,
          animation: 'zoom',
          transition: 'fade',
        },
        {
          type: 'network_flow',
          title: 'THE TLS 1.3 HANDSHAKE',
          text: 'Diffie-Hellman key exchange generates ephemeral symmetric keys in 1 RTT.',
          voiceNarration: 'Before transmitting data, the browser and server perform an encrypted TLS handshake, exchanging cryptographic public keys in just one round-trip.',
          flowActiveStep: 2,
          packetLabel: 'ClientHello + KeyShare 🔑',
          flowNodes: [
            { id: 'browser', label: 'BROWSER', icon: '💻', status: 'done', detail: 'ClientHello' },
            { id: 'handshake', label: 'TLS 1.3 EXCHANGE', icon: '🤝', status: 'active', detail: 'Diffie-Hellman' },
            { id: 'server', label: 'BANK SERVER', icon: '🔒', status: 'pending', detail: 'Certificate Valid' },
          ],
          telemetry: {
            protocol: 'TLS 1.3 • AES-256-GCM',
            status: 'HANDSHAKE VERIFIED',
            rtt: '1 RTT (Zero Overhead)',
          },
          animation: 'fade',
          transition: 'slide',
        },
        {
          type: 'browser_sim',
          title: 'https://bank.com 🔒',
          text: 'Verified SSL Certificate: Identity confirmed, payloads encrypted.',
          voiceNarration: 'Your browser validates the Certificate Authority signature, displays the green padlock, and encrypts all session tokens.',
          browserUrl: 'https://secure-bank.com/account',
          browserSimState: 'rendered',
          browserPageTitle: 'Verified Secure Banking 🔒',
          animation: 'zoom',
          transition: 'fade',
        },
        {
          type: 'architecture_overview',
          title: 'THE WEB SECURITY PIPELINE',
          text: 'TCP Handshake ➔ TLS 1.3 ➔ Certificate ➔ AES-256 Session ➔ Privacy.',
          voiceNarration: 'TCP handshake, Diffie Hellman key exchange, digital certificate verification, symmetric encryption, and full privacy guaranteed.',
          architectureSteps: [
            { label: 'PORT 443 TCP SYN', icon: '⚡', badge: 'STEP 01' },
            { label: 'TLS 1.3 CLIENT HELLO', icon: '🤝', badge: 'STEP 02' },
            { label: 'CERTIFICATE CA VERIFY', icon: '📜', badge: 'STEP 03' },
            { label: 'DIFFIE-HELLMAN KEY', icon: '🔑', badge: 'STEP 04' },
            { label: 'AES-256 CIPHERTEXT', icon: '🔒', badge: 'STEP 05' },
            { label: 'VERIFIED DOM PAYOFF', icon: '🛡️', badge: 'STEP 06' },
          ],
          animation: 'bounce',
          transition: 'fade',
        },
        {
          type: 'network_flow',
          title: 'WHAT ABOUT DNS LEAKS? 🔄',
          text: 'Your connection is encrypted, but does your ISP still see the domain?',
          voiceNarration: 'HTTPS hides your payload. But can your internet provider still see what websites you look up? That brings us to DNS over HTTPS...',
          flowActiveStep: 2,
          packetLabel: 'Plaintext DNS vs DoH ❓',
          flowNodes: [
            { id: 'user', label: 'YOUR LAPTOP', icon: '💻', status: 'done', detail: 'DNS Request' },
            { id: 'isp', label: 'ISP SNIFFER', icon: '👁️', status: 'active', detail: 'Port 53 UDP' },
            { id: 'doh', label: 'DNS OVER HTTPS', icon: '🔒', status: 'pending', detail: 'Port 443 Encrypted' },
          ],
          telemetry: {
            protocol: 'DoH RFC 8484',
            status: 'NEXT VIDEO 🔄',
          },
          animation: 'fade',
          transition: 'none',
        },
      ],
    };
  }

  // 4. WHAT HAPPENS WHEN YOU TYPE GOOGLE.COM / DNS
  if (t.includes('google') || t.includes('dns') || (t.includes('type') && t.includes('url'))) {
    return {
      title: 'What Happens When You Type google.com? 🌐 (In 30 Seconds)',
      hookText: 'You type google.com and press Enter. What actually happens? 🚀',
      language: 'javascript',
      scenes: [
        {
          type: 'browser_sim',
          title: 'ENTER GOOGLE.COM',
          text: 'You type google.com and hit Enter. What happens in the next second?',
          voiceNarration: 'You type google.com and press Enter. What actually happens inside the global network in the next single second?',
          browserUrl: 'google.com',
          browserSimState: 'enter',
          browserPageTitle: 'Google',
          animation: 'fade',
          transition: 'fade',
        },
        {
          type: 'cinematic_image',
          title: 'UNDERSEA GLOBAL FIBER',
          text: 'Your request travels thousands of miles across transcontinental cables.',
          voiceNarration: 'Before anything appears, your request travels thousands of miles across global fiber-optic cables at the speed of light.',
          imageUrl: '/assets/images/dns_network_infra.jpg',
          cinematicZoom: true,
          animation: 'zoom',
          transition: 'fade',
        },
        {
          type: 'network_flow',
          title: 'STEP 1: DNS RESOLUTION',
          text: 'Browser resolves google.com to IP 142.250.190.46 via UDP Port 53.',
          voiceNarration: 'Step one: Your browser asks the DNS recursive resolver: what is the IP address for google.com? It returns the exact server IP over UDP port 53.',
          flowActiveStep: 2,
          packetLabel: "What is google.com IP?",
          flowNodes: [
            { id: 'browser', label: 'BROWSER', icon: '💻', status: 'done', detail: 'google.com' },
            { id: 'dns', label: 'DNS RESOLVER', icon: '🌐', status: 'active', detail: '8.8.8.8' },
            { id: 'edge', label: 'EDGE SERVER', icon: '⚡', status: 'pending', detail: '142.250.190.46' },
          ],
          telemetry: {
            protocol: 'UDP / 53',
            status: 'RESOLVED 142.250.190.46',
            rtt: '11ms',
          },
          animation: 'fade',
          transition: 'slide',
        },
        {
          type: 'network_flow',
          title: 'STEP 2: TLS 1.3 HANDSHAKE',
          text: 'Browser establishes encrypted TLS 1.3 cryptographic session.',
          voiceNarration: 'Here is the interesting part: Browser establishes a secure TLS 1.3 connection to Google edge servers, exchanging encryption keys in a single millisecond.',
          flowActiveStep: 2,
          packetLabel: 'TLS 1.3 Handshake 🔒',
          flowNodes: [
            { id: 'browser', label: 'BROWSER', icon: '💻', status: 'done', detail: 'ClientHello' },
            { id: 'edge', label: 'GOOGLE EDGE', icon: '⚡', status: 'active', detail: 'TLS 1.3' },
            { id: 'origin', label: 'SEARCH CLUSTER', icon: '🔍', status: 'pending', detail: 'Query Engine' },
          ],
          telemetry: {
            protocol: 'TLS 1.3 • HTTP/3',
            status: 'SECURE HANDSHAKE',
            rtt: '8ms',
          },
          animation: 'fade',
          transition: 'slide',
        },
        {
          type: 'network_flow',
          title: 'STEP 3: SERVER & DB QUERY',
          text: 'Web server fetches page payload and streams HTML/CSS back via HTTP/3.',
          voiceNarration: 'Step three: Web servers query the search index, assemble the payload, and stream HTML, CSS, and JavaScript back via HTTP/3.',
          flowActiveStep: 2,
          packetLabel: 'HTTP/3 200 OK (Stream)',
          flowNodes: [
            { id: 'edge', label: 'GOOGLE EDGE', icon: '⚡', status: 'done', detail: 'Routing' },
            { id: 'db', label: 'INDEX DATABASE', icon: '🗄️', status: 'active', detail: 'Bigtable' },
            { id: 'browser', label: 'BROWSER', icon: '💻', status: 'pending', detail: 'Rendering' },
          ],
          telemetry: {
            protocol: 'HTTP/3 • QUIC UDP',
            status: 'STATUS 200 OK',
            payload: 'Compressed HTML',
          },
          animation: 'fade',
          transition: 'slide',
        },
        {
          type: 'browser_sim',
          title: 'DOM PARSED & RENDERED ✓',
          text: 'DOM tree constructed, styles calculated, pixels rendered on screen!',
          voiceNarration: 'DOM parsed, CSS applied, layout computed, and the page renders cleanly on screen—all in a fraction of a second!',
          browserUrl: 'google.com',
          browserSimState: 'rendered',
          browserPageTitle: 'Google Search',
          animation: 'zoom',
          transition: 'fade',
        },
        {
          type: 'architecture_overview',
          title: 'THE FULL ARCHITECTURE LOOP 🔄',
          text: 'YOU ➔ DNS ➔ TCP/TLS ➔ EDGE ➔ DB ➔ RENDER.',
          voiceNarration: 'That is the complete lifecycle. But how does that data physically cross undersea cables on the ocean floor? That brings us to our next video...',
          architectureSteps: [
            { label: 'USER INPUT', icon: '⌨️', badge: 'STEP 01' },
            { label: 'DNS RESOLUTION', icon: '🌐', badge: 'STEP 02' },
            { label: 'TLS 1.3 HANDSHAKE', icon: '🔒', badge: 'STEP 03' },
            { label: 'EDGE ROUTING', icon: '⚡', badge: 'STEP 04' },
            { label: 'DATABASE QUERY', icon: '🗄️', badge: 'STEP 05' },
            { label: 'DOM PARSE & RENDER', icon: '🎉', badge: 'STEP 06' },
          ],
          animation: 'bounce',
          transition: 'none',
        },
      ],
    };
  }

  // 5. REDIS / CACHING / DATABASE
  if (t.includes('redis') || t.includes('cache') || t.includes('caching') || t.includes('database') || t.includes('sql') || t.includes('nosql')) {
    return {
      title: 'Redis Caching in 30 Seconds ⚡ (Sub-Millisecond Speed)',
      hookText: 'Why is your database taking 500ms when it could take 1ms? 🚀',
      language: 'javascript',
      scenes: [
        {
          type: 'browser_sim',
          title: 'SLOW DATABASE QUERY 🐢',
          text: 'Reading millions of rows from disk takes hundreds of milliseconds.',
          voiceNarration: 'Why is your database taking hundreds of milliseconds when it could respond in one? Traditional disk queries are the ultimate bottleneck.',
          browserUrl: 'api.store.com/products?page=1',
          browserSimState: 'loading',
          browserPageTitle: 'Query Latency: 480ms',
          animation: 'fade',
          transition: 'fade',
        },
        {
          type: 'comparison',
          title: 'DISK STORAGE VS IN-MEMORY RAM',
          comparisonLeftTitle: 'Traditional SQL (Disk)',
          comparisonRightTitle: 'Redis Cache (RAM)',
          comparisonLeftCode: `// Heavy Disk I/O: ~15-500ms
SELECT * FROM products 
JOIN categories ON p.cat_id = c.id
WHERE stock > 0
ORDER BY created_at DESC;
// 🐢 Mechanical disk read`,
          comparisonRightCode: `// In-Memory Key-Value: < 1ms
GET products:top:cache

// Returns JSON string directly
// ⚡ Direct RAM memory access!`,
          comparisonLeftLanguage: 'javascript',
          comparisonRightLanguage: 'javascript',
          comparisonVerdict: 'RAM is up to 100,000 times faster than disk storage!',
          voiceNarration: 'Disk storage requires slow mechanical or SSD seek times. Redis holds everything directly in random access memory, delivering sub-millisecond lookups.',
          animation: 'fade',
          transition: 'fade',
        },
        {
          type: 'network_flow',
          title: 'CACHE-ASIDE PATTERN',
          text: 'Check Redis first. Cache hit returns in 1ms. Cache miss fetches from DB.',
          voiceNarration: 'Using the Cache-Aside pattern, your application checks Redis first. If the key exists, it returns instantly. If not, it falls back to PostgreSQL.',
          flowActiveStep: 2,
          packetLabel: 'GET user:session:1042 ⚡',
          flowNodes: [
            { id: 'app', label: 'APP SERVER', icon: '⚙️', status: 'done', detail: 'Check Cache' },
            { id: 'redis', label: 'REDIS RAM', icon: '⚡', status: 'active', detail: 'RAM Hit: 0.8ms' },
            { id: 'pg', label: 'POSTGRES DB', icon: '🗄️', status: 'pending', detail: 'Disk Fallback' },
          ],
          telemetry: {
            protocol: 'RESP3 Protocol',
            status: 'CACHE HIT 0.8ms',
            rtt: '< 1ms',
          },
          animation: 'fade',
          transition: 'slide',
        },
        {
          type: 'code',
          title: 'CACHE LOGIC IN NODE.JS',
          text: 'Set expiring key with TTL to prevent stale data.',
          voiceNarration: 'With five lines of code, you check the cache, set a time-to-live expiration, and eliminate ninety percent of database queries.',
          code: `const cached = await redis.get('products:featured');
if (cached) return JSON.parse(cached);

const freshData = await db.query('SELECT * FROM products');
await redis.set('products:featured', JSON.stringify(freshData), 'EX', 3600);
return freshData;`,
          language: 'javascript',
          animation: 'fade',
          transition: 'fade',
        },
        {
          type: 'browser_sim',
          title: 'SUB-MILLISECOND RESPONSE ✓',
          text: 'API latency drops from 480ms to 2ms. Instant snappy UI!',
          voiceNarration: 'Your API latency plummets from half a second down to two milliseconds. The user interface feels instantaneous.',
          browserUrl: 'api.store.com/products?page=1',
          browserSimState: 'rendered',
          browserPageTitle: 'Cache Hit: 2ms ✓',
          animation: 'zoom',
          transition: 'fade',
        },
        {
          type: 'architecture_overview',
          title: 'THE CACHED DATA PIPELINE',
          text: 'Client ➔ App Server ➔ Redis RAM ➔ PostgreSQL DB ➔ Lightning Fast.',
          voiceNarration: 'Client request, memory cache lookup, instant response, and seamless background database synchronization.',
          architectureSteps: [
            { label: 'CLIENT API CALL', icon: '📱', badge: 'STEP 01' },
            { label: 'REDIS KEY LOOKUP', icon: '⚡', badge: 'STEP 02' },
            { label: 'CACHE HIT VERIFIED', icon: '🎯', badge: 'STEP 03' },
            { label: 'TTL EXPIRATION SET', icon: '⏱️', badge: 'STEP 04' },
            { label: 'RAM PAYLOAD RETURN', icon: '📦', badge: 'STEP 05' },
            { label: '1MS RESPONSE PAYOFF', icon: '🎉', badge: 'STEP 06' },
          ],
          animation: 'bounce',
          transition: 'fade',
        },
        {
          type: 'network_flow',
          title: 'WHAT IF REDIS CRASHES? 🔄',
          text: 'What happens when RAM runs out or the server restarts? That brings us to...',
          voiceNarration: 'RAM is volatile. What happens if the Redis server restarts or runs out of memory? That brings us to Redis AOF and RDB persistence...',
          flowActiveStep: 2,
          packetLabel: 'AOF Append-Only Log 📄',
          flowNodes: [
            { id: 'redis', label: 'REDIS INSTANCE', icon: '⚡', status: 'done', detail: 'In-Memory' },
            { id: 'aof', label: 'AOF PERSISTENCE', icon: '💾', status: 'active', detail: 'Fsync to Disk' },
            { id: 'replica', label: 'REDIS REPLICA', icon: '🔄', status: 'active', detail: 'Failover Sentinel' },
          ],
          telemetry: {
            protocol: 'RDB + AOF Persistence',
            status: 'NEXT VIDEO 🔄',
          },
          animation: 'fade',
          transition: 'none',
        },
      ],
    };
  }

  // 6. DYNAMIC TECHNICAL SYNTHESIS (FOR ANY ARBITRARY TOPIC)
  const cleanTitle = topic.charAt(0).toUpperCase() + topic.slice(1);
  const keywords = topic.split(/[\s,–—-]+/).filter(w => w.length > 2);
  const subjectName = keywords[0] || 'Technology';

  return {
    title: `${cleanTitle} Explained in 30 Seconds ⚡`,
    hookText: `What actually happens inside ${subjectName}? 🚀`,
    language: 'javascript',
    scenes: [
      {
        type: 'browser_sim',
        title: `${subjectName.toUpperCase()}: THE CORE PROBLEM`,
        text: `Why do modern engineering teams rely on ${subjectName}?`,
        voiceNarration: `What actually happens when you deploy ${subjectName} in a production environment? Here is the core concept explained in thirty seconds.`,
        browserUrl: `system.internal/${subjectName.toLowerCase()}`,
        browserSimState: 'enter',
        browserPageTitle: `${subjectName} Architecture`,
        animation: 'fade',
        transition: 'fade',
      },
      {
        type: 'cinematic_image',
        title: 'UNDER THE HOOD ARCHITECTURE',
        text: 'Moving beyond abstraction into the physical system flow.',
        voiceNarration: `Behind the simple interface lies a sophisticated technical architecture designed to eliminate bottlenecks and scale throughput.`,
        imageUrl: '/assets/images/dns_network_infra.jpg',
        cinematicZoom: true,
        animation: 'zoom',
        transition: 'fade',
      },
      {
        type: 'network_flow',
        title: 'REQUEST & DATA EXECUTION',
        text: 'Packets traverse the system with verified cryptographic integrity.',
        voiceNarration: `Every single operation triggers high-speed communication between distributed components, validating protocols and synchronizing state.`,
        flowActiveStep: 2,
        packetLabel: `${subjectName} Payload ⚡`,
        flowNodes: [
          { id: 'client', label: 'CALLER NODE', icon: '💻', status: 'done', detail: 'Initiator' },
          { id: 'engine', label: `${subjectName.toUpperCase()} CORE`, icon: '⚙️', status: 'active', detail: 'Execution Engine' },
          { id: 'storage', label: 'TARGET SYSTEM', icon: '🗄️', status: 'pending', detail: 'Synchronized' },
        ],
        telemetry: {
          protocol: 'High-Throughput RPC',
          status: '200 RESOLVED',
          rtt: '3ms',
        },
        animation: 'fade',
        transition: 'slide',
      },
      {
        type: 'code',
        title: 'IMPLEMENTATION EXAMPLE',
        text: 'Minimal, production-grade configuration pattern.',
        voiceNarration: `In just a few lines of configuration, you establish resilient connection pooling and fault-tolerant event processing.`,
        code: `// ${subjectName} Configuration
const client = new Client({
  endpoint: process.env.${subjectName.toUpperCase()}_URL,
  timeoutMs: 2500,
  retryPolicy: { maxRetries: 3 }
});

await client.connect();
const result = await client.execute();`,
        language: 'javascript',
        animation: 'fade',
        transition: 'fade',
      },
      {
        type: 'browser_sim',
        title: 'EXECUTION COMPLETED ✓',
        text: 'Zero memory leaks, deterministic throughput, verified status.',
        voiceNarration: `Execution completes cleanly with zero resource leaks and guaranteed sub-second response times.`,
        browserUrl: `system.internal/${subjectName.toLowerCase()}/status`,
        browserSimState: 'rendered',
        browserPageTitle: `${subjectName} 200 OK`,
        animation: 'zoom',
        transition: 'fade',
      },
      {
        type: 'architecture_overview',
        title: 'THE END-TO-END PIPELINE',
        text: 'Input ➔ Processing ➔ Consensus ➔ Cache ➔ Payoff.',
        voiceNarration: `Input, distributed processing, state synchronization, caching, and instant verified payoff. That is the architecture of ${subjectName}.`,
        architectureSteps: [
          { label: 'CLIENT DISPATCH', icon: '📱', badge: 'STEP 01' },
          { label: 'INGRESS VALIDATION', icon: '🛡️', badge: 'STEP 02' },
          { label: `${subjectName.toUpperCase()} CORE`, icon: '⚡', badge: 'STEP 03' },
          { label: 'CONSENSUS STATE', icon: '🔄', badge: 'STEP 04' },
          { label: 'IN-MEMORY CACHE', icon: '💾', badge: 'STEP 05' },
          { label: 'STATUS VERIFIED', icon: '🎉', badge: 'STEP 06' },
        ],
        animation: 'bounce',
        transition: 'fade',
      },
      {
        type: 'network_flow',
        title: 'WHERE DOES IT BREAK? 🔄',
        text: 'How do you handle catastrophic network partitions? That brings us to...',
        voiceNarration: `That works in ideal conditions. But how does this system survive sudden network partitions? That brings us to our next technical deep dive...`,
        flowActiveStep: 2,
        packetLabel: 'Partition Tolerance ⚡',
        flowNodes: [
          { id: 'nodeA', label: 'PRIMARY CLUSTER', icon: '🖥️', status: 'done', detail: 'Quorum' },
          { id: 'mesh', label: 'SPLIT BRAIN SHIELD', icon: '🛡️', status: 'active', detail: 'Consensus' },
          { id: 'nodeB', label: 'BACKUP REGION', icon: '🌐', status: 'active', detail: 'Failover' },
        ],
        telemetry: {
          protocol: 'CAP Theorem',
          status: 'NEXT VIDEO 🔄',
        },
        animation: 'fade',
        transition: 'none',
      },
    ],
  };
}

/**
 * Generate a complete, ready-to-render project from a given topic prompt.
 * Generates custom Edge TTS voiceover for every scene, computes accurate durations,
 * assigns custom visual assets, and writes directly into SQLite.
 */
export async function generateProjectFromTopic(
  topic: string,
  options: GenerateTopicOptions = {},
): Promise<ProjectWithScenes> {
  const db = getDb();
  const archetype = synthesizeTopicArchetype(topic);

  const projectId = uuidv4();
  const now = new Date().toISOString();
  const audioMode = options.audioMode || 'voice_music';
  const voiceModel = options.voiceModel || 'en-US-ChristopherNeural';
  const musicFile = options.musicFile || 'chill-lofi.mp3';

  // Find CodeWithSundresh Tech template or default
  let templateId = 'codewithsundresh-tech';
  const templateRow = db.prepare('SELECT id FROM templates WHERE id = ?').get(templateId);
  if (!templateRow) {
    const def = db.prepare('SELECT id FROM templates WHERE is_default = 1').get() as any;
    templateId = def?.id || '4ef431c9-7942-49de-a2b1-bed85b1d51af';
  }

  // 1. Insert project record first to satisfy foreign key constraints
  db.prepare(`
    INSERT INTO projects (
      id, title, language, hook_text, code_snippets, output, cta,
      template_id, scene_config, audio_mode, music_file, status,
      explanation_template, sfx_whoosh, sfx_typing, sfx_achievement,
      tts_explanation, tts_output, music_volume, voice_volume,
      created_at, updated_at
    ) VALUES (
      ?, ?, ?, ?, '[]', '', '',
      ?, '[]', ?, ?, 'draft',
      'none', 1, 1, 1,
      1, 1, 0.12, 1.0,
      ?, ?
    )
  `).run(
    projectId,
    archetype.title,
    archetype.language,
    archetype.hookText,
    templateId,
    audioMode,
    musicFile,
    now,
    now,
  );

  // 2. Generate TTS Audio, calculate durations, and insert scenes
  const generatedScenes: SceneConfig[] = [];
  let sceneOrder = 0;

  for (let i = 0; i < archetype.scenes.length; i++) {
    const rawScene = archetype.scenes[i];
    const sceneId = uuidv4();
    const narration = rawScene.voiceNarration.trim();

    let voiceUrl = '';
    let durationFrames = 150; // default 5s (150f)

    if (audioMode === 'voice_music' && narration) {
      try {
        const filename = `audio_${projectId.slice(0, 8)}_${i + 1}.mp3`;
        const audioRes = await generateAudio(narration, voiceModel, filename);
        voiceUrl = audioRes.audioUrl;
        if (audioRes.durationSeconds > 0) {
          // Dynamic Audio-Visual Sync Rule: Math.ceil(audioSecs * 30) + 24
          durationFrames = Math.max(90, Math.ceil(audioRes.durationSeconds * FPS) + 24);
        }
      } catch (err) {
        console.error(`[AITopicEngine] TTS failed for scene ${i + 1}:`, err);
        durationFrames = 150;
      }
    }

    const sceneConfig: SceneConfig = {
      id: sceneId,
      type: rawScene.type,
      title: rawScene.title,
      text: rawScene.text,
      duration_frames: durationFrames,
      animation: rawScene.animation || 'fade',
      transition: rawScene.transition || 'fade',
      voiceNarration: narration,
      voiceUrl: voiceUrl || undefined,
      code: rawScene.code,
      language: rawScene.language,
      output: rawScene.output,
      imageUrl: rawScene.imageUrl,
      browserUrl: rawScene.browserUrl,
      browserSimState: rawScene.browserSimState,
      browserPageTitle: rawScene.browserPageTitle,
      cinematicZoom: rawScene.cinematicZoom,
      flowNodes: rawScene.flowNodes,
      flowActiveStep: rawScene.flowActiveStep,
      packetLabel: rawScene.packetLabel,
      telemetry: rawScene.telemetry,
      architectureSteps: rawScene.architectureSteps,
      comparisonLeftTitle: rawScene.comparisonLeftTitle,
      comparisonRightTitle: rawScene.comparisonRightTitle,
      comparisonLeftCode: rawScene.comparisonLeftCode,
      comparisonRightCode: rawScene.comparisonRightCode,
      comparisonLeftLanguage: rawScene.comparisonLeftLanguage,
      comparisonRightLanguage: rawScene.comparisonRightLanguage,
      comparisonVerdict: rawScene.comparisonVerdict,
      snippetHookEmoji: rawScene.snippetHookEmoji,
      snippetHookColor: rawScene.snippetHookColor,
    };

    generatedScenes.push(sceneConfig);

    // Persist scene to SQLite scenes table
    const content = {
      text: sceneConfig.text,
      code: sceneConfig.code,
      language: sceneConfig.language,
      output: sceneConfig.output,
      imageUrl: sceneConfig.imageUrl,
      browserUrl: sceneConfig.browserUrl,
      browserSimState: sceneConfig.browserSimState,
      browserPageTitle: sceneConfig.browserPageTitle,
      cinematicZoom: sceneConfig.cinematicZoom,
      flowNodes: sceneConfig.flowNodes,
      flowActiveStep: sceneConfig.flowActiveStep,
      packetLabel: sceneConfig.packetLabel,
      telemetry: sceneConfig.telemetry,
      architectureSteps: sceneConfig.architectureSteps,
      comparisonLeftTitle: sceneConfig.comparisonLeftTitle,
      comparisonRightTitle: sceneConfig.comparisonRightTitle,
      comparisonLeftCode: sceneConfig.comparisonLeftCode,
      comparisonRightCode: sceneConfig.comparisonRightCode,
      comparisonLeftLanguage: sceneConfig.comparisonLeftLanguage,
      comparisonRightLanguage: sceneConfig.comparisonRightLanguage,
      comparisonVerdict: sceneConfig.comparisonVerdict,
      snippetHookEmoji: sceneConfig.snippetHookEmoji,
      snippetHookColor: sceneConfig.snippetHookColor,
      voiceNarration: sceneConfig.voiceNarration,
      voiceUrl: sceneConfig.voiceUrl,
    };

    db.prepare(`
      INSERT INTO scenes (id, project_id, scene_order, type, title, content, duration_frames, animation, transition_, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      sceneId,
      projectId,
      sceneOrder++,
      sceneConfig.type,
      sceneConfig.title,
      JSON.stringify(content),
      sceneConfig.duration_frames,
      sceneConfig.animation,
      sceneConfig.transition,
      now,
    );
  }

  // 3. Update project with finalized scene_config
  db.prepare(`
    UPDATE projects SET scene_config = ? WHERE id = ?
  `).run(JSON.stringify(generatedScenes), projectId);

  const rawProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId) as any;
  const scenes = db.prepare('SELECT id, project_id, scene_order, type, title, content, duration_frames, animation, transition_ AS transition, created_at FROM scenes WHERE project_id = ? ORDER BY scene_order ASC').all(projectId) as any[];

  return {
    ...rawProject,
    sfx_whoosh: true,
    sfx_typing: true,
    sfx_achievement: true,
    tts_explanation: true,
    tts_output: true,
    scenes,
  };
}
