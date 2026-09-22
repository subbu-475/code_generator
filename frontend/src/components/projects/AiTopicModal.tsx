// ============================================================
// AI Topic Generator Modal Component
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  Chip,
  LinearProgress,
  IconButton,
  Alert,
  Fade,
} from '@mui/material';
import {
  Close as CloseIcon,
  AutoAwesome as SparklesIcon,
  RecordVoiceOver as VoiceIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import * as api from '../../api/client.js';

interface AiTopicModalProps {
  open: boolean;
  onClose: () => void;
}

const INSPIRATION_TOPICS = [
  { label: '⚡ Nginx in 30secs', topic: 'nginx in 30secs' },
  { label: '🐳 What is Docker', topic: 'what is docker' },
  { label: '🔒 HTTP vs HTTPS', topic: 'http vs https' },
  { label: '🌐 How DNS Works', topic: 'what happens when you type google.com' },
  { label: '🚀 Redis Caching in 30s', topic: 'redis caching in 30 seconds' },
];

const LOADING_STEPS = [
  'Analyzing topic & architectural archetype...',
  'Crafting dynamic visual flows & protocol telemetry...',
  'Synthesizing synchronized Edge Neural TTS voiceover...',
  'Finalizing video scenes & visual assets...',
];

export default function AiTopicModal({ open, onClose }: AiTopicModalProps) {
  const navigate = useNavigate();

  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStage, setCurrentStage] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (topicToUse?: string) => {
    const finalTopic = (topicToUse || topic).trim();
    if (!finalTopic) return;

    try {
      setLoading(true);
      setError(null);
      setProgress(5);
      setCurrentStage('Initializing AI Video Factory...');

      const response = await api.startVideoPipeline({
        topic: finalTopic,
        duration: 45,
        style: 'dark-cinematic-tech',
        voice: 'en-US-ChristopherNeural',
      });

      const jobId = response.job?.id;
      if (!jobId) {
        throw new Error('No job ID returned from server');
      }

      // Connect to live SSE progress stream
      const eventSource = new EventSource(`/api/jobs/${jobId}/stream`);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.progress !== undefined) {
            setProgress(data.progress);
          }
          if (data.message) {
            setCurrentStage(data.message);
          }

          if (data.status === 'completed') {
            eventSource.close();
            setLoading(false);
            onClose();
            const projectId = response.job?.projectId;
            if (projectId) {
              navigate(`/projects/${projectId}`);
            } else {
              navigate('/exports');
            }
          } else if (data.status === 'failed') {
            eventSource.close();
            setLoading(false);
            setError(data.message || 'Video generation failed');
          }
        } catch (parseErr) {
          console.error('Failed to parse SSE event:', parseErr);
        }
      };

      eventSource.onerror = () => {
        // SSE connection error — close and check job status directly
        eventSource.close();
      };

    } catch (err: any) {
      console.error('Failed to generate video from topic:', err);
      setError(err?.message || 'Failed to generate video. Please try again.');
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: '#0c1210',
          backgroundImage: 'radial-gradient(ellipse at 50% 0%, #132a1c 0%, #080b0a 100%)',
          borderRadius: 3.5,
          border: '1px solid rgba(120, 224, 143, 0.25)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.8), 0 0 32px rgba(120, 224, 143, 0.15)',
          color: '#F5F2E8',
          p: 1.5,
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              background: 'linear-gradient(135deg, #78E08F 0%, #38ef7d 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#080B0A',
              boxShadow: '0 0 16px rgba(120, 224, 143, 0.5)',
            }}
          >
            <SparklesIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, color: '#F5F2E8', letterSpacing: '-0.01em' }}>
              AI Video Generator
            </Typography>
            <Typography variant="caption" sx={{ color: 'rgba(245, 242, 232, 0.65)' }}>
              Give any tech topic — AI creates relevant flows, assets & voiceover
            </Typography>
          </Box>
        </Box>
        {!loading && (
          <IconButton onClick={onClose} size="small" sx={{ color: 'rgba(255,255,255,0.4)', '&:hover': { color: '#fff' } }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2.5, backgroundColor: 'rgba(255, 107, 107, 0.15)', color: '#FF6B6B', border: '1px solid rgba(255, 107, 107, 0.3)' }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ py: 5, textAlign: 'center' }}>
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                border: '3px solid rgba(120, 224, 143, 0.2)',
                borderTopColor: '#78E08F',
                animation: 'spin 1s linear infinite',
                margin: '0 auto 24px',
                boxShadow: '0 0 24px rgba(120, 224, 143, 0.3)',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5, color: '#F5F2E8' }}>
              Building Your Video Short...
            </Typography>
            <Typography variant="body2" sx={{ color: '#78E08F', minHeight: 24, fontWeight: 600, mb: 2 }}>
              {currentStage || 'Working on your video...'}
            </Typography>
            <Box sx={{ width: '85%', margin: '0 auto' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="caption" sx={{ color: '#9EABB2', fontWeight: 600 }}>
                  PIPELINE PROGRESS
                </Typography>
                <Typography variant="caption" sx={{ color: '#B8FF9C', fontWeight: 800, fontFamily: 'JetBrains Mono, monospace' }}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(255, 255, 255, 0.08)',
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #78E08F 0%, #B8FF9C 100%)',
                  },
                }}
              />
            </Box>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, mt: 1 }}>
            <TextField
              autoFocus
              fullWidth
              placeholder="e.g. Nginx in 30secs, What is Docker, HTTP vs HTTPS..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && topic.trim()) {
                  handleGenerate();
                }
              }}
              label="Topic or Concept"
              InputLabelProps={{ sx: { color: 'rgba(245, 242, 232, 0.7)' } }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  color: '#F5F2E8',
                  borderRadius: 2.5,
                  fontSize: '1.05rem',
                  fontWeight: 500,
                  '& fieldset': {
                    borderColor: 'rgba(120, 224, 143, 0.3)',
                  },
                  '&:hover fieldset': {
                    borderColor: '#78E08F',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#78E08F',
                    boxShadow: '0 0 16px rgba(120, 224, 143, 0.25)',
                  },
                },
              }}
            />

            {/* Quick Inspiration Pills */}
            <Box>
              <Typography variant="caption" sx={{ color: 'rgba(245, 242, 232, 0.55)', display: 'block', mb: 1, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Quick Inspiration (Click to Generate)
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {INSPIRATION_TOPICS.map((item) => (
                  <Chip
                    key={item.topic}
                    label={item.label}
                    onClick={() => {
                      setTopic(item.topic);
                      handleGenerate(item.topic);
                    }}
                    sx={{
                      backgroundColor: 'rgba(120, 224, 143, 0.08)',
                      border: '1px solid rgba(120, 224, 143, 0.22)',
                      color: '#F5F2E8',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: '#78E08F',
                        color: '#080B0A',
                        boxShadow: '0 0 12px rgba(120, 224, 143, 0.4)',
                        transform: 'translateY(-1px)',
                      },
                    }}
                  />
                ))}
              </Box>
            </Box>

            {/* Feature Highlights */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2.5,
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: 1.5,
                textAlign: 'center',
              }}
            >
              <Box>
                <SpeedIcon sx={{ color: '#78E08F', fontSize: 20, mb: 0.5 }} />
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: '#F5F2E8' }}>
                  25–35s High Retention
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(245,242,232,0.5)', fontSize: '0.7rem' }}>
                  0-frame hook & fast pacing
                </Typography>
              </Box>
              <Box>
                <SparklesIcon sx={{ color: '#B8FF9C', fontSize: 20, mb: 0.5 }} />
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: '#F5F2E8' }}>
                  Dynamic Archetypes
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(245,242,232,0.5)', fontSize: '0.7rem' }}>
                  Network flows & simulations
                </Typography>
              </Box>
              <Box>
                <VoiceIcon sx={{ color: '#F4C95D', fontSize: 20, mb: 0.5 }} />
                <Typography variant="caption" sx={{ display: 'block', fontWeight: 700, color: '#F5F2E8' }}>
                  Synchronized TTS
                </Typography>
                <Typography variant="caption" sx={{ color: 'rgba(245,242,232,0.5)', fontSize: '0.7rem' }}>
                  Edge Neural developer voice
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      {!loading && (
        <DialogActions sx={{ px: 3, pb: 2, pt: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Button onClick={onClose} sx={{ color: 'rgba(245, 242, 232, 0.6)', textTransform: 'none', fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!topic.trim()}
            onClick={() => handleGenerate()}
            startIcon={<SparklesIcon />}
            sx={{
              background: 'linear-gradient(135deg, #78E08F 0%, #38ef7d 100%)',
              color: '#080B0A',
              fontWeight: 800,
              px: 3,
              py: 1.1,
              borderRadius: 2.5,
              textTransform: 'none',
              fontSize: '0.95rem',
              boxShadow: '0 4px 16px rgba(120, 224, 143, 0.4)',
              '&:hover': {
                background: 'linear-gradient(135deg, #B8FF9C 0%, #78E08F 100%)',
                boxShadow: '0 6px 24px rgba(120, 224, 143, 0.6)',
              },
              '&.Mui-disabled': {
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.3)',
              },
            }}
          >
            Generate Video
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
