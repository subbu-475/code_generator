// ============================================================
// YouTube service — YouTube Data API v3 integration with OAuth2
// ============================================================

import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';
import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../database/connection.js';

const SCOPES = [
  'https://www.googleapis.com/auth/youtube.upload',
  'https://www.googleapis.com/auth/youtube.readonly',
];

export interface YoutubeConfig {
  clientId: string;
  clientSecret: string;
  autoUpload?: boolean;
  defaultPrivacy?: 'private' | 'unlisted' | 'public';
  defaultTags?: string;
}

export interface YoutubeStatus {
  configured: boolean;
  connected: boolean;
  channelTitle?: string;
  channelHandle?: string;
  channelThumbnail?: string;
  autoUpload: boolean;
  defaultPrivacy: 'private' | 'unlisted' | 'public';
  defaultTags: string;
  clientIdMasked?: string;
}

export interface UploadOptions {
  filePath: string;
  title: string;
  description?: string;
  tags?: string[];
  privacyStatus?: 'private' | 'unlisted' | 'public';
  projectId?: string;
  exportId?: string;
  playlistId?: string;
  thumbnailPath?: string;
}

export interface YoutubeUploadResult {
  id: string;
  youtubeId: string;
  videoUrl: string;
  title: string;
  privacyStatus: string;
  status: string;
}

/**
 * Get setting value from database
 */
function getSetting(key: string): string | null {
  const db = getDb();
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key) as { value: string } | undefined;
  return row ? row.value : null;
}

/**
 * Helper to read key from environment or .env file
 */
function getEnv(key: string): string | undefined {
  if (process.env[key]) return process.env[key];
  try {
    const envPaths = [path.resolve('.env'), path.resolve('..', '.env')];
    for (const p of envPaths) {
      if (fs.existsSync(p)) {
        const lines = fs.readFileSync(p, 'utf-8').split(/\r?\n/);
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
            const idx = trimmed.indexOf('=');
            const k = trimmed.slice(0, idx).trim();
            const v = trimmed.slice(idx + 1).trim();
            if (k === key) return v;
          }
        }
      }
    }
  } catch {}
  return undefined;
}

/**
 * Resolve Client ID from settings or .env
 */
export function getResolvedClientId(): string | null {
  return (
    getSetting('youtube_client_id') ||
    getEnv('YOUTUBE_CLIENT_ID') ||
    getEnv('ClientID') ||
    getEnv('CLIENT_ID') ||
    getEnv('client_id') ||
    null
  );
}

/**
 * Resolve Client Secret from settings or .env
 */
export function getResolvedClientSecret(): string | null {
  return (
    getSetting('youtube_client_secret') ||
    getEnv('YOUTUBE_CLIENT_SECRET') ||
    getEnv('ClientSecret') ||
    getEnv('CLIENT_SECRET') ||
    getEnv('client_secret') ||
    null
  );
}

/**
 * Save setting value into database
 */
function setSetting(key: string, value: string): void {
  const db = getDb();
  db.prepare(`
    INSERT INTO settings (key, value) VALUES (?, ?)
    ON CONFLICT(key) DO UPDATE SET value = excluded.value
  `).run(key, value);
}

/**
 * Delete setting key from database
 */
function deleteSetting(key: string): void {
  const db = getDb();
  db.prepare('DELETE FROM settings WHERE key = ?').run(key);
}

/**
 * Determine the OAuth redirect URI
 */
function getRedirectUri(): string {
  const port = process.env.PORT || 3001;
  return `http://localhost:${port}/api/youtube/oauth2callback`;
}

/**
 * Build configured OAuth2 client
 */
export function getOAuth2Client(): any {
  const clientId = getResolvedClientId();
  const clientSecret = getResolvedClientSecret();
  const redirectUri = getRedirectUri();

  if (!clientId || !clientSecret) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);

  const tokensJson = getSetting('youtube_tokens');
  if (tokensJson) {
    try {
      const tokens = JSON.parse(tokensJson);
      oauth2Client.setCredentials(tokens);
    } catch (e) {
      console.error('[YouTube] Failed to parse stored tokens:', e);
    }
  }

  // Automatically persist refreshed tokens
  oauth2Client.on('tokens', (tokens) => {
    try {
      const existingJson = getSetting('youtube_tokens');
      const existing = existingJson ? JSON.parse(existingJson) : {};
      const merged = { ...existing, ...tokens };
      setSetting('youtube_tokens', JSON.stringify(merged));
      console.log('[YouTube] OAuth tokens refreshed and saved');
    } catch (err) {
      console.error('[YouTube] Failed to save refreshed tokens:', err);
    }
  });

  return oauth2Client;
}

/**
 * Generate Google OAuth2 authorization URL
 */
