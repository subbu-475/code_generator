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
  Slider,
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
  const [explanationTemplate, setExplanationTemplate] = useState<'none' | 'step_by_step' | 'refactor' | 'spotlight' | 'quiz_generator' | 'guess_output' | 'interview_question' | 'bugfix' | 'oneliner' | 'comparison' | 'roadmap'>('none');
  const [sfxWhoosh, setSfxWhoosh] = useState(true);
  const [sfxTyping, setSfxTyping] = useState(true);
  const [sfxAchievement, setSfxAchievement] = useState(true);
  const [ttsExplanation, setTtsExplanation] = useState(true);
  const [ttsOutput, setTtsOutput] = useState(true);
  const [musicVolume, setMusicVolume] = useState<number>(15);
  const [voiceVolume, setVoiceVolume] = useState<number>(100);

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
          setMusicVolume(p.music_volume !== undefined ? Math.round(p.music_volume * 100) : 15);
          setVoiceVolume(p.voice_volume !== undefined ? Math.round(p.voice_volume * 100) : 100);
          
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

  // Migration logic when Video Type dropdown changes
  useEffect(() => {
    if (!snippets || snippets.length === 0) return;
    
    const first = snippets[0];
    if (explanationTemplate === 'quiz_generator' && !first.quizOptions) {
      setSnippets([{
        id: '',
        title: 'Quiz Challenge',
        code: '',
        language,
        quizQuestion: 'What is the output of this code?',
        quizOptions: ['Option A', 'Option B', 'Option C', 'Option D'],
        quizCorrectIndex: 0,
        quizExplanation: 'This is because...',
        quizRevealDelay: 90,
      }]);
    } else if (explanationTemplate === 'guess_output' && first.guessRevealDelay === undefined) {
      setSnippets([{
        id: '',
        title: 'Guess The Output',
        code: '',
        language,
        guessCode: '',
        guessLanguage: language,
        guessAnswer: '',
        guessRevealDelay: 90,
      }]);
    } else if (explanationTemplate === 'interview_question' && !first.interviewDifficulty) {
      setSnippets([{
        id: '',
        title: 'What is a closure?',
        code: '',
        language,
        interviewDifficulty: 'medium',
        interviewCategory: 'JavaScript',
        interviewAnswer: 'A closure is a function that retains access to its outer scope variables.',
      }]);
    } else if (explanationTemplate === 'bugfix' && !first.buggyCode) {
      setSnippets([{
        id: '',
        title: 'Bug Fix Challenge',
        code: '',
        language,
        bugLanguage: language,
        buggyCode: 'if (x = 5) { /* ... */ }',
        fixedCode: 'if (x === 5) { /* ... */ }',
        bugExplanation: 'Use === for comparison, not = which is assignment.',
      }]);
    } else if (explanationTemplate === 'oneliner' && !first.onelinerCode) {
      setSnippets([{
        id: '',
        title: 'One-Line Trick',
        code: '',
        language,
        onelinerLanguage: language,
        onelinerCode: 'const unique = [...new Set(arr)];',
        onelinerExplanation: 'Set removes duplicates, spread converts back to array.',
      }]);
    } else if (explanationTemplate === 'comparison' && !first.comparisonLeftCode) {
      setSnippets([{
        id: '',
        title: 'Comparison',
        code: '',
        language,
        comparisonLeftTitle: 'Approach A',
        comparisonRightTitle: 'Approach B',
        comparisonLeftCode: '// Left approach',
        comparisonRightCode: '// Right approach',
        comparisonLeftLanguage: language,
        comparisonRightLanguage: language,
        comparisonVerdict: 'Both have their use cases!',
      }]);
    } else if (explanationTemplate === 'roadmap' && !first.roadmapIcon) {
      setSnippets([{
        id: '',
        title: 'Step 1: HTML & CSS',
        code: '',
        language,
        roadmapStepNumber: 1,
        roadmapTotalSteps: 3,
        roadmapIcon: '📚',
        roadmapDescription: 'Learn basic structure and styling.',
      }]);
    } else if (['none', 'step_by_step', 'refactor', 'spotlight'].includes(explanationTemplate) && (first.quizOptions || first.guessRevealDelay !== undefined || first.roadmapIcon || first.comparisonLeftCode || first.buggyCode)) {
      setSnippets([{
        id: '',
        title: 'Main Snippet',
        code: '',
        language,
      }]);
    }
  }, [explanationTemplate, language]);

  const handleAddSnippet = () => {
    const defaultSnippet: CodeSnippet = {
      id: '',
      title: explanationTemplate === 'roadmap' ? `Step ${snippets.length + 1}` : `Snippet ${snippets.length + 1}`,
      code: '',
      language,
    };

    if (explanationTemplate === 'quiz_generator') {
      defaultSnippet.quizQuestion = 'What is the output?';
      defaultSnippet.quizOptions = ['', '', '', ''];
      defaultSnippet.quizCorrectIndex = 0;
      defaultSnippet.quizExplanation = '';
      defaultSnippet.quizRevealDelay = 90;
    } else if (explanationTemplate === 'guess_output') {
      defaultSnippet.guessLanguage = language;
      defaultSnippet.guessAnswer = '';
      defaultSnippet.guessRevealDelay = 90;
    } else if (explanationTemplate === 'interview_question') {
      defaultSnippet.interviewDifficulty = 'medium';
      defaultSnippet.interviewCategory = '';
      defaultSnippet.interviewAnswer = '';
    } else if (explanationTemplate === 'bugfix') {
      defaultSnippet.bugLanguage = language;
      defaultSnippet.buggyCode = '';
      defaultSnippet.fixedCode = '';
      defaultSnippet.bugExplanation = '';
    } else if (explanationTemplate === 'oneliner') {
      defaultSnippet.onelinerLanguage = language;
      defaultSnippet.onelinerCode = '';
      defaultSnippet.onelinerExplanation = '';
    } else if (explanationTemplate === 'comparison') {
      defaultSnippet.comparisonLeftTitle = 'Approach A';
      defaultSnippet.comparisonRightTitle = 'Approach B';
      defaultSnippet.comparisonLeftCode = '';
      defaultSnippet.comparisonRightCode = '';
      defaultSnippet.comparisonLeftLanguage = language;
      defaultSnippet.comparisonRightLanguage = language;
      defaultSnippet.comparisonVerdict = '';
    } else if (explanationTemplate === 'roadmap') {
      defaultSnippet.roadmapStepNumber = snippets.length + 1;
      defaultSnippet.roadmapTotalSteps = snippets.length + 1;
      defaultSnippet.roadmapIcon = '📚';
      defaultSnippet.roadmapDescription = '';
    }

    setSnippets([...snippets, defaultSnippet]);
  };

  const handleQuizOptionChange = (sIdx: number, optIdx: number, val: string) => {
    setSnippets(snippets.map((s, idx) => {
      if (idx !== sIdx) return s;
      const optsCopy = [...(s.quizOptions || ['', '', '', ''])];
      optsCopy[optIdx] = val;
      return { ...s, quizOptions: optsCopy };
    }));
  };

  const handleRemoveSnippet = (idx: number) => {
    if (snippets.length === 1) return;
    setSnippets(snippets.filter((_, i) => i !== idx));
  };

  const handleSnippetChange = (idx: number, field: keyof CodeSnippet, value: any) => {
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
        music_volume: musicVolume / 100,
        voice_volume: voiceVolume / 100,
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
                      label="Video Type"
                      fullWidth
                      value={explanationTemplate}
                      onChange={(e) => setExplanationTemplate(e.target.value as any)}
                      helperText="Choose the video format and auto-generated scene sequence."
                    >
                      <MenuItem value="none">Code Short (Standard Hook & Code)</MenuItem>
                      <MenuItem value="step_by_step">Step-by-Step Tutorial (Hook → Code → Steps → Output → CTA)</MenuItem>
                      <MenuItem value="refactor">Before & After Refactoring (Hook → Old Code → Tip → New Code → CTA)</MenuItem>
                      <MenuItem value="spotlight">API Feature Spotlight (Hook → Code → Highlight → Output → CTA)</MenuItem>
                      <MenuItem value="quiz_generator">Quiz Generator (Hook → Code → Quiz → CTA)</MenuItem>
                      <MenuItem value="guess_output">Guess The Output (Hook → Code → Reveal Answer → CTA)</MenuItem>
                      <MenuItem value="interview_question">Interview Question (Hook → Question → Code Answer → CTA)</MenuItem>
                      <MenuItem value="bugfix">Bug Fix Challenge (Hook → Buggy Code → Fixed Code → CTA)</MenuItem>
                      <MenuItem value="oneliner">One-Line Trick (Hook → One-Liners → CTA)</MenuItem>
                      <MenuItem value="comparison">Comparison Video (Hook → Side-by-Side → Verdict → CTA)</MenuItem>
                      <MenuItem value="roadmap">Roadmap Generator (Hook → Step 1 → Step 2 → ... → CTA)</MenuItem>
                    </TextField>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Code Snippets Section */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {explanationTemplate === 'quiz_generator' && 'Quiz Challenges'}
                {explanationTemplate === 'guess_output' && 'Guess The Output Challenges'}
                {explanationTemplate === 'interview_question' && 'Interview Questions'}
                {explanationTemplate === 'bugfix' && 'Bug Fix Configuration'}
                {explanationTemplate === 'oneliner' && 'One-Line Tricks'}
                {explanationTemplate === 'comparison' && 'Comparison Configuration'}
                {explanationTemplate === 'roadmap' && 'Roadmap Steps'}
                {['none', 'step_by_step', 'refactor', 'spotlight'].includes(explanationTemplate) && 'Code Snippets'}
              </Typography>
              {!['bugfix', 'comparison'].includes(explanationTemplate) && (
                <Button startIcon={<AddIcon />} variant="outlined" onClick={handleAddSnippet} size="small">
                  {explanationTemplate === 'quiz_generator' && 'Add Quiz'}
                  {explanationTemplate === 'guess_output' && 'Add Challenge'}
                  {explanationTemplate === 'interview_question' && 'Add Question'}
                  {explanationTemplate === 'roadmap' && 'Add Step'}
                  {explanationTemplate === 'oneliner' && 'Add Trick'}
                  {['none', 'step_by_step', 'refactor', 'spotlight'].includes(explanationTemplate) && 'Add Snippet'}
                </Button>
              )}
            </Box>

            {snippets.map((snippet, idx) => (
              <Card key={idx} sx={{ p: 3, mb: 3, position: 'relative' }}>
                {snippets.length > 1 && !['bugfix', 'comparison'].includes(explanationTemplate) && (
                  <IconButton
                    onClick={() => handleRemoveSnippet(idx)}
                    color="error"
                    sx={{ position: 'absolute', top: 12, right: 12 }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}

                {/* 1. Standard Code Snippet Form */}
                {['none', 'step_by_step', 'refactor', 'spotlight'].includes(explanationTemplate) && (
                  <>
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
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                          <TextField
                            select
                            label="Emoji"
                            size="small"
                            value={snippet.hookEmoji || ''}
                            onChange={(e) => handleSnippetChange(idx, 'hookEmoji', e.target.value)}
                            sx={{ minWidth: 80, maxWidth: 80, '& .MuiSelect-select': { fontSize: 20, textAlign: 'center' } }}
                          >
                            <MenuItem value="">None</MenuItem>
                            {['🔥','⚡','💡','🚀','✨','🎯','💻','🧠','⭐','🏆','💎','🎉','👀','💥','🛠️','📌','🔑','🎨','📢','⚠️'].map((emoji) => (
                              <MenuItem key={emoji} value={emoji} sx={{ fontSize: 20, justifyContent: 'center' }}>
                                {emoji}
                              </MenuItem>
                            ))}
                          </TextField>
                          <TextField
                            label="Snippet Hook (Optional)"
                            size="small"
                            fullWidth
                            value={snippet.hook || ''}
                            onChange={(e) => handleSnippetChange(idx, 'hook', e.target.value)}
                            placeholder="e.g. Stop using loops!"
                            helperText="Pops up introducing this snippet"
                          />
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, pt: 0.5 }}>
                            <Box
                              component="label"
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 1,
                                border: '2px solid',
                                borderColor: 'divider',
                                backgroundColor: snippet.hookColor || '#ffffff',
                                cursor: 'pointer',
                                display: 'block',
                                position: 'relative',
                                overflow: 'hidden',
                                transition: 'border-color 0.2s',
                                '&:hover': { borderColor: 'primary.main' },
                              }}
                            >
                              <input
                                type="color"
                                value={snippet.hookColor || '#ffffff'}
                                onChange={(e) => handleSnippetChange(idx, 'hookColor', e.target.value)}
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  opacity: 0,
                                  cursor: 'pointer',
                                }}
                              />
                            </Box>
                            <Box
                              component="span"
                              sx={{ fontSize: 9, color: 'text.secondary', fontFamily: 'monospace', cursor: 'pointer' }}
                              onClick={() => handleSnippetChange(idx, 'hookColor', '')}
                              title="Click to reset color"
                            >
                              {snippet.hookColor ? snippet.hookColor.toUpperCase() : 'Auto'}
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                      <Grid item xs={12} md={4}>
                        <TextField
                          label="Snippet Explanation (Optional)"
                          size="small"
                          fullWidth
                          value={snippet.explanation || ''}
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
                          multiline
                          minRows={2}
                          maxRows={6}
                          value={snippet.output || ''}
                          onChange={(e) => handleSnippetChange(idx, 'output', e.target.value)}
                          placeholder={"e.g.\nJohn\n25"}
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
                  </>
                )}

                {/* 2. Quiz Generator Form */}
                {explanationTemplate === 'quiz_generator' && (
                  <>
                    <Grid container spacing={3} sx={{ mb: 2 }}>
                      <Grid item xs={12}>
                        <TextField
                          label="Quiz Question"
                          size="small"
                          fullWidth
                          value={snippet.quizQuestion || ''}
                          onChange={(e) => handleSnippetChange(idx, 'quizQuestion', e.target.value)}
                          placeholder="e.g. What does this code print?"
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={3} sx={{ mb: 2 }}>
                      {[0, 1, 2, 3].map((optIdx) => (
                        <Grid item xs={12} sm={6} key={optIdx}>
                          <TextField
                            label={`Option ${String.fromCharCode(65 + optIdx)}`}
                            size="small"
                            fullWidth
                            value={(snippet.quizOptions && snippet.quizOptions[optIdx]) || ''}
                            onChange={(e) => handleQuizOptionChange(idx, optIdx, e.target.value)}
                            placeholder={`Choice ${optIdx + 1}`}
                          />
                        </Grid>
                      ))}
                    </Grid>
                    <Grid container spacing={3} sx={{ mb: 2.5 }}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          select
                          label="Correct Option"
                          size="small"
                          fullWidth
                          value={snippet.quizCorrectIndex !== undefined ? snippet.quizCorrectIndex : 0}
                          onChange={(e) => handleSnippetChange(idx, 'quizCorrectIndex', Number(e.target.value))}
                        >
                          {[0, 1, 2, 3].map((i) => (
                            <MenuItem key={i} value={i}>
                              Option {String.fromCharCode(65 + i)}
                            </MenuItem>
                          ))}
                        </TextField>
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
                      <Grid item xs={12} sm={4}>
                        <TextField
                          select
                          label="Reveal Delay"
                          size="small"
                          fullWidth
                          value={snippet.quizRevealDelay !== undefined ? snippet.quizRevealDelay : 90}
                          onChange={(e) => handleSnippetChange(idx, 'quizRevealDelay', Number(e.target.value))}
                        >
                          {[30, 45, 60, 75, 90, 105, 120, 135].map((frames) => (
                            <MenuItem key={frames} value={frames}>
                              {Math.round((frames / 30) * 10) / 10}s ({frames} frames)
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Explanation (Optional)"
                          size="small"
                          fullWidth
                          multiline
                          rows={2}
                          value={snippet.quizExplanation || ''}
                          onChange={(e) => handleSnippetChange(idx, 'quizExplanation', e.target.value)}
                          placeholder="e.g. Because JavaScript arrays are objects"
                        />
                      </Grid>
                    </Grid>
                    <Box sx={{ mb: 2 }}>
                      <FormLabel sx={{ display: 'block', mb: 1, fontSize: 13, fontWeight: 600 }}>Code Block</FormLabel>
                      <CodeEditor
                        value={snippet.code}
                        onChange={(val) => handleSnippetChange(idx, 'code', val)}
                        language={snippet.language || language}
                      />
                    </Box>
                  </>
                )}

                {/* 3. Guess The Output Form */}
                {explanationTemplate === 'guess_output' && (
                  <>
                    <Grid container spacing={3} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={8}>
                        <TextField
                          label="Reveal Answer / Output"
                          size="small"
                          fullWidth
                          value={snippet.guessAnswer || ''}
                          onChange={(e) => handleSnippetChange(idx, 'guessAnswer', e.target.value)}
                          placeholder="e.g. undefined"
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          select
                          label="Reveal Delay"
                          size="small"
                          fullWidth
                          value={snippet.guessRevealDelay !== undefined ? snippet.guessRevealDelay : 90}
                          onChange={(e) => handleSnippetChange(idx, 'guessRevealDelay', Number(e.target.value))}
                        >
                          {[30, 45, 60, 75, 90, 105, 120, 135].map((frames) => (
                            <MenuItem key={frames} value={frames}>
                              {Math.round((frames / 30) * 10) / 10}s ({frames} frames)
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          select
                          label="Snippet Language"
                          size="small"
                          fullWidth
                          value={snippet.guessLanguage || language}
                          onChange={(e) => handleSnippetChange(idx, 'guessLanguage', e.target.value as any)}
                        >
                          {languages.map((l) => (
                            <MenuItem key={l.value} value={l.value}>
                              {l.label}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </Grid>
                    <Box sx={{ mb: 2 }}>
                      <FormLabel sx={{ display: 'block', mb: 1, fontSize: 13, fontWeight: 600 }}>Code Snippet</FormLabel>
                      <CodeEditor
                        value={snippet.guessCode || snippet.code || ''}
                        onChange={(val) => {
                          handleSnippetChange(idx, 'guessCode', val);
                          handleSnippetChange(idx, 'code', val);
                        }}
                        language={snippet.guessLanguage || snippet.language || language}
                      />
                    </Box>
                  </>
                )}

                {/* 4. Interview Question Form */}
                {explanationTemplate === 'interview_question' && (
                  <>
                    <Grid container spacing={3} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Category (e.g. JavaScript, CSS)"
                          size="small"
                          fullWidth
                          value={snippet.interviewCategory || ''}
                          onChange={(e) => handleSnippetChange(idx, 'interviewCategory', e.target.value)}
                          placeholder="e.g. Data Structures"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Difficulty"
                          size="small"
                          fullWidth
                          value={snippet.interviewDifficulty || 'medium'}
                          onChange={(e) => handleSnippetChange(idx, 'interviewDifficulty', e.target.value)}
                        >
                          <MenuItem value="easy">Easy</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="hard">Hard</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Question Title / Text"
                          size="small"
                          fullWidth
                          value={snippet.title || ''}
                          onChange={(e) => handleSnippetChange(idx, 'title', e.target.value)}
                          placeholder="e.g. What is the difference between map and filter?"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Answer Description"
                          size="small"
                          fullWidth
                          multiline
                          rows={3}
                          value={snippet.interviewAnswer || ''}
                          onChange={(e) => handleSnippetChange(idx, 'interviewAnswer', e.target.value)}
                          placeholder="Explain the answer in details..."
                        />
                      </Grid>
                    </Grid>
                    <Box sx={{ mb: 2 }}>
                      <FormLabel sx={{ display: 'block', mb: 1, fontSize: 13, fontWeight: 600 }}>Code Example (Optional)</FormLabel>
                      <CodeEditor
                        value={snippet.code || ''}
                        onChange={(val) => handleSnippetChange(idx, 'code', val)}
                        language={snippet.language || language}
                      />
                    </Box>
                  </>
                )}

                {/* 5. Bug Fix Challenge Form */}
                {explanationTemplate === 'bugfix' && (
                  <>
                    <Grid container spacing={3} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Snippet Language"
                          size="small"
                          fullWidth
                          value={snippet.bugLanguage || language}
                          onChange={(e) => handleSnippetChange(idx, 'bugLanguage', e.target.value as any)}
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
                          label="Fix Explanation"
                          size="small"
                          fullWidth
                          multiline
                          rows={2}
                          value={snippet.bugExplanation || ''}
                          onChange={(e) => handleSnippetChange(idx, 'bugExplanation', e.target.value)}
                          placeholder="e.g. Use === instead of = for correct comparison."
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={3} sx={{ mb: 2 }}>
                      <Grid item xs={12} md={6}>
                        <FormLabel sx={{ display: 'block', mb: 1, fontSize: 13, fontWeight: 600 }}>Buggy Code</FormLabel>
                        <CodeEditor
                          value={snippet.buggyCode || ''}
                          onChange={(val) => {
                            handleSnippetChange(idx, 'buggyCode', val);
                            handleSnippetChange(idx, 'code', val);
                          }}
                          language={snippet.bugLanguage || snippet.language || language}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormLabel sx={{ display: 'block', mb: 1, fontSize: 13, fontWeight: 600 }}>Fixed Code</FormLabel>
                        <CodeEditor
                          value={snippet.fixedCode || ''}
                          onChange={(val) => handleSnippetChange(idx, 'fixedCode', val)}
                          language={snippet.bugLanguage || snippet.language || language}
                        />
                      </Grid>
                    </Grid>
                  </>
                )}

                {/* 6. One-Line Trick Form */}
                {explanationTemplate === 'oneliner' && (
                  <>
                    <Grid container spacing={3} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Snippet Language"
                          size="small"
                          fullWidth
                          value={snippet.onelinerLanguage || language}
                          onChange={(e) => handleSnippetChange(idx, 'onelinerLanguage', e.target.value as any)}
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
                          label="Explanation / Trick Note"
                          size="small"
                          fullWidth
                          multiline
                          rows={2}
                          value={snippet.onelinerExplanation || ''}
                          onChange={(e) => handleSnippetChange(idx, 'onelinerExplanation', e.target.value)}
                          placeholder="Explain how this trick works..."
                        />
                      </Grid>
                    </Grid>
                    <Box sx={{ mb: 2 }}>
                      <FormLabel sx={{ display: 'block', mb: 1, fontSize: 13, fontWeight: 600 }}>One-Liner Code</FormLabel>
                      <CodeEditor
                        value={snippet.onelinerCode || snippet.code || ''}
                        onChange={(val) => {
                          handleSnippetChange(idx, 'onelinerCode', val);
                          handleSnippetChange(idx, 'code', val);
                        }}
                        language={snippet.onelinerLanguage || snippet.language || language}
                      />
                    </Box>
                  </>
                )}

                {/* 7. Comparison Video Form */}
                {explanationTemplate === 'comparison' && (
                  <>
                    <Grid container spacing={3} sx={{ mb: 2 }}>
                      <Grid item xs={12}>
                        <TextField
                          label="Verdict Explanation"
                          size="small"
                          fullWidth
                          multiline
                          rows={2}
                          value={snippet.comparisonVerdict || ''}
                          onChange={(e) => handleSnippetChange(idx, 'comparisonVerdict', e.target.value)}
                          placeholder="e.g. Choose REST for simplicity, GraphQL for query flexibility."
                        />
                      </Grid>
                    </Grid>
                    <Grid container spacing={3} sx={{ mb: 2 }}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Left Comparison Side</Typography>
                        <TextField
                          label="Left Title"
                          size="small"
                          fullWidth
                          value={snippet.comparisonLeftTitle || ''}
                          onChange={(e) => handleSnippetChange(idx, 'comparisonLeftTitle', e.target.value)}
                          placeholder="e.g. Approach A"
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          select
                          label="Left Language"
                          size="small"
                          fullWidth
                          value={snippet.comparisonLeftLanguage || language}
                          onChange={(e) => handleSnippetChange(idx, 'comparisonLeftLanguage', e.target.value as any)}
                          sx={{ mb: 2 }}
                        >
                          {languages.map((l) => (
                            <MenuItem key={l.value} value={l.value}>
                              {l.label}
                            </MenuItem>
                          ))}
                        </TextField>
                        <FormLabel sx={{ display: 'block', mb: 1, fontSize: 13, fontWeight: 600 }}>Left Code</FormLabel>
                        <CodeEditor
                          value={snippet.comparisonLeftCode || ''}
                          onChange={(val) => {
                            handleSnippetChange(idx, 'comparisonLeftCode', val);
                            handleSnippetChange(idx, 'code', val);
                          }}
                          language={snippet.comparisonLeftLanguage || snippet.language || language}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>Right Comparison Side</Typography>
                        <TextField
                          label="Right Title"
                          size="small"
                          fullWidth
                          value={snippet.comparisonRightTitle || ''}
                          onChange={(e) => handleSnippetChange(idx, 'comparisonRightTitle', e.target.value)}
                          placeholder="e.g. Approach B"
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          select
                          label="Right Language"
                          size="small"
                          fullWidth
                          value={snippet.comparisonRightLanguage || language}
                          onChange={(e) => handleSnippetChange(idx, 'comparisonRightLanguage', e.target.value as any)}
                          sx={{ mb: 2 }}
                        >
                          {languages.map((l) => (
                            <MenuItem key={l.value} value={l.value}>
                              {l.label}
                            </MenuItem>
                          ))}
                        </TextField>
                        <FormLabel sx={{ display: 'block', mb: 1, fontSize: 13, fontWeight: 600 }}>Right Code</FormLabel>
                        <CodeEditor
                          value={snippet.comparisonRightCode || ''}
                          onChange={(val) => handleSnippetChange(idx, 'comparisonRightCode', val)}
                          language={snippet.comparisonRightLanguage || snippet.language || language}
                        />
                      </Grid>
                    </Grid>
                  </>
                )}

                {/* 8. Roadmap Generator Form */}
                {explanationTemplate === 'roadmap' && (
                  <>
                    <Grid container spacing={3} sx={{ mb: 2 }}>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Step Number"
                          size="small"
                          fullWidth
                          type="number"
                          value={snippet.roadmapStepNumber !== undefined ? snippet.roadmapStepNumber : idx + 1}
                          onChange={(e) => handleSnippetChange(idx, 'roadmapStepNumber', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Total Steps"
                          size="small"
                          fullWidth
                          type="number"
                          value={snippet.roadmapTotalSteps !== undefined ? snippet.roadmapTotalSteps : snippets.length}
                          onChange={(e) => handleSnippetChange(idx, 'roadmapTotalSteps', Number(e.target.value))}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Step Icon (Emoji)"
                          size="small"
                          fullWidth
                          value={snippet.roadmapIcon || '📚'}
                          onChange={(e) => handleSnippetChange(idx, 'roadmapIcon', e.target.value)}
                          placeholder="e.g. 📚"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Step Title"
                          size="small"
                          fullWidth
                          value={snippet.title || ''}
                          onChange={(e) => handleSnippetChange(idx, 'title', e.target.value)}
                          placeholder="e.g. Learn HTML basics"
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Description"
                          size="small"
                          fullWidth
                          multiline
                          rows={3}
                          value={snippet.roadmapDescription || ''}
                          onChange={(e) => handleSnippetChange(idx, 'roadmapDescription', e.target.value)}
                          placeholder="What should the learner study in this step?"
                        />
                      </Grid>
                    </Grid>
                  </>
                )}
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
                  <>
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

                    <Box sx={{ mb: 3 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                        <span>Background Music Volume</span>
                        <span style={{ opacity: 0.7 }}>{musicVolume}%</span>
                      </Typography>
                      <Slider
                        value={musicVolume}
                        onChange={(_, val) => setMusicVolume(val as number)}
                        min={0}
                        max={100}
                        step={5}
                        valueLabelDisplay="auto"
                      />
                    </Box>
                  </>
                )}

                {audioMode === 'voice_music' && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, display: 'flex', justifyContent: 'space-between' }}>
                      <span>Voice Narration Volume</span>
                      <span style={{ opacity: 0.7 }}>{voiceVolume}%</span>
                    </Typography>
                    <Slider
                      value={voiceVolume}
                      onChange={(_, val) => setVoiceVolume(val as number)}
                      min={0}
                      max={100}
                      step={5}
                      valueLabelDisplay="auto"
                    />
                  </Box>
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
