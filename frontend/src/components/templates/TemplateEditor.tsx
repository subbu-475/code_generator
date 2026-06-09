// ============================================================
// Template Editor Page Component
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Grid,
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Slider,
  Card,
  CardContent,
  IconButton,
  CircularProgress,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import * as api from '../../api/client.js';
import type { Template, AnimationStyle, TransitionStyle, CodeTheme } from '../../types/index.js';

export default function TemplateEditor() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [backgroundColor, setBackgroundColor] = useState('#1a1a2e');
  const [fontFamily, setFontFamily] = useState('JetBrains Mono');
  const [fontSize, setFontSize] = useState(16);
  const [accentColor, setAccentColor] = useState('#7c3aed');
  const [textColor, setTextColor] = useState('#ffffff');
  const [animationStyle, setAnimationStyle] = useState<AnimationStyle>('fade');
  const [transitionStyle, setTransitionStyle] = useState<TransitionStyle>('fade');
  const [codeTheme, setCodeTheme] = useState<CodeTheme>('github-dark');
  const [customCss, setCustomCss] = useState('');
  
  // Enhancement States
  const [backgroundGradient, setBackgroundGradient] = useState<string | null>(null);
  const [containerStyle, setContainerStyle] = useState<'rounded' | 'sharp' | 'floating'>('rounded');
  const [glowEffect, setGlowEffect] = useState<boolean>(true);
  const [backgroundEffect, setBackgroundEffect] = useState<string>('none');
  const [bgType, setBgType] = useState<'solid' | 'gradient'>('solid');

  const presets = [
    {
      name: 'Cyberpunk Neon 🌐',
      bgType: 'gradient' as const,
      bg: '#0d0221',
      bgGradient: 'linear-gradient(135deg, #0d0221 0%, #150050 100%)',
      accent: '#ff007f',
      text: '#ffffff',
      font: 'Space Mono',
      fontSize: 16,
      codeTheme: 'dracula' as const,
      bgEffect: 'particles',
      containerStyle: 'floating' as const,
      glowEffect: true,
    },
    {
      name: 'Tokyo Midnight 🗼',
      bgType: 'gradient' as const,
      bg: '#0a0a16',
      bgGradient: 'linear-gradient(135deg, #0a0a16 0%, #12122c 100%)',
      accent: '#00f5d4',
      text: '#ffffff',
      font: 'Fira Code',
      fontSize: 16,
      codeTheme: 'tokyo-night' as const,
      bgEffect: 'grid',
      containerStyle: 'rounded' as const,
      glowEffect: true,
    },
    {
      name: 'Matrix Terminal 📟',
      bgType: 'gradient' as const,
      bg: '#020804',
      bgGradient: 'linear-gradient(135deg, #020804 0%, #051408 100%)',
      accent: '#39ff14',
      text: '#a3e635',
      font: 'Courier New',
      fontSize: 16,
      codeTheme: 'vitesse-dark' as const,
      bgEffect: 'matrix',
      containerStyle: 'sharp' as const,
      glowEffect: true,
    },
    {
      name: 'Matte Minimalist ♠️',
      bgType: 'solid' as const,
      bg: '#121212',
      bgGradient: null,
      accent: '#ffffff',
      text: '#e0e0e0',
      font: 'SF Mono',
      fontSize: 16,
      codeTheme: 'github-dark' as const,
      bgEffect: 'none',
      containerStyle: 'sharp' as const,
      glowEffect: false,
    },
    {
      name: 'Coding Dark (Classic) 🟣',
      bgType: 'gradient' as const,
      bg: '#1a1a2e',
      bgGradient: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
      accent: '#7c3aed',
      text: '#ffffff',
      font: 'JetBrains Mono',
      fontSize: 16,
      codeTheme: 'github-dark' as const,
      bgEffect: 'none',
      containerStyle: 'rounded' as const,
      glowEffect: true,
    },
  ];

  const applyPreset = (p: typeof presets[0]) => {
    setBgType(p.bgType);
    setBackgroundColor(p.bg);
    setBackgroundGradient(p.bgGradient);
    setAccentColor(p.accent);
    setTextColor(p.text);
    setFontFamily(p.font);
    setFontSize(p.fontSize);
    setCodeTheme(p.codeTheme);
    setBackgroundEffect(p.bgEffect);
    setContainerStyle(p.containerStyle);
    setGlowEffect(p.glowEffect);
  };

  useEffect(() => {
    if (id) {
      async function loadTemplate() {
        try {
          setLoading(true);
          const t = await api.getTemplate(id!);
          setName(t.name);
          setBackgroundColor(t.background_color);
          setFontFamily(t.font_family);
          setFontSize(t.font_size);
          setAccentColor(t.accent_color);
          setTextColor(t.text_color);
          setAnimationStyle(t.animation_style);
          setTransitionStyle(t.transition_style);
          setCodeTheme(t.code_theme);
          setCustomCss(t.custom_css || '');
          setBackgroundGradient(t.background_gradient || null);
          setContainerStyle(t.container_style || 'rounded');
          setGlowEffect(t.glow_effect !== 0);
          setBackgroundEffect(t.background_effect || 'none');
          setBgType(t.background_gradient ? 'gradient' : 'solid');
        } catch (err) {
          console.error(err);
          alert('Template not found');
          navigate('/templates');
        } finally {
          setLoading(false);
        }
      }
      loadTemplate();
    }
  }, [id, navigate]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setSaving(true);
      const payload = {
        name,
        background_color: backgroundColor,
        font_family: fontFamily,
        font_size: fontSize,
        accent_color: accentColor,
        text_color: textColor,
        animation_style: animationStyle,
        transition_style: transitionStyle,
        code_theme: codeTheme,
        custom_css: customCss || undefined,
        background_effect: backgroundEffect,
        background_gradient: bgType === 'gradient' ? (backgroundGradient || 'linear-gradient(135deg, #1a1a2e 0%, #7c3aed 100%)') : null,
        container_style: containerStyle,
        glow_effect: glowEffect,
      };

      if (id) {
        await api.updateTemplate(id, payload);
        alert('Template saved successfully!');
        navigate('/templates');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to save template');
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

  const fonts = ['JetBrains Mono', 'Fira Code', 'Consolas', 'Space Mono', 'SF Mono', 'Courier New'];
  const animations = ['fade', 'zoom', 'slide', 'pop', 'bounce'];
  const transitions = ['fade', 'slide', 'zoom', 'none'];
  const codeThemes = ['github-dark', 'vitesse-dark', 'tokyo-night', 'dracula'];

  // Calculated Preview Container Style
  const actualBg = bgType === 'gradient' ? (backgroundGradient || 'linear-gradient(135deg, #1a1a2e 0%, #7c3aed 100%)') : backgroundColor;

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate('/templates')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Edit Template Settings
        </Typography>
      </Box>

      {/* Quick Presets Panel */}
      <Card sx={{ p: 3, mb: 4, background: 'rgba(255, 255, 255, 0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: 'text.secondary' }}>
          ✨ Quick Design Presets (Boost Retention & Look)
        </Typography>
        <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
          {presets.map((preset) => (
            <Button
              key={preset.name}
              variant="outlined"
              onClick={() => applyPreset(preset)}
              sx={{
                py: 1,
                px: 2.5,
                borderRadius: 2.5,
                borderColor: 'rgba(255,255,255,0.12)',
                background: 'rgba(255,255,255,0.03)',
                color: 'text.primary',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: 13,
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  borderColor: preset.accent,
                  background: `${preset.accent}15`,
                  transform: 'translateY(-2px)',
                  boxShadow: `0 6px 20px ${preset.accent}25`,
                },
              }}
            >
              {preset.name}
            </Button>
          ))}
        </Box>
      </Card>

      <form onSubmit={handleSave}>
        <Grid container spacing={4}>
          <Grid item xs={12} lg={7}>
            <Card sx={{ p: 3, mb: 3 }}>
              <CardContent sx={{ p: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Base Configurations
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      label="Template Name"
                      fullWidth
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Primary Font Family"
                      fullWidth
                      value={fontFamily}
                      onChange={(e) => setFontFamily(e.target.value)}
                    >
                      {fonts.map((f) => (
                        <MenuItem key={f} value={f}>
                          {f}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Shiki Code Editor Theme"
                      fullWidth
                      value={codeTheme}
                      onChange={(e) => setCodeTheme(e.target.value as any)}
                    >
                      {codeThemes.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography id="font-size-slider" gutterBottom sx={{ fontSize: 13, fontWeight: 600, color: 'text.secondary' }}>
                      Font Size ({fontSize}px)
                    </Typography>
                    <Slider
                      value={fontSize}
                      min={10}
                      max={32}
                      step={1}
                      onChange={(_, val) => setFontSize(val as number)}
                      valueLabelDisplay="auto"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ p: 3, mb: 3 }}>
              <CardContent sx={{ p: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Color & Background Settings
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Background Style"
                      fullWidth
                      value={bgType}
                      onChange={(e) => {
                        const val = e.target.value as 'solid' | 'gradient';
                        setBgType(val);
                        if (val === 'solid') {
                          setBackgroundGradient(null);
                        } else {
                          setBackgroundGradient(backgroundGradient || 'linear-gradient(135deg, #1a1a2e 0%, #7c3aed 100%)');
                        }
                      }}
                    >
                      <MenuItem value="solid">Solid Background Color</MenuItem>
                      <MenuItem value="gradient">Linear Gradient Background</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Particle Animation Effect"
                      fullWidth
                      value={backgroundEffect}
                      onChange={(e) => setBackgroundEffect(e.target.value)}
                    >
                      <MenuItem value="none">None (Static Background)</MenuItem>
                      <MenuItem value="particles">Particles (Floating Neon Sparks)</MenuItem>
                      <MenuItem value="matrix">Matrix (Green Digital Stream)</MenuItem>
                      <MenuItem value="grid">Grid (Cyberpunk Tech Mesh)</MenuItem>
                    </TextField>
                  </Grid>

                  {bgType === 'solid' ? (
                    <Grid item xs={12} sm={4}>
                      <TextField
                        type="color"
                        label="Background Color"
                        fullWidth
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                      />
                    </Grid>
                  ) : (
                    <Grid item xs={12} sm={12}>
                      <TextField
                        label="CSS linear-gradient Value"
                        fullWidth
                        placeholder="linear-gradient(135deg, #1a1a2e 0%, #7c3aed 100%)"
                        value={backgroundGradient || ''}
                        onChange={(e) => setBackgroundGradient(e.target.value)}
                        helperText="Use linear-gradient standard CSS format"
                      />
                    </Grid>
                  )}

                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="color"
                      label="Text Color"
                      fullWidth
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      type="color"
                      label="Accent Color"
                      fullWidth
                      value={accentColor}
                      onChange={(e) => setAccentColor(e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Card sx={{ p: 3, mb: 3 }}>
              <CardContent sx={{ p: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Layout & Animations
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Code Frame Container Shape"
                      fullWidth
                      value={containerStyle}
                      onChange={(e) => setContainerStyle(e.target.value as any)}
                    >
                      <MenuItem value="rounded">Modern Rounded Corner Card</MenuItem>
                      <MenuItem value="sharp">Retro Sharp Console Block</MenuItem>
                      <MenuItem value="floating">Floating Premium Overlay Frame</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Ambient Shadows / Glows"
                      fullWidth
                      value={glowEffect ? 'enabled' : 'disabled'}
                      onChange={(e) => setGlowEffect(e.target.value === 'enabled')}
                    >
                      <MenuItem value="enabled">Enabled (Neon Aesthetic Glow)</MenuItem>
                      <MenuItem value="disabled">Disabled (Clean & Flat)</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Default Scene Entrance"
                      fullWidth
                      value={animationStyle}
                      onChange={(e) => setAnimationStyle(e.target.value as any)}
                    >
                      {animations.map((a) => (
                        <MenuItem key={a} value={a}>
                          {a}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Default Scene Transition"
                      fullWidth
                      value={transitionStyle}
                      onChange={(e) => setTransitionStyle(e.target.value as any)}
                    >
                      {transitions.map((t) => (
                        <MenuItem key={t} value={t}>
                          {t}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              disabled={saving}
              startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 700 }}
            >
              Save Template Changes
            </Button>
          </Grid>

          {/* Real-time preview card */}
          <Grid item xs={12} lg={5}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
              Interactive Sandbox Preview
            </Typography>
            <Box
              sx={{
                borderRadius: 4.5,
                background: actualBg,
                p: 4,
                aspectRatio: '9/16',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                position: 'sticky',
                top: 90,
                overflow: 'hidden',
              }}
            >
              {/* Particle overlay simulation */}
              {backgroundEffect === 'particles' && (
                <>
                  <Box
                    sx={{
                      position: 'absolute',
                      width: 150,
                      height: 150,
                      borderRadius: '50%',
                      bgcolor: accentColor,
                      opacity: 0.16,
                      filter: 'blur(35px)',
                      top: '15%',
                      left: '10%',
                      pointerEvents: 'none',
                      animation: 'pulse 4s infinite alternate',
                    }}
                  />
                  <Box
                    sx={{
                      position: 'absolute',
                      width: 130,
                      height: 130,
                      borderRadius: '50%',
                      bgcolor: accentColor,
                      opacity: 0.12,
                      filter: 'blur(45px)',
                      bottom: '20%',
                      right: '15%',
                      pointerEvents: 'none',
                      animation: 'pulse 3.5s infinite alternate-reverse',
                    }}
                  />
                </>
              )}

              {/* Grid overlay simulation */}
              {backgroundEffect === 'grid' && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.04) 1px, transparent 1px)',
                    backgroundSize: '24px 24px',
                    pointerEvents: 'none',
                  }}
                />
              )}

              {/* Matrix overlay simulation */}
              {backgroundEffect === 'matrix' && (
                <Box
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.12,
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #39ff14 1.2px, transparent 1.2px)',
                    backgroundSize: '12px 20px',
                    pointerEvents: 'none',
                  }}
                />
              )}

              <Typography
                sx={{
                  fontFamily,
                  fontSize: fontSize + 6,
                  color: textColor,
                  fontWeight: 900,
                  textAlign: 'center',
                  mb: 3,
                  zIndex: 1,
                  textShadow: glowEffect ? `0 0 15px ${accentColor}60` : 'none',
                }}
              >
                Sample Scene Header
              </Typography>
              
              {/* Fake IDE */}
              <Box
                sx={{
                  width: '100%',
                  borderRadius: containerStyle === 'sharp' ? 0 : containerStyle === 'floating' ? '24px' : '16px',
                  overflow: 'hidden',
                  background: 'rgba(0,0,0,0.65)',
                  border: containerStyle === 'floating' ? `2px solid ${accentColor}30` : '1px solid rgba(255,255,255,0.06)',
                  boxShadow: glowEffect 
                    ? `0 12px 40px rgba(0,0,0,0.6), 0 0 35px ${accentColor}25` 
                    : '0 8px 32px rgba(0,0,0,0.5)',
                  zIndex: 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  transform: containerStyle === 'floating' ? 'scale(1.02)' : 'scale(1)',
                }}
              >
                {/* Traffic dots */}
                <Box sx={{ display: 'flex', gap: 1, p: 1.5, background: 'rgba(0,0,0,0.3)' }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#27c93f' }} />
                </Box>
                {/* Code area */}
                <Box sx={{ p: 2.5, fontFamily, fontSize, color: textColor, opacity: 0.9 }}>
                  <span style={{ color: '#c792ea' }}>const</span> <span style={{ color: '#82aaff' }}>add</span> = (<span style={{ color: accentColor }}>a</span>, <span style={{ color: accentColor }}>b</span>) =&gt; &#123;
                  <Box sx={{ pl: 2 }}>
                    <span style={{ color: '#c792ea' }}>return</span> a + b;
                  </Box>
                  &#125;;
                </Box>
              </Box>

              <Box
                sx={{
                  mt: 4,
                  px: 3,
                  py: 1,
                  borderRadius: containerStyle === 'sharp' ? 0 : 50,
                  bgcolor: accentColor,
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 900,
                  boxShadow: glowEffect ? `0 4px 18px ${accentColor}60` : 'none',
                  zIndex: 1,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                  border: '1px solid rgba(255,255,255,0.15)',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                SUBSCRIBE
              </Box>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