export function getAuthUrl(): string {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) {
    throw new Error('YouTube Client ID and Secret are not configured. Please set them in Settings.');
  }

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
  });
}

/**
 * Handle Google OAuth callback: exchange code for tokens and fetch channel profile
 */
export async function handleCallback(code: string): Promise<YoutubeStatus> {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) {
    throw new Error('OAuth2 client could not be initialized');
  }

  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);
  setSetting('youtube_tokens', JSON.stringify(tokens));

  // Fetch channel info
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  try {
    const res = await youtube.channels.list({
      part: ['snippet'],
      mine: true,
    });

    const channel = res.data.items?.[0];
    if (channel?.snippet) {
      setSetting('youtube_channel_title', channel.snippet.title || '');
      setSetting('youtube_channel_handle', channel.snippet.customUrl || '');
      setSetting('youtube_channel_thumbnail', channel.snippet.thumbnails?.default?.url || '');
    }
  } catch (err) {
    console.warn('[YouTube] Could not fetch channel profile:', err);
  }

  return getYoutubeStatus();
}

/**
 * Get current YouTube integration status
 */
export async function getYoutubeStatus(): Promise<YoutubeStatus> {
  const clientId = getResolvedClientId();
  const clientSecret = getResolvedClientSecret();
  const tokensJson = getSetting('youtube_tokens');

  const configured = Boolean(clientId && clientSecret);
  let connected = Boolean(configured && tokensJson);

  let channelTitle = getSetting('youtube_channel_title') || undefined;
  let channelHandle = getSetting('youtube_channel_handle') || undefined;
  let channelThumbnail = getSetting('youtube_channel_thumbnail') || undefined;

  // If connected, verify token validity
  if (connected && !channelTitle) {
    try {
      const oauth2Client = getOAuth2Client();
      if (oauth2Client) {
        const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
        const res = await youtube.channels.list({
          part: ['snippet'],
          mine: true,
        });
        const channel = res.data.items?.[0];
        if (channel?.snippet) {
          channelTitle = channel.snippet.title || undefined;
          channelHandle = channel.snippet.customUrl || undefined;
          channelThumbnail = channel.snippet.thumbnails?.default?.url || undefined;
          if (channelTitle) setSetting('youtube_channel_title', channelTitle);
          if (channelHandle) setSetting('youtube_channel_handle', channelHandle);
          if (channelThumbnail) setSetting('youtube_channel_thumbnail', channelThumbnail);
        }
      }
    } catch (err) {
      console.warn('[YouTube] Token verification error:', err);
      // Don't immediately mark as disconnected if it was just a temporary network hiccup
    }
  }

  const autoUpload = getSetting('youtube_auto_upload') === '1';
  const defaultPrivacy = (getSetting('youtube_default_privacy') as any) || 'private';
  const defaultTags = getSetting('youtube_default_tags') || 'Shorts,CodeShorts,Coding,Programming,Tech';

  const maskedClientId = clientId
    ? `${clientId.slice(0, 8)}...${clientId.slice(-10)}`
    : undefined;

  return {
    configured,
    connected,
    channelTitle,
    channelHandle,
    channelThumbnail,
    autoUpload,
    defaultPrivacy,
    defaultTags,
    clientIdMasked: maskedClientId,
  };
}

/**
 * Save YouTube API credentials and preferences
 */
export function saveYoutubeConfig(config: YoutubeConfig): void {
  if (config.clientId !== undefined) {
    setSetting('youtube_client_id', config.clientId.trim());
  }
  if (config.clientSecret !== undefined) {
    setSetting('youtube_client_secret', config.clientSecret.trim());
  }
  if (config.autoUpload !== undefined) {
    setSetting('youtube_auto_upload', config.autoUpload ? '1' : '0');
  }
  if (config.defaultPrivacy !== undefined) {
    setSetting('youtube_default_privacy', config.defaultPrivacy);
  }
  if (config.defaultTags !== undefined) {
    setSetting('youtube_default_tags', config.defaultTags.trim());
  }
}

/**
 * Disconnect YouTube integration
 */
export function disconnect(): void {
  deleteSetting('youtube_tokens');
  deleteSetting('youtube_channel_title');
  deleteSetting('youtube_channel_handle');
  deleteSetting('youtube_channel_thumbnail');
}

/**
 * Upload a vertical video to YouTube Shorts
 */
