// ============================================================
// Batch Details & Progress Page
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Grid,
  LinearProgress,
  IconButton,
  Chip,
  Snackbar,
  Alert,
  Tooltip,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  GetApp as DownloadIcon,
  Replay as RetryIcon,
  PlayCircle as PlayIcon,
  ErrorOutline as ErrorIcon,
} from '@mui/icons-material';
import * as api from '../../api/client.js';
import type { Batch, BatchItem } from '../../types/index.js';

export default function BatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [batch, setBatch] = useState<Batch | null>(null);
  const [items, setItems] = useState<BatchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);

  // Snackbar Notification State
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Store polling interval ref
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = (message: string, severity: 'success' | 'error' = 'success') => {
    setToast({ open: true, message, severity });
  };

  const loadBatchData = async (showLoading = false) => {
    if (!id) return;
    try {
      if (showLoading) setLoading(true);
      const data = await api.getBatch(id);
      setBatch({
        id: data.id,
        name: data.name,
        status: data.status,
        total_videos: data.total_videos,
        completed_videos: data.completed_videos,
        failed_videos: data.failed_videos,
        created_at: data.created_at,
      });
      setItems(data.items);
    } catch (err) {
      console.error('Failed to load batch detail:', err);
      showToast('Failed to load batch details', 'error');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadBatchData(true);
  }, [id]);

  // Setup auto-polling loop every 2 seconds if batch is running/pending
  useEffect(() => {
    if (batch && (batch.status === 'processing' || batch.status === 'pending')) {
      if (!pollingRef.current) {
        pollingRef.current = setInterval(() => {
          loadBatchData(false);
        }, 2000);
      }
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [batch]);

  const handleRetryFailed = async () => {
    if (!id) return;
    try {
      setRetrying(true);
      await api.retryBatch(id);
      showToast('Failed render tasks re-queued successfully!');
      loadBatchData(false);
    } catch (err) {
      console.error('Failed to retry batch:', err);
      showToast(err instanceof Error ? err.message : 'Failed to trigger retry', 'error');
    } finally {
      setRetrying(false);
    }
  };

  const handleDownloadAll = () => {
    if (batch && id) {
      api.downloadBatchZip(id, batch.name);
    }
  };

  const handlePlayVideo = (path: string) => {
    window.open(path, '_blank');
  };

  // Grid columns definition
  const columns: GridColDef[] = [
    {
      field: 'title',
      headerName: 'Video Title',
      flex: 1.5,
      renderCell: (params) => (
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {params.value}
        </Typography>
      ),
    },
    {
      field: 'language',
      headerName: 'Language',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value as string}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ textTransform: 'capitalize', fontWeight: 600 }}
        />
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 130,
      renderCell: (params) => {
        const val = params.value as string;
        let color: 'default' | 'primary' | 'warning' | 'success' | 'error' = 'default';
        if (val === 'processing') color = 'warning';
        if (val === 'completed') color = 'success';
        if (val === 'failed') color = 'error';

        return (
          <Box sx={{ display: 'flex', alignItems: 'center', height: '100%' }}>
            <Chip
              label={val}
              size="small"
              color={color}
              sx={{ textTransform: 'capitalize', fontWeight: 700 }}
            />
          </Box>
        );
      },
    },
    {
      field: 'error_message',
      headerName: 'Logs / Error',
      flex: 2,
      renderCell: (params) => {
        if (!params.value) return null;
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#ef4444', height: '100%' }}>
            <ErrorIcon fontSize="small" />
            <Typography variant="caption" noWrap>
              {params.value}
            </Typography>
          </Box>
        );
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 140,
      sortable: false,
      filterable: false,
      renderCell: (params) => {
        const val = params.row.status as string;
        const videoPath = params.row.video_path as string | null;

        return (
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
            {val === 'completed' && videoPath ? (
              <Tooltip title="Play Rendered Video">
                <IconButton
                  size="small"
                  onClick={() => handlePlayVideo(videoPath)}
                  sx={{ color: '#10b981', '&:hover': { bgcolor: 'rgba(16,185,129,0.1)' } }}
                >
                  <PlayIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : null}
          </Box>
        );
      },
    },
  ];

  if (loading && !batch) {
    return (
      <Box sx={{ width: '100%', py: 10, display: 'flex', justifyContent: 'center' }}>
        <LinearProgress sx={{ width: 200, height: 6, borderRadius: 3 }} />
      </Box>
    );
  }

  if (!batch) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography color="error">Batch detail not found.</Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate('/batch')} sx={{ mt: 2 }}>
          Back to Batches
        </Button>
      </Box>
    );
  }

  const processed = batch.completed_videos + batch.failed_videos;
  const pct = batch.total_videos > 0 ? Math.round((processed / batch.total_videos) * 100) : 0;
  const remaining = batch.total_videos - processed;

  const stats = [
    { title: 'Total Videos', value: batch.total_videos, color: '#7c3aed' },
    { title: 'Completed', value: batch.completed_videos, color: '#10b981' },
    { title: 'Failed', value: batch.failed_videos, color: '#ef4444' },
    { title: 'Remaining', value: remaining, color: '#eab308' },
  ];

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <IconButton onClick={() => navigate('/batch')} sx={{ border: '1px solid rgba(255,255,255,0.06)' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Batch: {batch.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Chip
              label={batch.status}
              size="small"
              color={
                batch.status === 'completed'
                  ? 'success'
                  : batch.status === 'processing'
                  ? 'warning'
                  : batch.status === 'failed'
                  ? 'error'
                  : 'default'
              }
              sx={{ textTransform: 'capitalize', fontWeight: 700 }}
            />
            <Typography variant="caption" color="text.secondary">
              Created {new Date(batch.created_at).toLocaleString()}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            startIcon={<RetryIcon />}
            variant="outlined"
            onClick={handleRetryFailed}
            disabled={batch.failed_videos === 0 || retrying}
            sx={{ borderRadius: 2 }}
          >
            {retrying ? 'Re-queuing...' : 'Retry Failed'}
          </Button>
          <Button
            startIcon={<DownloadIcon />}
            variant="contained"
            onClick={handleDownloadAll}
            disabled={batch.completed_videos === 0}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            Download All (ZIP)
          </Button>
        </Box>
      </Box>

      {/* Progress Cards */}
      <Grid container spacing={3}>
        {stats.map((s) => (
          <Grid item xs={12} sm={6} md={3} key={s.title}>
            <Card sx={{ bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 3 }}>
              <CardContent sx={{ py: '20px !important' }}>
                <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                  {s.title}
                </Typography>
                <Typography variant="h3" sx={{ fontWeight: 800, color: s.color }}>
                  {s.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Progress Bar Card */}
      <Card sx={{ bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', p: 3, borderRadius: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body1" sx={{ fontWeight: 700 }}>
            Overall Rendering Progress
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 800, color: '#7c3aed' }}>
            {pct}% ({processed} of {batch.total_videos} processed)
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={pct}
          color={pct === 100 ? 'success' : 'primary'}
          sx={{ height: 12, borderRadius: 6, bgcolor: 'rgba(255,255,255,0.06)' }}
        />
      </Card>

      {/* Grid List */}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            Batch Video Logs
          </Typography>
          <Button
            size="small"
            startIcon={<RefreshIcon />}
            onClick={() => loadBatchData(false)}
            sx={{ borderRadius: 1.5 }}
          >
            Force Sync
          </Button>
        </Box>
        <Card sx={{ bgcolor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 3.5, overflow: 'hidden', height: 500 }}>
          <DataGrid
            rows={items}
            columns={columns}
            initialState={{
              pagination: { paginationModel: { pageSize: 10 } },
            }}
            pageSizeOptions={[5, 10, 25]}
            disableRowSelectionOnClick
            sx={{
              border: 'none',
              '& .MuiDataGrid-cell': {
                borderBottom: '1px solid rgba(255,255,255,0.04)',
              },
              '& .MuiDataGrid-columnHeaders': {
                bgcolor: 'rgba(0,0,0,0.2)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              },
              '& .MuiDataGrid-footerContainer': {
                borderTop: '1px solid rgba(255,255,255,0.06)',
              },
              color: 'rgba(255,255,255,0.85)',
            }}
          />
        </Card>
      </Box>

      {/* Snackbar notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast({ ...toast, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToast({ ...toast, open: false })}
          severity={toast.severity}
          sx={{ width: '100%', borderRadius: 2 }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
