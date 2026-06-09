// ============================================================
// Dashboard Page Component
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  VideoLibrary as ProjectsIcon,
  Palette as TemplatesIcon,
  CloudDownload as ExportsIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Info as InfoIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { useProjects } from '../../hooks/useProjects.js';
import { useTemplates } from '../../hooks/useTemplates.js';
import * as api from '../../api/client.js';
import AnimatedCard from '../common/AnimatedCard.js';
import type { ExportRecord, HealthCheck } from '../../types/index.js';

export default function Dashboard() {
  const navigate = useNavigate();
  const { projects, loading: projectsLoading } = useProjects();
  const { templates, loading: templatesLoading } = useTemplates();
  const [exportsCount, setExportsCount] = useState<number>(0);
  const [exportsLoading, setExportsLoading] = useState(true);
  const [health, setHealth] = useState<HealthCheck | null>(null);
  const [healthLoading, setHealthLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const exports = await api.getExports();
        setExportsCount(exports.length);
      } catch (err) {
        console.error('Failed to load exports:', err);
      } finally {
        setExportsLoading(false);
      }

      try {
        const status = await api.getHealth();
        setHealth(status);
      } catch (err) {
        console.error('Failed to load health status:', err);
      } finally {
        setHealthLoading(false);
      }
    }
    loadStats();
  }, []);

  const stats = [
    {
      title: 'Total Projects',
      value: projectsLoading ? <CircularProgress size={20} /> : projects.length,
      icon: <ProjectsIcon sx={{ fontSize: 36, color: '#7c3aed' }} />,
      glow: '#7c3aed',
      onClick: () => navigate('/projects'),
    },
    {
      title: 'Saved Templates',
      value: templatesLoading ? <CircularProgress size={20} /> : templates.length,
      icon: <TemplatesIcon sx={{ fontSize: 36, color: '#06b6d4' }} />,
      glow: '#06b6d4',
      onClick: () => navigate('/templates'),
    },
    {
      title: 'Exported Videos',
      value: exportsLoading ? <CircularProgress size={20} /> : exportsCount,
      icon: <ExportsIcon sx={{ fontSize: 36, color: '#10b981' }} />,
      glow: '#10b981',
      onClick: () => navigate('/exports'),
    },
  ];

  const recentProjects = projects.slice(0, 3);

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Welcome & Quick actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Welcome to CodeShorts
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Generate professional vertical videos from your code snippets.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/projects/new')}
          sx={{
            px: 3,
            py: 1.25,
            borderRadius: 2.5,
            fontWeight: 700,
            boxShadow: '0 4px 14px 0 rgba(124, 58, 237, 0.4)',
          }}
        >
          Create Project
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Stats Grid */}
        {stats.map((s, idx) => (
          <Grid item xs={12} sm={6} md={4} key={s.title}>
            <AnimatedCard
              onClick={s.onClick}
              glowColor={s.glow}
              delay={idx * 0.1}
              sx={{ minHeight: 120, display: 'flex', alignItems: 'center' }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                    {s.title}
                  </Typography>
                  <Typography variant="h3" sx={{ fontWeight: 800 }}>
                    {s.value}
                  </Typography>
                </Box>
                {s.icon}
              </Box>
            </AnimatedCard>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={4}>
        {/* Recent projects */}
        <Grid item xs={12} lg={8}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            Recent Projects
          </Typography>
          {projectsLoading ? (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}>
              <CircularProgress />
            </Box>
          ) : recentProjects.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.1)' }}>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                No projects found. Create your first project to get started!
              </Typography>
              <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/projects/new')}>
                New Project
              </Button>
            </Card>
          ) : (
            <Grid container spacing={2.5}>
              {recentProjects.map((project, idx) => (
                <Grid item xs={12} key={project.id}>
                  <AnimatedCard
                    onClick={() => navigate(`/projects/${project.id}`)}
                    glowColor="#7c3aed"
                    delay={0.3 + idx * 0.08}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {project.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                          <Chip label={project.language} size="small" color="primary" variant="outlined" sx={{ textTransform: 'capitalize' }} />
                          <Chip
                            label={project.status}
                            size="small"
                            color={
                              project.status === 'completed'
                                ? 'success'
                                : project.status === 'rendering'
                                ? 'warning'
                                : project.status === 'error'
                                ? 'error'
                                : 'default'
                            }
                            variant="filled"
                            sx={{ textTransform: 'capitalize' }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            Updated {new Date(project.updated_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                      <Button variant="text" color="primary" startIcon={<PlayArrowIcon />}>
                        Open Project
                      </Button>
                    </Box>
                  </AnimatedCard>
                </Grid>
              ))}
            </Grid>
          )}
        </Grid>

        {/* System Health */}
        <Grid item xs={12} lg={4}>
          <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
            System Health {health ? '(Online)' : healthLoading ? '' : '(Offline)'}
          </Typography>
          <Card sx={{ borderRadius: 3, border: '1px solid rgba(255,255,255,0.06)' }}>
            <CardContent sx={{ p: 3 }}>
              {healthLoading ? (
                <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
                  <CircularProgress size={24} />
                </Box>
              ) : health ? (
                <List sx={{ p: 0 }}>
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemText
                      primary="SQLite Database"
                      secondary={health.database ? 'Connected & Migrated' : 'Disconnected'}
                    />
                    {health.database ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                  </ListItem>
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemText
                      primary="FFmpeg Utility"
                      secondary={health.ffmpeg ? 'Installed & Ready' : 'Not installed'}
                    />
                    {health.ffmpeg ? <CheckCircleIcon color="success" /> : <CancelIcon color="error" />}
                  </ListItem>
                  <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />
                  <ListItem sx={{ px: 0, py: 1.5 }}>
                    <ListItemText
                      primary="Piper TTS (Voice)"
                      secondary={health.piper ? 'Configured & Enabled' : 'Optional - Piper binary missing'}
                    />
                    {health.piper ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <InfoIcon color="warning" />
                    )}
                  </ListItem>
                </List>
              ) : (
                <Typography color="error">Failed to connect to backend server</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
