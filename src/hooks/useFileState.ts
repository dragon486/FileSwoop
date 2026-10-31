'use client';

import { useState, useCallback, useRef } from 'react';
import type { ProcessedFile, StationId } from '@/types';
import { fileToProcessedFile, isSupported } from '@/lib/fileUtils';

export interface FlowFileState {
  currentFile: ProcessedFile | null;
  originalFile: ProcessedFile | null;
  versions: ProcessedFile[];
  isDraggingFile: boolean;
  overStation: StationId | null;
  processingStation: StationId | null;
  processingProgress: number;
  error: string | null;
  success: string | null;
}

export function useFileState() {
  const [state, setState] = useState<FlowFileState>({
    currentFile: null,
    originalFile: null,
    versions: [],
    isDraggingFile: false,
    overStation: null,
    processingStation: null,
    processingProgress: 0,
    error: null,
    success: null,
  });

  const objectUrlsRef = useRef<string[]>([]);

  const trackUrl = useCallback((url: string) => {
    objectUrlsRef.current.push(url);
  }, []);

  const handleFileDrop = useCallback(async (file: File): Promise<ProcessedFile | null> => {
    if (!isSupported(file.type)) {
      setState((s) => ({
        ...s,
        error: `Unsupported file type: ${file.type || 'unknown'}. Try JPG, PNG, WebP, PDF, or ZIP.`,
      }));
      return null;
    }

    try {
      const processed = await fileToProcessedFile(file);
      trackUrl(processed.url);
      setState((s) => ({
        ...s,
        currentFile: processed,
        originalFile: processed,
        versions: [processed],
        error: null,
        success: null,
        processingStation: null,
      }));
      return processed;
    } catch {
      setState((s) => ({ ...s, error: 'Failed to load file. Please try again.' }));
      return null;
    }
  }, [trackUrl]);

  const setCurrentFile = useCallback((file: ProcessedFile) => {
    trackUrl(file.url);
    setState((s) => ({
      ...s,
      currentFile: file,
      versions: [...s.versions, file],
      error: null,
      processingStation: null,
      processingProgress: 0,
    }));
  }, [trackUrl]);

  const startProcessing = useCallback((station: StationId) => {
    setState((s) => ({ ...s, processingStation: station, processingProgress: 0, error: null }));
  }, []);

  const updateProgress = useCallback((progress: number) => {
    setState((s) => ({ ...s, processingProgress: progress }));
  }, []);

  const setError = useCallback((error: string) => {
    setState((s) => ({ ...s, error, processingStation: null, processingProgress: 0 }));
  }, []);

  const setSuccess = useCallback((msg: string) => {
    setState((s) => ({ ...s, success: msg }));
    setTimeout(() => setState((s) => ({ ...s, success: null })), 3000);
  }, []);

  const undo = useCallback(() => {
    setState((s) => {
      if (s.versions.length <= 1) return s;
      const newVersions = s.versions.slice(0, -1);
      return {
        ...s,
        versions: newVersions,
        currentFile: newVersions[newVersions.length - 1],
        error: null,
      };
    });
  }, []);

  const reset = useCallback(() => {
    // Revoke all tracked object URLs to prevent memory leaks
    objectUrlsRef.current.forEach((url) => {
      try { URL.revokeObjectURL(url); } catch {}
    });
    objectUrlsRef.current = [];

    setState({
      currentFile: null,
      originalFile: null,
      versions: [],
      isDraggingFile: false,
      overStation: null,
      processingStation: null,
      processingProgress: 0,
      error: null,
      success: null,
    });
  }, []);

  const setOverStation = useCallback((station: StationId | null) => {
    setState((s) => ({ ...s, overStation: station }));
  }, []);

  const setIsDraggingFile = useCallback((v: boolean) => {
    setState((s) => ({ ...s, isDraggingFile: v }));
  }, []);

  const dismissError = useCallback(() => {
    setState((s) => ({ ...s, error: null }));
  }, []);

  const selectVersion = useCallback((index: number) => {
    setState((s) => {
      if (index < 0 || index >= s.versions.length) return s;
      return {
        ...s,
        currentFile: s.versions[index],
        error: null,
      };
    });
  }, []);

  return {
    state,
    handleFileDrop,
    setCurrentFile,
    startProcessing,
    updateProgress,
    setError,
    setSuccess,
    undo,
    reset,
    selectVersion,
    setOverStation,
    setIsDraggingFile,
    dismissError,
  };
}
