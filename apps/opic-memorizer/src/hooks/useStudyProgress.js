import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createEmptyProgress,
  loadProgress,
  saveProgress
} from '../lib/progress.js';

export function useStudyProgress(datasetDate) {
  const [progress, setProgress] = useState(() => {
    if (typeof window === 'undefined') return createEmptyProgress(datasetDate);
    return loadProgress(datasetDate);
  });

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  const updateProgress = useCallback((updater) => {
    setProgress((current) => updater(current));
  }, []);

  return useMemo(() => ({ progress, updateProgress }), [progress, updateProgress]);
}

