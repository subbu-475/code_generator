// ============================================================
// Create/Edit Project Form Component
// ============================================================

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Typography,
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  Card,
  CardContent,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  CircularProgress,
  Checkbox,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { useProjects } from '../../hooks/useProjects.js';
import { useTemplates } from '../../hooks/useTemplates.js';
import * as api from '../../api/client.js';
import type { CodeSnippet, ProgrammingLanguage, AudioMode } from '../../types/index.js';
import CodeEditor from '../common/CodeEditor.js';

export default function ProjectForm() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const { createProject, updateProject } = useProjects();
  const { templates, loading: templatesLoading } = useTemplates();

  const [loadingProject, setLoadingProject] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [language, setLanguage] = useState<ProgrammingLanguage>('javascript');
  const [hookText, setHookText] = useState('');
  const [output, setOutput] = useState('');
  const [cta, setCta] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [audioMode, setAudioMode] = useState<AudioMode>('none');
  const [musicFile, setMusicFile] = useState('');
  const [explanationTemplate, setExplanationTemplate] = useState<'none' | 'step_by_step' | 'refactor' | 'spotlight'>('none');
  const [sfxWhoosh, setSfxWhoosh] = useState(true);
  const [sfxTyping, setSfxTyping] = useState(true);
  const [sfxAchievement, setSfxAchievement] = useState(true);
  const [ttsExplanation, setTtsExplanation] = useState(true);
  const [ttsOutput, setTtsOutput] = useState(true);

  // Multiple Code Snippets
  const [snippets, setSnippets] = useState<CodeSnippet[]>([
    { id: '', title: 'Main Snippet', code: '', language: 'javascript' },
  ]);

  // Load project if editing
  useEffect(() => {
    if (isEdit && id) {
      async function loadProject() {
        try {
          setLoadingProject(true);
          const p = await api.getProject(id!);
          setTitle(p.title);
          setLanguage(p.language);
          setHookText(p.hook_text);
          setOutput(p.output);
          setCta(p.cta);
          setTemplateId(p.template_id || '');
          setAudioMode(p.audio_mode);
          setMusicFile(p.music_file || '');
          setExplanationTemplate((p as any).explanation_template || 'none');
          setSfxWhoosh(p.sfx_whoosh !== false);
          setSfxTyping(p.sfx_typing !== false);
          setSfxAchievement(p.sfx_achievement !== false);
          setTtsExplanation(p.tts_explanation !== false);
          setTtsOutput((p as any).tts_output !== false);
          
          if (p.code_snippets) {
            const parsed = JSON.parse(p.code_snippets) as CodeSnippet[];
            if (parsed.length > 0) {
              setSnippets(parsed);
            }
          }
        } catch (err) {
          console.error('Failed to load project:', err);
          alert('Failed to load project details.');
          navigate('/projects');
        } finally {
          setLoadingProject(false);
        }
      }
      loadProject();
    }
  }, [isEdit, id, navigate]);

  // Set default template once loaded
  useEffect(() => {
    if (!templateId && templates.length > 0) {
      const def = templates.find((t) => t.is_default) || templates[0];
      setTemplateId(def.id);
    }
  }, [templates, templateId]);

  const handleAddSnippet = () => {
    setSnippets([
      ...snippets,
      { id: '', title: `Snippet ${snippets.length + 1}`, code: '', language },
    ]);
  };

  const handleRemoveSnippet = (idx: number) => {
    if (snippets.length === 1) return;
    setSnippets(snippets.filter((_, i) => i !== idx));
  };

  const handleSnippetChange = (idx: number, field: keyof CodeSnippet, value: string) => {
    setSnippets(
      snippets.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSaving(true);
      const payload = {
        title,
        language,
        hook_text: hookText,
        code_snippets: snippets.map((s) => ({
          ...s,
          language: s.language || language,
        })),
        output,
        cta,
        template_id: templateId || undefined,
        audio_mode: audioMode,
        music_file: musicFile || undefined,
        explanation_template: explanationTemplate,
        sfx_whoosh: sfxWhoosh,
        sfx_typing: sfxTyping,
        sfx_achievement: sfxAchievement,
        tts_explanation: ttsExplanation,
        tts_output: ttsOutput,
      };

      if (isEdit && id) {
        await updateProject(id, payload);
        navigate(`/projects/${id}`);
      } else {
        const created = await createProject(payload);
        navigate(`/projects/${created.id}`);
      }
    } catch (err) {
      console.error('Failed to save project:', err);
      alert(err instanceof Error ? err.message : 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  if (loadingProject) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
        <CircularProgress />
      </Box>
    );
  }

  const languages: { value: ProgrammingLanguage; label: string }[] = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'jsx', label: 'React JSX' },
    { value: 'tsx', label: 'React TSX' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'csharp', label: 'C#' },
    { value: 'php', label: 'PHP' },
  ];

  const musicTracks = [
    { value: '', label: 'None' },
    { value: 'chill-lofi.mp3', label: 'Chill Lofi Beat' },
    { value: 'synthwave.mp3', label: 'Synthwave Neon' },
    { value: 'corporate-tech.mp3', label: 'Corporate Modern Tech' },
    { value: 'ambient.mp3', label: 'Ambient Deep Space' },
  ];

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease' }}>
      {/* Header back */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate(isEdit ? `/projects/${id}` : '/projects')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          {isEdit ? 'Edit Project' : 'Create Project'}
        </Typography>
      </Box>

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Card sx={{ p: 3, mb: 3 }}>
              <CardContent sx={{ p: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Video Details
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={8}>
                    <TextField
                      label="Project Title"
                      fullWidth
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. 5 Array Methods Every Developer Uses"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      select
                      label="Programming Language"
                      fullWidth
                      value={language}
                      onChange={(e) => {
                        const lang = e.target.value as ProgrammingLanguage;
                        setLanguage(lang);
                        setSnippets(snippets.map((s) => ({ ...s, language: lang })));
                      }}
                    >
                      {languages.map((l) => (
                        <MenuItem key={l.value} value={l.value}>
                          {l.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      label="Hook Text"
                      fullWidth
                      value={hookText}
                      onChange={(e) => setHookText(e.target.value)}
                      placeholder="e.g. Stop using loops for everything!"
                      helperText="This text grabs the viewer's attention in the first 3 seconds."
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      select
                      label="Explanation Layout Template"
                      fullWidth
                      value={explanationTemplate}
                      onChange={(e) => setExplanationTemplate(e.target.value as any)}
                      helperText="Choose a pre-defined AI-free code explanation sequence for your scenes."
                    >
                      <MenuItem value="none">Standard Layout (Direct Hook & Code)</MenuItem>
                      <MenuItem value="step_by_step">Step-by-Step Tutorial (Hook → Code → Step 1 → Step 2 → Output → CTA)</MenuItem>
                      <MenuItem value="refactor">Before & After Refactoring (Hook → Old Code → Tip → New Code → CTA)</MenuItem>
                      <MenuItem value="spotlight">API Feature Spotlight (Hook → Code → Highlight Tip → Output → CTA)</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Code Snippets Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Code Snippets
              </Typography>
              <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAddSnippet} size="small">
                Add Snippet
              </Button>
            </Box>

            {snippets.map((snippet, idx) => (
              <Card key={idx} sx={{ p: 3, mb: 3, position: 'relative' }}>
                {snippets.length > 1 && (
                  <IconButton
                    onClick={() => handleRemoveSnippet(idx)}
                    color="error"
                    sx={{ position: 'absolute', top: 12, right: 12 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
                <Grid container spacing={3} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={8}>
                    <TextField
                      label="Snippet Title"
                      size="small"
                      fullWidth
                      value={snippet.title}
                      onChange={(e) => handleSnippetChange(idx, 'title', e.target.value)}
                      placeholder="e.g. Map method basic"
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      select
                      label="Snippet Language"
                      size="small"
                      fullWidth
                      value={snippet.language || language}
                      onChange={(e) => handleSnippetChange(idx, 'language', e.target.value)}
                    >
                      {languages.map((l) => (
                        <MenuItem key={l.value} value={l.value}>
                          {l.label}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>
                <Grid container spacing={3} sx={{ mb: 2.5 }}>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Snippet Hook (Optional)"
                      size="small"
                      fullWidth
                      value={(snippet as any).hook || ''}
                      onChange={(e) => handleSnippetChange(idx, 'hook', e.target.value)}
                      placeholder="e.g. Stop using loops!"
                      helperText="Pops up introducing this snippet"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Snippet Explanation (Optional)"
                      size="small"
                      fullWidth
                      value={(snippet as any).explanation || ''}
                      onChange={(e) => handleSnippetChange(idx, 'explanation', e.target.value)}
                      placeholder="e.g. Map allocates new memory"
                      helperText="Text note scene before the code"
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <TextField
                      label="Snippet Output / Result (Optional)"
                      size="small"
                      fullWidth
                      value={snippet.output || ''}
                      onChange={(e) => handleSnippetChange(idx, 'output', e.target.value)}
                      placeholder="e.g. [2, 4, 6]"
                      helperText="Terminal output for this snippet"
                    />
                  </Grid>
                </Grid>
                <Box sx={{ mb: 2 }}>
                  <FormLabel sx={{ display: 'block', mb: 1, fontSize: 13, fontWeight: 600 }}>Code</FormLabel>
                  <CodeEditor
                    value={snippet.code}
                    onChange={(val) => handleSnippetChange(idx, 'code', val)}
                    language={snippet.language || language}
                  />
                </Box>
              </Card>
            ))}

            <Card sx={{ p: 3, mb: 3 }}>
              <CardContent sx={{ p: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Conclusion & Call-to-Action
                </Typography>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Output / Result"
                      fullWidth
                      value={output}
                      onChange={(e) => setOutput(e.target.value)}
                      placeholder="e.g. [2,4,6]"
                      helperText="Displays terminal execution result"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      label="Call to Action (CTA)"
                      fullWidth
                      value={cta}
                      onChange={(e) => setCta(e.target.value)}
                      placeholder="e.g. Follow for Daily JavaScript!"
                      helperText="Encourages viewer to subscribe or follow"
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} lg={4}>
            {/* Design & Theme Settings */}
            <Card sx={{ p: 3, mb: 3 }}>
              <CardContent sx={{ p: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                  Design Settings
                </Typography>
                <Box sx={{ mb: 3 }}>
                  <TextField
                    select
                    label="Video Theme Template"
                    fullWidth
                    value={templateId}
                    onChange={(e) => setTemplateId(e.target.value)}
                    disabled={templatesLoading}
                  >
                    {templates.map((t) => (
                      <MenuItem key={t.id} value={t.id}>
                        {t.name} {t.is_default ? '(Default)' : ''}
                      </MenuItem>
                    ))}
                  </TextField>
                </Box>

                <FormControl component="fieldset" sx={{ mb: 3, display: 'block' }}>
                  <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>Audio Narration Mode</FormLabel>
                  <RadioGroup
                    value={audioMode}
                    onChange={(e) => setAudioMode(e.target.value as AudioMode)}
                  >
                    <FormControlLabel value="none" control={<Radio />} label="No Audio / Silent" />
                    <FormControlLabel value="music" control={<Radio />} label="Background Music Only" />
                    <FormControlLabel value="voice_music" control={<Radio />} label="Voice + Background Music" />
                  </RadioGroup>
                </FormControl>

                {(audioMode === 'music' || audioMode === 'voice_music') && (
                  <TextField
                    select
                    label="Select Track"
                    fullWidth
                    value={musicFile}
                    onChange={(e) => setMusicFile(e.target.value)}
                    sx={{ mb: 3 }}
                  >
                    {musicTracks.map((track) => (
                      <MenuItem key={track.value} value={track.value}>
                        {track.label}
                      </MenuItem>
                    ))}
                  </TextField>
                )}

                <FormControl component="fieldset" sx={{ mt: 1, display: 'block' }}>
                  <FormLabel component="legend" sx={{ fontWeight: 600, mb: 1 }}>Sound & Voice Options</FormLabel>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={sfxWhoosh}
                          onChange={(e) => setSfxWhoosh(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Hook Intro Whoosh SFX"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={sfxTyping}
                          onChange={(e) => setSfxTyping(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Coding Typing SFX"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={sfxAchievement}
                          onChange={(e) => setSfxAchievement(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Output Success SFX"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={ttsExplanation}
                          onChange={(e) => setTtsExplanation(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Explanation TTS Voiceover"
                      disabled={audioMode !== 'voice_music'}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={ttsOutput}
                          onChange={(e) => setTtsOutput(e.target.checked)}
                          color="primary"
                        />
                      }
                      label="Output TTS Voiceover"
                      disabled={audioMode !== 'voice_music'}
                    />
                  </Box>
                </FormControl>
              </CardContent>
            </Card>

            {/* Save Buttons */}
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                fullWidth
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
                sx={{ py: 1.5, borderRadius: 2.5, fontWeight: 700 }}
              >
                {saving ? 'Saving...' : 'Save Project'}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    </Box>
  );
}