export async function uploadVideo(options: UploadOptions): Promise<YoutubeUploadResult> {
  const { filePath, title, description, tags, privacyStatus, projectId, exportId } = options;

  if (!fs.existsSync(filePath)) {
    throw new Error(`Video file not found at: ${filePath}`);
  }

  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) {
    throw new Error('YouTube is not configured. Configure credentials in Settings.');
  }

  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });

  // Format title and description for YouTube Shorts
  let finalTitle = title.trim();
  if (!finalTitle.toLowerCase().includes('#shorts')) {
    finalTitle = `${finalTitle} #shorts`;
  }
  // Title limit is 100 characters on YouTube
  if (finalTitle.length > 100) {
    finalTitle = finalTitle.slice(0, 92) + ' #shorts';
  }

  // Ensure #shorts and tags are in description
  const defaultTagsString = getSetting('youtube_default_tags') || 'Shorts,CodeShorts,Coding,Programming,Tech';
  const defaultTagList = defaultTagsString.split(',').map((t) => t.trim()).filter(Boolean);
  const combinedTags = Array.from(new Set([...(tags || []), ...defaultTagList]));

  let finalDescription = description || `${finalTitle}\n\nGenerated with CodeShorts AI.`;
  if (!finalDescription.includes('#shorts')) {
    finalDescription += '\n\n#shorts #coding #developer #tech';
  }

  const finalPrivacy = privacyStatus || (getSetting('youtube_default_privacy') as any) || 'private';

  console.log(`[YouTube] Uploading "${finalTitle}" (${filePath}) as ${finalPrivacy}...`);

  const res = await youtube.videos.insert({
    part: ['snippet', 'status'],
    requestBody: {
      snippet: {
        title: finalTitle,
        description: finalDescription,
        tags: combinedTags,
        categoryId: '28', // Science & Technology
      },
      status: {
        privacyStatus: finalPrivacy,
        selfDeclaredMadeForKids: false,
      },
    },
    media: {
      body: fs.createReadStream(filePath),
    },
  });

  const youtubeId = res.data.id;
  if (!youtubeId) {
    throw new Error('YouTube upload completed but no video ID was returned.');
  }

  const videoUrl = `https://youtu.be/${youtubeId}`;
  const uploadId = uuidv4();
  const db = getDb();

  db.prepare(`
    INSERT INTO youtube_uploads (id, project_id, export_id, youtube_id, video_url, title, description, tags, status, privacy_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'uploaded', ?)
  `).run(
    uploadId,
    projectId || null,
    exportId || null,
    youtubeId,
    videoUrl,
    finalTitle,
    finalDescription,
    JSON.stringify(combinedTags),
    finalPrivacy
  );

  console.log(`[YouTube] Successfully uploaded video: ${videoUrl}`);

  // Optional: Add to playlist
  if (options.playlistId) {
    try {
      await addToPlaylist(options.playlistId, youtubeId);
    } catch (err) {
      console.warn(`[YouTube] Could not add to playlist ${options.playlistId}:`, err);
    }
  }

  // Optional: Upload custom thumbnail
  if (options.thumbnailPath && fs.existsSync(options.thumbnailPath)) {
    try {
      await setVideoThumbnail(youtubeId, options.thumbnailPath);
    } catch (err) {
      console.warn('[YouTube] Could not set custom thumbnail:', err);
    }
  }

  return {
    id: uploadId,
    youtubeId,
    videoUrl,
    title: finalTitle,
    privacyStatus: finalPrivacy,
    status: 'uploaded',
  };
}

/**
 * Get channel playlists
 */
export async function getPlaylists(): Promise<{ id: string; title: string }[]> {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) throw new Error('YouTube is not configured.');
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  const res = await youtube.playlists.list({
    part: ['snippet'],
    mine: true,
    maxResults: 50,
  });
  return (res.data.items || []).map((item) => ({
    id: item.id || '',
    title: item.snippet?.title || 'Untitled Playlist',
  }));
}

/**
 * Add a video to a specific playlist
 */
export async function addToPlaylist(playlistId: string, videoId: string): Promise<void> {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) throw new Error('YouTube is not configured.');
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  await youtube.playlistItems.insert({
    part: ['snippet'],
    requestBody: {
      snippet: {
        playlistId,
        resourceId: {
          kind: 'youtube#video',
          videoId,
        },
      },
    },
  });
  console.log(`[YouTube] Video ${videoId} added to playlist ${playlistId}`);
}

/**
 * Upload custom thumbnail for a video
 */
export async function setVideoThumbnail(videoId: string, imagePath: string): Promise<void> {
  const oauth2Client = getOAuth2Client();
  if (!oauth2Client) throw new Error('YouTube is not configured.');
  const youtube = google.youtube({ version: 'v3', auth: oauth2Client });
  await youtube.thumbnails.set({
    videoId,
    media: {
      body: fs.createReadStream(imagePath),
    },
  });
  console.log(`[YouTube] Thumbnail set for video ${videoId}`);
}

/**
 * Get list of YouTube uploads
 */
export function getYoutubeUploads(): any[] {
  const db = getDb();
  return db.prepare('SELECT * FROM youtube_uploads ORDER BY created_at DESC').all();
}
