# CodeShorts Generator

<div align="center">

**Generate professional YouTube Shorts videos from code snippets — completely offline.**

![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-07405E?style=for-the-badge&logo=sqlite&logoColor=white)

</div>

---

## ✨ Features

- **🎬 Video Generation** — Create YouTube Shorts (9:16, 1080×1920) from code snippets
- **🎨 5 Built-in Templates** — Coding Dark, VSCode Theme, Neon Blue, Cyberpunk, Minimal
- **✍️ Syntax Highlighting** — Powered by Shiki with 8+ languages and 4 themes
- **🎭 Scene System** — Auto-generates Hook → Code → Output → CTA scenes
- **🎞️ Animations** — Fade, Zoom, Slide, Pop, Bounce transitions
- **🔊 Voice Narration** — Optional Piper TTS for offline voice generation
- **🎵 Background Music** — Add custom background music tracks
- **📦 Export Options** — MP4 or WebM, 720p / 1080p / 4K
- **🖥️ Modern Dashboard** — Glassmorphic dark theme, inspired by Adobe Express
- **🔒 Completely Offline** — No cloud APIs, no OpenAI, no external dependencies
- **💾 SQLite Database** — All project data stored locally

## 📸 Supported Languages

| Language | Extension |
|----------|-----------|
| JavaScript | `.js` |
| TypeScript | `.ts` |
| React (JSX) | `.jsx` |
| React (TSX) | `.tsx` |
| Python | `.py` |
| Java | `.java` |
| C# | `.cs` |
| PHP | `.php` |

## 🎨 Code Themes

- **GitHub Dark** — Classic dark theme
- **Vitesse Dark** — Elegant muted colors
- **Tokyo Night** — Vibrant purple/blue tones
- **Dracula** — Iconic dark theme with bright accents

---

## 🚀 Prerequisites

- **Node.js** v18 or higher
- **npm** v9 or higher
- **FFmpeg** — Required for video rendering ([Download](https://ffmpeg.org/download.html))
- **Piper TTS** *(optional)* — For voice narration ([Download](https://github.com/rhasspy/piper/releases))

### Installing FFmpeg

**Windows:**
```bash
# Using winget
winget install FFmpeg

# Or using Chocolatey
choco install ffmpeg

# Or download from https://ffmpeg.org/download.html and add to PATH
```

**Linux:**
```bash
# Ubuntu/Debian
sudo apt update && sudo apt install ffmpeg

# Fedora
sudo dnf install ffmpeg
```

### Installing Piper TTS (Optional)

1. Download the latest release for your platform from [Piper Releases](https://github.com/rhasspy/piper/releases)
2. Extract to `assets/piper/` directory
3. Download a voice model (e.g., `en_US-lessac-medium`):
   ```bash
   # Place .onnx and .onnx.json files in assets/piper/
   ```

---

## 📦 Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd codegen

# Install all dependencies (root + workspaces)
npm install

# Start development servers (frontend + backend)
npm run dev
```

The app will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001

## 🛠️ Development Commands

```bash
# Start both frontend and backend
npm run dev

# Start only frontend
npm run dev:frontend

# Start only backend
npm run dev:backend

# Open Remotion Studio (for video preview/debugging)
npm run studio

# Build all packages
npm run build

# Build frontend for production
npm run build:frontend

# Build backend for production
npm run build:backend
```

---

## 📁 Project Structure

```
codegen/
├── package.json                 # Root workspace config
├── tsconfig.base.json           # Shared TypeScript config
├── docker-compose.yml           # Docker setup
├── Dockerfile
│
├── frontend/                    # React + Vite + Material UI
│   ├── src/
│   │   ├── components/          # UI components
│   │   │   ├── layout/          # AppLayout, Sidebar
│   │   │   ├── dashboard/       # Dashboard page
│   │   │   ├── projects/        # Project CRUD pages
│   │   │   ├── templates/       # Template management
│   │   │   ├── exports/         # Export management
│   │   │   ├── settings/        # App settings
│   │   │   └── common/          # Shared components
│   │   ├── api/                 # API client (axios)
│   │   ├── hooks/               # Custom React hooks
│   │   ├── theme.ts             # MUI dark theme
│   │   └── App.tsx              # Routes & layout
│   └── index.html
│
├── backend/                     # Express.js API
│   └── src/
│       ├── routes/              # API route handlers
│       ├── services/            # Business logic
│       ├── database/            # SQLite setup & migrations
│       ├── middleware/          # Error handling, validation
│       └── utils/               # Helpers (paths, ffmpeg)
│
├── renderer/                    # Remotion video engine
│   └── src/
│       ├── compositions/        # Video compositions
│       ├── components/          # Scene components
│       ├── animations/          # Animation functions
│       └── styles/              # Video themes
│
├── shared/                      # Shared TypeScript types
│   └── types.ts
│
├── assets/
│   ├── music/                   # Background music files
│   ├── fonts/                   # Custom fonts
│   └── piper/                   # Piper TTS binary + models
│
├── generated/                   # Output directory
│   ├── code-images/             # Shiki-generated PNGs
│   ├── audio/                   # Piper TTS WAV outputs
│   └── videos/                  # Rendered videos
│
└── database/
    └── codeshorts.db            # SQLite database
```

---

## 🔌 API Reference

### Projects
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/projects` | Create a new project |
| `GET` | `/api/projects` | List all projects |
| `GET` | `/api/projects/:id` | Get project details |
| `PUT` | `/api/projects/:id` | Update a project |
| `DELETE` | `/api/projects/:id` | Delete a project |

### Templates
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/templates` | List all templates |
| `POST` | `/api/templates` | Create a template |
| `PUT` | `/api/templates/:id` | Update a template |
| `DELETE` | `/api/templates/:id` | Delete a template |

### Generation
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/generate-code-image` | Generate syntax-highlighted code image |
| `POST` | `/api/generate-audio` | Generate voice narration (Piper TTS) |
| `POST` | `/api/render-video` | Start video rendering |
| `GET` | `/api/render-progress/:id` | SSE stream for render progress |

### Exports
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/exports` | List all exports |
| `GET` | `/api/exports/:id/download` | Download exported video |
| `DELETE` | `/api/exports/:id` | Delete an export |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/settings` | Get application settings |
| `PUT` | `/api/settings` | Update settings |

### Health
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | System health check |

---

## 🐳 Docker

```bash
# Build and run with Docker Compose
docker-compose up --build

# Or build manually
docker build -t codeshorts-generator .
docker run -p 3001:3001 -v ./generated:/app/generated -v ./database:/app/database codeshorts-generator
```

---

## 🎬 Usage Guide

### 1. Create a Project
1. Click **"Create New Project"** on the dashboard
2. Fill in: Title, Language, Hook Text, Code Snippet, Output, CTA
3. Select a template
4. Choose audio settings
5. Click **"Create Project"**

### 2. Review Scenes
- The app auto-generates scenes from your content
- Edit scene order, durations, and animations
- Each scene type (Hook, Code, Output, CTA) has dedicated styling

### 3. Preview & Render
- Preview your video layout in the project detail view
- Click **"Render Video"** to start generation
- Select format (MP4/WebM) and resolution (720p/1080p/4K)
- Monitor progress in real-time

### 4. Export
- Find rendered videos in the **"Exports"** page
- Download or manage your exported videos

---

## 📄 License

This project is for personal/educational use. Note that [Remotion](https://remotion.dev/license) requires a commercial license for business use.

---

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request.

---

<div align="center">
  <strong>Built with ❤️ for developers who create content</strong>
</div>
