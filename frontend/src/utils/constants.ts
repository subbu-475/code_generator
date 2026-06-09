import DashboardIcon from '@mui/icons-material/Dashboard';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import PaletteIcon from '@mui/icons-material/Palette';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import type { SvgIconComponent } from '@mui/icons-material';

export interface NavItemConfig {
  label: string;
  path: string;
  icon: SvgIconComponent;
}

export const NAV_ITEMS: NavItemConfig[] = [
  { label: 'Dashboard', path: '/', icon: DashboardIcon },
  { label: 'Projects', path: '/projects', icon: VideoLibraryIcon },
  { label: 'Templates', path: '/templates', icon: PaletteIcon },
  { label: 'Exports', path: '/exports', icon: DownloadIcon },
  { label: 'Settings', path: '/settings', icon: SettingsIcon },
];

export const DRAWER_WIDTH = 280;

export const LANGUAGE_COLORS: Record<string, string> = {
  javascript: '#f7df1e',
  typescript: '#3178c6',
  jsx: '#61dafb',
  tsx: '#3178c6',
  python: '#3776ab',
  java: '#ed8b00',
  csharp: '#68217a',
  php: '#777bb4',
};

export const STATUS_COLORS: Record<string, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  draft: 'default',
  rendering: 'warning',
  completed: 'success',
  error: 'error',
};

export const FONT_OPTIONS = [
  { value: 'JetBrains Mono', label: 'JetBrains Mono' },
  { value: 'Consolas', label: 'Consolas' },
  { value: 'Fira Code', label: 'Fira Code' },
  { value: 'Space Mono', label: 'Space Mono' },
  { value: 'SF Mono', label: 'SF Mono' },
];

export const RESOLUTION_OPTIONS = [
  { value: '720p', label: '720p (HD)' },
  { value: '1080p', label: '1080p (Full HD)' },
  { value: '4k', label: '4K (Ultra HD)' },
];

export function formatFileSize(bytes: number | null): string {
  if (bytes === null || bytes === 0) return '—';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let size = bytes;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(1)} ${units[i]}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function framesToSeconds(frames: number, fps: number = 30): string {
  return (frames / fps).toFixed(1);
}
