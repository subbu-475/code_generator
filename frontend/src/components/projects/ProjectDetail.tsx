// ============================================================
// Project Detail Page
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Box,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  CircularProgress,
  Paper,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Edit as EditIcon,
  PlayCircle as RenderIcon,
} from '@mui/icons-material';
import * as api from '../../api/client.js';
import { useTemplates } from '../../hooks/useTemplates.js';
import { useRenderProgress } from '../../hooks/useRenderProgress.js';
import type { Project, Scene, Template } from '../../types/index.js';
import VideoPreview from '../preview/VideoPreview.js';
import TimelineEditor from './TimelineEditor.js';
import ProgressDialog from '../common/ProgressDialog.js';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { templates } = useTemplates();
  const { progress, isRendering, error, startListening, stopListening } = useRenderProgress();

  const [project, setProject] = useState<any | null>(null);
  const [scenes, setScenes] = useState<Scene[]>([]);
  const [loading, setLoading] = useState(true);
  const playerRef = useRef<any>(null);

  // Render configuration dialog states
  const [renderDialogOpen, setRenderDialogOpen] = useState(false);
  const [format, setFormat] = useState<'mp4' | 'webm'>('mp4');
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4k'>('1080p');
  const [progressDialogOpen, setProgressDialogOpen] = useState(false);

  const loadProjectData = async (isInitial: boolean = false) => {
    if (!id) return;
    try {
      if (isInitial) {
        setLoading(true);
      }
      const data = await api.getProject(id) as any;
      setProject(data);
      if (data.scenes) {
        setScenes(data.scenes);
      }
    } catch (err) {
      console.error('Failed to load project details:', err);
      alert('Project not found');
      navigate('/projects');
    } finally {
      if (isInitial) {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadProjectData(true);
  }, [id]);

  const handleStartRender = async () => {
    if (!project) return;
    setRenderDialogOpen(false);
    setProgressDialogOpen(true);

    try {
      const response = await api.renderVideo({
        project_id: project.id,
        format,
        resolution,
      });
      // Start listening to SSE updates
      startListening(project.id);
    } catch (err) {
      console.error('Render error:', err);
      // useRenderProgress handles errors if listener started, but here it failed to trigger
      alert(err instanceof Error ? err.message : 'Failed to trigger video render');
      setProgressDialogOpen(false);
    }
  };

  const handleDownload = (path: string) => {
    window.open(path, '_blank');
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!project) return null;

  const currentTemplate = templates.find((t) => t.id === project.template_id) || null;

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <IconButton onClick={() => navigate('/projects')}>
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
              {project.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Language: <span style={{ textTransform: 'capitalize' }}>{project.language}</span> • Status: <span style={{ textTransform: 'capitalize' }}>{project.status}</span>
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/projects/${project.id}/edit`)}
          >
            Edit Fields
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RenderIcon />}
            onClick={() => setRenderDialogOpen(true)}
            sx={{ fontWeight: 700 }}
          >
            Render Video
          </Button>
        </Box>
      </Box>

      <Grid container spacing={4} sx={{ flexGrow: 1 }}>
        <Grid item xs={12} md={7} lg={8} sx={{ display: 'flex', flexDirection: 'column' }}>
          <TimelineEditor projectId={project.id} scenes={scenes} onRefresh={() => loadProjectData(false)} playerRef={playerRef} />
        </Grid>

        <Grid item xs={12} md={5} lg={4}>
          <Box sx={{ position: 'sticky', top: 90 }}>
            <VideoPreview ref={playerRef} project={project} scenes={scenes} template={currentTemplate} />
          </Box>
        </Grid>
      </Grid>

      {/* Render Configuration Dialog */}
      <Dialog open={renderDialogOpen} onClose={() => setRenderDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Export Configuration</DialogTitle>
        <DialogContent sx={{ pb: 1 }}>
          <FormControl component="fieldset" sx={{ mb: 3, display: 'block', mt: 1 }}>
            <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>Video Format</FormLabel>
            <RadioGroup value={format} onChange={(e) => setFormat(e.target.value as any)}>
              <FormControlLabel value="mp4" control={<Radio />} label="MP4 (H.264 - Highly Compatible)" />
              <FormControlLabel value="webm" control={<Radio />} label="WebM (VP8 - Open Web Standard)" />
            </RadioGroup>
          </FormControl>
          
          <FormControl component="fieldset" sx={{ display: 'block' }}>
            <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>Resolution</FormLabel>
            <RadioGroup value={resolution} onChange={(e) => setResolution(e.target.value as any)}>
              <FormControlLabel value="1080p" control={<Radio />} label="Vertical 1080p (1080x1920 - Recommended)" />
              <FormControlLabel value="720p" control={<Radio />} label="Vertical 720p (720x1280)" />
              <FormControlLabel value="4k" control={<Radio />} label="Vertical 4K (2160x3840)" />
            </RadioGroup>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button variant="outlined" onClick={() => setRenderDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={handleStartRender} sx={{ fontWeight: 700 }}>
            Start Render
          </Button>
        </DialogActions>
      </Dialog>

      {/* Progress Dialog */}
      <ProgressDialog
        open={progressDialogOpen}
        progress={progress}
        isRendering={isRendering}
        error={error}
        onCancel={() => {
          stopListening();
          setProgressDialogOpen(false);
        }}
        onDownload={handleDownload}
        onClose={() => setProgressDialogOpen(false)}
        onRetry={handleStartRender}
      />
    </Box>
  );
}
