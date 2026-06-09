// ============================================================
// Project List Page
// ============================================================

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  InputAdornment,
  CircularProgress,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  PlayArrow as PlayArrowIcon,
} from '@mui/icons-material';
import { useProjects } from '../../hooks/useProjects.js';
import AnimatedCard from '../common/AnimatedCard.js';

export default function ProjectList() {
  const navigate = useNavigate();
  const { projects, loading, deleteProject } = useProjects();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await deleteProject(id);
      } catch (err) {
        console.error('Failed to delete project:', err);
      }
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.hook_text && p.hook_text.toLowerCase().includes(search.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Title & Add project */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            My Projects
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage and generate short videos for your social channels.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/projects/new')}
          sx={{ px: 3, py: 1.25, borderRadius: 2.5, fontWeight: 700 }}
        >
          Create Project
        </Button>
      </Box>

      {/* Filters bar */}
      <Box sx={{ display: 'flex', gap: 2, mb: 4, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flexGrow: 1, maxWidth: 400 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: 'rgba(255,255,255,0.3)' }} />
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 160 }}
          label="Status"
        >
          <MenuItem value="all">All Statuses</MenuItem>
          <MenuItem value="draft">Draft</MenuItem>
          <MenuItem value="rendering">Rendering</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
          <MenuItem value="error">Error</MenuItem>
        </TextField>
      </Box>

      {/* Projects Grid */}
      {loading ? (
        <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : filteredProjects.length === 0 ? (
        <Box sx={{ py: 8, textAlign: 'center', border: '1px dashed rgba(255,255,255,0.08)', borderRadius: 3 }}>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            No projects found. Create one now to begin.
          </Typography>
          <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate('/projects/new')}>
            New Project
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {filteredProjects.map((project, idx) => (
            <Grid item xs={12} sm={6} md={4} key={project.id}>
              <AnimatedCard
                onClick={() => navigate(`/projects/${project.id}`)}
                glowColor="#7c3aed"
                delay={idx * 0.05}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 180,
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, lineBreak: 'anywhere' }}>
                    {project.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {project.hook_text || 'No hook text defined'}
                  </Typography>
                </Box>
                <Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
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
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', pt: 1.5 }}>
                    <Typography variant="caption" color="text.secondary">
                      Updated {new Date(project.updated_at).toLocaleDateString()}
                    </Typography>
                    <Box>
                      <Tooltip title="Edit project content">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/projects/${project.id}/edit`);
                          }}
                          sx={{ mr: 0.5 }}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete project">
                        <IconButton size="small" onClick={(e) => handleDelete(project.id, e)} color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                </Box>
              </AnimatedCard>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}
