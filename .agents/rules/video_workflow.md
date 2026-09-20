---
description: Rules for video duration, copyright safety, thumbnail generation, and YouTube publishing for CodeWithSundresh
globs: ["**/*"]
---

# CodeWithSundresh Video Publishing Rules

1. **Duration:** All generated YouTube Shorts MUST be between **50 seconds and 70 seconds** (1,500 to 2,100 frames at 30 fps).
2. **Copyright Safety:** Zero copyrighted material. Generate all 3D visual assets dynamically via `generate_image`. Use royalty-free music and neural TTS.
3. **Thumbnail:** Always generate a professional high-CTR thumbnail for every video using `generate_image`.
4. **Approval Before Upload:** Always present the rendered video, duration, and thumbnail to the user and explicitly ask for confirmation and privacy status (`Unlisted` / `Public`) before uploading.
5. **Playlist Assignment:** Query channel playlists and assign the uploaded video to the matching playlist.
6. **Metadata:** Format title (ending with `#shorts`), generate bilingual Tamil & English description with takeaways, and attach relevant tech tags.
