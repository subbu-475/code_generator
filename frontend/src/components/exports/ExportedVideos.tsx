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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Link,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Movie as MovieIcon,
  AccessTime as DurationIcon,
  SdCard as SizeIcon,
  YouTube as YouTubeIcon,
  OpenInNew as OpenInNewIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import * as api from '../../api/client.js';
import type { ExportRecord, YoutubeUploadRecord, YoutubeStatus } from '../../types/index.js';
import AnimatedCard from '../common/AnimatedCard.js';

export default function ExportedVideos() {
  const [exports, setExports] = useState<ExportRecord[]>([]);
  const [ytUploads, setYtUploads] = useState<YoutubeUploadRecord[]>([]);
  const [ytStatus, setYtStatus] = useState<YoutubeStatus | null>(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ExportRecord | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploadTags, setUploadTags] = useState('');
  const [uploadPrivacy, setUploadPrivacy] = useState<'private' | 'unlisted' | 'public'>('private');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccessUrl, setUploadSuccessUrl] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [exportData, uploadsData, statusData] = await Promise.all([
        api.getExports(),
        api.getYoutubeUploads().catch(() => []),
        api.getYoutubeStatus().catch(() => null),
      ]);
      setExports(exportData);
      setYtUploads(uploadsData);
      setYtStatus(statusData);
    } catch (err) {
      console.error('Failed to load export records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
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

  const handleOpenUploadModal = (record: ExportRecord) => {
    setSelectedRecord(record);
    const fileName = record.file_path ? record.file_path.split(/[\\/]/).pop()?.replace(/\.[^/.]+$/, '') : 'Code Shorts';
    setUploadTitle(`${fileName || 'Code Shorts'} #shorts`);
    setUploadDescription(`Generated with CodeShorts AI.\n\n#shorts #programming #tech #coding`);
    setUploadTags(ytStatus?.defaultTags || 'Shorts,CodeShorts,Coding,Programming,Tech');
    setUploadPrivacy(ytStatus?.defaultPrivacy || 'private');
    setUploadError('');
    setUploadSuccessUrl('');
    setUploadModalOpen(true);
  };

  const handleExecuteUpload = async () => {
    if (!selectedRecord) return;
    try {
      setUploading(true);
      setUploadError('');
      const tagList = uploadTags.split(',').map((t) => t.trim()).filter(Boolean);

      const result = await api.uploadToYoutube({
        exportId: selectedRecord.id,
        projectId: selectedRecord.project_id,
        filePath: selectedRecord.file_path,
        title: uploadTitle,
        description: uploadDescription,
        tags: tagList,
        privacyStatus: uploadPrivacy,
      });

      setUploadSuccessUrl(result.videoUrl);
      // Refresh uploads list
      const updatedUploads = await api.getYoutubeUploads();
      setYtUploads(updatedUploads);
    } catch (err) {
      console.error('Upload to YouTube failed:', err);
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  function formatBytes(bytes: number | null): string {
    if (bytes === null || bytes === undefined) return '0 MB';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Helper to check if an export has already been uploaded to YouTube
  const getExistingUpload = (record: ExportRecord) => {
    return ytUploads.find(
      (u) => u.export_id === record.id || (u.project_id && u.project_id === record.project_id)
    );
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Title */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Exported Videos
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Download or upload your rendered 9:16 Shorts directly to YouTube.
          </Typography>
        </Box>

        {ytStatus?.connected && (
          <Chip
            icon={<YouTubeIcon sx={{ color: '#ff0000 !important' }} />}
            label={`YouTube: ${ytStatus.channelTitle || 'Connected'}`}
            variant="outlined"
            sx={{ borderColor: 'rgba(255, 0, 0, 0.4)', bgcolor: 'rgba(255, 0, 0, 0.05)', fontWeight: 600 }}
          />
        )}
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
          {exports.map((record, idx) => {
            const existingUpload = getExistingUpload(record);

            return (
              <Grid item xs={12} sm={6} md={4} key={record.id}>
                <AnimatedCard
                  glowColor="#10b981"
                  delay={idx * 0.05}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 220,
                    border: '1px solid rgba(255,255,255,0.06)',
                  }}
                >
                  <Box>
                    <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start', mb: 2 }}>
                      <MovieIcon sx={{ color: '#10b981', mt: 0.5 }} />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, lineBreak: 'anywhere' }}>
                          {record.file_path ? record.file_path.split(/[\\/]/).pop() : 'video_shorts.mp4'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Rendered {new Date(record.created_at).toLocaleString()}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Metadata chips */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap' }}>
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

                    {/* YouTube status banner if already uploaded */}
                    {existingUpload && (
                      <Box sx={{ mb: 2 }}>
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: '16px !important', color: '#10b981' }} />}
                          label={
                            <Link
                              href={existingUpload.video_url}
                              target="_blank"
                              rel="noreferrer"
                              sx={{ color: 'inherit', display: 'flex', alignItems: 'center', gap: 0.5, textDecoration: 'none' }}
                            >
                              Uploaded to YouTube <OpenInNewIcon sx={{ fontSize: 12 }} />
                            </Link>
                          }
                          size="small"
                          sx={{
                            bgcolor: 'rgba(16, 185, 129, 0.12)',
                            color: '#10b981',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            fontWeight: 700,
                          }}
                        />
                      </Box>
                    )}
                  </Box>

                  {/* Actions */}
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

                    <Tooltip title="Upload directly to YouTube Shorts">
                      <Button
                        variant="outlined"
                        color="error"
                        startIcon={<YouTubeIcon />}
                        onClick={() => handleOpenUploadModal(record)}
                        sx={{ fontWeight: 700, minWidth: 120, borderColor: 'rgba(255,0,0,0.5)' }}
                      >
                        YouTube
                      </Button>
                    </Tooltip>

                    <Tooltip title="Delete file & record">
                      <IconButton color="error" onClick={() => handleDelete(record.id)}>
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </AnimatedCard>
              </Grid>
            );
          })}
        </Grid>
      )}

      {/* YouTube Upload Modal */}
      <Dialog
        open={uploadModalOpen}
        onClose={() => !uploading && setUploadModalOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: { bgcolor: '#1a1a24', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 2.5 },
        }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800 }}>
          <YouTubeIcon sx={{ color: '#ff0000', fontSize: 28 }} />
          Upload to YouTube Shorts
        </DialogTitle>

        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: 1 }}>
          {!ytStatus?.connected && (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              YouTube channel is not yet connected. Configure and authorize your channel in <b>Settings</b> before uploading.
            </Alert>
          )}

          {uploadError && (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {uploadError}
            </Alert>
          )}

          {uploadSuccessUrl ? (
            <Box sx={{ textAlign: 'center', py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <CheckCircleIcon sx={{ fontSize: 56, color: '#10b981' }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Successfully Uploaded to YouTube!
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your video is now live / processing on YouTube Shorts.
              </Typography>
              <Button
                variant="contained"
                color="error"
                startIcon={<OpenInNewIcon />}
                href={uploadSuccessUrl}
                target="_blank"
                rel="noreferrer"
                sx={{ mt: 1, fontWeight: 700 }}
              >
                Watch on YouTube ({uploadSuccessUrl})
              </Button>
            </Box>
          ) : (
            <>
              <TextField
                label="Video Title"
                fullWidth
                value={uploadTitle}
                onChange={(e) => setUploadTitle(e.target.value)}
                helperText="Must include #shorts for best discovery (max 100 chars)"
              />

              <TextField
                label="Description"
                multiline
                rows={3}
                fullWidth
                value={uploadDescription}
                onChange={(e) => setUploadDescription(e.target.value)}
              />

              <TextField
                select
                label="Privacy Status"
                fullWidth
                value={uploadPrivacy}
                onChange={(e) => setUploadPrivacy(e.target.value as any)}
              >
                <MenuItem value="private">Private (Only you can view)</MenuItem>
                <MenuItem value="unlisted">Unlisted (Anyone with link can view)</MenuItem>
                <MenuItem value="public">Public (Visible to everyone)</MenuItem>
              </TextField>

              <TextField
                label="Tags (comma separated)"
                fullWidth
                value={uploadTags}
                onChange={(e) => setUploadTags(e.target.value)}
              />
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {uploadSuccessUrl ? (
            <Button variant="contained" onClick={() => setUploadModalOpen(false)}>
              Close
            </Button>
          ) : (
            <>
              <Button onClick={() => setUploadModalOpen(false)} disabled={uploading} color="inherit">
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                disabled={uploading || !ytStatus?.connected || !uploadTitle.trim()}
                onClick={handleExecuteUpload}
                startIcon={uploading ? <CircularProgress size={18} /> : <YouTubeIcon />}
                sx={{ px: 3, fontWeight: 700 }}
              >
                {uploading ? 'Uploading to YouTube...' : 'Upload Short'}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}

