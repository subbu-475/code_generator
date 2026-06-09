import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './components/dashboard/Dashboard';
import ProjectList from './components/projects/ProjectList';
import ProjectForm from './components/projects/ProjectForm';
import ProjectDetail from './components/projects/ProjectDetail';
import TemplateList from './components/templates/TemplateList';
import TemplateEditor from './components/templates/TemplateEditor';
import ExportedVideos from './components/exports/ExportedVideos';
import SettingsPage from './components/settings/SettingsPage';
import BatchGenerationPage from './components/batch/BatchGenerationPage';
import BatchDetailPage from './components/batch/BatchDetailPage';

export default function App() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/new" element={<ProjectForm />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />
        <Route path="/projects/:id/edit" element={<ProjectForm />} />
        <Route path="/templates" element={<TemplateList />} />
        <Route path="/templates/:id/edit" element={<TemplateEditor />} />
        <Route path="/exports" element={<ExportedVideos />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/batch" element={<BatchGenerationPage />} />
        <Route path="/batch/:id" element={<BatchDetailPage />} />
      </Routes>
    </AppLayout>
  );
}
