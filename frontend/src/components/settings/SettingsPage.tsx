// ============================================================
// Settings Page Component
// ============================================================

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
} from '@mui/material';
import { Save as SaveIcon } from '@mui/icons-material';
import * as api from '../../api/client.js';
import type { Settings, ExportResolution, AnimationStyle } from '../../types/index.js';

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Toast Notification State
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<'success' | 'error'>('success');

  // Load settings
  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const data = await api.getSettings();
        setSettings(data);
      } catch (err) {
        console.error('Failed to load settings:', err);
        setToastMessage('Failed to load settings from server');
        setToastSeverity('error');
        setToastOpen(true);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
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
    <Box sx={{ animation: 'fadeIn 0.5s ease', maxWidth: 650 }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Configure default options for new projects and exports.
        </Typography>
      </Box>

      {settings && (
        <form onSubmit={handleSave}>
          <Card sx={{ p: 3, mb: 4, border: '1px solid rgba(255,255,255,0.06)' }}>
            <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 3.5 }}>
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
            </CardContent>
          </Card>

          <Button
            variant="contained"
            color="primary"
            type="submit"
            disabled={saving}
            startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
            sx={{ px: 4, py: 1.5, borderRadius: 2.5, fontWeight: 700 }}
          >
            Save Settings
          </Button>
        </form>
      )}

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
