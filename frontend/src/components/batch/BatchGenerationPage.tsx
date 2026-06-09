// ============================================================
// Batch Generation Dashboard Page
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Paper,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {
  CloudUpload as UploadIcon,
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import * as api from '../../api/client.js';
import type { Batch } from '../../types/index.js';

export default function BatchGenerationPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [batches, setBatches] = useState<Batch[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Snackbar Notification State
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  const loadBatches = async () => {
    try {
      setLoading(true);
      const data = await api.getBatches();
      setBatches(data);
    } catch (err) {
      console.error('Failed to load batches:', err);
      showToast('Failed to load batch list', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBatches();
  }, []);

  const showToast = (message: string, severity: 'success' | 'error' = 'success') => {
    setToast({ open: true, message, severity });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await uploadFile(file);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await uploadFile(file);
      // Reset input value to allow uploading the same file name later
      e.target.value = '';
    }
  };

  const uploadFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'csv' && ext !== 'xlsx' && ext !== 'json') {
      showToast('Invalid file format. Please upload a CSV, XLSX, or JSON file.', 'error');
      return;
    }

    try {
      setUploading(true);
      const result = await api.uploadBatchFile(file);
      showToast('Batch uploaded and queued successfully!');
      
      // Navigate to the batch detail page immediately
      navigate(`/batch/${result.batchId}`);
    } catch (err) {
      console.error('Failed to upload file:', err);
      showToast(err instanceof Error ? err.message : 'File parsing failed', 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteBatch = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this batch and all its rendered videos?')) {
      return;
    }

    try {
      await api.deleteBatch(id);
      showToast('Batch deleted successfully!');
      loadBatches();
    } catch (err) {
      console.error('Failed to delete batch:', err);
      showToast('Failed to delete batch', 'error');
    }
  };

  const handleDownloadZip = (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation();
    api.downloadBatchZip(id, name);
  };

  const triggerUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Define table columns
  const columns: GridColDef[] = [
    {
      field: 'name',
      headerName: 'Batch Name',
      flex: 1.5,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, height: '100%' }}>
          <FileIcon color="primary" fontSize="small" />
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {params.value}
          </Typography>
        </Box>
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
      field: 'progress',
      headerName: 'Rendering Progress',
      flex: 2,
      renderCell: (params) => {
        const completed = params.row.completed_videos || 0;
        const failed = params.row.failed_videos || 0;
        const total = params.row.total_videos || 0;
        const processed = completed + failed;
        const pct = total > 0 ? Math.round((processed / total) * 100) : 0;

        return (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%', width: '100%', pr: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {completed} Done • {failed} Failed
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: 600 }}>
                {pct}% ({processed}/{total})
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={pct}
              color={failed > 0 && completed === 0 ? 'error' : pct === 100 ? 'success' : 'primary'}
              sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.06)' }}
            />
          </Box>
        );
      },
    },
    {
      field: 'created_at',
      headerName: 'Uploaded At',
      width: 170,
      valueGetter: (value) => {
        if (!value) return '';
        return new Date(value).toLocaleString();
      },
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 180,
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
          <Tooltip title="View Details">
            <IconButton
              size="small"
              onClick={() => navigate(`/batch/${params.row.id}`)}
              sx={{ color: '#06b6d4', '&:hover': { bgcolor: 'rgba(6,182,212,0.1)' } }}
            >
              <ViewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Download ZIP">
            <span>
              <IconButton
                size="small"
                onClick={(e) => handleDownloadZip(params.row.id, params.row.name, e)}
                disabled={params.row.completed_videos === 0}
                sx={{ color: '#10b981', '&:hover': { bgcolor: 'rgba(16,185,129,0.1)' } }}
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Delete Batch">
            <IconButton
              size="small"
              onClick={(e) => handleDeleteBatch(params.row.id, e)}
              sx={{ color: '#ef4444', '&:hover': { bgcolor: 'rgba(239,68,68,0.1)' } }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
    },
  ];

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {/* Title */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Batch Video Generation
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Upload CSV, XLSX, or JSON spreadsheets to generate hundreds of coding Shorts automatically.
          </Typography>
        </Box>
        <Button
          startIcon={<RefreshIcon />}
          variant="outlined"
          onClick={loadBatches}
          sx={{ borderRadius: 2 }}
        >
          Refresh
        </Button>
      </Box>

      {/* Upload Zone */}
      <Card
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerUploadClick}
        sx={{
          p: 5,
          cursor: 'pointer',
          textAlign: 'center',
          background: dragOver ? 'rgba(124, 58, 237, 0.08)' : 'rgba(255, 255, 255, 0.01)',
          border: uploading ? '1px solid rgba(255,255,255,0.06)' : dragOver ? '2px dashed #7c3aed' : '2px dashed rgba(255, 255, 255, 0.1)',
          borderRadius: 4,
          boxShadow: dragOver ? '0 0 24px rgba(124, 58, 237, 0.2)' : 'none',
          transition: 'all 0.3s ease',
          '&:hover': {
            background: 'rgba(255, 255, 255, 0.02)',
            borderColor: uploading ? 'rgba(255,255,255,0.06)' : '#7c3aed',
            boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
          },
        }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".csv,.xlsx,.json"
          style={{ display: 'none' }}
          disabled={uploading}
        />
        <CardContent sx={{ p: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          {uploading ? (
            <Box sx={{ width: '100%', py: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <LinearProgress sx={{ width: 120, height: 6, borderRadius: 3 }} />
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Parsing spreadsheet records...
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This will take only a few moments.
              </Typography>
            </Box>
          ) : (
            <>
              <Box
                sx={{
                  width: 68,
                  height: 68,
                  borderRadius: '50%',
                  bgcolor: 'rgba(124, 58, 237, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#7c3aed',
                  mb: 1,
                  animation: dragOver ? 'pulse 1s infinite' : 'none',
                }}
              >
                <UploadIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                Drag & drop your file here, or <span style={{ color: '#7c3aed' }}>browse</span>
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450 }}>
                Supports **CSV**, **XLSX**, or **JSON** formats. Make sure your spreadsheet contains fields: **title**, **hook**, **code**, **output**, **cta**, **language**, and **template**.
              </Typography>
            </>
          )}
        </CardContent>
      </Card>

      {/* Batches Table List */}
      <Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2.5 }}>
          Existing Batches
        </Typography>
        <Paper
          sx={{
            height: 450,
            width: '100%',
            bgcolor: 'rgba(255,255,255,0.01)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 3.5,
            overflow: 'hidden',
          }}
        >
          <DataGrid
            rows={batches}
            columns={columns}
            loading={loading}
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
        </Paper>
      </Box>

      {/* Toast Notification */}
      <Snackbar
        open={toast.open}
        autoHideDuration={6000}
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
