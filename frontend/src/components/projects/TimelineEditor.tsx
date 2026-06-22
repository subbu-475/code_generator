import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Menu,
  MenuItem,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  Slider,
  Checkbox,
  FormControlLabel,
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
  Whatshot as HookIcon,
  Code as CodeIcon,
  Terminal as OutputIcon,
  Image as ImageIcon,
  Movie as VideoIcon,
  EmojiObjects as TipIcon,
  Campaign as CtaIcon,
  Subscriptions as SubscribeIcon,
  NotificationsActive as SubscribeVideoIcon,
  Flag as OutroIcon,
  LiveHelp as QuizIcon,
} from '@mui/icons-material';
import * as api from '../../api/client.js';
import type { Project, Scene, SceneType, AnimationStyle, TransitionStyle } from '../../types/index.js';

// Visual mock preview component for insert blocks
const ScenePreview = ({ type }: { type: SceneType }) => {
  const getPreviewConfig = () => {
    switch (type) {
      case 'hook':
        return {
          title: 'Hook Opener',
          desc: 'Vibrant animated opener card to grab attention in the first 3 seconds.',
          element: (
            <Box sx={{ width: 140, height: 180, borderRadius: 2.5, background: 'linear-gradient(135deg, #ff0055, #7000ff)', p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(255,255,255,0.25)', boxShadow: '0 8px 20px rgba(112,0,255,0.3)' }}>
              <Box sx={{ px: 1.2, py: 0.4, borderRadius: 1, bgcolor: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)' }}>
                <Typography sx={{ fontSize: 6.5, fontWeight: 900, color: '#ff0055', letterSpacing: 1, lineHeight: 1, textTransform: 'uppercase' }}>🔥 HEY CREATORS!</Typography>
              </Box>
              <Typography sx={{ fontSize: 9.5, fontWeight: 900, color: '#fff', textAlign: 'center', lineHeight: 1.25, textShadow: '0 2px 4px rgba(0,0,0,0.5)', px: 0.5 }}>
                STOP USING LOOPS FOR EVERYTHING!
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, bgcolor: 'rgba(0,0,0,0.5)', px: 1, py: 0.5, borderRadius: 2, border: '1px solid rgba(255,255,255,0.1)', width: '100%' }}>
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#ff0055', border: '1px solid #fff', flexShrink: 0 }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                  <Box sx={{ width: 30, height: 3, bgcolor: '#fff', borderRadius: 0.25 }} />
                  <Box sx={{ width: 20, height: 2, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 0.25 }} />
                </Box>
              </Box>
            </Box>
          )
        };
      case 'code':
        return {
          title: 'Code Snippet',
          desc: 'Syntax-highlighted code editor window with typing sound audio-sync.',
          element: (
            <Box sx={{ width: 140, height: 180, borderRadius: 2.5, bgcolor: '#0b0f19', border: '1px solid rgba(255,255,255,0.1)', p: 1, display: 'flex', flexDirection: 'column', gap: 0.8, boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
              <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', pb: 0.8 }}>
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#ff5f56' }} />
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#ffbd2e' }} />
                <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#27c93f' }} />
                <Box sx={{ flex: 1, height: 5, bgcolor: 'rgba(255,255,255,0.05)', borderRadius: 0.5, ml: 1, display: 'flex', alignItems: 'center', px: 1 }}>
                  <Box sx={{ width: 20, height: 2, bgcolor: 'rgba(255,255,255,0.3)', borderRadius: 0.25 }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, mt: 0.5, px: 0.5, fontFamily: 'monospace', fontSize: 6.5 }}>
                <Box sx={{ display: 'flex', gap: 0.4 }}>
                  <Box sx={{ color: '#ff7b72', fontWeight: 700 }}>const</Box>
                  <Box sx={{ color: '#79c0ff' }}>data</Box>
                  <Box sx={{ color: '#ff7b72' }}>=</Box>
                  <Box sx={{ color: '#a5d6ff' }}>"JS"</Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.4, pl: 0.8 }}>
                  <Box sx={{ color: '#ff7b72', fontWeight: 700 }}>function</Box>
                  <Box sx={{ color: '#d2a8ff' }}>run</Box>
                  <Box sx={{ color: '#e1e4e8' }}>() {`{`}</Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.4, pl: 1.6 }}>
                  <Box sx={{ color: '#79c0ff' }}>console</Box>
                  <Box sx={{ color: '#e1e4e8' }}>.</Box>
                  <Box sx={{ color: '#d2a8ff' }}>log</Box>
                  <Box sx={{ color: '#e1e4e8' }}>(</Box>
                  <Box sx={{ color: '#79c0ff' }}>data</Box>
                  <Box sx={{ color: '#e1e4e8' }}>)</Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.4, pl: 0.8 }}>
                  <Box sx={{ color: '#e1e4e8' }}>{`}`}</Box>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.4, mt: 1 }}>
                  <Box sx={{ width: 45, height: 4, bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 0.25 }} />
                </Box>
              </Box>
            </Box>
          )
        };
      case 'output':
        return {
          title: 'Console Output',
          desc: 'Visual terminal-style block rendering code output and execution results.',
          element: (
            <Box sx={{ width: 140, height: 180, borderRadius: 2.5, bgcolor: '#020617', border: '1px solid rgba(16,185,129,0.15)', p: 1.2, display: 'flex', flexDirection: 'column', gap: 0.8, boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(16,185,129,0.1)', pb: 0.6 }}>
                <Typography sx={{ fontSize: 6.5, color: '#10b981', fontWeight: 900, letterSpacing: 0.5, fontFamily: 'monospace' }}>▶ TERMINAL</Typography>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#10b981', boxShadow: '0 0 4px #10b981' }} />
              </Box>
              <Box sx={{ flex: 1, border: '1px solid rgba(255,255,255,0.03)', borderRadius: 1.5, p: 1, display: 'flex', flexDirection: 'column', gap: 0.6, bgcolor: 'rgba(0,0,0,0.3)', fontFamily: 'monospace' }}>
                <Box sx={{ display: 'flex', gap: 0.4, alignItems: 'center' }}>
                  <Typography sx={{ fontSize: 7, color: '#38bdf8', fontWeight: 800 }}>$</Typography>
                  <Typography sx={{ fontSize: 7, color: '#e2e8f0' }}>node app.js</Typography>
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, mt: 0.5 }}>
                  <Typography sx={{ fontSize: 6.5, color: '#10b981', fontWeight: 700 }}>[2, 4, 6]</Typography>
                  <Typography sx={{ fontSize: 6.5, color: 'rgba(255,255,255,0.4)' }}>Done in 0.05s</Typography>
                </Box>
                <Box sx={{ width: 3, height: 6, bgcolor: '#10b981', boxShadow: '0 0 3px #10b981', mt: 0.5 }} />
              </Box>
            </Box>
          )
        };
      case 'image':
        return {
          title: 'Image Frame',
          desc: 'Mock browser window with an image display and customizable size/contain mode.',
          element: (
            <Box sx={{ width: 140, height: 180, borderRadius: 2.5, bgcolor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', p: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 24px rgba(0,0,0,0.4)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 0.5 }}>
                <Box sx={{ width: 25, height: 3, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 0.25 }} />
                <Box sx={{ px: 0.6, py: 0.2, bgcolor: '#06b6d4', borderRadius: 0.5 }}>
                  <Typography sx={{ fontSize: 5, fontWeight: 800, color: '#fff' }}>9:16 CROP</Typography>
                </Box>
              </Box>
              <Box sx={{ width: '100%', height: 90, bgcolor: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(6,182,212,0.3)', borderRadius: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#06b6d4', gap: 0.5 }}>
                <Typography sx={{ fontSize: 16 }}>🖼</Typography>
                <Typography sx={{ fontSize: 5.5, color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>IMAGE CONTAINER</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, alignItems: 'center', width: '100%', mb: 0.5 }}>
                <Box sx={{ width: '90%', height: 4, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 0.25 }} />
                <Box sx={{ width: '60%', height: 3, bgcolor: 'rgba(255,255,255,0.3)', borderRadius: 0.25 }} />
              </Box>
            </Box>
          )
        };
      case 'video':
        return {
          title: 'Video Clip',
          desc: 'Mock browser window displaying an uploaded video clip with play controls.',
          element: (
            <Box sx={{ width: 140, height: 180, borderRadius: 2.5, bgcolor: '#0b091a', border: '1px solid rgba(99,102,241,0.2)', p: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 24px rgba(99,102,241,0.1)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 0.5 }}>
                <Typography sx={{ fontSize: 5.5, color: '#6366f1', fontWeight: 800 }}>VIDEO DECK</Typography>
                <Typography sx={{ fontSize: 5, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>00:04.2</Typography>
              </Box>
              <Box sx={{ flex: 1, my: 1, borderRadius: 1, bgcolor: '#121026', border: '1px solid rgba(255,255,255,0.03)', display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
                <Box sx={{ width: 24, height: 24, borderRadius: '50%', bgcolor: 'rgba(99,102,241,0.25)', border: '1px solid #6366f1', display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontSize: 8, boxShadow: '0 0 10px rgba(99,102,241,0.4)' }}>
                  ▶
                </Box>
                <Box sx={{ position: 'absolute', bottom: 4, left: 4, right: 4, height: 2, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 0.1 }}>
                  <Box sx={{ width: '40%', height: '100%', bgcolor: '#6366f1' }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, alignItems: 'center' }}>
                <Box sx={{ width: '80%', height: 3, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 0.25 }} />
              </Box>
            </Box>
          )
        };
      case 'tip':
        return {
          title: 'Pro Tip',
          desc: 'Glassmorphic announcement card with glowing border and bulb emoji.',
          element: (
            <Box sx={{ width: 140, height: 180, borderRadius: 2.5, background: 'linear-gradient(135deg, #130f26, #070510)', border: '1px solid rgba(139,92,246,0.3)', p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 1, boxShadow: '0 8px 25px rgba(139,92,246,0.2)' }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'rgba(139,92,246,0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(139,92,246,0.4)', boxShadow: '0 0 15px rgba(139,92,246,0.3)' }}>
                <Typography sx={{ fontSize: 16 }}>💡</Typography>
              </Box>
              <Typography sx={{ fontSize: 8, fontWeight: 900, color: '#a78bfa', letterSpacing: 1 }}>PRO TIP</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, width: '100%', alignItems: 'center', mt: 0.5 }}>
                <Box sx={{ width: '90%', height: 4, bgcolor: 'rgba(255,255,255,0.85)', borderRadius: 0.25 }} />
                <Box sx={{ width: '70%', height: 3.5, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 0.25 }} />
              </Box>
            </Box>
          )
        };
      case 'cta':
        return {
          title: 'CTA Message',
          desc: 'Encouraging call-to-action block urging viewers to follow/subscribe.',
          element: (
            <Box sx={{ width: 140, height: 180, borderRadius: 2.5, bgcolor: '#1c1117', border: '1px solid rgba(236,72,153,0.25)', p: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 24px rgba(236,72,153,0.15)' }}>
              <Box sx={{ width: 26, height: 26, borderRadius: '50%', bgcolor: 'rgba(236,72,153,0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1px solid rgba(236,72,153,0.3)' }}>
                <Typography sx={{ fontSize: 12 }}>📢</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.4, width: '100%', alignItems: 'center' }}>
                <Box sx={{ width: '85%', height: 4, bgcolor: 'rgba(255,255,255,0.85)', borderRadius: 0.25 }} />
                <Box sx={{ width: '55%', height: 3.5, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 0.25 }} />
              </Box>
              <Box sx={{ px: 2.5, py: 0.6, bgcolor: '#ec4899', borderRadius: 1.5, boxShadow: '0 4px 12px rgba(236,72,153,0.4)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Typography sx={{ fontSize: 7, fontWeight: 900, color: '#fff', letterSpacing: 0.5 }}>TAP HERE</Typography>
              </Box>
            </Box>
          )
        };
      case 'subscribe':
        return {
          title: 'Subscribe Card',
          desc: 'Renders dynamic YouTuber profile popup with logo and follower counts.',
          element: (
            <Box sx={{ width: 140, height: 180, borderRadius: 2.5, bgcolor: '#08080c', border: '1px solid rgba(239,68,68,0.2)', p: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 24px rgba(239,68,68,0.15)' }}>
              <Box sx={{ width: '100%', height: 35, bgcolor: 'rgba(255,255,255,0.02)', borderRadius: 1.5, display: 'flex', alignItems: 'center', px: 1, gap: 0.8, border: '1px solid rgba(255,255,255,0.05)' }}>
                <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.2)' }} />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2 }}>
                  <Box sx={{ width: 25, height: 3.5, bgcolor: 'rgba(255,255,255,0.6)', borderRadius: 0.25 }} />
                  <Box sx={{ width: 15, height: 2.5, bgcolor: 'rgba(255,255,255,0.3)', borderRadius: 0.25 }} />
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.6 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: '#ef4444', display: 'flex', justifyContent: 'center', alignItems: 'center', border: '1.5px solid #fff', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>
                  <Typography sx={{ fontSize: 14 }}>🎯</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.2 }}>
                  <Typography sx={{ fontSize: 8, fontWeight: 900, color: '#fff' }}>CodeShorts</Typography>
                  <Box sx={{ width: 5, height: 5, borderRadius: '50%', bgcolor: '#38bdf8', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 3.5, fontWeight: 900, color: '#fff' }}>✓</Box>
                </Box>
                <Typography sx={{ fontSize: 5.5, color: '#94a3b8' }}>100K Subscribers</Typography>
              </Box>
              <Box sx={{ width: '100%', px: 1.5, py: 0.6, bgcolor: '#ef4444', borderRadius: 2, display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 10px rgba(239,68,68,0.3)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <Typography sx={{ fontSize: 7, fontWeight: 900, color: '#fff', letterSpacing: 0.5 }}>SUBSCRIBE</Typography>
              </Box>
            </Box>
          )
        };
      case 'subscribe_video':
        return {
          title: 'Subscribe Video',
          desc: 'Displays interactive MP4 subscribe animation overlays with feedback bell.',
          element: (
            <Box sx={{ width: 140, height: 180, borderRadius: 2.5, bgcolor: '#000000', border: '1px solid rgba(239,68,68,0.2)', p: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 24px rgba(239,68,68,0.1)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 0.5 }}>
                <Typography sx={{ fontSize: 5.5, color: '#ef4444', fontWeight: 800 }}>BELL OVERLAY</Typography>
                <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#ef4444' }} />
              </Box>
              <Box sx={{ width: '100%', height: 95, border: '1px solid rgba(255,255,255,0.05)', borderRadius: 2, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.02)', gap: 0.8, p: 1, position: 'relative' }}>
                <Box sx={{ position: 'relative', width: 28, height: 28, display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'rgba(255,255,255,0.04)', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <Typography sx={{ fontSize: 14 }}>🔔</Typography>
                  <Box sx={{ position: 'absolute', top: 0, right: 0, width: 7, height: 7, borderRadius: '50%', bgcolor: '#ef4444', border: '1.5px solid #000' }} />
                </Box>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.2, alignItems: 'center' }}>
                  <Box sx={{ width: 40, height: 3.5, bgcolor: '#fff', borderRadius: 0.25 }} />
                  <Box sx={{ width: 30, height: 2.5, bgcolor: 'rgba(255,255,255,0.5)', borderRadius: 0.25 }} />
                </Box>
              </Box>
              <Typography sx={{ fontSize: 5.5, color: 'rgba(255,255,255,0.4)', textAlign: 'center', mb: 0.5 }}>🔔 Notification Ring On</Typography>
            </Box>
          )
        };
      case 'end_screen':
        return {
          title: 'Outro Screen',
          desc: 'Renders final socials links, contacts handles, and outro cards.',
          element: (
            <Box sx={{ width: 140, height: 180, borderRadius: 2.5, bgcolor: '#0a0d16', border: '1px solid rgba(2,132,197,0.2)', p: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 24px rgba(2,132,197,0.15)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', pb: 0.5 }}>
                <Box sx={{ width: 30, height: 3, bgcolor: 'rgba(255,255,255,0.2)', borderRadius: 0.25 }} />
                <Typography sx={{ fontSize: 5, color: '#0284c7', fontWeight: 800 }}>OUTRO</Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.8, alignItems: 'center', my: 1 }}>
                <Typography sx={{ fontSize: 7, fontWeight: 900, color: '#fff', letterSpacing: 0.5, textAlign: 'center' }}>THANKS FOR WATCHING!</Typography>
                <Box sx={{ width: 22, height: 2, bgcolor: '#0284c7', borderRadius: 0.25, mt: 0.2 }} />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.6, width: '100%', mb: 0.5 }}>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', bgcolor: 'rgba(255,255,255,0.03)', px: 0.8, py: 0.4, borderRadius: 1, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Typography sx={{ fontSize: 6.5 }}>🐙</Typography>
                  <Typography sx={{ fontSize: 5.5, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>github.com/user</Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', bgcolor: 'rgba(255,255,255,0.03)', px: 0.8, py: 0.4, borderRadius: 1, border: '1px solid rgba(255,255,255,0.05)' }}>
                  <Typography sx={{ fontSize: 6.5 }}>🐦</Typography>
                  <Typography sx={{ fontSize: 5.5, color: 'rgba(255,255,255,0.6)', fontFamily: 'monospace' }}>@twitterhandle</Typography>
                </Box>
              </Box>
            </Box>
          )
        };
      case 'quiz':
        return {
          title: 'Quiz Challenge',
          desc: 'Interactive quiz card with countdown timer, correct answer indicator, and slide-in explanation.',
          element: (
            <Box sx={{ width: 140, height: 180, borderRadius: 2.5, background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', border: '1px solid rgba(139,92,246,0.3)', p: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 24px rgba(139,92,246,0.2)' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ px: 0.8, py: 0.2, borderRadius: 1, bgcolor: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)' }}>
                  <Typography sx={{ fontSize: 5, fontWeight: 900, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: 0.5 }}>⚡ QUIZ CHALLENGE</Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: 7, fontWeight: 800, color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>
                What does [] + [] evaluate to?
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.3, width: '100%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, px: 0.6, py: 0.3, borderRadius: 0.75, border: '1px solid #22c55e', bgcolor: 'rgba(34,197,94,0.1)' }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#22c55e', color: '#fff', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 3.5 }}>✓</Box>
                  <Typography sx={{ fontSize: 5, color: '#fff', fontWeight: 700 }}>"" (Empty String)</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, px: 0.6, py: 0.3, borderRadius: 0.75, border: '1px solid rgba(255,255,255,0.05)', bgcolor: 'rgba(255,255,255,0.02)' }}>
                  <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: 3.5 }} />
                  <Typography sx={{ fontSize: 5, color: 'rgba(255,255,255,0.4)' }}>[]</Typography>
                </Box>
              </Box>
              <Box sx={{ width: '100%', bgcolor: 'rgba(0,0,0,0.4)', p: 0.4, borderRadius: 0.75, border: '1px solid rgba(34,197,94,0.2)' }}>
                <Typography sx={{ fontSize: 4.5, color: '#22c55e', fontWeight: 800, textTransform: 'uppercase' }}>EXPLANATION</Typography>
                <Typography sx={{ fontSize: 4, color: 'rgba(255,255,255,0.7)', lineHeight: 1 }}>Implicit coercion converts arrays to strings...</Typography>
              </Box>
            </Box>
          )
        };
      case 'guess_output':
        return {
          title: 'Guess The Output',
          desc: 'Shows code with countdown timer then reveals the answer with glow animation.',
          element: (
            <Box sx={{ width: 140, height: 180, borderRadius: 2.5, background: 'linear-gradient(135deg, #1a1505, #0f172a)', border: '1px solid rgba(245,158,11,0.3)', p: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 24px rgba(245,158,11,0.15)' }}>
              <Box sx={{ px: 0.8, py: 0.2, borderRadius: 1, bgcolor: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', alignSelf: 'center' }}>
                <Typography sx={{ fontSize: 5, fontWeight: 900, color: '#f59e0b', letterSpacing: 0.5 }}>🤔 GUESS OUTPUT</Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(0,0,0,0.5)', p: 0.8, borderRadius: 1, border: '1px solid rgba(255,255,255,0.08)' }}>
                <Typography sx={{ fontSize: 5.5, color: '#e2e8f0', fontFamily: 'monospace' }}>typeof null</Typography>
              </Box>
              <Box sx={{ width: '100%', height: 3, bgcolor: 'rgba(255,255,255,0.08)', borderRadius: 0.5, overflow: 'hidden' }}>
                <Box sx={{ width: '60%', height: '100%', background: 'linear-gradient(90deg, #f59e0b, #ef4444)' }} />
              </Box>
              <Box sx={{ bgcolor: 'rgba(34,197,94,0.1)', border: '1px solid #22c55e', p: 0.6, borderRadius: 1, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 4.5, color: '#22c55e', fontWeight: 800 }}>✅ OUTPUT</Typography>
                <Typography sx={{ fontSize: 8, color: '#22c55e', fontWeight: 900, fontFamily: 'monospace' }}>"object"</Typography>
              </Box>
            </Box>
          )
        };
      case 'interview_question':
        return {
          title: 'Interview Question',
          desc: 'Professional interview card with difficulty badge and timed answer reveal.',
          element: (
            <Box sx={{ width: 140, height: 180, borderRadius: 2.5, background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(59,130,246,0.25)', p: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 24px rgba(59,130,246,0.15)' }}>
              <Box sx={{ px: 0.8, py: 0.2, borderRadius: 1, bgcolor: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)' }}>
                <Typography sx={{ fontSize: 5, fontWeight: 900, color: '#3b82f6', letterSpacing: 0.5 }}>💼 INTERVIEW Q</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Box sx={{ px: 0.5, py: 0.2, borderRadius: 0.5, bgcolor: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)' }}>
                  <Typography sx={{ fontSize: 4, color: '#f59e0b', fontWeight: 800 }}>🟡 MEDIUM</Typography>
                </Box>
                <Box sx={{ px: 0.5, py: 0.2, borderRadius: 0.5, bgcolor: 'rgba(255,255,255,0.05)' }}>
                  <Typography sx={{ fontSize: 4, color: 'rgba(255,255,255,0.5)' }}>JavaScript</Typography>
                </Box>
              </Box>
              <Typography sx={{ fontSize: 7, fontWeight: 700, color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>What is a closure?</Typography>
              <Box sx={{ width: '100%', bgcolor: 'rgba(0,0,0,0.4)', p: 0.5, borderRadius: 0.75, border: '1px solid rgba(245,158,11,0.2)' }}>
                <Typography sx={{ fontSize: 4, color: '#f59e0b', fontWeight: 800 }}>✅ ANSWER</Typography>
                <Typography sx={{ fontSize: 4, color: 'rgba(255,255,255,0.6)', lineHeight: 1 }}>A function retaining outer scope...</Typography>
              </Box>
            </Box>
          )
        };
      case 'bugfix':
        return {
          title: 'Bug Fix Challenge',
          desc: 'Spot-the-bug scene: buggy code with red stripe transitions to fixed code with green glow.',
          element: (
            <Box sx={{ width: 140, height: 180, borderRadius: 2.5, background: 'linear-gradient(135deg, #1a0505, #0f172a)', border: '1px solid rgba(239,68,68,0.3)', p: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 24px rgba(239,68,68,0.15)' }}>
              <Box sx={{ px: 0.8, py: 0.2, borderRadius: 1, bgcolor: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', alignSelf: 'center' }}>
                <Typography sx={{ fontSize: 5, fontWeight: 900, color: '#ef4444', letterSpacing: 0.5 }}>🐛 SPOT THE BUG</Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.3)', p: 0.6, borderRadius: 0.75, borderLeft: '3px solid #ef4444' }}>
                <Typography sx={{ fontSize: 4, color: '#ef4444', fontWeight: 800 }}>BUGGY CODE</Typography>
                <Typography sx={{ fontSize: 5, color: '#e2e8f0', fontFamily: 'monospace' }}>if (x = 5) {'{'}</Typography>
              </Box>
              <Box sx={{ bgcolor: 'rgba(34,197,94,0.05)', border: '1px solid rgba(34,197,94,0.3)', p: 0.6, borderRadius: 0.75, borderLeft: '3px solid #22c55e' }}>
                <Typography sx={{ fontSize: 4, color: '#22c55e', fontWeight: 800 }}>✅ FIXED</Typography>
                <Typography sx={{ fontSize: 5, color: '#e2e8f0', fontFamily: 'monospace' }}>if (x === 5) {'{'}</Typography>
              </Box>
              <Box sx={{ width: '100%', bgcolor: 'rgba(0,0,0,0.3)', p: 0.4, borderRadius: 0.5, border: '1px solid rgba(34,197,94,0.15)' }}>
                <Typography sx={{ fontSize: 3.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1 }}>💡 Use === for comparison</Typography>
              </Box>
            </Box>
          )
        };
      case 'oneliner':
        return {
          title: 'One-Line Trick',
          desc: 'Flashy one-liner showcase with typewriter animation and neon glow effect.',
          element: (
            <Box sx={{ width: 140, height: 180, borderRadius: 2.5, background: 'linear-gradient(135deg, #0a0a2e, #1a1a2e)', border: '1px solid rgba(124,58,237,0.3)', p: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 24px rgba(124,58,237,0.2)' }}>
              <Box sx={{ px: 1, py: 0.3, borderRadius: 1.5, background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(245,158,11,0.15))', border: '1px solid rgba(124,58,237,0.4)' }}>
                <Typography sx={{ fontSize: 5, fontWeight: 900, color: '#a78bfa', letterSpacing: 0.5 }}>⚡ ONE-LINER</Typography>
              </Box>
              <Box sx={{ px: 0.5, py: 0.2, borderRadius: 0.5, bgcolor: 'rgba(255,255,255,0.05)' }}>
                <Typography sx={{ fontSize: 4, color: 'rgba(255,255,255,0.4)', fontFamily: 'monospace' }}>JAVASCRIPT</Typography>
              </Box>
              <Box sx={{ width: '100%', bgcolor: 'rgba(0,0,0,0.5)', border: '1.5px solid rgba(124,58,237,0.5)', p: 0.8, borderRadius: 1, textAlign: 'center', boxShadow: '0 0 15px rgba(124,58,237,0.2)' }}>
                <Typography sx={{ fontSize: 5.5, color: '#e2e8f0', fontFamily: 'monospace', fontWeight: 700 }}>[...new Set(arr)]</Typography>
              </Box>
              <Box sx={{ width: '100%', bgcolor: 'rgba(0,0,0,0.3)', p: 0.5, borderRadius: 0.5 }}>
                <Typography sx={{ fontSize: 3.5, color: '#a78bfa', fontWeight: 800 }}>💡 HOW IT WORKS</Typography>
                <Typography sx={{ fontSize: 3.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1 }}>Set removes duplicates...</Typography>
              </Box>
            </Box>
          )
        };
      case 'comparison':
        return {
          title: 'Comparison',
          desc: 'Side-by-side code comparison with VS badge and animated verdict reveal.',
          element: (
            <Box sx={{ width: 140, height: 180, borderRadius: 2.5, background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', border: '1px solid rgba(99,102,241,0.2)', p: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 8px 24px rgba(99,102,241,0.15)' }}>
              <Box sx={{ px: 0.8, py: 0.2, borderRadius: 1, bgcolor: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', alignSelf: 'center' }}>
                <Typography sx={{ fontSize: 5, fontWeight: 900, color: '#818cf8', letterSpacing: 0.5 }}>⚔️ COMPARE</Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 0.5, width: '100%', position: 'relative' }}>
                <Box sx={{ flex: 1, bgcolor: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.25)', p: 0.4, borderRadius: 0.75 }}>
                  <Typography sx={{ fontSize: 4, color: '#3b82f6', fontWeight: 800 }}>REST</Typography>
                  <Typography sx={{ fontSize: 3.5, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>fetch('/api')</Typography>
                </Box>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: 14, height: 14, borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #f59e0b)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1, border: '1px solid rgba(255,255,255,0.3)' }}>
                  <Typography sx={{ fontSize: 4, fontWeight: 900, color: '#fff' }}>VS</Typography>
                </Box>
                <Box sx={{ flex: 1, bgcolor: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)', p: 0.4, borderRadius: 0.75 }}>
                  <Typography sx={{ fontSize: 4, color: '#f59e0b', fontWeight: 800 }}>GQL</Typography>
                  <Typography sx={{ fontSize: 3.5, color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{"query { }"}</Typography>
                </Box>
              </Box>
              <Box sx={{ width: '100%', bgcolor: 'rgba(0,0,0,0.3)', p: 0.4, borderRadius: 0.5, textAlign: 'center' }}>
                <Typography sx={{ fontSize: 3.5, color: '#818cf8', fontWeight: 800 }}>⚡ VERDICT</Typography>
                <Typography sx={{ fontSize: 3.5, color: 'rgba(255,255,255,0.5)', lineHeight: 1 }}>Both have their merits!</Typography>
              </Box>
            </Box>
          )
        };
      case 'roadmap_step':
        return {
          title: 'Roadmap Step',
          desc: 'Animated milestone card with progress ring, icon, and timeline dots.',
          element: (
            <Box sx={{ width: 140, height: 180, borderRadius: 2.5, background: 'linear-gradient(135deg, #0f172a, #1e293b)', border: '1px solid rgba(34,197,94,0.2)', p: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 24px rgba(34,197,94,0.1)' }}>
              <Box sx={{ px: 0.8, py: 0.2, borderRadius: 1, bgcolor: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.3)' }}>
                <Typography sx={{ fontSize: 5, fontWeight: 900, color: '#22c55e', letterSpacing: 0.5 }}>🗺️ ROADMAP</Typography>
              </Box>
              <Box sx={{ width: 30, height: 30, borderRadius: '50%', border: '2px solid #22c55e', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'rgba(34,197,94,0.08)' }}>
                <Typography sx={{ fontSize: 14 }}>📚</Typography>
              </Box>
              <Box sx={{ px: 0.5, py: 0.2, borderRadius: 0.5, bgcolor: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Typography sx={{ fontSize: 4.5, color: '#22c55e', fontWeight: 800 }}>STEP 1 OF 5</Typography>
              </Box>
              <Typography sx={{ fontSize: 7, fontWeight: 800, color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>Learn Basics</Typography>
              <Box sx={{ display: 'flex', gap: 0.3, alignItems: 'center' }}>
                <Box sx={{ width: 12, height: 3, borderRadius: 0.5, bgcolor: '#22c55e' }} />
                <Box sx={{ width: 3, height: 3, borderRadius: 0.5, bgcolor: 'rgba(255,255,255,0.15)' }} />
                <Box sx={{ width: 3, height: 3, borderRadius: 0.5, bgcolor: 'rgba(255,255,255,0.15)' }} />
                <Box sx={{ width: 3, height: 3, borderRadius: 0.5, bgcolor: 'rgba(255,255,255,0.15)' }} />
                <Box sx={{ width: 3, height: 3, borderRadius: 0.5, bgcolor: 'rgba(255,255,255,0.15)' }} />
              </Box>
            </Box>
          )
        };
      case 'summary':
        return {
          title: 'Summary Slide',
          desc: 'Staggered key takeaways bullet list in a premium glassmorphic card.',
          element: (
            <Box sx={{ width: 140, height: 180, borderRadius: 2.5, background: 'linear-gradient(135deg, #0f172a, #2a1b0f)', border: '1px solid rgba(249,115,22,0.25)', p: 1.2, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 8px 24px rgba(249,115,22,0.15)' }}>
              <Box sx={{ px: 0.8, py: 0.2, borderRadius: 1, bgcolor: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)' }}>
                <Typography sx={{ fontSize: 5, fontWeight: 900, color: '#f97316', letterSpacing: 0.5 }}>📋 SUMMARY</Typography>
              </Box>
              <Typography sx={{ fontSize: 7, fontWeight: 800, color: '#fff', textAlign: 'center', lineHeight: 1.2 }}>Key Takeaways</Typography>
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 0.5, mt: 1 }}>
                {[1, 2, 3].map((pt) => (
                  <Box key={pt} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Box sx={{ width: 4, height: 4, borderRadius: '50%', border: '0.75px solid #f97316', display: 'flex', justifyContent: 'center', alignItems: 'center', bgcolor: 'rgba(249,115,22,0.1)' }}>
                      <Typography sx={{ fontSize: 2.5, color: '#f97316' }}>✓</Typography>
                    </Box>
                    <Typography sx={{ fontSize: 4, color: 'rgba(255,255,255,0.6)', whiteSpace: 'nowrap', overflow: 'hidden' }}>Point {pt} description...</Typography>
                  </Box>
                ))}
              </Box>
              <Box sx={{ width: 40, height: 1.5, borderRadius: 0.5, bgcolor: '#f97316', mt: 1, opacity: 0.5 }} />
            </Box>
          )
        };
      default:
        return { title: 'Scene Block', desc: '', element: null };
    }
  };

  const config = getPreviewConfig();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 1.5, alignItems: 'center', maxWidth: 170 }}>
      <Typography variant="body2" sx={{ fontWeight: 800, color: '#a78bfa', textAlign: 'center', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: 0.5 }}>
        {config.title}
      </Typography>
      <Box sx={{ boxShadow: '0 10px 25px rgba(0,0,0,0.5)', borderRadius: 2, overflow: 'hidden' }}>
        {config.element}
      </Box>
      <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textAlign: 'center', lineHeight: 1.3 }}>
        {config.desc}
      </Typography>
    </Box>
  );
};

const getSceneIcon = (type: SceneType) => {
  switch (type) {
    case 'hook': return <HookIcon sx={{ fontSize: 18 }} />;
    case 'code': return <CodeIcon sx={{ fontSize: 18 }} />;
    case 'output': return <OutputIcon sx={{ fontSize: 18 }} />;
    case 'image': return <ImageIcon sx={{ fontSize: 18 }} />;
    case 'video': return <VideoIcon sx={{ fontSize: 18 }} />;
    case 'tip': return <TipIcon sx={{ fontSize: 18 }} />;
    case 'cta': return <CtaIcon sx={{ fontSize: 18 }} />;
    case 'subscribe': return <SubscribeIcon sx={{ fontSize: 18 }} />;
    case 'subscribe_video': return <SubscribeVideoIcon sx={{ fontSize: 18 }} />;
    case 'end_screen': return <OutroIcon sx={{ fontSize: 18 }} />;
    case 'quiz': return <QuizIcon sx={{ fontSize: 18 }} />;
    case 'guess_output': return <QuizIcon sx={{ fontSize: 18 }} />;
    case 'interview_question': return <TipIcon sx={{ fontSize: 18 }} />;
    case 'bugfix': return <CodeIcon sx={{ fontSize: 18 }} />;
    case 'oneliner': return <CodeIcon sx={{ fontSize: 18 }} />;
    case 'comparison': return <CodeIcon sx={{ fontSize: 18 }} />;
    case 'roadmap_step': return <OutroIcon sx={{ fontSize: 18 }} />;
    case 'summary': return <OutroIcon sx={{ fontSize: 18 }} />;
    default: return <AddIcon sx={{ fontSize: 18 }} />;
  }
};

interface TimelineEditorProps {
  projectId: string;
  project: Project;
  scenes: Scene[];
  onRefresh: () => void;
  playerRef?: React.RefObject<any>;
}

export default function TimelineEditor({ projectId, project, scenes, onRefresh, playerRef }: TimelineEditorProps) {
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null);
  const [localMusicVolume, setLocalMusicVolume] = useState<number>(15);
  const [localVoiceVolume, setLocalVoiceVolume] = useState<number>(100);

  // Sync with project prop changes
  useEffect(() => {
    if (project) {
      setLocalMusicVolume(project.music_volume !== undefined ? Math.round(project.music_volume * 100) : 15);
      setLocalVoiceVolume(project.voice_volume !== undefined ? Math.round(project.voice_volume * 100) : 100);
    }
  }, [project]);

  const handleMusicVolumeCommit = async (newVolPercent: number) => {
    try {
      await api.updateProject(projectId, { music_volume: newVolPercent / 100 });
      onRefresh();
    } catch (err) {
      console.error('Failed to update music volume:', err);
    }
  };

  const handleVoiceVolumeCommit = async (newVolPercent: number) => {
    try {
      await api.updateProject(projectId, { voice_volume: newVolPercent / 100 });
      onRefresh();
    } catch (err) {
      console.error('Failed to update voice volume:', err);
    }
  };
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
  const [snippetHookColor, setSnippetHookColor] = useState('');
  const [snippetHookEmoji, setSnippetHookEmoji] = useState('');
  const [explanation, setExplanation] = useState('');
  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOptions, setQuizOptions] = useState<string[]>(['Option A', 'Option B', 'Option C', 'Option D']);
  const [quizCorrectIndex, setQuizCorrectIndex] = useState<number>(0);
  const [quizExplanation, setQuizExplanation] = useState('');
  const [quizRevealDelay, setQuizRevealDelay] = useState<number>(90);
  const [insertAnchorEl, setInsertAnchorEl] = useState<null | HTMLElement>(null);
  const [pendingSceneType, setPendingSceneType] = useState<SceneType | null>(null);

  // Guess The Output states
  const [guessCode, setGuessCode] = useState('');
  const [guessLanguage, setGuessLanguage] = useState('javascript');
  const [guessAnswer, setGuessAnswer] = useState('');
  const [guessRevealDelay, setGuessRevealDelay] = useState<number>(90);

  // Interview Question states
  const [interviewDifficulty, setInterviewDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [interviewCategory, setInterviewCategory] = useState('');
  const [interviewAnswer, setInterviewAnswer] = useState('');

  // Bug Fix states
  const [buggyCode, setBuggyCode] = useState('');
  const [fixedCode, setFixedCode] = useState('');
  const [bugLanguage, setBugLanguage] = useState('javascript');
  const [bugExplanation, setBugExplanation] = useState('');

  // One-Liner states
  const [onelinerCode, setOnelinerCode] = useState('');
  const [onelinerLanguage, setOnelinerLanguage] = useState('javascript');
  const [onelinerExplanation, setOnelinerExplanation] = useState('');

  // Comparison states
  const [comparisonLeftTitle, setComparisonLeftTitle] = useState('');
  const [comparisonRightTitle, setComparisonRightTitle] = useState('');
  const [comparisonLeftCode, setComparisonLeftCode] = useState('');
  const [comparisonRightCode, setComparisonRightCode] = useState('');
  const [comparisonLeftLanguage, setComparisonLeftLanguage] = useState('javascript');
  const [comparisonRightLanguage, setComparisonRightLanguage] = useState('javascript');
  const [comparisonVerdict, setComparisonVerdict] = useState('');

  // Roadmap Step states
  const [roadmapStepNumber, setRoadmapStepNumber] = useState<number>(1);
  const [roadmapTotalSteps, setRoadmapTotalSteps] = useState<number>(5);
  const [roadmapIcon, setRoadmapIcon] = useState('📚');
  const [roadmapDescription, setRoadmapDescription] = useState('');

  // Summary Slide states
  const [summaryTitle, setSummaryTitle] = useState('Key Takeaways');
  const [summaryPoints, setSummaryPoints] = useState<string[]>(['', '', '']);
  const [summaryVoiceOver, setSummaryVoiceOver] = useState(true);
  const [summaryLayout, setSummaryLayout] = useState<'points' | 'paragraph'>('points');
  const [summaryShowSubscribe, setSummaryShowSubscribe] = useState(true);

  // Font Size Override states
  const [codeFontSize, setCodeFontSize] = useState<number | ''>('');
  const [explanationFontSize, setExplanationFontSize] = useState<number | ''>('');

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
      setSnippetHookColor(content.snippetHookColor || '');
      setSnippetHookEmoji(content.snippetHookEmoji || '');
      setExplanation(content.explanation || '');
      setQuizQuestion(content.quizQuestion || 'What is the output of this code?');
      setQuizOptions(content.quizOptions || ['Option A', 'Option B', 'Option C', 'Option D']);
      setQuizCorrectIndex(content.quizCorrectIndex !== undefined ? content.quizCorrectIndex : 0);
      setQuizExplanation(content.quizExplanation || 'This is because...');
      setQuizRevealDelay(content.quizRevealDelay !== undefined ? content.quizRevealDelay : 90);

      // Guess The Output
      setGuessCode(content.guessCode || '');
      setGuessLanguage(content.guessLanguage || 'javascript');
      setGuessAnswer(content.guessAnswer || '');
      setGuessRevealDelay(content.guessRevealDelay !== undefined ? content.guessRevealDelay : 90);

      // Interview Question
      setInterviewDifficulty(content.interviewDifficulty || 'medium');
      setInterviewCategory(content.interviewCategory || '');
      setInterviewAnswer(content.interviewAnswer || '');

      // Bug Fix
      setBuggyCode(content.buggyCode || '');
      setFixedCode(content.fixedCode || '');
      setBugLanguage(content.bugLanguage || 'javascript');
      setBugExplanation(content.bugExplanation || '');

      // One-Liner
      setOnelinerCode(content.onelinerCode || '');
      setOnelinerLanguage(content.onelinerLanguage || 'javascript');
      setOnelinerExplanation(content.onelinerExplanation || '');

      // Comparison
      setComparisonLeftTitle(content.comparisonLeftTitle || '');
      setComparisonRightTitle(content.comparisonRightTitle || '');
      setComparisonLeftCode(content.comparisonLeftCode || '');
      setComparisonRightCode(content.comparisonRightCode || '');
      setComparisonLeftLanguage(content.comparisonLeftLanguage || 'javascript');
      setComparisonRightLanguage(content.comparisonRightLanguage || 'javascript');
      setComparisonVerdict(content.comparisonVerdict || '');

      // Roadmap Step
      setRoadmapStepNumber(content.roadmapStepNumber || 1);
      setRoadmapTotalSteps(content.roadmapTotalSteps || 5);
      setRoadmapIcon(content.roadmapIcon || '📚');
      setRoadmapDescription(content.roadmapDescription || '');

      // Summary Slide
      setSummaryTitle(content.summaryTitle || 'Key Takeaways');
      setSummaryPoints(content.summaryPoints || ['', '', '']);
      setSummaryVoiceOver(content.summaryVoiceOver !== false);
      setSummaryLayout(content.summaryLayout || 'points');
      setSummaryShowSubscribe(content.summaryShowSubscribe !== false);

      // Font overrides
      setCodeFontSize(content.codeFontSize !== undefined && content.codeFontSize !== null ? content.codeFontSize : '');
      setExplanationFontSize(content.explanationFontSize !== undefined && content.explanationFontSize !== null ? content.explanationFontSize : '');
    } else if (!selectedSceneId && scenes.length > 0) {
      setSelectedSceneId(scenes[0].id);
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
        payload.snippetHookColor = snippetHookColor || null;
        payload.snippetHookEmoji = snippetHookEmoji || null;
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
      } else if (selectedScene.type === 'quiz') {
        payload.quizQuestion = quizQuestion;
        payload.quizOptions = quizOptions;
        payload.quizCorrectIndex = quizCorrectIndex;
        payload.quizExplanation = quizExplanation;
        payload.quizRevealDelay = quizRevealDelay;
      } else if (selectedScene.type === 'guess_output') {
        payload.guessCode = guessCode;
        payload.guessLanguage = guessLanguage;
        payload.guessAnswer = guessAnswer;
        payload.guessRevealDelay = guessRevealDelay;
      } else if (selectedScene.type === 'interview_question') {
        payload.text = text;
        payload.interviewDifficulty = interviewDifficulty;
        payload.interviewCategory = interviewCategory;
        payload.interviewAnswer = interviewAnswer;
      } else if (selectedScene.type === 'bugfix') {
        payload.buggyCode = buggyCode;
        payload.fixedCode = fixedCode;
        payload.bugLanguage = bugLanguage;
        payload.bugExplanation = bugExplanation;
      } else if (selectedScene.type === 'oneliner') {
        payload.onelinerCode = onelinerCode;
        payload.onelinerLanguage = onelinerLanguage;
        payload.onelinerExplanation = onelinerExplanation;
      } else if (selectedScene.type === 'comparison') {
        payload.comparisonLeftTitle = comparisonLeftTitle;
        payload.comparisonRightTitle = comparisonRightTitle;
        payload.comparisonLeftCode = comparisonLeftCode;
        payload.comparisonRightCode = comparisonRightCode;
        payload.comparisonLeftLanguage = comparisonLeftLanguage;
        payload.comparisonRightLanguage = comparisonRightLanguage;
        payload.comparisonVerdict = comparisonVerdict;
      } else if (selectedScene.type === 'roadmap_step') {
        payload.text = text;
        payload.roadmapStepNumber = roadmapStepNumber;
        payload.roadmapTotalSteps = roadmapTotalSteps;
        payload.roadmapIcon = roadmapIcon;
        payload.roadmapDescription = roadmapDescription;
      } else if (selectedScene.type === 'summary') {
        payload.summaryTitle = summaryTitle;
        payload.summaryPoints = summaryPoints;
        payload.summaryVoiceOver = summaryVoiceOver;
        payload.summaryLayout = summaryLayout;
        payload.summaryShowSubscribe = summaryShowSubscribe;
        payload.text = text;
        payload.imageUrl = logoUrl;
      }

      // Font overrides
      payload.codeFontSize = codeFontSize !== '' ? Number(codeFontSize) : null;
      payload.explanationFontSize = explanationFontSize !== '' ? Number(explanationFontSize) : null;

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
  const handleAddScene = async (type: SceneType, position: 'start' | 'after_selected' | 'end') => {
    try {
      let insertAfterId: string | undefined;
      if (position === 'start') {
        insertAfterId = 'START';
      } else if (position === 'after_selected') {
        insertAfterId = selectedSceneId || undefined;
      } else {
        insertAfterId = undefined;
      }

      const inserted = await api.addScene(projectId, type, insertAfterId);
      setSelectedSceneId(inserted.id);
      onRefresh();
      // Keep selection on the newly inserted scene
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
    
    // Seek Remotion Player
    if (playerRef?.current) {
      try {
        playerRef.current.seekTo(frame);
      } catch (err) {
        console.warn('Failed to seek player:', err);
      }
    }
  }, [zoom, totalFrames, playerRef]);

  useEffect(() => {
    if (!isDraggingPlayhead) return;
    const handleMouseMove = (e: MouseEvent) => {
      if (!timelineTrackRef.current) return;
      const rect = timelineTrackRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + timelineTrackRef.current.scrollLeft;
      const frame = Math.max(0, Math.min(totalFrames, Math.round(x / zoom)));
      setPlayheadFrame(frame);
      
      // Seek Remotion Player in real time
      if (playerRef?.current) {
        try {
          playerRef.current.seekTo(frame);
        } catch (err) {
          // ignore seek errors during fast drag
        }
      }
    };
    const handleMouseUp = () => setIsDraggingPlayhead(false);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingPlayhead, zoom, totalFrames, playerRef]);

  // Sync playhead state from Remotion Player's animation clock
  useEffect(() => {
    let attached = false;
    let playerInstance: any = null;

    const onFrameUpdate = () => {
      if (!isDraggingPlayhead && playerRef?.current) {
        try {
          setPlayheadFrame(playerRef.current.getCurrentFrame());
        } catch (err) {
          // ignore frame fetch errors
        }
      }
    };

    const intervalId = setInterval(() => {
      if (playerRef?.current && !attached) {
        playerInstance = playerRef.current;
        try {
          playerInstance.addEventListener('frameupdate', onFrameUpdate);
          attached = true;
          clearInterval(intervalId);
        } catch (err) {
          console.warn('Waiting to bind player event listener:', err);
        }
      }
    }, 200);

    return () => {
      clearInterval(intervalId);
      if (playerInstance && attached) {
        try {
          playerInstance.removeEventListener('frameupdate', onFrameUpdate);
        } catch (err) {
          // ignore cleanup errors
        }
      }
    };
  }, [playerRef, isDraggingPlayhead]);

  // Play individual scene preview (seek to scene start, play, and auto-stop at scene end)
  const handlePlayScene = (sceneId: string) => {
    if (playingSceneId === sceneId) {
      setPlayingSceneId(null);
      if (playerRef?.current) {
        try {
          playerRef.current.pause();
        } catch (err) {
          console.warn(err);
        }
      }
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

    const scene = scenes.find((s) => s.id === sceneId);
    if (!scene) return;
    const sceneDuration = scene.duration_frames;

    if (playerRef?.current) {
      try {
        playerRef.current.seekTo(frameOffset);
        playerRef.current.play();

        const endFrame = frameOffset + sceneDuration;
        const checkFrame = () => {
          if (!playerRef.current) return;
          try {
            const currentFrame = playerRef.current.getCurrentFrame();
            const isStillPlaying = playerRef.current.isPlaying();
            
            if (currentFrame >= endFrame || !isStillPlaying) {
              playerRef.current.pause();
              setPlayingSceneId(null);
            } else {
              requestAnimationFrame(checkFrame);
            }
          } catch (err) {
            setPlayingSceneId(null);
          }
        };
        requestAnimationFrame(checkFrame);
      } catch (err) {
        console.warn('Playback controller error:', err);
      }
    } else {
      // Fallback local UI animation if player is not fully loaded
      const durationMs = (sceneDuration / 30) * 1000;
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
    }
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
      case 'quiz':
        return '#ec4899'; // Bright Pink
      case 'guess_output':
        return '#f59e0b'; // Amber
      case 'interview_question':
        return '#3b82f6'; // Blue
      case 'bugfix':
        return '#ef4444'; // Red
      case 'oneliner':
        return '#a855f7'; // Purple
      case 'comparison':
        return '#6366f1'; // Indigo
      case 'roadmap_step':
        return '#22c55e'; // Green
      case 'summary':
        return '#f97316'; // Orange
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

                      {/* Emoji & Color Customization */}
                      <Grid item xs={12} sm={6}>
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'flex-start' }}>
                          <TextField
                            select
                            label="Hook Emoji"
                            size="small"
                            fullWidth
                            value={snippetHookEmoji}
                            onChange={(e) => setSnippetHookEmoji(e.target.value)}
                            sx={{ '& .MuiSelect-select': { fontSize: 20, py: '5.5px' } }}
                          >
                            <MenuItem value="">None</MenuItem>
                            {['🔥','⚡','💡','🚀','✨','🎯','💻','🧠','⭐','🏆','💎','🎉','👀','💥','🛠️','📌','🔑','🎨','📢','⚠️'].map((emoji) => (
                              <MenuItem key={emoji} value={emoji} sx={{ fontSize: 20, justifyContent: 'center' }}>
                                {emoji}
                              </MenuItem>
                            ))}
                          </TextField>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, pt: 0.5 }}>
                            <Box
                              component="label"
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: 1,
                                border: '2px solid',
                                borderColor: 'divider',
                                backgroundColor: snippetHookColor || '#ffffff',
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
                                value={snippetHookColor || '#ffffff'}
                                onChange={(e) => setSnippetHookColor(e.target.value)}
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
                              onClick={() => setSnippetHookColor('')}
                              title="Click to reset color"
                            >
                              {snippetHookColor ? snippetHookColor.toUpperCase() : 'Auto'}
                            </Box>
                          </Box>
                        </Box>
                      </Grid>

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

                  {selectedScene.type === 'quiz' && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          label="Question"
                          fullWidth
                          value={quizQuestion}
                          onChange={(e) => setQuizQuestion(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      {[0, 1, 2, 3].map((optIdx) => (
                        <Grid item xs={12} sm={6} key={optIdx}>
                          <TextField
                            label={`Option ${String.fromCharCode(65 + optIdx)}`}
                            fullWidth
                            size="small"
                            value={quizOptions[optIdx] || ''}
                            onChange={(e) => {
                              const copy = [...quizOptions];
                              copy[optIdx] = e.target.value;
                              setQuizOptions(copy);
                            }}
                            sx={{ mb: 1 }}
                          />
                        </Grid>
                      ))}
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Correct Answer"
                          fullWidth
                          size="small"
                          value={quizCorrectIndex}
                          onChange={(e) => setQuizCorrectIndex(Number(e.target.value))}
                          sx={{ mb: 2 }}
                        >
                          {[0, 1, 2, 3].map((idx) => (
                            <MenuItem key={idx} value={idx}>
                              Option {String.fromCharCode(65 + idx)}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Reveal Answer Delay"
                          fullWidth
                          size="small"
                          value={quizRevealDelay}
                          onChange={(e) => setQuizRevealDelay(Number(e.target.value))}
                          sx={{ mb: 2 }}
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
                          label="Explanation (Shown after reveal)"
                          fullWidth
                          multiline
                          rows={2}
                          value={quizExplanation}
                          onChange={(e) => setQuizExplanation(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                    </>
                  )}

                  {selectedScene.type === 'guess_output' && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          label="Code Snippet"
                          fullWidth
                          multiline
                          rows={5}
                          value={guessCode}
                          onChange={(e) => setGuessCode(e.target.value)}
                          sx={{ mb: 2, fontFamily: 'monospace' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          select
                          label="Language"
                          fullWidth
                          size="small"
                          value={guessLanguage}
                          onChange={(e) => setGuessLanguage(e.target.value)}
                          sx={{ mb: 2 }}
                        >
                          {['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php'].map((lang) => (
                            <MenuItem key={lang} value={lang}>
                              {lang.toUpperCase()}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Answer Output"
                          fullWidth
                          size="small"
                          value={guessAnswer}
                          onChange={(e) => setGuessAnswer(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          select
                          label="Reveal Answer Delay"
                          fullWidth
                          size="small"
                          value={guessRevealDelay}
                          onChange={(e) => setGuessRevealDelay(Number(e.target.value))}
                          sx={{ mb: 2 }}
                        >
                          {[30, 45, 60, 75, 90, 105, 120, 135].map((frames) => (
                            <MenuItem key={frames} value={frames}>
                              {Math.round((frames / 30) * 10) / 10}s ({frames} frames)
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                    </>
                  )}

                  {selectedScene.type === 'interview_question' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Difficulty"
                          fullWidth
                          size="small"
                          value={interviewDifficulty}
                          onChange={(e) => setInterviewDifficulty(e.target.value as any)}
                          sx={{ mb: 2 }}
                        >
                          <MenuItem value="easy">Easy</MenuItem>
                          <MenuItem value="medium">Medium</MenuItem>
                          <MenuItem value="hard">Hard</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Category (e.g. JavaScript, Algorithms)"
                          fullWidth
                          size="small"
                          value={interviewCategory}
                          onChange={(e) => setInterviewCategory(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Question Text"
                          fullWidth
                          multiline
                          rows={2}
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Answer Description"
                          fullWidth
                          multiline
                          rows={3}
                          value={interviewAnswer}
                          onChange={(e) => setInterviewAnswer(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                    </>
                  )}

                  {selectedScene.type === 'bugfix' && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          label="Buggy Code"
                          fullWidth
                          multiline
                          rows={4}
                          value={buggyCode}
                          onChange={(e) => setBuggyCode(e.target.value)}
                          sx={{ mb: 2, fontFamily: 'monospace' }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Fixed Code"
                          fullWidth
                          multiline
                          rows={4}
                          value={fixedCode}
                          onChange={(e) => setFixedCode(e.target.value)}
                          sx={{ mb: 2, fontFamily: 'monospace' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Language"
                          fullWidth
                          size="small"
                          value={bugLanguage}
                          onChange={(e) => setBugLanguage(e.target.value)}
                          sx={{ mb: 2 }}
                        >
                          {['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php'].map((lang) => (
                            <MenuItem key={lang} value={lang}>
                              {lang.toUpperCase()}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Fix Explanation"
                          fullWidth
                          multiline
                          rows={2}
                          value={bugExplanation}
                          onChange={(e) => setBugExplanation(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                    </>
                  )}

                  {selectedScene.type === 'oneliner' && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                          label="One-Liner Code"
                          fullWidth
                          multiline
                          rows={3}
                          value={onelinerCode}
                          onChange={(e) => setOnelinerCode(e.target.value)}
                          sx={{ mb: 2, fontFamily: 'monospace' }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Language"
                          fullWidth
                          size="small"
                          value={onelinerLanguage}
                          onChange={(e) => setOnelinerLanguage(e.target.value)}
                          sx={{ mb: 2 }}
                        >
                          {['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php'].map((lang) => (
                            <MenuItem key={lang} value={lang}>
                              {lang.toUpperCase()}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Explanation"
                          fullWidth
                          multiline
                          rows={2}
                          value={onelinerExplanation}
                          onChange={(e) => setOnelinerExplanation(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                    </>
                  )}

                  {selectedScene.type === 'comparison' && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Left Side Title (e.g. Approach A)"
                          fullWidth
                          size="small"
                          value={comparisonLeftTitle}
                          onChange={(e) => setComparisonLeftTitle(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          label="Left Side Code"
                          fullWidth
                          multiline
                          rows={4}
                          value={comparisonLeftCode}
                          onChange={(e) => setComparisonLeftCode(e.target.value)}
                          sx={{ mb: 2, fontFamily: 'monospace' }}
                        />
                        <TextField
                          select
                          label="Left Language"
                          fullWidth
                          size="small"
                          value={comparisonLeftLanguage}
                          onChange={(e) => setComparisonLeftLanguage(e.target.value)}
                          sx={{ mb: 2 }}
                        >
                          {['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php'].map((lang) => (
                            <MenuItem key={lang} value={lang}>
                              {lang.toUpperCase()}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          label="Right Side Title (e.g. Approach B)"
                          fullWidth
                          size="small"
                          value={comparisonRightTitle}
                          onChange={(e) => setComparisonRightTitle(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                        <TextField
                          label="Right Side Code"
                          fullWidth
                          multiline
                          rows={4}
                          value={comparisonRightCode}
                          onChange={(e) => setComparisonRightCode(e.target.value)}
                          sx={{ mb: 2, fontFamily: 'monospace' }}
                        />
                        <TextField
                          select
                          label="Right Language"
                          fullWidth
                          size="small"
                          value={comparisonRightLanguage}
                          onChange={(e) => setComparisonRightLanguage(e.target.value)}
                          sx={{ mb: 2 }}
                        >
                          {['javascript', 'typescript', 'jsx', 'tsx', 'python', 'java', 'csharp', 'php'].map((lang) => (
                            <MenuItem key={lang} value={lang}>
                              {lang.toUpperCase()}
                            </MenuItem>
                          ))}
                        </TextField>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Verdict Explanation"
                          fullWidth
                          multiline
                          rows={2}
                          value={comparisonVerdict}
                          onChange={(e) => setComparisonVerdict(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                    </>
                  )}

                  {selectedScene.type === 'roadmap_step' && (
                    <>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Step Number"
                          fullWidth
                          type="number"
                          size="small"
                          value={roadmapStepNumber}
                          onChange={(e) => setRoadmapStepNumber(Number(e.target.value))}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Total Steps"
                          fullWidth
                          type="number"
                          size="small"
                          value={roadmapTotalSteps}
                          onChange={(e) => setRoadmapTotalSteps(Number(e.target.value))}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Icon (Emoji)"
                          fullWidth
                          size="small"
                          value={roadmapIcon}
                          onChange={(e) => setRoadmapIcon(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Step Title"
                          fullWidth
                          size="small"
                          value={text}
                          onChange={(e) => setText(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          label="Description"
                          fullWidth
                          multiline
                          rows={3}
                          value={roadmapDescription}
                          onChange={(e) => setRoadmapDescription(e.target.value)}
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                    </>
                  )}

                  {selectedScene.type === 'summary' && (
                    <>
                      <Grid item xs={12}>
                        <TextField
                           label="Summary Title"
                           fullWidth
                           size="small"
                           value={summaryTitle}
                           onChange={(e) => setSummaryTitle(e.target.value)}
                           sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          select
                          label="Layout Format"
                          fullWidth
                          size="small"
                          value={summaryLayout}
                          onChange={(e) => setSummaryLayout(e.target.value as any)}
                          sx={{ mb: 2 }}
                        >
                          <MenuItem value="points">Takeaway Bullet Points</MenuItem>
                          <MenuItem value="paragraph">Paragraph Text Summary</MenuItem>
                        </TextField>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={summaryVoiceOver}
                              onChange={(e) => setSummaryVoiceOver(e.target.checked)}
                            />
                          }
                          label="Enable Voice Over (TTS)"
                          sx={{ mb: 2 }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Checkbox
                              checked={summaryShowSubscribe}
                              onChange={(e) => setSummaryShowSubscribe(e.target.checked)}
                            />
                          }
                          label="Overlay Like & Subscribe Animation"
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
                      
                      {summaryLayout === 'paragraph' ? (
                        <Grid item xs={12}>
                          <TextField
                            label="Summary Paragraph Text"
                            fullWidth
                            multiline
                            rows={4}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            sx={{ mb: 2 }}
                          />
                        </Grid>
                      ) : (
                        <>
                          <Grid item xs={12}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem', color: 'text.secondary' }}>
                              Takeaway Points
                            </Typography>
                          </Grid>
                          {summaryPoints.map((point, idx) => (
                            <Grid item xs={12} key={idx} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <TextField
                                label={`Point #${idx + 1}`}
                                fullWidth
                                size="small"
                                value={point}
                                onChange={(e) => {
                                  const copy = [...summaryPoints];
                                  copy[idx] = e.target.value;
                                  setSummaryPoints(copy);
                                }}
                                sx={{ mb: 1 }}
                              />
                              {summaryPoints.length > 1 && (
                                <IconButton
                                  color="error"
                                  size="small"
                                  onClick={() => {
                                    setSummaryPoints(summaryPoints.filter((_, i) => i !== idx));
                                  }}
                                  sx={{ mb: 1 }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              )}
                            </Grid>
                          ))}
                          {summaryPoints.length < 6 && (
                            <Grid item xs={12}>
                              <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => {
                                  setSummaryPoints([...summaryPoints, '']);
                                }}
                                sx={{
                                  mt: 1,
                                  borderColor: 'rgba(255, 255, 255, 0.15)',
                                  color: 'text.primary',
                                  '&:hover': {
                                    borderColor: 'primary.main',
                                    background: 'rgba(124, 58, 237, 0.08)'
                                  }
                                }}
                              >
                                Add Takeaway Point
                              </Button>
                            </Grid>
                          )}
                        </>
                      )}
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

                  {/* Font Size Overrides */}
                  <Grid item xs={12} sx={{ mt: 2.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.75rem', color: 'text.secondary', mb: 0.5 }}>
                      Font Size Overrides (Optional)
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Code Font Size (px)"
                      type="number"
                      fullWidth
                      size="small"
                      value={codeFontSize}
                      placeholder="Template default"
                      onChange={(e) => {
                        const val = e.target.value;
                        setCodeFontSize(val === '' ? '' : Number(val));
                      }}
                      inputProps={{ min: 10, max: 100 }}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      label="Text Font Size (px)"
                      type="number"
                      fullWidth
                      size="small"
                      value={explanationFontSize}
                      placeholder="Template default"
                      onChange={(e) => {
                        const val = e.target.value;
                        setExplanationFontSize(val === '' ? '' : Number(val));
                      }}
                      inputProps={{ min: 10, max: 100 }}
                    />
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
                { type: 'quiz' as SceneType, label: 'Quiz Challenge' },
                { type: 'output' as SceneType, label: 'Console Output' },
                { type: 'image' as SceneType, label: 'Image Frame' },
                { type: 'video' as SceneType, label: 'Video Clip' },
                { type: 'tip' as SceneType, label: 'Pro Tip' },
                { type: 'cta' as SceneType, label: 'CTA Message' },
                { type: 'subscribe' as SceneType, label: 'Subscribe Card' },
                { type: 'subscribe_video' as SceneType, label: 'Subscribe Video' },
                { type: 'end_screen' as SceneType, label: 'Outro Screen' },
                { type: 'guess_output' as SceneType, label: 'Guess Output' },
                { type: 'interview_question' as SceneType, label: 'Interview Q' },
                { type: 'bugfix' as SceneType, label: 'Bug Fix' },
                { type: 'oneliner' as SceneType, label: 'One-Liner' },
                { type: 'comparison' as SceneType, label: 'Comparison' },
                { type: 'roadmap_step' as SceneType, label: 'Roadmap Step' },
                { type: 'summary' as SceneType, label: 'Summary Slide' },
              ].map((item) => (
                <Grid item xs={6} key={item.type}>
                  <Tooltip
                    title={<ScenePreview type={item.type} />}
                    placement="right"
                    arrow
                    componentsProps={{
                      tooltip: {
                        sx: {
                          bgcolor: '#090a13',
                          border: '1px solid rgba(255, 255, 255, 0.08)',
                          p: 0,
                          boxShadow: '0 12px 36px rgba(0,0,0,0.6)',
                          borderRadius: 3,
                          backdropFilter: 'blur(16px)',
                        },
                      },
                      arrow: {
                        sx: {
                          color: '#090a13',
                        },
                      },
                    }}
                  >
                    <Button
                      variant="outlined"
                      fullWidth
                      size="small"
                      onClick={(e) => {
                        setPendingSceneType(item.type);
                        setInsertAnchorEl(e.currentTarget);
                      }}
                      sx={{
                        borderColor: 'rgba(255, 255, 255, 0.06)',
                        color: 'text.primary',
                        justifyContent: 'flex-start',
                        py: 1.2,
                        px: 1.8,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        borderRadius: 2,
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.01), rgba(255,255,255,0.02))',
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        '& .MuiButton-startIcon': {
                          color: getSceneColor(item.type),
                          mr: 1,
                        },
                        '&:hover': {
                          borderColor: getSceneColor(item.type),
                          background: `${getSceneColor(item.type)}0a`,
                          transform: 'translateY(-2px)',
                          boxShadow: `0 4px 12px ${getSceneColor(item.type)}15`,
                        },
                      }}
                      startIcon={getSceneIcon(item.type)}
                    >
                      {item.label}
                    </Button>
                  </Tooltip>
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

          {/* Audio Tracks & Volumes toolbar */}
          {project && (project.audio_mode === 'music' || project.audio_mode === 'voice_music') && (
            <Box sx={{ px: 3, py: 1, display: 'flex', gap: 4, alignItems: 'center', borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: '#0b0c16', flexWrap: 'wrap' }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Volume Controls:
              </Typography>
              
              {(project.audio_mode === 'music' || project.audio_mode === 'voice_music') && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: 220 }}>
                  <Typography sx={{ fontSize: 11, minWidth: 90, color: 'rgba(255,255,255,0.7)' }}>Music Volume:</Typography>
                  <Slider
                    size="small"
                    value={localMusicVolume}
                    onChange={(_, val) => setLocalMusicVolume(val as number)}
                    onChangeCommitted={(_, val) => handleMusicVolumeCommit(val as number)}
                    min={0}
                    max={100}
                    step={5}
                    valueLabelDisplay="auto"
                    sx={{ flexGrow: 1 }}
                  />
                  <Typography sx={{ fontSize: 10, fontFamily: 'monospace', minWidth: 30, textAlign: 'right' }}>
                    {localMusicVolume}%
                  </Typography>
                </Box>
              )}

              {project.audio_mode === 'voice_music' && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, width: 220 }}>
                  <Typography sx={{ fontSize: 11, minWidth: 90, color: 'rgba(255,255,255,0.7)' }}>Voice Volume:</Typography>
                  <Slider
                    size="small"
                    value={localVoiceVolume}
                    onChange={(_, val) => setLocalVoiceVolume(val as number)}
                    onChangeCommitted={(_, val) => handleVoiceVolumeCommit(val as number)}
                    min={0}
                    max={100}
                    step={5}
                    valueLabelDisplay="auto"
                    sx={{ flexGrow: 1 }}
                  />
                  <Typography sx={{ fontSize: 10, fontFamily: 'monospace', minWidth: 30, textAlign: 'right' }}>
                    {localVoiceVolume}%
                  </Typography>
                </Box>
              )}
            </Box>
          )}

          {/* Timeline ruler and track area */}
          <Box
            ref={timelineTrackRef}
            onClick={handleTimelineClick}
            sx={{ overflowX: 'auto', p: 3, background: '#090a13', display: 'flex', flexDirection: 'column', gap: 1, position: 'relative', cursor: 'crosshair' }}
          >
            
            {/* Timeline rulers / ticks */}
            <Box sx={{ position: 'relative', height: 22, mb: 1, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              {Array.from({ length: Math.ceil(totalFrames / 10) + 1 }).map((_, tickIdx) => {
                const f = tickIdx * 10; // frame index
                const isMajor = f % 30 === 0;
                return (
                  <div
                    key={tickIdx}
                    style={{
                      position: 'absolute',
                      left: f * zoom,
                      fontSize: 9,
                      color: isMajor ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)',
                      fontFamily: 'monospace',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      transform: 'translateX(-50%)',
                    }}
                  >
                    {isMajor ? (
                      <>
                        <span>{f / 30}s</span>
                        <div style={{ width: 1, height: 6, backgroundColor: 'rgba(255,255,255,0.25)', marginTop: 2 }} />
                      </>
                    ) : (
                      <div style={{ width: 1, height: 4, backgroundColor: 'rgba(255,255,255,0.12)', marginTop: 10 }} />
                    )}
                  </div>
                );
              })}
            </Box>

            {/* Main horizontal tracks container */}
            <Box
              sx={{
                display: 'flex',
                position: 'relative',
                alignItems: 'stretch',
                height: 74,
                width: 'fit-content',
                bgcolor: 'rgba(255,255,255,0.01)',
                border: '1px dashed rgba(255,255,255,0.05)',
                borderRadius: 2.5,
                p: '2px',
              }}
            >
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
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: isSelected ? `0 0 15px ${blockBgColor}80` : isPlaying ? `0 0 20px rgba(239, 68, 68, 0.4)` : 'none',
                      opacity: draggedSceneId === scene.id ? 0.3 : 1,
                      transform: isOver ? 'scale(0.95)' : 'scale(1)',
                      '&:hover': {
                        borderColor: isSelected ? '#ffffff' : 'rgba(255,255,255,0.4)',
                        boxShadow: isSelected ? `0 0 20px ${blockBgColor}a0` : `0 0 12px ${blockBgColor}60`,
                        transform: isSelected ? 'scale(1.02)' : 'scale(1.01)',
                        zIndex: 2,
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

              {/* Playhead indicator - red vertical line with wider interactive handle */}
              <div
                onMouseDown={handlePlayheadMouseDown}
                style={{
                  position: 'absolute',
                  left: playheadFrame * zoom - 8,
                  top: -26,
                  bottom: 0,
                  width: 16,
                  cursor: 'ew-resize',
                  zIndex: 10,
                  pointerEvents: 'auto',
                  display: 'flex',
                  justifyContent: 'center',
                  transition: isDraggingPlayhead ? 'none' : 'left 0.05s ease-out',
                }}
              >
                {/* Visual red vertical line */}
                <div
                  style={{
                    width: 2,
                    height: '100%',
                    backgroundColor: '#ef4444',
                    boxShadow: isDraggingPlayhead ? '0 0 8px #ef4444, 0 0 15px #ef4444' : 'none',
                    transition: 'box-shadow 0.2s',
                  }}
                />
                
                {/* Visual handle at the top (shield/teardrop design) */}
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    width: 14,
                    height: 10,
                    borderRadius: '2px 2px 0 0',
                    backgroundColor: '#ef4444',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    width: 0,
                    height: 0,
                    borderLeft: '7px solid transparent',
                    borderRight: '7px solid transparent',
                    borderTop: '6px solid #ef4444',
                  }}
                />
              </div>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Menu for selecting insert position */}
      <Menu
        anchorEl={insertAnchorEl}
        open={Boolean(insertAnchorEl)}
        onClose={() => {
          setInsertAnchorEl(null);
          setPendingSceneType(null);
        }}
        PaperProps={{
          sx: {
            background: '#121420',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            '& .MuiMenuItem-root': {
              fontSize: '0.85rem',
              color: 'rgba(255,255,255,0.8)',
              py: 1.2,
              px: 2.5,
              '&:hover': {
                background: 'rgba(255,255,255,0.05)',
                color: '#fff',
              },
              '&.Mui-disabled': {
                color: 'rgba(255,255,255,0.3)',
              },
            },
          },
        }}
      >
        <MenuItem
          onClick={() => {
            if (pendingSceneType) {
              handleAddScene(pendingSceneType, 'start');
            }
            setInsertAnchorEl(null);
            setPendingSceneType(null);
          }}
        >
          Add at the Beginning
        </MenuItem>
        <MenuItem
          disabled={!selectedSceneId}
          onClick={() => {
            if (pendingSceneType) {
              handleAddScene(pendingSceneType, 'after_selected');
            }
            setInsertAnchorEl(null);
            setPendingSceneType(null);
          }}
        >
          Insert After Selected Block
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (pendingSceneType) {
              handleAddScene(pendingSceneType, 'end');
            }
            setInsertAnchorEl(null);
            setPendingSceneType(null);
          }}
        >
          Add to the End
        </MenuItem>
      </Menu>
    </Box>
  );
}
