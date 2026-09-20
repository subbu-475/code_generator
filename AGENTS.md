# CodeWithSundresh — Animated Tech Shorts Master Standards

## Channel Identity & Positioning
- **Channel:** `CodeWithSundresh` ([@CodeWithSundresh](https://youtube.com/@codewithsundresh))
- **Primary Niche:** Animated Technology Explainers, System Architecture, Networking, Security, DevOps, Programming & AI Internals.
- **Core Positioning:** Explaining complex technology concepts through:
  - Cinematic 2D/2.5D animation
  - Animated system & network flow diagrams
  - Realistic UI simulations (Browser address bar, terminal, mobile chat)
  - Code visualization (relevant 1–5 lines, execution highlighting)
  - Real-world analogies & metaphors
  - Kinetic typography & telemetry HUDs
- **Primary Language:** **English** (Clear, articulate, energetic developer narration).
  - Use Microsoft Edge Neural TTS (`en-US-ChristopherNeural` or `en-US-GuyNeural` at `--rate=+10%`).
  - Professional, punchy, knowledgeable tech creator delivery.
- **Voice Synchronization Rule (STRICT):**
  - Audio and visuals must be **100% synchronized**.
  - Scene duration must ALWAYS match or exceed audio duration (`scene.duration_frames >= Math.ceil(audioSeconds * 30) + 15 frames`).
  - Voice narration must start cleanly with scene entrance and finish completely BEFORE the scene transitions.
  - An audio clip must NEVER bleed into the next scene.
- **Core Mantra:** *"A complex technology concept turned into a short animated story."* Make invisible technology visible.

---

## 1. Visual Identity & Color System
Every visual asset, animation, and UI element MUST follow the signature palette:
- **Canvas / Background:** `#080B0A` (Deep dark charcoal / obsidian)
- **Primary Text & Headings:** `#F5F2E8` (Clean warm off-white)
- **Primary Tech Accent:** `#78E08F` (Signature electric mint green)
- **Secondary Accent:** `#B8FF9C` (Luminous bright lime-green for data packets & highlights)
- **Warning / Error / Problem:** `#FF6B6B` (Coral red for mistakes, drops, leaks ❌)
- **Attention / Metric / Notice:** `#F4C95D` (Warm amber gold for latency, tokens, warnings ⚠️)

### Background & Atmosphere:
- Dark charcoal base with subtle radial glow (`radial-gradient(ellipse at 50% 30%, #0d1a12 0%, #080b0a 100%)`).
- Faint animated technical grid / circuit lines.
- Zero clutter: The technical animation must remain the hero.

---

## 2. Video Format & Duration Guidelines
- **Platform:** YouTube Shorts (Vertical 9:16, 1080×1920 or 720×1280).
- **Target Duration:** **25–40 seconds** (Ideal sweet spot: **30–35 seconds** / 900–1,050 frames at 30 fps).
- **Frame Rate:** 30 FPS.
- **Pacing Rule:** Every second must earn its place. Something meaningful must change every **1–3 seconds** (camera zoom, packet hop, node highlight, telemetry update).

---

## 3. Language & Narration Standards
- **Primary Language:** **English ONLY** (Clean, energetic, articulate developer narration).
  - **Tone:** An experienced developer and tech creator explaining complex systems simply, dynamically, and clearly to another developer or tech enthusiast.
  - **Voice:** Microsoft Edge Neural TTS (`en-US-ChristopherNeural` or `en-US-GuyNeural` at `--rate=+10%`).
  - **Narration Principle:** Keep sentences concise, punchy, and engaging. Never over-explain verbally—use **Voice + Animation + Labels** in synergy. Max **3–7 words** per visual text label.
- **Audio-Visual Synchronization (CRITICAL RULE):**
  - Audio and visual animations must be **100% synchronized**.
  - Every scene's duration MUST be calculated dynamically from the exact audio length:
    `scene.duration_frames = Math.max(minFrames, Math.ceil(audioDurationSeconds * 30) + 24)`.
  - Audio starts 10–12 frames after scene entrance to let visuals settle.
  - Narration finishes cleanly 12–15 frames before scene transition.
  - Audio sequences must NEVER bleed or overlap into subsequent scenes.

---

## Master Retention Rules (STRICT — ALWAYS FOLLOW)
1. **No blank/intro animation during the first 0.5 seconds.** Show the core subject immediately at frame 0.
2. **Show the core subject immediately.** Never start with empty space, generic title screens, or slow fades.
3. **First curiosity question must appear within 1 second.** Hook the viewer instantly.
4. **Do not keep a visually identical scene for more than 1.5–2 seconds.** Constant kinetic motion.
5. **Every 2–3 seconds introduce a meaningful visual change** (camera push, packet hop, node highlight, telemetry update).
6. **Every major step must show actual movement of data/information** (traveling bullets along SVG paths, pulses).
7. **Create a new curiosity question before revealing the next technical step** to sustain viewer attention.
8. **Do not use decorative images for more than 1–2 seconds** unless they are actively contributing to the technical story.
9. **Remove fake precision such as invented latency numbers** (do NOT show arbitrary numbers like `14ms`, `22ms`, `64ms`, `98ms`).
10. **Do not present illustrative technical values as real measurements.** Use accurate protocol labels (`DNS / UDP 53`, `TLS 1.3`, `HTTP/3`, `200 OK`, `AES-256-GCM`).
11. **Verify technical relationships between components before animation** (Browser ➔ DNS; Browser ➔ Server; Server ➔ DB).
12. **Keep the explanation focused on ONE core question.** Do not wander into secondary topics.
13. **Target 25–35 seconds for simple concepts** (approx. 750–1,050 frames at 30 fps).
14. **Audio & visual must be 100% synchronized.** Scene duration must dynamically expand to match voice narration with zero audio overlap or bleeding.
15. **Keep technical terms in English** (*DNS, API, TLS, HTTP, Server, Database, Docker, AI, Handshake, Payload, etc.*).
16. **Use micro-hooks throughout the video:**
    - *"But..."*
    - *"Here's the interesting part..."*
    - *"Wait..."*
    - *"We're not done yet..."*
    - *"But how?"*
    - *"Now something important happens..."*
17. **End with a new unanswered technical question** that can naturally become the next video.
18. **Make the video loop naturally whenever possible** (bridge the ending question directly back to the opening hook!).

---

## 4. 7 to 9-Scene Master Story Structure (25–35s)

| Scene | Timestamp | Scene Purpose & Visual Story |
| :--- | :--- | :--- |
| **1. Hook** | 0:00–0:03 (0–90f) | **Instant Curiosity Gap:** No logo, no intro, no blank frames. Core subject visible at 0.0s. First curiosity question on screen within 1.0s. (e.g. *"You type google.com and press Enter. What actually happens in the next second?"*) |
| **2. Real-World Action** | 0:03–0:06 (90–180f) | **Active Movement:** Browser mockup. User types `google.com` and hits Enter with keypress ripple & lookup radar. |
| **3. Transition** | 0:06–0:09 (180–270f) | **Entering the System:** Camera pushes into address bar / network highway. *"Before anything appears, your request travels across global fiber."* |
| **4. First Technical Step** | 0:09–0:14 (270–420f) | **Request Travel:** Browser node connects to DNS node. Glowing packet travels along SVG line: `"What is google.com IP?"`. Protocol: `UDP / 53`. |
| **5. Response / Next Hook** | 0:14–0:19 (420–570f) | **Micro-hook & Secure Connection:** *"Here's the interesting part..."* Browser establishes encrypted TLS 1.3 connection to Google's edge server. |
| **6. Server & Database** | 0:19–0:25 (570–750f) | **Server & Database Flow:** Server queries search index database; active nodes pulse; streams HTML/CSS back. |
| **7. The Payoff** | 0:25–0:30 (750–900f) | **Result Visual:** Webpage renders cleanly in browser mockup. Verified status: `HTTP 200 OK • DOM RENDERED`. |
| **8. Loop / Next Question** | 0:30–0:35 (900–1050f) | **Seamless Ending Loop:** Open unanswered question teasing the next level (*"That's the basic lifecycle. But how does that data physically cross undersea cables? That brings us to..."*) bridging seamlessly back into Scene 1! 🔄 |

---

## 5. Visual Asset & Image Generation Standards
- **Do NOT generate images for every scene.** Target **2–5 generated assets** per Short. Combine:
  `Animated graphics + generated conceptual visuals + UI simulations + code + network diagrams`.
- **Image Generation Prompt Structure:**
  - Subject: Modern technical infrastructure or conceptual object.
  - Action: Glowing data request, server racks, or packet flow.
  - Style: Premium cinematic 3D technology visualization, matte surfaces, studio lighting.
  - Colors: Obsidian background (`#080B0A`), clean off-white (`#F5F2E8`), green accents (`#78E08F`).
  - Aspect: Vertical 9:16 with central composition and safe space for text overlays.
- **CRITICAL: NEVER generate text inside images.** Generate clean visuals without text/logos, and overlay accurate labels programmatically in the video renderer to guarantee zero typos and sharp typography.
- **Continuous Motion:** Never leave images completely static. Apply subtle camera zoom (`100% ➔ 108%`), drift, particle glow, and parallax.

---

## 6. Technical Diagram & Animation Standards
- **Nodes:** Sleek rounded glassmorphic cards with neon border glow.
- **Connectors:** Animated SVG curved paths with gradient stroke.
- **Packets:** Glowing data bullets (`#B8FF9C`) traveling smoothly along paths.
- **Feedback:** Destination node pulses and highlights upon packet arrival.
- **Telemetry HUD:** Show realistic metrics (`Latency: 12ms`, `Protocol: TLS 1.3`, `Status: 200 OK`).
- **No Empty Void:** All components must fill the vertical 9:16 safe area dynamically.

---

## 7. Audio Hierarchy & Sound Design
- **Voiceover:** 100% (crystal-clear, energetic, conversational).
- **SFX (20–40%):**
  - Typing: Keyboard click sounds
  - Requests: Fast digital whoosh
  - Packets: Soft digital blip / data sweep
  - Success / Payoff: Subtle clean chime / confirmation tone
- **Music (5–15%):** Minimal electronic / lo-fi tech background track (must never compete with narration).

---

## 8. High-CTR Thumbnail & Publishing Workflow
- For every video, generate a dedicated 9:16 vertical thumbnail via `generate_image`:
  - Centered hero object (e.g. Glowing server rack, digital highway, or phone mockup).
  - High-contrast 3–4 hook words (e.g. *"WHAT HAPPENS NEXT? 🤯"*, *"INSIDE GOOGLE.COM"*).
  - Dark charcoal aesthetic with vibrant green accent.
  - Save to `generated/thumbnails/thumb_<video_id>.jpg`.
- **Publishing:**
  - Title: Under 100 characters, irresistible curiosity hook, ending with `#shorts`.
  - Description: Short bilingual takeaway summary and channel credit `@CodeWithSundresh`.
  - Channel: Always upload to connected channel **CodeWithSundresh**.
