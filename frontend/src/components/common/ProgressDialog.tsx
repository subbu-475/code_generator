import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import DownloadIcon from '@mui/icons-material/Download';
import type { RenderProgress } from '../../types';

interface ProgressDialogProps {
  open: boolean;
  progress: RenderProgress | null;
  isRendering: boolean;
  error: string | null;
  onCancel: () => void;
  onRetry?: () => void;
  onDownload?: (path: string) => void;
  onClose?: () => void;
}

interface StepInfo {
  key: string;
  label: string;
}

const STEPS: StepInfo[] = [
  { key: 'bundling', label: 'Preparing scenes' },
  { key: 'rendering', label: 'Generating code images' },
  { key: 'encoding', label: 'Rendering & encoding video' },
  { key: 'complete', label: 'Export complete' },
];

function getStepStatus(
  stepKey: string,
  currentStatus: string | undefined
): 'done' | 'active' | 'pending' | 'error' {
  if (currentStatus === 'error') return 'error';

  const stepOrder = ['bundling', 'rendering', 'encoding', 'complete'];
  const currentIdx = stepOrder.indexOf(currentStatus || '');
  const stepIdx = stepOrder.indexOf(stepKey);

  if (stepIdx < currentIdx) return 'done';
  if (stepIdx === currentIdx) return currentStatus === 'complete' ? 'done' : 'active';
  return 'pending';
}

export default function ProgressDialog({
  open,
  progress,
  isRendering,
  error,
  onCancel,
  onRetry,
  onDownload,
  onClose,
}: ProgressDialogProps) {
  const isComplete = progress?.status === 'complete';
  const isError = progress?.status === 'error' || !!error;

  return (
    <Dialog
      open={open}
      maxWidth="sm"
      fullWidth
      disableEscapeKeyDown={isRendering}
      id="render-progress-dialog"
    >
      <DialogTitle
        sx={{
          textAlign: 'center',
          pt: 4,
          pb: 1,
          fontSize: '1.4rem',
          fontWeight: 700,
        }}
      >
        {isComplete
          ? '🎉 Video Rendered!'
          : isError
          ? '❌ Render Failed'
          : '🎬 Rendering Video...'}
      </DialogTitle>

      <DialogContent sx={{ px: 4, pb: 2 }}>
        {/* Steps */}
        <Box sx={{ my: 3 }}>
          {STEPS.map((step) => {
            const status = getStepStatus(step.key, progress?.status);
            return (
              <Box
                key={step.key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  py: 1.2,
                  opacity: status === 'pending' ? 0.4 : 1,
                  transition: 'opacity 0.3s ease',
                }}
              >
                {status === 'done' && (
                  <CheckCircleIcon sx={{ color: '#10b981', fontSize: 22 }} />
                )}
                {status === 'active' && (
                  <ArrowForwardIcon
                    sx={{
                      color: '#7c3aed',
                      fontSize: 22,
                      animation: 'pulse 1.5s ease infinite',
                    }}
                  />
                )}
                {status === 'pending' && (
                  <RadioButtonUncheckedIcon sx={{ color: '#4b5563', fontSize: 22 }} />
                )}
                {status === 'error' && (
                  <ErrorOutlineIcon sx={{ color: '#ef4444', fontSize: 22 }} />
                )}
                <Typography
                  sx={{
                    fontWeight: status === 'active' ? 600 : 400,
                    color: status === 'active' ? '#f1f5f9' : status === 'done' ? '#94a3b8' : '#4b5563',
                  }}
                >
                  {step.label}
                </Typography>
              </Box>
            );
          })}
        </Box>

        {/* Progress bar */}
        {!isError && (
          <Box sx={{ mt: 3 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                {progress?.message || 'Initializing...'}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  fontFamily: '"JetBrains Mono", monospace',
                  color: isComplete ? '#10b981' : '#a78bfa',
                }}
              >
                {progress?.progress || 0}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={progress?.progress || 0}
              sx={{
                height: 10,
                borderRadius: 5,
                ...(isComplete && {
                  '& .MuiLinearProgress-bar': {
                    background: 'linear-gradient(90deg, #10b981, #06b6d4)',
                  },
                }),
              }}
            />
          </Box>
        )}

        {/* Error message */}
        {isError && (
          <Box
            sx={{
              mt: 2,
              p: 2,
              borderRadius: 2,
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <Typography variant="body2" sx={{ color: '#f87171' }}>
              {error || progress?.message || 'An unexpected error occurred during rendering.'}
            </Typography>
          </Box>
        )}

        {/* Success download */}
        {isComplete && progress?.output_path && (
          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              id="download-rendered-video-btn"
              variant="contained"
              color="success"
              startIcon={<DownloadIcon />}
              onClick={() => onDownload?.(progress.output_path!)}
              sx={{
                px: 4,
                py: 1.5,
                background: 'linear-gradient(135deg, #10b981, #059669)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #34d399, #10b981)',
                  boxShadow: '0 4px 16px rgba(16, 185, 129, 0.4)',
                },
              }}
            >
              Download Video
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 3, justifyContent: 'center', gap: 1 }}>
        {isRendering && (
          <Button
            id="cancel-render-btn"
            variant="outlined"
            color="error"
            onClick={onCancel}
          >
            Cancel
          </Button>
        )}
        {isError && onRetry && (
          <Button
            id="retry-render-btn"
            variant="contained"
            onClick={onRetry}
          >
            Retry
          </Button>
        )}
        {(isComplete || isError) && (
          <Button
            id="close-progress-dialog-btn"
            variant="outlined"
            onClick={onClose || onCancel}
          >
            Close
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
