import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
} from '@mui/material';
import {
  MovieFilter as TransitionIcon,
  Animation as AnimationIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Save as SaveIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  DragIndicator as DragIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  CloudUpload as UploadIcon,
} from '@mui/icons-material';
import * as api from '../../api/client.js';
import type { Scene, SceneType, AnimationStyle, TransitionStyle } from '../../types/index.js';

interface TimelineEditorProps {
  projectId: string;
  scenes: Scene[];
  onRefresh: () => void;
}

export default function TimelineEditor({ projectId, scenes, onRefresh }: TimelineEditorProps) {
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(3); // pixels per frame (1 to 6) Snaps nicely
  const [saving, setSaving] = useState<boolean>(false);
  const [draggedSceneId, setDraggedSceneId] = useState<string | null>(null);
  const [dragOverSceneId, setDragOverSceneId] = useState<string | null>(null);

  // Playhead state (frame position)
  const [playheadFrame, setPlayheadFrame] = useState<number>(0);
  const [isDraggingPlayhead, setIsDraggingPlayhead] = useState<boolean>(false);
  const [playingSceneId, setPlayingSceneId] = useState<string | null>(null);
  const timelineTrackRef = useRef<HTMLDivElement | null>(null);

  // Resize tracking states
  const isResizingRef = useRef<boolean>(false);
  const resizeSceneIdRef = useRef<string | null>(null);
  const startXRef = useRef<number>(0);
  const startDurationRef = useRef<number>(0);
  const currentDurationRef = useRef<number>(0);

  // Form edit states (synced when selectedSceneId changes)
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(90);
  const [animation, setAnimation] = useState<AnimationStyle>('fade');
  const [transition, setTransition] = useState<TransitionStyle>('fade');
  const [text, setText] = useState('');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [channelName, setChannelName] = useState('CodeShorts');
  const [channelHandle, setChannelHandle] = useState('@codeshorts');
  const [subscriberCount, setSubscriberCount] = useState('100K');
  const [socials, setSocials] = useState<Array<{ platform: string; handle: string }>>([]);
  const [imageUrl, setImageUrl] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [logoUrl, setLogoUrl] = useState('');
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Hook scene configuration states
  const [hookBadge, setHookBadge] = useState('');
  const [hookBadgeStyle, setHookBadgeStyle] = useState('heartbeat');
  const [hookCreatorName, setHookCreatorName] = useState('');
  const [hookCreatorHandle, setHookCreatorHandle] = useState('');
  const [hookCreatorAvatar, setHookCreatorAvatar] = useState('');
  const [hookShowProgress, setHookShowProgress] = useState(false);
  const [hookProgressStyle, setHookProgressStyle] = useState('bar');
  const [hookLayout, setHookLayout] = useState('standard');
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [hookImage, setHookImage] = useState('');
  const [uploadingHookImage, setUploadingHookImage] = useState(false);
  const [hookImageSize, setHookImageSize] = useState('medium');
  const [hookImageViewMode, setHookImageViewMode] = useState('contain');
  const [explanation, setExplanation] = useState('');

  const selectedScene = scenes.find((s) => s.id === selectedSceneId) || null;

  // Sync form state when selected scene changes
  useEffect(() => {
    if (selectedScene) {
      setTitle(selectedScene.title);
      setDuration(selectedScene.duration_frames);
      setAnimation(selectedScene.animation);
      setTransition(selectedScene.transition || 'fade');

      let content: any = {};
      try {
        content = JSON.parse(selectedScene.content);
      } catch (e) {
        console.error(e);
      }

      setText(content.text || content.title || '');
      setCode(content.code || '');
      setOutput(content.output || '');
      setLanguage(content.language || 'javascript');
      setChannelName(content.channelName || 'CodeShorts');
      setChannelHandle(content.channelHandle || '@codeshorts');
      setSubscriberCount(content.subscriberCount || '100K');
      setSocials(content.socials || []);
      setImageUrl(content.imageUrl || '');
      setVideoUrl(content.videoUrl || '');
      setLogoUrl(content.imageUrl || content.logoUrl || '');
      setHookBadge(content.hookBadge || '');
      setHookBadgeStyle(content.hookBadgeStyle || 'heartbeat');
      setHookCreatorName(content.hookCreatorName || '');
      setHookCreatorHandle(content.hookCreatorHandle || '');
      setHookCreatorAvatar(content.hookCreatorAvatar || '');
      setHookShowProgress(!!content.hookShowProgress);
      setHookProgressStyle(content.hookProgressStyle || 'bar');
      setHookLayout(content.hookLayout || 'standard');
      setHookImage(content.hookImage || '');
      setHookImageSize(content.hookImageSize || 'medium');
      setHookImageViewMode(content.hookImageViewMode || 'contain');
      setExplanation(content.explanation || '');
    } else {
      setSelectedSceneId(scenes[0]?.id || null);
    }
  }, [selectedSceneId, scenes]);

  // Keyboard shortcut: Delete/Backspace to remove selected scene
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedSceneId) {
        e.preventDefault();
        handleDeleteScene(selectedSceneId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedSceneId, scenes]);

  // Handle saving selected scene
  const handleSaveScene = async () => {
    if (!selectedSceneId || !selectedScene) return;

    try {
      setSaving(true);
      const payload: any = {
        title,
        duration_frames: duration,
        animation,
        transition,
      };

      if (selectedScene.type === 'hook') {
        payload.text = text;
        payload.hookBadge = hookBadge;
        payload.hookBadgeStyle = hookBadgeStyle;
        payload.hookCreatorName = hookCreatorName;
        payload.hookCreatorHandle = hookCreatorHandle;
        payload.hookCreatorAvatar = hookCreatorAvatar;
        payload.hookShowProgress = hookShowProgress;
        payload.hookProgressStyle = hookProgressStyle;
        payload.hookLayout = hookLayout;
        payload.hookImage = hookImage;
        payload.hookImageSize = hookImageSize;
        payload.hookImageViewMode = hookImageViewMode;
      } else if (selectedScene.type === 'output') {
        payload.text = text;
        payload.explanation = explanation;
      } else if (selectedScene.type === 'cta' || selectedScene.type === 'tip') {
        payload.text = text;
      } else if (selectedScene.type === 'code') {
        payload.code = code;
        payload.output = output;
        payload.language = language;
      } else if (selectedScene.type === 'subscribe') {
        payload.channelName = channelName;
        payload.channelHandle = channelHandle;
        payload.subscriberCount = subscriberCount;
        payload.imageUrl = logoUrl;
      } else if (selectedScene.type === 'end_screen') {
        payload.text = text; // outro title
        payload.socials = socials;
        payload.imageUrl = logoUrl;
      } else if (selectedScene.type === 'image') {
        payload.text = text;
        payload.imageUrl = imageUrl;
      } else if (selectedScene.type === 'video') {
        payload.text = text;
        payload.videoUrl = videoUrl;
      } else if (selectedScene.type === 'subscribe_video') {
        payload.videoUrl = videoUrl;
        payload.imageUrl = logoUrl;
      }

      await api.updateScene(projectId, selectedSceneId, payload);
      onRefresh();
    } catch (err) {
      console.error('Failed to update scene:', err);
      alert('Failed to update scene details.');
    } finally {
      setSaving(false);
    }
  };

  // Add new scene
  const handleAddScene = async (type: SceneType) => {
    try {
      const inserted = await api.addScene(projectId, type, selectedSceneId || undefined);
      onRefresh();
      setSelectedSceneId(inserted.id);
    } catch (err) {
      console.error('Failed to add scene:', err);
      alert('Failed to add scene.');
    }
  };

  // Delete scene
  const handleDeleteScene = async (sceneId: string) => {
    if (scenes.length <= 1) {
      alert('Cannot delete the only scene in your video.');
      return;
    }
    if (!confirm('Are you sure you want to delete this scene?')) return;

    try {
      await api.deleteScene(projectId, sceneId);
      if (selectedSceneId === sceneId) {
        setSelectedSceneId(null);
      }
      onRefresh();
    } catch (err) {
      console.error('Failed to delete scene:', err);
      alert('Failed to delete scene.');
    }
  };

  // Drag and drop reordering
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedSceneId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (draggedSceneId !== id) {
      setDragOverSceneId(id);
    }
  };

  const handleDragEnd = () => {
    setDraggedSceneId(null);
    setDragOverSceneId(null);
  };

  const handleDrop = async (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedSceneId || draggedSceneId === targetId) return;

    const draggedIdx = scenes.findIndex((s) => s.id === draggedSceneId);
    const targetIdx = scenes.findIndex((s) => s.id === targetId);

    const reorderedIds = [...scenes.map((s) => s.id)];
    // Move dragged element to target position
    reorderedIds.splice(draggedIdx, 1);
    reorderedIds.splice(targetIdx, 0, draggedSceneId);

    try {
      await api.reorderScenes(projectId, reorderedIds);
      onRefresh();
    } catch (err) {
      console.error('Failed to reorder:', err);
      alert('Failed to reorder scenes.');
    } finally {
      setDraggedSceneId(null);
      setDragOverSceneId(null);
    }
  };

  // Timeline resize handling (stretching duration)
  const handleResizeStart = (e: React.MouseEvent, sceneId: string, currentFrames: number) => {
    e.stopPropagation();
    e.preventDefault();

    isResizingRef.current = true;
    resizeSceneIdRef.current = sceneId;
    startXRef.current = e.clientX;
    startDurationRef.current = currentFrames;
    currentDurationRef.current = currentFrames;

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizingRef.current || !resizeSceneIdRef.current) return;

    const deltaX = e.clientX - startXRef.current;
    // deltaX / zoom = frame difference
    const frameDelta = Math.round(deltaX / zoom);
    let newFrames = startDurationRef.current + frameDelta;

    // Snaps to multiples of 15 frames (0.5 seconds)
    newFrames = Math.round(newFrames / 15) * 15;
    
    // Bounds check: 30f (1s) to 300f (10s)
    newFrames = Math.max(30, Math.min(300, newFrames));

    currentDurationRef.current = newFrames;

    // Visual updates via temporarily modifying DOM element width
    const el = document.getElementById(`scene-block-${resizeSceneIdRef.current}`);
    if (el) {
      el.style.width = `${newFrames * zoom}px`;
      const textEl = document.getElementById(`scene-duration-label-${resizeSceneIdRef.current}`);
      if (textEl) {
        textEl.innerText = `${Math.round((newFrames / 30) * 10) / 10}s`;
      }
    }
  };

  const handleResizeEnd = async () => {
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);

    if (!isResizingRef.current || !resizeSceneIdRef.current) return;

    const sceneId = resizeSceneIdRef.current;
    const finalDuration = currentDurationRef.current;

    isResizingRef.current = false;
    resizeSceneIdRef.current = null;

    if (finalDuration === startDurationRef.current) {
      onRefresh(); // resets visual style
      return;
    }

    try {
      await api.updateScene(projectId, sceneId, { duration_frames: finalDuration });
      onRefresh();
    } catch (err) {
      console.error('Failed to resize scene duration:', err);
      alert('Failed to update scene duration.');
      onRefresh();
    }
  };

  // ---- Playhead drag handlers ----
  const totalFrames = scenes.reduce((sum, s) => sum + s.duration_frames, 0);

  const handlePlayheadMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDraggingPlayhead(true);
  };

  const handleTimelineClick = useCallback((e: React.MouseEvent) => {
    if (!timelineTrackRef.current) return;
    const rect = timelineTrackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + timelineTrackRef.current.scrollLeft;
    const frame = Math.max(0, Math.min(totalFrames, Math.round(x / zoom)));
    setPlayheadFrame(frame);
  }, [zoom, totalFrames]);

  useEffect(() => {
    if (!isDraggingPlayhead) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineTrackRef.current) return;
      const rect = timelineTrackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + timelineTrackRef.current.scrollLeft;
      const frame = Math.max(0, Math.min(totalFrames, Math.round(x / zoom)));
      setPlayheadFrame(frame);
    };
    const handleMouseUp = () => setIsDraggingPlayhead(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPlayhead, zoom, totalFrames]);

  // Play individual scene preview (highlight for 2s then reset)
  const handlePlayScene = (sceneId: string) => {
    if (playingSceneId === sceneId) {
      setPlayingSceneId(null);
      return;
    }
    // Move playhead to start of this scene
    let frameOffset = 0;
    for (const s of scenes) {
      if (s.id === sceneId) break;
      frameOffset += s.duration_frames;
    }
    setPlayheadFrame(frameOffset);
    setPlayingSceneId(sceneId);
    setSelectedSceneId(sceneId);

    // Auto-animate playhead across the scene duration
    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) return;
    const sceneDuration = scene.duration_frames;
    const durationMs = (sceneDuration / 30) * 1000; // 30fps
    const startTime = performance.now();
    const startFrame = frameOffset;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const currentFrame = startFrame + Math.round(progress * sceneDuration);
      setPlayheadFrame(currentFrame);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setPlayingSceneId(null);
      }
    };
    requestAnimationFrame(animate);
  };

  // Get the current scene under the playhead
  const getPlayheadTime = () => {
    const seconds = playheadFrame / 30;
    const mins = Math.floor(seconds / 60);
    const secs = (seconds % 60).toFixed(1);
    return `${mins}:${secs.padStart(4, '0')}`;
  };

  // Helper: Get color chips based on scene type (CapCut feel)
  const getSceneColor = (type: string) => {
    switch (type) {
      case 'hook':
        return '#dfa92a'; // Gold/Yellow
      case 'code':
        return '#7c3aed'; // Purple
      case 'output':
        return '#10b981'; // Emerald Green
      case 'cta':
      case 'subscribe':
      case 'subscribe_video':
        return '#ef4444'; // Red
      case 'end_screen':
        return '#0284c7'; // Blue
      case 'image':
        return '#06b6d4'; // Teal/Cyan
      case 'video':
        return '#6366f1'; // Indigo
      default:
        return '#6b7280'; // Gray
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
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', gap: 3 }}>
      {/* Editor Details Workspace and Quick Insert Actions */}
      <Grid container spacing={3} sx={{ flexGrow: 1 }}>
        {/* Left Side: Sidebar details form for selected scene */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, border: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.015)' }}>
            {selectedScene ? (
              <Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip label={selectedScene.type} size="small" style={{ backgroundColor: getSceneColor(selectedScene.type), color: '#fff', fontWeight: 800 }} />
                    Configure Block
                  </Typography>

                  <IconButton color="error" size="small" onClick={() => handleDeleteScene(selectedScene.id)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Block Title"
                      fullWidth
                      size="small"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Duration (Frames)"
                      fullWidth
                      select
                      size="small"
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      sx={{ mb: 2 }}
                    >
                      {[30, 45, 60, 75, 90, 105, 120, 150, 180, 210, 240, 300].map((f) => (
                        <MenuItem key={f} value={f}>
                          {Math.round((f / 30) * 10) / 10}s ({f} frames)
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  {/* Core dynamic content inputs based on scene type */}
                  {selectedScene.type === 'hook' && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          label="Hook Text / Opener headline"
                          fullWidth
                          multiline
                          rows={2}
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </Grid>

                      {/* Hook Graphic Image Upload */}
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>
                          Hook Opener Center Image (Visual Attention Grabber)
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                          {hookImage && (
                            <Box
                              component="img"
                              src={hookImage}
                              alt="Hook Graphic"
                              sx={{ width: 64, height: 40, borderRadius: '4px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                          )}
                          <TextField
                            label="Hook Image URL"
                            fullWidth
                            size="small"
                            value={hookImage}
                            onChange={(e) => setHookImage(e.target.value)}
                          />
                          <Button
                            variant="outlined"
                            component="label"
                            size="medium"
                            disabled={uploadingHookImage}
                            startIcon={<UploadIcon />}
                            sx={{ flexShrink: 0, height: 40 }}
                          >
                            {uploadingHookImage ? 'Uploading...' : 'Upload Image'}
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  setUploadingHookImage(true);
                                  const res = await api.uploadFile(file);
                                  setHookImage(res.url);
                                } catch (err: any) {
                                  alert(err.message || 'Image upload failed');
                                } finally {
                                  setUploadingHookImage(false);
                                }
                              }}
                            />
                          </Button>
                        </Box>
                      </Grid>

                      {hookImage && (
                        <>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              select
                              label="Hook Image Size Factor"
                              fullWidth
                              size="small"
                              value={hookImageSize}
                              onChange={(e) => setHookImageSize(e.target.value)}
                              sx={{ mb: 2 }}
                            >
                              <MenuItem value="small">Small graphic (70%)</MenuItem>
                              <MenuItem value="medium">Medium graphic (85%)</MenuItem>
                              <MenuItem value="large">Large full-width (95%)</MenuItem>
                            </TextField>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              select
                              label="Hook Image View Mode"
                              fullWidth
                              size="small"
                              value={hookImageViewMode}
                              onChange={(e) => setHookImageViewMode(e.target.value)}
                              sx={{ mb: 2 }}
                            >
                              <MenuItem value="contain">Fit (Contain full image)</MenuItem>
                              <MenuItem value="cover">Fill (Cover & Crop edges)</MenuItem>
                            </TextField>
                          </Grid>
                        </>
                      )}

                      {/* Layout Selection */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Intro Visual Layout"
                          fullWidth
                          size="small"
                          value={hookLayout}
                          onChange={(e) => setHookLayout(e.target.value)}
                          sx={{ mb: 2 }}
                        >
                          <MenuItem value="standard">Standard opener text</MenuItem>
                          <MenuItem value="glassmorphic">Glassmorphic Card overlay</MenuItem>
                          <MenuItem value="thumbnail">High-Contrast Thumbnail block</MenuItem>
                        </TextField>
                      </Grid>

                      {/* Show Progress Toggle & Style */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Visual Progress Timer"
                          fullWidth
                          size="small"
                          value={hookShowProgress ? hookProgressStyle : 'none'}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === 'none') {
                              setHookShowProgress(false);
                            } else {
                              setHookShowProgress(true);
                              setHookProgressStyle(val);
                            }
                          }}
                          sx={{ mb: 2 }}
                        >
                          <MenuItem value="none">No progress timer</MenuItem>
                          <MenuItem value="bar">Top Linear Progress Bar</MenuItem>
                          <MenuItem value="ring">Circular Ring Countdown</MenuItem>
                        </TextField>
                      </Grid>

                      {/* Badge Config */}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Alert Badge text (e.g. SECRET TIP)"
                          fullWidth
                          size="small"
                          value={hookBadge}
                          onChange={(e) => setHookBadge(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Badge Animation Style"
                          fullWidth
                          size="small"
                          value={hookBadgeStyle}
                          onChange={(e) => setHookBadgeStyle(e.target.value)}
                          sx={{ mb: 2 }}
                          disabled={!hookBadge}
                        >
                          <MenuItem value="heartbeat">Heartbeat pulse</MenuItem>
                          <MenuItem value="bounce">Floating bounce</MenuItem>
                          <MenuItem value="shake">Wiggle shake alert</MenuItem>
                          <MenuItem value="glow">Neon outer glow pulse</MenuItem>
                        </TextField>
                      </Grid>

                      {/* Creator Profile details */}
                      <Grid item xs={12}>
                        <Divider sx={{ my: 1.5, opacity: 0.1 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          Branded Creator Chip (Avatar & Handle overlay)
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Creator Name"
                          fullWidth
                          size="small"
                          value={hookCreatorName}
                          onChange={(e) => setHookCreatorName(e.target.value)}
                        />
                      </Grid>
                      
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Handle (e.g. @codeshorts)"
                          fullWidth
                          size="small"
                          value={hookCreatorHandle}
                          onChange={(e) => setHookCreatorHandle(e.target.value)}
                        />
                      </Grid>

                      <Grid item xs={12} sm={4}>
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                          {hookCreatorAvatar && (
                            <Box
                              component="img"
                              src={hookCreatorAvatar}
                              alt="Avatar"
                              sx={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }}
                            />
                          )}
                          <Button
                            variant="outlined"
                            component="label"
                            size="small"
                            disabled={uploadingAvatar}
                            startIcon={<UploadIcon />}
                            sx={{ flexGrow: 1, height: 40 }}
                          >
                            {uploadingAvatar ? 'Uploading...' : 'Avatar'}
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  setUploadingAvatar(true);
                                  const res = await api.uploadFile(file);
                                  setHookCreatorAvatar(res.url);
                                } catch (err: any) {
                                  alert(err.message || 'Avatar upload failed');
                                } finally {
                                  setUploadingAvatar(false);
                                }
                              }}
                            />
                          </Button>
                        </Box>
                      </Grid>
                    </>
                  )}

                  {(selectedScene.type === 'output' || selectedScene.type === 'cta' || selectedScene.type === 'tip') && (
                    <Grid item xs={12}>
                      <TextField
                        label={selectedScene.type === 'output' ? "Console Output Text" : "Text Content"}
                        fullWidth
                        multiline
                        rows={3}
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                  )}

                  {selectedScene.type === 'output' && (
                    <Grid item xs={12}>
                      <TextField
                        label="Explanation Text (Shown below output)"
                        fullWidth
                        multiline
                        rows={3}
                        value={explanation}
                        onChange={(e) => setExplanation(e.target.value)}
                        placeholder="Explain the result in a simple, user-friendly way..."
                        helperText="This text will display in a styled explanation card directly below the terminal output."
                        sx={{ mb: 2 }}
                      />
                    </Grid>
                  )}

                  {selectedScene.type === 'code' && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          label="Code Snippet"
                          fullWidth
                          multiline
                          rows={5}
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          sx={{ mb: 2, fontFamily: 'monospace' }}
                        />
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          select
                          label="Language"
                          fullWidth
                          size="small"
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                        >
                          {['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php'].map((lang) => (
                            <MenuItem key={lang} value={lang}>
                              {lang.toUpperCase()}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={6}>
                        <TextField
                          label="Console Output (Optional)"
                          fullWidth
                          size="small"
                          value={output}
                          onChange={(e) => setOutput(e.target.value)}
                        />
                      </Grid>
                    </>
                  )}

                  {selectedScene.type === 'subscribe' && (
                    <>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Channel Name"
                          fullWidth
                          size="small"
                          value={channelName}
                          onChange={(e) => setChannelName(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Handle (e.g. @name)"
                          fullWidth
                          size="small"
                          value={channelHandle}
                          onChange={(e) => setChannelHandle(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Subscribers Count"
                          fullWidth
                          size="small"
                          value={subscriberCount}
                          onChange={(e) => setSubscriberCount(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>
                          Channel Logo / Avatar
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          {logoUrl && (
                            <Box
                              component="img"
                              src={logoUrl}
                              alt="Logo"
                              sx={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
                            />
                          )}
                          <TextField
                            label="Logo Image URL"
                            fullWidth
                            size="small"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                          />
                          <Button
                            variant="outlined"
                            component="label"
                            size="medium"
                            disabled={uploadingLogo}
                            startIcon={<UploadIcon />}
                            sx={{ flexShrink: 0, height: 40 }}
                          >
                            {uploadingLogo ? 'Uploading...' : 'Upload'}
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  setUploadingLogo(true);
                                  const res = await api.uploadFile(file);
                                  setLogoUrl(res.url);
                                } catch (err: any) {
                                  alert(err.message || 'Upload failed');
                                } finally {
                                  setUploadingLogo(false);
                                }
                              }}
                            />
                          </Button>
                        </Box>
                      </Grid>
                    </>
                  )}

                  {selectedScene.type === 'end_screen' && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          label="Outro Text"
                          fullWidth
                          size="small"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>
                          Channel Logo / Avatar
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
                          {logoUrl && (
                            <Box
                              component="img"
                              src={logoUrl}
                              alt="Logo"
                              sx={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
                            />
                          )}
                          <TextField
                            label="Logo Image URL"
                            fullWidth
                            size="small"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                          />
                          <Button
                            variant="outlined"
                            component="label"
                            size="medium"
                            disabled={uploadingLogo}
                            startIcon={<UploadIcon />}
                            sx={{ flexShrink: 0, height: 40 }}
                          >
                            {uploadingLogo ? 'Uploading...' : 'Upload'}
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  setUploadingLogo(true);
                                  const res = await api.uploadFile(file);
                                  setLogoUrl(res.url);
                                } catch (err: any) {
                                  alert(err.message || 'Upload failed');
                                } finally {
                                  setUploadingLogo(false);
                                }
                              }}
                            />
                          </Button>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>
                          Social Channels (Max 3)
                        </Typography>
                        {socials.map((soc, idx) => (
                          <Box key={idx} sx={{ display: 'flex', gap: 2, mb: 1.5 }}>
                            <TextField
                              select
                              size="small"
                              label="Platform"
                              value={soc.platform}
                              onChange={(e) => {
                                const copy = [...socials];
                                copy[idx].platform = e.target.value;
                                setSocials(copy);
                              }}
                              sx={{ width: 140 }}
                            >
                              {['github', 'twitter', 'youtube', 'linkedin'].map((plat) => (
                                <MenuItem key={plat} value={plat}>{plat.toUpperCase()}</MenuItem>
                              ))}
                            </TextField>
                            <TextField
                              size="small"
                              label="Username/Handle"
                              value={soc.handle}
                              onChange={(e) => {
                                const copy = [...socials];
                                copy[idx].handle = e.target.value;
                                setSocials(copy);
                              }}
                              sx={{ flexGrow: 1 }}
                            />
                            <IconButton
                              color="error"
                              onClick={() => setSocials(socials.filter((_, sIdx) => sIdx !== idx))}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        ))}
                        {socials.length < 3 && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={() => setSocials([...socials, { platform: 'github', handle: 'username' }])}
                            sx={{ mt: 1 }}
                          >
                            Add Social Channel
                          </Button>
                        )}
                      </Grid>
                    </>
                  )}
                  
                  {selectedScene.type === 'image' && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          label="Caption / Subtitles text overlay"
                          fullWidth
                          multiline
                          rows={2}
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <TextField
                            label="Image URL"
                            fullWidth
                            size="small"
                            value={imageUrl}
                            onChange={(e) => setImageUrl(e.target.value)}
                          />
                          <Button
                            variant="outlined"
                            component="label"
                            size="medium"
                            disabled={uploading}
                            sx={{ flexShrink: 0, height: 40 }}
                          >
                            {uploading ? 'Uploading...' : 'Upload File'}
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  setUploading(true);
                                  const res = await api.uploadFile(file);
                                  setImageUrl(res.url);
                                } catch (err: any) {
                                  alert(err.message || 'Upload failed');
                                } finally {
                                  setUploading(false);
                                }
                              }}
                            />
                          </Button>
                        </Box>
                      </Grid>
                    </>
                  )}

                  {selectedScene.type === 'video' && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          label="Caption / Subtitles text overlay"
                          fullWidth
                          multiline
                          rows={2}
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <TextField
                            label="Video URL"
                            fullWidth
                            size="small"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                          />
                          <Button
                            variant="outlined"
                            component="label"
                            size="medium"
                            disabled={uploading}
                            sx={{ flexShrink: 0, height: 40 }}
                          >
                            {uploading ? 'Uploading...' : 'Upload Video'}
                            <input
                              type="file"
                              accept="video/*"
                              hidden
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  setUploading(true);
                                  const res = await api.uploadFile(file);
                                  setVideoUrl(res.url);
                                } catch (err: any) {
                                  alert(err.message || 'Upload failed');
                                } finally {
                                  setUploading(false);
                                }
                              }}
                            />
                          </Button>
                        </Box>
                      </Grid>
                    </>
                  )}

                  {selectedScene.type === 'subscribe_video' && (
                    <>
                      <Grid item xs={12}>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          <TextField
                            label="Video URL (leave empty for fallback animation)"
                            fullWidth
                            size="small"
                            value={videoUrl}
                            onChange={(e) => setVideoUrl(e.target.value)}
                            placeholder="e.g. /assets/default_subscribe.mp4"
                          />
                          <Button
                            variant="outlined"
                            component="label"
                            size="medium"
                            disabled={uploading}
                            sx={{ flexShrink: 0, height: 40 }}
                          >
                            {uploading ? 'Uploading...' : 'Upload MP4'}
                            <input
                              type="file"
                              accept="video/*"
                              hidden
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  setUploading(true);
                                  const res = await api.uploadFile(file);
                                  setVideoUrl(res.url);
                                } catch (err: any) {
                                  alert(err.message || 'Upload failed');
                                } finally {
                                  setUploading(false);
                                }
                              }}
                            />
                          </Button>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>
                          Channel Logo / Avatar
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                          {logoUrl && (
                            <Box
                              component="img"
                              src={logoUrl}
                              alt="Logo"
                              sx={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.1)' }}
                            />
                          )}
                          <TextField
                            label="Logo Image URL"
                            fullWidth
                            size="small"
                            value={logoUrl}
                            onChange={(e) => setLogoUrl(e.target.value)}
                          />
                          <Button
                            variant="outlined"
                            component="label"
                            size="medium"
                            disabled={uploadingLogo}
                            startIcon={<UploadIcon />}
                            sx={{ flexShrink: 0, height: 40 }}
                          >
                            {uploadingLogo ? 'Uploading...' : 'Upload'}
                            <input
                              type="file"
                              accept="image/*"
                              hidden
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (!file) return;
                                try {
                                  setUploadingLogo(true);
                                  const res = await api.uploadFile(file);
                                  setLogoUrl(res.url);
                                } catch (err: any) {
                                  alert(err.message || 'Upload failed');
                                } finally {
                                  setUploadingLogo(false);
                                }
                              }}
                            />
                          </Button>
                        </Box>
                      </Grid>
                    </>
                  )}

                  {/* Transition parameters */}
                  <Grid item xs={6} sx={{ mt: 2 }}>
                    <TextField
                      select
                      label="Entrance Animation"
                      fullWidth
                      size="small"
                      value={animation}
                      onChange={(e) => setAnimation(e.target.value as any)}
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
                  <Grid item xs={6} sx={{ mt: 2 }}>
                    <TextField
                      select
                      label="Transition Out"
                      fullWidth
                      size="small"
                      value={transition}
                      onChange={(e) => setTransition(e.target.value as any)}
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
                  fullWidth
                  startIcon={<SaveIcon />}
                  onClick={handleSaveScene}
                  disabled={saving}
                  sx={{ mt: 4, fontWeight: 700 }}
                >
                  {saving ? 'Applying...' : 'Apply Block Changes'}
                </Button>
              </Box>
            ) : (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <Typography color="text.secondary">Select a block from the timeline below to edit its content.</Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Side: Quick insert actions */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, border: '1px solid rgba(255, 255, 255, 0.05)', background: 'rgba(255, 255, 255, 0.015)' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 2, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Insert Clip Block
            </Typography>
            <Grid container spacing={1.5}>
              {[
                { type: 'hook' as SceneType, label: 'Hook Opener' },
                { type: 'code' as SceneType, label: 'Code Snippet' },
                { type: 'output' as SceneType, label: 'Console Output' },
                { type: 'image' as SceneType, label: 'Image Frame' },
                { type: 'video' as SceneType, label: 'Video Clip' },
                { type: 'tip' as SceneType, label: 'Pro Tip' },
                { type: 'cta' as SceneType, label: 'CTA Message' },
                { type: 'subscribe' as SceneType, label: 'Subscribe Card' },
                { type: 'subscribe_video' as SceneType, label: 'Subscribe Video' },
                { type: 'end_screen' as SceneType, label: 'Outro Screen' },
              ].map((item) => (
                <Grid item xs={6} key={item.type}>
                  <Button
                    variant="outlined"
                    fullWidth
                    size="small"
                    startIcon={<AddIcon />}
                    onClick={() => handleAddScene(item.type)}
                    sx={{
                      borderColor: 'rgba(255, 255, 255, 0.08)',
                      color: 'text.primary',
                      justifyContent: 'flex-start',
                      py: 1.2,
                      px: 2,
                      background: 'rgba(255,255,255,0.01)',
                      '&:hover': {
                        borderColor: getSceneColor(item.type),
                        background: `${getSceneColor(item.type)}10`,
                      },
                    }}
                  >
                    {item.label}
                  </Button>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>

      {/* CapCut Timeline Horizontal Bar */}
      <Card sx={{ border: '1px solid rgba(255, 255, 255, 0.06)', background: '#090a12', overflow: 'visible' }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {/* Header toolbar */}
          <Box sx={{ px: 3, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: '#121420' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 1 }}>
                Timeline Track Editor
                <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.5 }}>(Drag clip to reorder • Press Delete to remove • Click timeline to seek)</span>
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Playhead time display */}
              <Chip
                label={`⏱ ${getPlayheadTime()}`}
                size="small"
                sx={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: 12,
                  backgroundColor: 'rgba(239, 68, 68, 0.15)',
                  color: '#ef4444',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                }}
              />

              {/* Zoom Slider */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton size="small" onClick={() => setZoom(Math.max(1, zoom - 0.5))} disabled={zoom <= 1}>
                  <ZoomOutIcon fontSize="small" />
                </IconButton>
                <Typography variant="caption" sx={{ minWidth: 60, textAlign: 'center', fontWeight: 600 }}>Zoom: {Math.round(zoom * 20)}%</Typography>
                <IconButton size="small" onClick={() => setZoom(Math.min(6, zoom + 0.5))} disabled={zoom >= 6}>
                  <ZoomInIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>
          </Box>

          {/* Timeline ruler and track area */}
          <Box
            ref={timelineTrackRef}
            onClick={handleTimelineClick}
            sx={{ overflowX: 'auto', p: 3, background: '#090a13', display: 'flex', flexDirection: 'column', gap: 1, position: 'relative', cursor: 'crosshair' }}
          >
            
            {/* Timeline rulers / ticks */}
            <Box sx={{ position: 'relative', height: 20, mb: 1, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
              {Array.from({ length: Math.ceil(totalFrames / 30) + 1 }).map((_, sIdx) => {
                const f = sIdx * 30; // frames
                return (
                  <div
                    key={sIdx}
                    style={{
                      position: 'absolute',
                      left: f * zoom,
                      fontSize: 10,
                      color: 'rgba(255,255,255,0.3)',
                      fontFamily: 'monospace',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <span>{sIdx}s</span>
                    <div style={{ width: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.15)', marginTop: 2 }} />
                  </div>
                );
              })}
            </Box>

            {/* Main horizontal tracks container */}
            <Box sx={{ display: 'flex', position: 'relative', alignItems: 'stretch', height: 74, width: 'fit-content' }}>
              {scenes.map((scene, index) => {
                const isSelected = scene.id === selectedSceneId;
                const isPlaying = playingSceneId === scene.id;
                const widthPx = scene.duration_frames * zoom;
                const blockBgColor = getSceneColor(scene.type);
                const isOver = dragOverSceneId === scene.id;

                return (
                  <Box
                    key={scene.id}
                    id={`scene-block-${scene.id}`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, scene.id)}
                    onDragOver={(e) => handleDragOver(e, scene.id)}
                    onDragEnd={handleDragEnd}
                    onDrop={(e) => handleDrop(e, scene.id)}
                    onClick={(e) => { e.stopPropagation(); setSelectedSceneId(scene.id); }}
                    sx={{
                      width: widthPx,
                      position: 'relative',
                      background: isSelected 
                        ? `linear-gradient(135deg, ${blockBgColor}e0, ${blockBgColor}80)`
                        : `linear-gradient(135deg, ${blockBgColor}cc, ${blockBgColor}50)`,
                      border: isSelected ? '2px solid #ffffff' : isPlaying ? `2px solid #ef4444` : '1px solid rgba(255,255,255,0.08)',
                      borderRadius: '8px',
                      mr: 0.5,
                      flexShrink: 0,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      px: 1.5,
                      transition: 'border 0.1s, opacity 0.2s, box-shadow 0.2s',
                      boxShadow: isSelected ? `0 0 15px ${blockBgColor}80` : isPlaying ? `0 0 20px rgba(239, 68, 68, 0.4)` : 'none',
                      opacity: draggedSceneId === scene.id ? 0.3 : 1,
                      transform: isOver ? 'scale(0.98)' : 'scale(1)',
                      '&:hover': {
                        borderColor: isSelected ? '#ffffff' : 'rgba(255,255,255,0.4)',
                        boxShadow: `0 0 10px ${blockBgColor}40`,
                      },
                    }}
                  >
                    {/* Drag indicator handle on left */}
                    <Box sx={{ mr: 0.5, opacity: 0.4, cursor: 'grab', display: 'flex', alignItems: 'center' }}>
                      <DragIcon sx={{ fontSize: 16 }} />
                    </Box>

                    {/* Play individual scene button */}
                    <Tooltip title={isPlaying ? 'Stop preview' : 'Preview this clip'} arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => { e.stopPropagation(); handlePlayScene(scene.id); }}
                        sx={{
                          mr: 0.5,
                          width: 24,
                          height: 24,
                          color: isPlaying ? '#ef4444' : 'rgba(255,255,255,0.6)',
                          '&:hover': { color: '#fff', backgroundColor: 'rgba(255,255,255,0.1)' },
                        }}
                      >
                        {isPlaying ? <PauseIcon sx={{ fontSize: 14 }} /> : <PlayIcon sx={{ fontSize: 14 }} />}
                      </IconButton>
                    </Tooltip>

                    {/* Clip Metadata */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', minWidth: 0, flexGrow: 1 }}>
                      <Typography sx={{ fontSize: 12, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        #{index + 1} • {scene.title || scene.type}
                      </Typography>
                      <Typography
                        id={`scene-duration-label-${scene.id}`}
                        sx={{ fontSize: 10, opacity: 0.5, fontFamily: 'monospace' }}
                      >
                        {Math.round((scene.duration_frames / 30) * 10) / 10}s
                      </Typography>
                    </Box>

                    {/* Resize handle bar on right edge */}
                    <div
                      onMouseDown={(e) => handleResizeStart(e, scene.id, scene.duration_frames)}
                      style={{
                        position: 'absolute',
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width: 8,
                        cursor: 'ew-resize',
                        background: 'rgba(255,255,255,0.1)',
                        borderTopRightRadius: 6,
                        borderBottomRightRadius: 6,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.4)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')}
                    >
                      <div style={{ width: 2, height: 12, backgroundColor: 'rgba(255,255,255,0.6)' }} />
                    </div>
                  </Box>
                );
              })}

              {/* Playhead indicator - red vertical line */}
              <div
                onMouseDown={handlePlayheadMouseDown}
                style={{
                  position: 'absolute',
                  left: playheadFrame * zoom - 1,
                  top: -28,
                  bottom: 0,
                  width: 2,
                  backgroundColor: '#ef4444',
                  cursor: 'ew-resize',
                  zIndex: 10,
                  pointerEvents: 'auto',
                  transition: isDraggingPlayhead ? 'none' : 'left 0.05s ease-out',
                }}
              >
                {/* Playhead top triangle handle */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 0,
                    height: 0,
                    borderLeft: '6px solid transparent',
                    borderRight: '6px solid transparent',
                    borderTop: '8px solid #ef4444',
                  }}
                />
              </div>
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
