import axios from 'axios';
import type {
  Project,
  ProjectInput,
  Template,
  TemplateInput,
  ExportRecord,
  Settings,
  ApiResponse,
  RenderRequest,
  RenderProgress,
  CodeImageRequest,
  CodeImageResponse,
  AudioRequest,
  AudioResponse,
  HealthCheck,
  Batch,
  BatchItem,
  BatchProgress,
} from '../types';

// ---- Axios Instance ----

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Response interceptor for unified error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    console.error('[API Error]', message);
    return Promise.reject(new Error(message));
  }
);

// ---- Helper ----

function unwrap<T>(response: { data: ApiResponse<T> }): T {
  if (!response.data.success) {
    throw new Error(response.data.error || 'Request failed');
  }
  return response.data.data as T;
}

// ---- Projects ----

export async function getProjects(): Promise<Project[]> {
  return unwrap(await api.get<ApiResponse<Project[]>>('/projects'));
}

export async function getProject(id: string): Promise<Project> {
  return unwrap(await api.get<ApiResponse<Project>>(`/projects/${id}`));
}

export async function createProject(input: ProjectInput): Promise<Project> {
  return unwrap(await api.post<ApiResponse<Project>>('/projects', input));
}

export async function updateProject(id: string, input: Partial<ProjectInput>): Promise<Project> {
  return unwrap(await api.put<ApiResponse<Project>>(`/projects/${id}`, input));
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}

// ---- Templates ----

export async function getTemplates(): Promise<Template[]> {
  return unwrap(await api.get<ApiResponse<Template[]>>('/templates'));
}

export async function getTemplate(id: string): Promise<Template> {
  return unwrap(await api.get<ApiResponse<Template>>(`/templates/${id}`));
}

export async function createTemplate(input: TemplateInput): Promise<Template> {
  return unwrap(await api.post<ApiResponse<Template>>('/templates', input));
}

export async function updateTemplate(id: string, input: Partial<TemplateInput>): Promise<Template> {
  return unwrap(await api.put<ApiResponse<Template>>(`/templates/${id}`, input));
}

export async function deleteTemplate(id: string): Promise<void> {
  await api.delete(`/templates/${id}`);
}

// ---- Code Image ----

export async function generateCodeImage(request: CodeImageRequest): Promise<CodeImageResponse> {
  return unwrap(await api.post<ApiResponse<CodeImageResponse>>('/code-image', request));
}

// ---- Audio ----

export async function generateAudio(request: AudioRequest): Promise<AudioResponse> {
  return unwrap(await api.post<ApiResponse<AudioResponse>>('/audio', request));
}

// ---- Render ----

export async function renderVideo(request: RenderRequest): Promise<{ jobId: string }> {
  return unwrap(await api.post<ApiResponse<{ jobId: string }>>('/render', request));
}

export function getRenderProgress(
  projectId: string,
  onProgress: (progress: RenderProgress) => void,
  onError: (error: Error) => void
): () => void {
  const eventSource = new EventSource(`/api/render-progress/${projectId}`);

  eventSource.onmessage = (event) => {
    try {
      const data: RenderProgress = JSON.parse(event.data);
      onProgress(data);
      if (data.status === 'complete' || data.status === 'error') {
        eventSource.close();
      }
    } catch (e) {
      console.error('Failed to parse SSE data:', e);
    }
  };

  eventSource.onerror = () => {
    onError(new Error('Lost connection to render progress'));
    eventSource.close();
  };

  // Return cleanup function
  return () => {
    eventSource.close();
  };
}

// ---- Exports ----

export async function getExports(): Promise<ExportRecord[]> {
  return unwrap(await api.get<ApiResponse<ExportRecord[]>>('/exports'));
}

export async function getExport(id: string): Promise<ExportRecord> {
  return unwrap(await api.get<ApiResponse<ExportRecord>>(`/exports/${id}`));
}

export async function deleteExport(id: string): Promise<void> {
  await api.delete(`/exports/${id}`);
}

export function downloadExport(id: string): void {
  window.open(`/api/exports/${id}/download`, '_blank');
}

// ---- Scenes ----

export async function addScene(
  projectId: string,
  type: string,
  insertAfterId?: string,
): Promise<any> {
  return unwrap(
    await api.post<ApiResponse<any>>(`/projects/${projectId}/scenes`, {
      type,
      insertAfterId,
    }),
  );
}

export async function reorderScenes(
  projectId: string,
  sceneIds: string[],
): Promise<void> {
  await api.put<ApiResponse<void>>(`/projects/${projectId}/scenes/reorder`, {
    sceneIds,
  });
}

export async function deleteScene(
  projectId: string,
  sceneId: string,
): Promise<void> {
  await api.delete<ApiResponse<void>>(`/projects/${projectId}/scenes/${sceneId}`);
}

export async function updateScene(
  projectId: string,
  sceneId: string,
  updates: any,
): Promise<any> {
  return unwrap(
    await api.put<ApiResponse<any>>(`/projects/${projectId}/scenes/${sceneId}`, updates),
  );
}

// ---- Settings ----

export async function getSettings(): Promise<Settings> {
  return unwrap(await api.get<ApiResponse<Settings>>('/settings'));
}

export async function updateSettings(settings: Partial<Settings>): Promise<Settings> {
  return unwrap(await api.put<ApiResponse<Settings>>('/settings', settings));
}

// ---- Health ----

export async function getHealth(): Promise<HealthCheck> {
  const res = await api.get<HealthCheck>('/health');
  return res.data;
}

// ---- Upload ----

export async function uploadFile(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post<ApiResponse<{ url: string; filename: string }>>('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return unwrap(res);
}

// ---- Batch Generation ----

export async function uploadBatchFile(file: File): Promise<{ batchId: string }> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post<ApiResponse<{ batchId: string }>>('/batch/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return unwrap(res);
}

export async function startBatchQueue(): Promise<void> {
  await api.post('/batch/start');
}

export async function getBatches(): Promise<Batch[]> {
  return unwrap(await api.get<ApiResponse<Batch[]>>('/batch'));
}

export async function getBatch(id: string): Promise<Batch & { items: BatchItem[] }> {
  return unwrap(await api.get<ApiResponse<Batch & { items: BatchItem[] }>>(`/batch/${id}`));
}

export async function getBatchStatus(id: string): Promise<BatchProgress> {
  return unwrap(await api.get<ApiResponse<BatchProgress>>(`/batch/${id}/status`));
}

export function downloadBatchZip(id: string, name: string): void {
  window.open(`/api/batch/${id}/download`, '_blank');
}

export async function retryBatch(id: string): Promise<void> {
  await api.post(`/batch/${id}/retry`);
}

export async function deleteBatch(id: string): Promise<void> {
  await api.delete(`/batch/${id}`);
}

export default api;
