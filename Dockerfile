# ---- Stage 1: Build ----
FROM node:20-alpine AS builder

WORKDIR /app

# Copy workspace config
COPY package.json tsconfig.base.json ./
COPY shared/ ./shared/

# Copy package.json files for each workspace
COPY frontend/package.json ./frontend/
COPY backend/package.json ./backend/
COPY renderer/package.json ./renderer/

# Install all dependencies
RUN npm install

# Copy source code
COPY frontend/ ./frontend/
COPY backend/ ./backend/
COPY renderer/ ./renderer/

# Build all packages
RUN npm run build:frontend
RUN npm run build:backend

# ---- Stage 2: Runtime ----
FROM node:20-slim

# Install FFmpeg and Chromium (required by Remotion)
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    chromium \
    fonts-liberation \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

# Set Chromium path for Remotion
ENV CHROME_PATH=/usr/bin/chromium
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

WORKDIR /app

# Copy workspace config
COPY package.json tsconfig.base.json ./
COPY shared/ ./shared/

# Copy built frontend
COPY --from=builder /app/frontend/dist ./frontend/dist

# Copy backend source and dependencies
COPY --from=builder /app/backend/ ./backend/
COPY --from=builder /app/node_modules ./node_modules

# Copy renderer for Remotion bundling
COPY --from=builder /app/renderer/ ./renderer/

# Create directories
RUN mkdir -p generated/code-images generated/audio generated/videos database assets/music assets/fonts assets/piper

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD curl -f http://localhost:3001/api/health || exit 1

# Start the backend (which serves the frontend build)
CMD ["node", "backend/dist/index.js"]
