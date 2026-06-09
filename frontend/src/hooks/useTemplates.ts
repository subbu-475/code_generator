import { useState, useEffect, useCallback } from 'react';
import type { Template, TemplateInput } from '../types';
import * as api from '../api/client';

interface UseTemplatesReturn {
  templates: Template[];
  loading: boolean;
  error: string | null;
  fetchTemplates: () => Promise<void>;
  createTemplate: (input: TemplateInput) => Promise<Template>;
  updateTemplate: (id: string, input: Partial<TemplateInput>) => Promise<Template>;
  deleteTemplate: (id: string) => Promise<void>;
}

export function useTemplates(): UseTemplatesReturn {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTemplates();
      setTemplates(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch templates');
    } finally {
      setLoading(false);
    }
  }, []);

  const createTemplate = useCallback(async (input: TemplateInput): Promise<Template> => {
    const template = await api.createTemplate(input);
    setTemplates((prev) => [template, ...prev]);
    return template;
  }, []);

  const updateTemplate = useCallback(async (id: string, input: Partial<TemplateInput>): Promise<Template> => {
    const template = await api.updateTemplate(id, input);
    setTemplates((prev) => prev.map((t) => (t.id === id ? template : t)));
    return template;
  }, []);

  const deleteTemplate = useCallback(async (id: string): Promise<void> => {
    await api.deleteTemplate(id);
    setTemplates((prev) => prev.filter((t) => t.id !== id));
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  return {
    templates,
    loading,
    error,
    fetchTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  };
}
