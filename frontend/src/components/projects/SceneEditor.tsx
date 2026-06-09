// ============================================================
// Scene Editor & Timeline Component
// ============================================================

import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Slider,
  Button,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  MovieFilter as TransitionIcon,
  Animation as AnimationIcon,
  AccessTime as DurationIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import * as api from '../../api/client.js';
import type { Scene, AnimationStyle, TransitionStyle } from '../../types/index.js';

interface SceneEditorProps {
  projectId: string;
  scenes: Scene[];
  onRefresh: () => void;
}

export default function SceneEditor({ projectId, scenes, onRefresh }: SceneEditorProps) {
  const [activeSceneId, setActiveSceneId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  // Per-scene edit states (keyed by sceneId)
  const [sceneEdits, setSceneEdits] = useState<Record<string, {
    title: string;
    duration_frames: number;
    animation: AnimationStyle;
    transition: TransitionStyle;
    text?: string;
    code?: string;
    output?: string;
  }>>({});

  const initEditState = (scene: Scene) => {
    if (sceneEdits[scene.id]) return;

    let content: any = {};
    try {
      content = JSON.parse(scene.content);
    } catch (e) {
      console.error(e);
    }

    setSceneEdits((prev) => ({
      ...prev,
      [scene.id]: {
        title: scene.title,
        duration_frames: scene.duration_frames,
        animation: scene.animation,
        transition: scene.transition || 'fade', // database transition value
        text: content.text || '',
        code: content.code || '',
        output: content.output || '',
      },
    }));
  };

  const handleFieldChange = (sceneId: string, field: string, value: any) => {
    setSceneEdits((prev) => ({
      ...prev,
      [sceneId]: {
        ...prev[sceneId],
        [field]: value,
      },
    }));
  };

  const handleSaveScene = async (scene: Scene) => {
    const edit = sceneEdits[scene.id];
    if (!edit) return;

    try {
      setSavingId(scene.id);
      
      const payload: any = {
        title: edit.title,
        duration_frames: edit.duration_frames,
        animation: edit.animation,
        transition: edit.transition,
      };

      // Depending on scene type, we can update text, code, or output
      if (scene.type === 'hook' || scene.type === 'output' || scene.type === 'cta') {
        payload.text = edit.text;
      } else if (scene.type === 'code') {
        payload.code = edit.code;
        payload.output = edit.output;
      }

      await api.updateProject(projectId, {
        // We can call updateProject with Partial containing changes or use our specific route.
        // Wait, in projects.ts router, we exposed: PUT /api/projects/:id/scenes/:sceneId
        // Let's call the specific PUT scene route:
      } as any);
      
      // Let's call the endpoint directly using axios client instance:
      const response = await api.default.put(`/projects/${projectId}/scenes/${scene.id}`, payload);
      if (response.data.success) {
        onRefresh();
        alert('Scene updated successfully!');
      }
    } catch (err) {
      console.error('Failed to save scene:', err);
      alert(err instanceof Error ? err.message : 'Failed to save scene.');
    } finally {
      setSavingId(null);
    }
  };

  const animations: { value: AnimationStyle; label: string }[] = [
    { value: 'fade', label: 'Fade' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'slide', label: 'Slide' },
    { value: 'pop', label: 'Pop' },
    { value: 'bounce', label: 'Bounce' },
  ];

  const transitions: { value: TransitionStyle; label: string }[] = [
    { value: 'fade', label: 'Fade' },
    { value: 'slide', label: 'Slide' },
    { value: 'zoom', label: 'Zoom' },
    { value: 'none', label: 'None' },
  ];

  return (
    <Box>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 2.5 }}>
        Video Scenes Timeline
      </Typography>

      {scenes.map((scene, index) => {
        const isOpen = activeSceneId === scene.id;
        const edit = sceneEdits[scene.id];

        return (
          <Accordion
            key={scene.id}
            expanded={isOpen}
            onChange={() => {
              initEditState(scene);
              setActiveSceneId(isOpen ? null : scene.id);
            }}
            sx={{
              mb: 2,
              borderRadius: '12px !important',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              background: 'rgba(255, 255, 255, 0.02)',
              overflow: 'hidden',
              '&::before': { display: 'none' },
            }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', pr: 2 }}>
                <Typography sx={{ width: 40, fontWeight: 700, color: 'text.secondary' }}>
                  #{index + 1}
                </Typography>
                <Chip
                  label={scene.type}
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ mr: 2, textTransform: 'uppercase', fontSize: 10, fontWeight: 700 }}
                />
                <Typography sx={{ fontWeight: 600, flexGrow: 1 }}>
                  {scene.title || `${scene.type} Scene`}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {Math.round((scene.duration_frames / 30) * 10) / 10}s ({scene.duration_frames}f)
                </Typography>
              </Box>
            </AccordionSummary>
            
            {edit && (
              <AccordionDetails sx={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', p: 3 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Scene Title"
                      fullWidth
                      size="small"
                      value={edit.title}
                      onChange={(e) => handleFieldChange(scene.id, 'title', e.target.value)}
                      sx={{ mb: 2.5 }}
                    />
                    
                    {/* Scene Specific text edits */}
                    {(scene.type === 'hook' || scene.type === 'output' || scene.type === 'cta') && (
                      <TextField
                        label="Text Content"
                        fullWidth
                        multiline
                        rows={3}
                        value={edit.text}
                        onChange={(e) => handleFieldChange(scene.id, 'text', e.target.value)}
                        sx={{ mb: 2.5 }}
                      />
                    )}

                    {scene.type === 'code' && (
                      <>
                        <TextField
                          label="Code Snippet"
                          fullWidth
                          multiline
                          rows={6}
                          value={edit.code}
                          onChange={(e) => handleFieldChange(scene.id, 'code', e.target.value)}
                          sx={{ mb: 2.5, fontFamily: 'monospace' }}
                        />
                        <TextField
                          label="Console Output"
                          fullWidth
                          value={edit.output}
                          onChange={(e) => handleFieldChange(scene.id, 'output', e.target.value)}
                          sx={{ mb: 2.5 }}
                        />
                      </>
                    )}
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DurationIcon fontSize="small" /> Duration (Frames)
                      </Typography>
                      <Slider
                        value={edit.duration_frames}
                        min={30}
                        max={300}
                        step={15}
                        onChange={(_, val) => handleFieldChange(scene.id, 'duration_frames', val as number)}
                        valueLabelDisplay="auto"
                        valueLabelFormat={(val) => `${Math.round((val / 30) * 10) / 10}s`}
                      />
                      <Typography variant="caption" color="text.secondary">
                        30 frames = 1 second. Drag slider to change.
                      </Typography>
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 3 }}>
                      <Grid item xs={6}>
                        <TextField
                          select
                          label="Entrance Animation"
                          fullWidth
                          size="small"
                          value={edit.animation}
                          onChange={(e) => handleFieldChange(scene.id, 'animation', e.target.value)}
                          InputProps={{
                            startAdornment: <AnimationIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        >
                          {animations.map((anim) => (
                            <MenuItem key={anim.value} value={anim.value}>
                              {anim.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          select
                          label="Transition Out"
                          fullWidth
                          size="small"
                          value={edit.transition}
                          onChange={(e) => handleFieldChange(scene.id, 'transition', e.target.value)}
                          InputProps={{
                            startAdornment: <TransitionIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />,
                          }}
                        >
                          {transitions.map((t) => (
                            <MenuItem key={t.value} value={t.value}>
                              {t.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>

                    <Button
                      variant="contained"
                      color="secondary"
                      startIcon={<SaveIcon />}
                      onClick={() => handleSaveScene(scene)}
                      disabled={savingId === scene.id}
                      fullWidth
                    >
                      {savingId === scene.id ? 'Saving...' : 'Apply & Save Scene'}
                    </Button>
                  </Grid>
                </Grid>
              </AccordionDetails>
            )}
          </Accordion>
        );
      })}
    </Box>
  );
}
