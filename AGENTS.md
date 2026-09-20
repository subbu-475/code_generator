# CodeShorts Generator — Agent Rules & Standards

When creating, rendering, and publishing YouTube Shorts for this channel, adhere strictly to the following standards:

## 1. Video Duration Standard
- **Target Duration: 50 seconds to 70 seconds** (1,500 to 2,100 frames at 30 fps).
- Structure 6–8 dynamic scenes so the content is detailed and engaging without feeling rushed:
  1. **Hook Scene:** 6–8s (180–240 frames) — High-impact question or curiosity gap.
  2. **Context / Setup:** 8–10s (240–300 frames) — What we are building or why this matters.
  3. **The Common Mistake / Problem:** 8–10s (240–300 frames) — What developers get wrong.
  4. **Code / Solution in Action:** 10–14s (300–420 frames) — The right way with clean syntax.
  5. **Deep Dive / Technical Rules:** 8–10s (240–300 frames) — Checklist, edge cases, slider rules.
  6. **Pro Tip / Best Practice:** 6–8s (180–240 frames) — High-value optimization takeaway.
  7. **Summary & CTA:** 6–8s (180–240 frames) — Subscribe to `@CodeWithSundresh` and save for later.

## 2. 100% Copyright-Safe Assets
- **Zero Copyright Strikes:** NEVER use copyrighted images, video clips, or background music.
- **Images & 3D Icons:** Always generate custom assets using `generate_image` or create vector SVG icons with transparency. Save generated assets into `assets/images/` or `generated/images/`.
- **Music:** Use only the bundled royalty-free tracks in `assets/music/` (e.g. `chill-lofi.mp3`).
- **Voiceover:** Use Microsoft's neural TTS (`edge-tts`) for Tamil (`ta-IN-ValluvarNeural` at `--rate=+18%`) or local Piper TTS for English.

## 3. High-End Visual Aesthetics
- Follow the 3D studio visual language:
  - Sage green 3D voxel window cards (`#6A8E7E`) with macOS pill dots.
  - Floating dark terminal consoles with glowing borders.
  - Smooth spring entrance animations and idle floating bobbing.
  - Subtitle pill with dark glassmorphic backdrop and high-contrast text.

## 4. Professional Thumbnail Generation
- For every video, generate a high-CTR vertical thumbnail (9:16 or 16:9) using `generate_image`.
- Design: High-contrast 3D subject, large readable hook text, dark/ambient gradient background, zero clutter.
- Save to `generated/thumbnails/<video_id>.jpg`.

## 5. Publishing & YouTube Upload Workflow
- **Never Upload Silently:** Always present the rendered video, duration, and thumbnail preview to the user first.
- **User Approval:** Explicitly ask the user to confirm upload and choose privacy status (`Unlisted`, `Public`, `Private`).
- **Metadata Standards:**
  - **Title:** Under 100 characters, catchy hook, ends with `#shorts`.
  - **Description:** Clear summary in Tamil & English, key bullet points, channel credit (`@CodeWithSundresh`), and targeted hashtags (`#shorts #coding #developer #ai #tamiltech`).
  - **Category:** `28` (Science & Technology).
  - **Playlist:** Fetch channel playlists and attach the video to the most relevant playlist.
  - **Thumbnail:** Set the custom thumbnail using `setVideoThumbnail`.
