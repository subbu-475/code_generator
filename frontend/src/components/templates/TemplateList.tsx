// ============================================================
// Template List Page
// ============================================================

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Grid,
  Typography,
  Box,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as DuplicateIcon,
} from '@mui/icons-material';
import { useTemplates } from '../../hooks/useTemplates.js';
import AnimatedCard from '../common/AnimatedCard.js';

export default function TemplateList() {
  const navigate = useNavigate();
  const { templates, loading, deleteTemplate, createTemplate } = useTemplates();

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this custom template?')) {
      try {
        await deleteTemplate(id);
      } catch (err) {
        console.error('Failed to delete template:', err);
      }
    }
  };

  const handleDuplicate = async (template: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const duplicateInput = {
        name: `${template.name} (Copy)`,
        background_color: template.background_color,
        font_family: template.font_family,
        font_size: template.font_size,
        accent_color: template.accent_color,
        text_color: template.text_color,
        animation_style: template.animation_style,
        transition_style: template.transition_style,
        code_theme: template.code_theme,
        custom_css: template.custom_css || '',
      };
      const duplicated = await createTemplate(duplicateInput);
      navigate(`/templates/${duplicated.id}/edit`);
    } catch (err) {
      console.error('Failed to duplicate template:', err);
      alert('Failed to duplicate template');
    }
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Video Templates
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Customize colors, typography, themes, and animations for your videos.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            // Navigate to template editor with new parameter or create a fast dummy custom template first
            const defaultNewTemplate = {
              name: 'My Custom Template',
              background_color: '#121212',
              font_family: 'JetBrains Mono',
              font_size: 16,
              accent_color: '#06b6d4',
              text_color: '#ffffff',
              animation_style: 'fade' as any,
              transition_style: 'fade' as any,
              code_theme: 'github-dark' as any,
            };
            createTemplate(defaultNewTemplate).then((created) => {
              navigate(`/templates/${created.id}/edit`);
            }).catch((err) => {
              alert('Failed to initialize a new template');
            });
          }}
          sx={{ px: 3, py: 1.25, borderRadius: 2.5, fontWeight: 700 }}
        >
          Create Template
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ py: 10, display: 'flex', justifyContent: 'center' }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {templates.map((template, idx) => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <AnimatedCard
                glowColor={template.accent_color}
                delay={idx * 0.05}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minHeight: 220,
                  position: 'relative',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 800 }}>
                      {template.name}
                    </Typography>
                    {template.is_default === 1 && (
                      <Chip label="System Default" size="small" color="secondary" sx={{ fontSize: 10, fontWeight: 700 }} />
                    )}
                  </Box>
                  
                  {/* Live Mini Preview Display */}
                  <Box
                    sx={{
                      height: 50,
                      borderRadius: 2,
                      background: template.background_color,
                      mb: 3,
                      border: '1px solid rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-around',
                      px: 2,
                    }}
                  >
                    <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: template.accent_color }} />
                    <Typography
                      sx={{
                        color: template.text_color,
                        fontFamily: template.font_family,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      {template.font_family}
                    </Typography>
                    <Chip
                      label={template.code_theme}
                      size="small"
                      sx={{
                        height: 18,
                        fontSize: 9,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: '#fff',
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.06)', pt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Font: {template.font_size}px
                  </Typography>
                  <Box>
                    <Tooltip title="Duplicate template">
                      <IconButton size="small" onClick={(e) => handleDuplicate(template, e)} sx={{ mr: 0.5 }}>
                        <DuplicateIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    {template.is_default !== 1 && (
                      <>
                        <Tooltip title="Edit template settings">
                          <IconButton
                            size="small"
                            onClick={() => navigate(`/templates/${template.id}/edit`)}
                            sx={{ mr: 0.5 }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete custom template">
                          <IconButton size="small" onClick={(e) => handleDelete(template.id, e)} color="error">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </>
                    )}
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
