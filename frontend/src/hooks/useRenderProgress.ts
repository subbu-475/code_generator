import { useState, useEffect, useRef, useCallback } from 'react';
import type { RenderProgress } from '../types';
import { getRenderProgress } from '../api/client';

interface UseRenderProgressReturn {
  progress: RenderProgress | null;
  isRendering: boolean;
  error: string | null;
  startListening: (projectId: string) => void;
  stopListening: () => void;
}

export function useRenderProgress(): UseRenderProgressReturn {
  const [progress, setProgress] = useState<RenderProgress | null>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);

  const stopListening = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setIsRendering(false);
  }, []);

  const startListening = useCallback(
    (projectId: string) => {
      // Clean up previous listener
      stopListening();

      setIsRendering(true);
      setError(null);
      setProgress({ status: 'bundling', progress: 0, message: 'Preparing scenes...' });

      const cleanup = getRenderProgress(
        projectId,
        (prog) => {
          setProgress(prog);
          if (prog.status === 'complete' || prog.status === 'error') {
            setIsRendering(false);
            if (prog.status === 'error') {
              setError(prog.message);
            }
          }
        },
        (err) => {
          setError(err.message);
          setIsRendering(false);
        }
      );

      cleanupRef.current = cleanup;
    },
    [stopListening]
  );

  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
      }
    };
  }, []);

  return {
    progress,
    isRendering,
    error,
    startListening,
    stopListening,
  };
}
