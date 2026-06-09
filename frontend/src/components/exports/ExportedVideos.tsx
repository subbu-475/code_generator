// ============================================================
// Exported Videos Gallery Page
// ============================================================

import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Button,
  IconButton,
  Chip,
  Tooltip,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Movie as MovieIcon,
  AccessTime as DurationIcon,
  SdCard as SizeIcon,
} from '@mui/icons-material';
import * as api from '../../api/client.js';
import type { ExportRecord } from '../../types/index.js';
import AnimatedCard from '../common/AnimatedCard.js';

export default function ExportedVideos() {
  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExports = async () => {
    try {
      setLoading(true);
      const data = await api.getExports();
      setExports(data);
    } catch (err) {
      console.error('Failed to load export records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExports();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this video export? This will also remove the video file from disk.')) {
      try {
        await api.deleteExport(id);
        setExports((prev) => prev.filter((r) => r.id !== id));
      } catch (err) {
        console.error('Failed to delete export:', err);
        alert('Failed to delete export');
      }
    }
  };

  const handleDownload = (id: string) => {
    api.downloadExport(id);
  };

  function formatBytes(bytes: number | null): string {
    if (bytes === null || bytes === undefined) return '0 MB';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Title */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
          Exported Videos
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Download or manage your rendered vertical mp4 and webm videos.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : exports.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 3 }}>
          <Typography color="text.secondary">
            No exported videos found. Render a project to see exports here.
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {exports.map((record, idx) => (
            <Grid item xs={12} sm={6} md={4} key={record.id}>
              <AnimatedCard
                glowColor="#10b981"
                delay={idx * 0.05}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 200,
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 2 }}>
                    <MovieIcon sx={{ color: '#10b981', mt: 0.5 }} />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, lineBreak: 'anywhere' }}>
                        {/* Filename basename */}
                        {record.file_path ? record.file_path.split(/[\\/]/).pop() : 'video_shorts.mp4'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Rendered {new Date(record.created_at).toLocaleString()}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <SizeIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {formatBytes(record.file_size)}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <DurationIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {record.duration_seconds ? `${Math.round(record.duration_seconds * 10) / 10}s` : '0s'}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', gap: 1, borderTop: '1px solid rgba(255,255,255,0.06)', pt: 2 }}>
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<DownloadIcon />}
                    onClick={() => handleDownload(record.id)}
                    fullWidth
                    sx={{ fontWeight: 700 }}
                  >
                    Download
                  </Button>
                  <Tooltip title="Delete file & record">
                    <IconButton color="error" onClick={() => handleDelete(record.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </AnimatedCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
