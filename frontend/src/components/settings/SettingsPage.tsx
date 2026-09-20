import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Link,
} from '@mui/material';
import {
  Save as SaveIcon,
  YouTube as YouTubeIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  OpenInNew as OpenInNewIcon,
  LinkOff as LinkOffIcon,
} from '@mui/icons-material';
import * as api from '../../api/client.js';
import type { Settings, ExportResolution, AnimationStyle, YoutubeStatus, YoutubeConfigInput } from '../../types/index.js';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // YouTube state
  const [ytStatus, setYtStatus] = useState<YoutubeStatus | null>(null);
  const [ytClientId, setYtClientId] = useState('');
  const [ytClientSecret, setYtClientSecret] = useState('');
  const [ytAutoUpload, setYtAutoUpload] = useState(false);
  const [ytDefaultPrivacy, setYtDefaultPrivacy] = useState<'private' | 'unlisted' | 'public'>('private');
  const [ytDefaultTags, setYtDefaultTags] = useState('Shorts,CodeShorts,Coding,Programming,Tech');
  const [ytSaving, setYtSaving] = useState(false);
  const [ytConnecting, setYtConnecting] = useState(false);
  
  // Toast Notification State
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  const fetchYoutubeStatus = async () => {
    try {
      const status = await api.getYoutubeStatus();
      setYtStatus(status);
      setYtAutoUpload(status.autoUpload);
      setYtDefaultPrivacy(status.defaultPrivacy);
      setYtDefaultTags(status.defaultTags);
    } catch (err) {
      console.warn('Failed to load YouTube status:', err);
    }
  };

  // Load settings & YouTube status
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const data = await api.getSettings();
        setSettings(data);
        await fetchYoutubeStatus();
      } catch (err) {
        console.error('Failed to load settings:', err);
        setToastMessage('Failed to load settings from server');
        setToastSeverity('error');
        setToastOpen(true);
      } finally {
        setLoading(false);
      }
    }
    loadData();

    // Listen for OAuth popup completion
    const handleOAuthMessage = (event: MessageEvent) => {
      if (event.data?.type === 'YOUTUBE_AUTH_SUCCESS') {
        fetchYoutubeStatus();
        setToastMessage('YouTube channel connected successfully!');
        setToastSeverity('success');
        setToastOpen(true);
      }
    };
    window.addEventListener('message', handleOAuthMessage);
    return () => window.removeEventListener('message', handleOAuthMessage);
  }, []);

  const handleChange = (field: keyof Settings, value: any) => {
    if (!settings) return;
    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    try {
      setSaving(true);
      const updated = await api.updateSettings(settings);
      setSettings(updated);
      setToastMessage('Application settings saved successfully!');
      setToastSeverity('success');
      setToastOpen(true);
    } catch (err) {
      console.error('Failed to update settings:', err);
      setToastMessage('Failed to save settings to server');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveYoutubeConfig = async () => {
    try {
      setYtSaving(true);
      const config: YoutubeConfigInput = {
        autoUpload: ytAutoUpload,
        defaultPrivacy: ytDefaultPrivacy,
        defaultTags: ytDefaultTags,
      };
      if (ytClientId.trim()) config.clientId = ytClientId.trim();
      if (ytClientSecret.trim()) config.clientSecret = ytClientSecret.trim();

      const updated = await api.updateYoutubeConfig(config);
      setYtStatus(updated);
      setYtClientId('');
      setYtClientSecret('');
      setToastMessage('YouTube settings saved successfully!');
      setToastSeverity('success');
      setToastOpen(true);
    } catch (err) {
      console.error('Failed to save YouTube config:', err);
      setToastMessage('Failed to save YouTube settings');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setYtSaving(false);
    }
  };

  const handleConnectYoutube = async () => {
    try {
      setYtConnecting(true);
      const authUrl = await api.getYoutubeAuthUrl();
      // Open OAuth window popup
      const width = 600;
      const height = 700;
      const left = window.screen.width / 2 - width / 2;
      const top = window.screen.height / 2 - height / 2;
      window.open(
        authUrl,
        'youtube_auth',
        `width=${width},height=${height},top=${top},left=${left},status=no,resizable=yes,scrollbars=yes`
      );
    } catch (err) {
      console.error('Failed to start YouTube authentication:', err);
      setToastMessage(err instanceof Error ? err.message : 'Failed to start YouTube authentication');
      setToastSeverity('error');
      setToastOpen(true);
    } finally {
      setYtConnecting(false);
    }
  };

  const handleDisconnectYoutube = async () => {
    if (!window.confirm('Disconnect your YouTube channel from CodeShorts?')) return;
    try {
      await api.disconnectYoutube();
      await fetchYoutubeStatus();
      setToastMessage('YouTube channel disconnected');
      setToastSeverity('success');
      setToastOpen(true);
    } catch (err) {
      console.error('Failed to disconnect YouTube:', err);
      setToastMessage('Failed to disconnect YouTube channel');
      setToastSeverity('error');
      setToastOpen(true);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const fonts = ['JetBrains Mono', 'Fira Code', 'Consolas', 'Space Mono', 'SF Mono'];
  const animations = [
    { value: 'fade', label: 'Fade' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'slide', label: 'Slide' },
    { value: 'pop', label: 'Pop' },
    { value: 'bounce', label: 'Bounce' },
  ];
  const resolutions = [
    { value: '720p', label: 'Vertical 720p (720x1280)' },
    { value: '1080p', label: 'Vertical 1080p (1080x1920)' },
    { value: '4k', label: 'Vertical 4K (2160x3840)' },
  ];
  const musicTracks = [
    { value: '', label: 'None' },
    { value: 'chill-lofi.mp3', label: 'Chill Lofi Beat' },
    { value: 'synthwave.mp3', label: 'Synthwave Neon' },
    { value: 'corporate-tech.mp3', label: 'Corporate Modern Tech' },
    { value: 'ambient.mp3', label: 'Ambient Deep Space' },
  ];

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease', maxWidth: 750 }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure default options, video styling, and automatic YouTube uploading.
        </Typography>
      </Box>

      {/* 1. General Settings Form */}
      {settings && (
        <form onSubmit={handleSave}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1.5 }}>
            🎨 General & Video Defaults
          </Typography>
          <Card sx={{ p: 3, mb: 4, border: '1px solid rgba(255,255,255,0.06)' }}>
            <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                select
                label="Application Theme"
                fullWidth
                value={settings.theme || 'dark'}
                onChange={(e) => handleChange('theme', e.target.value)}
              >
                <MenuItem value="light">Light Mode (Classic)</MenuItem>
                <MenuItem value="dark">Dark Mode (Sleek)</MenuItem>
              </TextField>

              <TextField
                select
                label="Default Font Family"
                fullWidth
                value={settings.default_font || 'JetBrains Mono'}
                onChange={(e) => handleChange('default_font', e.target.value)}
              >
                {fonts.map((f) => (
                  <MenuItem key={f} value={f}>
                    {f}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Default Scene Entrance Animation"
                fullWidth
                value={settings.default_animation || 'fade'}
                onChange={(e) => handleChange('default_animation', e.target.value as AnimationStyle)}
              >
                {animations.map((a) => (
                  <MenuItem key={a.value} value={a.value}>
                    {a.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Default Background Music"
                fullWidth
                value={settings.default_music || ''}
                onChange={(e) => handleChange('default_music', e.target.value)}
              >
                {musicTracks.map((track) => (
                  <MenuItem key={track.value} value={track.value}>
                    {track.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                label="Default Export Resolution"
                fullWidth
                value={settings.default_resolution || '1080p'}
                onChange={(e) => handleChange('default_resolution', e.target.value as ExportResolution)}
              >
                {resolutions.map((res) => (
                  <MenuItem key={res.value} value={res.value}>
                    {res.label}
                  </MenuItem>
                ))}
              </TextField>

              <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                  sx={{ px: 4, py: 1.2, borderRadius: 2, fontWeight: 700 }}
                >
                  Save Video Defaults
                </Button>
              </Box>
            </CardContent>
          </Card>
        </form>
      )}

      {/* 2. YouTube Shorts Integration Card */}
      <Box sx={{ mt: 5, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
          <YouTubeIcon sx={{ color: '#ff0000', fontSize: 32 }} />
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            YouTube Shorts Integration & Auto-Upload
          </Typography>
        </Box>

        <Card sx={{ p: 3, border: '1px solid rgba(255,255,255,0.06)', borderRadius: 2.5 }}>
          <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Status Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                {ytStatus?.channelThumbnail ? (
                  <Avatar src={ytStatus.channelThumbnail} sx={{ width: 48, height: 48 }} />
                ) : (
                  <Avatar sx={{ bgcolor: 'rgba(255, 0, 0, 0.15)', color: '#ff0000', width: 48, height: 48 }}>
                    <YouTubeIcon />
                  </Avatar>
                )}
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {ytStatus?.connected
                      ? (ytStatus.channelTitle || 'Connected YouTube Channel')
                      : 'Not Connected to YouTube'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {ytStatus?.connected
                      ? (ytStatus.channelHandle ? `@${ytStatus.channelHandle}` : 'OAuth Token Active')
                      : 'Connect your channel to upload vertical Shorts directly.'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: 'flex', gap: 1 }}>
                {ytStatus?.connected ? (
                  <Chip
                    icon={<CheckCircleIcon />}
                    label="Connected"
                    color="success"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                ) : ytStatus?.configured ? (
                  <Chip
                    icon={<ErrorIcon />}
                    label="Ready to Authorize"
                    color="warning"
                    variant="outlined"
                    sx={{ fontWeight: 600 }}
                  />
                ) : (
                  <Chip label="API Not Configured" color="default" variant="outlined" />
                )}
              </Box>
            </Box>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

            {/* Google OAuth Credentials */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                GOOGLE CLOUD OAUTH CREDENTIALS
              </Typography>

              <TextField
                label="OAuth Client ID"
                placeholder={ytStatus?.clientIdMasked || 'e.g. 123456789-xxx.apps.googleusercontent.com'}
                fullWidth
                value={ytClientId}
                onChange={(e) => setYtClientId(e.target.value)}
                helperText={ytStatus?.clientIdMasked ? `Currently configured: ${ytStatus.clientIdMasked}` : 'Required for YouTube Data API'}
              />

              <TextField
                label="OAuth Client Secret"
                type="password"
                placeholder={ytStatus?.configured ? '••••••••••••••••' : 'e.g. GOCSPX-xxxxxx'}
                fullWidth
                value={ytClientSecret}
                onChange={(e) => setYtClientSecret(e.target.value)}
              />
            </Box>

            {/* How to Setup Accordion */}
            <Accordion sx={{ bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography variant="body2" sx={{ fontWeight: 600, color: '#a78bfa' }}>
                  ℹ️ How to get your Google Cloud Client ID & Secret (2 minutes)
                </Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <span>1. Go to <Link href="https://console.cloud.google.com/apis/dashboard" target="_blank" rel="noreferrer" sx={{ color: '#8b5cf6' }}>Google Cloud Console <OpenInNewIcon sx={{ fontSize: 13 }} /></Link> and create a free project.</span>
                  <span>2. Navigate to <b>APIs & Services &gt; Library</b> and search for <b>YouTube Data API v3</b>, then click <b>Enable</b>.</span>
                  <span>3. Under <b>OAuth consent screen</b>, select <i>External</i>, add your email, and under Scopes add <code>https://www.googleapis.com/auth/youtube.upload</code>.</span>
                  <span>4. Under <b>APIs & Services &gt; Credentials</b>, click <b>Create Credentials &gt; OAuth client ID</b>.</span>
                  <span>5. Application type: <b>Web application</b>. Under <b>Authorized redirect URIs</b>, add: <code style={{ color: '#10b981' }}>http://localhost:3001/api/youtube/oauth2callback</code>.</span>
                  <span>6. Copy the generated <b>Client ID</b> and <b>Client Secret</b> into the inputs above and click Save.</span>
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Divider sx={{ borderColor: 'rgba(255,255,255,0.08)' }} />

            {/* Automation Preferences */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                UPLOAD AUTOMATION & DEFAULTS
              </Typography>

              <FormControlLabel
                control={
                  <Switch
                    checked={ytAutoUpload}
                    onChange={(e) => setYtAutoUpload(e.target.checked)}
                    color="error"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Auto-Upload to YouTube Shorts
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Automatically upload rendered video shorts to YouTube immediately after rendering finishes.
                    </Typography>
                  </Box>
                }
              />

              <TextField
                select
                label="Default Privacy Status"
                fullWidth
                value={ytDefaultPrivacy}
                onChange={(e) => setYtDefaultPrivacy(e.target.value as any)}
                helperText="We recommend starting with 'Private' or 'Unlisted' so you can review in YouTube Studio."
              >
                <MenuItem value="private">Private (Only you can see)</MenuItem>
                <MenuItem value="unlisted">Unlisted (Anyone with link can see)</MenuItem>
                <MenuItem value="public">Public (Published to everyone)</MenuItem>
              </TextField>

              <TextField
                label="Default Tags (comma-separated)"
                fullWidth
                value={ytDefaultTags}
                onChange={(e) => setYtDefaultTags(e.target.value)}
                helperText="#shorts is automatically appended to optimize vertical feed discovery."
              />
            </Box>

            {/* Action Buttons */}
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', pt: 1 }}>
              <Button
                variant="contained"
                color="inherit"
                disabled={ytSaving}
                onClick={handleSaveYoutubeConfig}
                startIcon={ytSaving ? <CircularProgress size={18} /> : <SaveIcon />}
                sx={{ px: 3, py: 1.2, fontWeight: 700 }}
              >
                Save YouTube Settings
              </Button>

              {ytStatus?.configured && !ytStatus?.connected && (
                <Button
                  variant="contained"
                  color="error"
                  disabled={ytConnecting}
                  onClick={handleConnectYoutube}
                  startIcon={ytConnecting ? <CircularProgress size={18} /> : <YouTubeIcon />}
                  sx={{ px: 3, py: 1.2, fontWeight: 700 }}
                >
                  Authorize YouTube Channel
                </Button>
              )}

              {ytStatus?.connected && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={handleDisconnectYoutube}
                  startIcon={<LinkOffIcon />}
                  sx={{ px: 3, py: 1.2, fontWeight: 600 }}
                >
                  Disconnect Channel
                </Button>
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Snackbar Toast */}
      <Snackbar
        open={toastOpen}
        autoHideDuration={4000}
        onClose={() => setToastOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setToastOpen(false)} severity={toastSeverity} sx={{ width: '100%', borderRadius: 2 }}>
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

