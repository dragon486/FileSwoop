'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, RotateCcw, Sun, Moon } from 'lucide-react';
import { HomeScreen } from '@/components/HomeScreen';
import { ConvertScreen } from '@/components/ConvertScreen';
import { CompressScreen } from '@/components/CompressScreen';
import { ResizeScreen } from '@/components/ResizeScreen';
import { ExtractScreen } from '@/components/ExtractScreen';
import { EnhanceScreen } from '@/components/EnhanceScreen';
import { ShareScreen } from '@/components/ShareScreen';
import { NextStepScreen } from '@/components/NextStepScreen';
import { FinalScreen } from '@/components/FinalScreen';
import { ActiveFileObject } from '@/components/ActiveFileObject';
import { useFileState } from '@/hooks/useFileState';
import { useTransform } from '@/hooks/useTransform';
import type { StationId } from '@/types';

type ScreenType =
  | 'home'
  | 'convert'
  | 'compress'
  | 'resize'
  | 'extract'
  | 'enhance'
  | 'share'
  | 'next-step'
  | 'final';

export default function FlowFilePage() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const fallbackInputRef = useRef<HTMLInputElement>(null);
  const pendingActionRef = useRef<{
    station: StationId;
    option: string;
    customParams?: { customWidth?: number; customHeight?: number; customQuality?: number };
  } | null>(null);

  const {
    state,
    handleFileDrop,
    setCurrentFile,
    startProcessing,
    updateProgress,
    setError,
    setSuccess,
    undo,
    reset,
    dismissError,
  } = useFileState();

  const { transform } = useTransform({
    currentFile: state.currentFile,
    startProcessing,
    updateProgress,
    setCurrentFile,
    setError,
    setSuccess,
  });

  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [, setScreenHistory] = useState<ScreenType[]>(['home']);
  const [lastOperationName, setLastOperationName] = useState<string>('');
  const [, setSnappedPos] = useState<{ x: number; y: number } | null>(null);
  const [, setIsInternalDragging] = useState(false);

  const navigateTo = useCallback((screen: ScreenType) => {
    setScreenHistory((prev) => [...prev, screen]);
    setCurrentScreen(screen);
    setSnappedPos(null);
  }, []);

  const navigateBack = useCallback(() => {
    setSnappedPos(null);
    setScreenHistory((prev) => {
      if (prev.length <= 1) {
        setCurrentScreen('home');
        return ['home'];
      }
      const nextHistory = prev.slice(0, -1);
      const previousScreen = nextHistory[nextHistory.length - 1];
      setCurrentScreen(previousScreen);
      return nextHistory;
    });
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  useEffect(() => {
    const handleGlobalDragOver = (e: DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };
    const handleGlobalDrop = (e: DragEvent) => {
      e.preventDefault();
    };
    window.addEventListener('dragover', handleGlobalDragOver);
    window.addEventListener('drop', handleGlobalDrop);
    return () => {
      window.removeEventListener('dragover', handleGlobalDragOver);
      window.removeEventListener('drop', handleGlobalDrop);
    };
  }, []);

  const handleContainerDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        await handleFileDrop(file);
      }
    },
    [handleFileDrop]
  );

  const handleResetFlow = useCallback(() => {
    reset();
    setScreenHistory(['home']);
    setCurrentScreen('home');
    setLastOperationName('');
    setSnappedPos(null);
  }, [reset]);

  const handleInitialFileDrop = useCallback(
    async (file: File, targetStationId?: StationId) => {
      await handleFileDrop(file);
      if (targetStationId) {
        navigateTo(targetStationId);
      }
    },
    [handleFileDrop, navigateTo]
  );

  const handleSelectStation = useCallback(
    (stationId: StationId) => {
      navigateTo(stationId);
    },
    [navigateTo]
  );

  const handleFallbackFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const activeFile = await handleFileDrop(file);
      if (activeFile && pendingActionRef.current) {
        const { station, option, customParams } = pendingActionRef.current;
        pendingActionRef.current = null;
        const result = await transform(station, option, customParams, activeFile);
        if (result) {
          setLastOperationName(
            station === 'convert'
              ? `Converted to ${option.toUpperCase()}`
              : station === 'compress'
              ? customParams?.customQuality
                ? `Compressed (${customParams.customQuality}% Quality)`
                : 'Compression'
              : station === 'resize'
              ? 'Resize'
              : `${station} applied`
          );
          navigateTo('final');
        }
      }
    }
    e.target.value = '';
  };

  const handleDownload = useCallback(() => {
    if (!state.currentFile) return;
    const a = document.createElement('a');
    a.href = state.currentFile.url;
    a.download = state.currentFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setSuccess(`Downloaded ${state.currentFile.name}`);
  }, [state.currentFile, setSuccess]);

  const handleExecuteConvert = useCallback(
    async (formatId: string, droppedFile?: File) => {
      let activeFile = state.currentFile;
      if (droppedFile) {
        activeFile = await handleFileDrop(droppedFile);
      }
      if (!activeFile) {
        pendingActionRef.current = { station: 'convert', option: formatId };
        fallbackInputRef.current?.click();
        return;
      }

      const result = await transform('convert', formatId, undefined, activeFile);
      if (result) {
        setLastOperationName(`Converted to ${formatId.toUpperCase()}`);
        navigateTo('final');
      }
    },
    [state.currentFile, handleFileDrop, transform, navigateTo]
  );

  const handleExecuteCompress = useCallback(
    async (optionId: string, customQuality?: number, droppedFile?: File) => {
      let activeFile = state.currentFile;
      if (droppedFile) {
        activeFile = await handleFileDrop(droppedFile);
      }
      if (!activeFile) {
        pendingActionRef.current = {
          station: 'compress',
          option: optionId,
          customParams: { customQuality },
        };
        fallbackInputRef.current?.click();
        return;
      }

      const result = await transform('compress', optionId, { customQuality }, activeFile);
      if (result) {
        setLastOperationName(
          optionId === 'custom' && customQuality
            ? `Compressed (${customQuality}% Quality)`
            : 'Compression'
        );
        navigateTo('final');
      }
    },
    [state.currentFile, handleFileDrop, transform, navigateTo]
  );

  const handleExecuteResize = useCallback(
    async (optionId: string, customParams?: { customWidth?: number; customHeight?: number }, droppedFile?: File) => {
      let activeFile = state.currentFile;
      if (droppedFile) {
        activeFile = await handleFileDrop(droppedFile);
      }
      if (!activeFile) {
        pendingActionRef.current = { station: 'resize', option: optionId, customParams };
        fallbackInputRef.current?.click();
        return;
      }

      const result = await transform('resize', optionId, customParams, activeFile);
      if (result) {
        setLastOperationName('Resize');
        navigateTo('final');
      }
    },
    [state.currentFile, handleFileDrop, transform, navigateTo]
  );

  const handleExecuteExtract = useCallback(
    async (optionId: string, droppedFile?: File) => {
      let activeFile = state.currentFile;
      if (droppedFile) {
        activeFile = await handleFileDrop(droppedFile);
      }
      if (!activeFile) {
        pendingActionRef.current = { station: 'extract', option: optionId };
        fallbackInputRef.current?.click();
        return;
      }

      const result = await transform('extract', optionId, undefined, activeFile);
      if (result) {
        setLastOperationName(`Extracted ${optionId}`);
        navigateTo('final');
      }
    },
    [state.currentFile, handleFileDrop, transform, navigateTo]
  );

  const handleExecuteEnhance = useCallback(
    async (optionId: string, droppedFile?: File) => {
      let activeFile = state.currentFile;
      if (droppedFile) {
        activeFile = await handleFileDrop(droppedFile);
      }
      if (!activeFile) {
        pendingActionRef.current = { station: 'enhance', option: optionId };
        fallbackInputRef.current?.click();
        return;
      }

      const result = await transform('enhance', optionId, undefined, activeFile);
      if (result) {
        setLastOperationName('Enhanced Image');
        navigateTo('final');
      }
    },
    [state.currentFile, handleFileDrop, transform, navigateTo]
  );

  const handleExecuteShare = useCallback(
    async (optionId: string, droppedFile?: File) => {
      let activeFile = state.currentFile;
      if (droppedFile) {
        activeFile = await handleFileDrop(droppedFile);
      }
      if (!activeFile) {
        pendingActionRef.current = { station: 'share', option: optionId };
        fallbackInputRef.current?.click();
        return;
      }

      if (optionId === 'download') {
        handleDownload();
        navigateTo('final');
        return;
      }
      const result = await transform('share', optionId, undefined, activeFile);
      if (result) {
        setLastOperationName('Share Export');
        navigateTo('final');
      }
    },
    [state.currentFile, handleFileDrop, handleDownload, transform, navigateTo]
  );

  return (
    <div
      className={`h-screen max-h-screen w-screen overflow-hidden flex flex-col transition-colors duration-300 selection:bg-[#0071E3]/20 ${
        theme === 'dark' ? 'dark bg-[#0B0C10] text-white' : 'bg-[#F5F5F7] text-[#1D1D1F]'
      }`}
    >
      <input
        ref={fallbackInputRef}
        type="file"
        className="hidden"
        accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml,application/pdf,text/plain,application/zip,application/x-zip-compressed"
        onChange={handleFallbackFileChange}
      />

      {/* Apple-style Top Navigation Header */}
      <header
        className={`h-14 shrink-0 flex items-center justify-between px-6 sm:px-10 backdrop-blur-xl border-b transition-colors duration-300 z-30 ${
          theme === 'light'
            ? 'bg-[#F5F5F7]/85 border-black/[0.06] text-[#1D1D1F]'
            : 'bg-[#0B0C10]/85 border-white/[0.08] text-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <img
            src={theme === 'light' ? '/images/logo_light.png' : '/images/logo_dark.png'}
            alt="FileSwoop"
            className="h-7 sm:h-8 w-auto object-contain select-none"
          />
          <span
            className={`text-xs font-normal hidden sm:inline border-l pl-3 transition-colors ${
              theme === 'light' ? 'border-black/10 text-[#86868B]' : 'border-white/15 text-white/60'
            }`}
          >
            Files, in motion.
          </span>
        </div>

        {/* Right Actions: Theme Toggle & Reset */}
        <div className="flex items-center gap-2.5">
          {/* Day / Night Theme Toggle */}
          <button
            onClick={() => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all border shadow-2xs cursor-pointer ${
              theme === 'light'
                ? 'bg-white hover:bg-neutral-100 text-[#1D1D1F] border-black/[0.08]'
                : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
            }`}
            title={theme === 'light' ? 'Switch to Night Sky mode' : 'Switch to Daylight mode'}
          >
            {theme === 'light' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-500" strokeWidth={2} />
                <span>Daylight</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400" strokeWidth={2} />
                <span>Night Sky</span>
              </>
            )}
          </button>

          {state.currentFile && (
            <button
              onClick={handleResetFlow}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors border shadow-2xs cursor-pointer ${
                theme === 'light'
                  ? 'bg-white hover:bg-neutral-100 text-[#1D1D1F] border-black/[0.08]'
                  : 'bg-white/10 hover:bg-white/15 text-white border-white/15'
              }`}
              title="Reset flow and clear file"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#86868B]" strokeWidth={1.8} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </header>

      {/* Main Single-Decision Screen Viewport with Big Pixel Art Background Card */}
      <main className="flex-1 min-h-0 w-full flex items-center justify-center p-3 sm:p-5 overflow-hidden">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
          }}
          onDrop={handleContainerDrop}
          className={`relative rounded-3xl overflow-hidden shadow-2xl w-[96%] max-w-[1360px] 2xl:max-w-[1480px] h-full max-h-[86vh] p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center transition-all duration-300 ${
            theme === 'light'
              ? 'border border-black/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.12)]'
              : 'border border-white/15 shadow-[0_25px_60px_rgba(0,0,0,0.6)]'
          }`}
        >
          {/* 1. Razor-sharp Pixel Art Background customized for Light mode vs Dark mode */}
          <img
            key={theme}
            src={
              theme === 'light'
                ? '/images/pixel_backdrop_light.jpg'
                : '/images/pixel_backdrop_dark.jpg'
            }
            alt={
              theme === 'light'
                ? 'Daylight pixel art landscape'
                : 'Night sky pixel art landscape'
            }
            className="absolute inset-0 h-full w-full object-cover object-center select-none pointer-events-none scale-105"
            style={{ imageRendering: 'pixelated' }}
          />

          {/* 2. Atmospheric vignette overlay tailored for contrast in Light vs Dark mode */}
          <div
            className={`absolute inset-0 pointer-events-none transition-colors duration-300 ${
              theme === 'light'
                ? 'bg-gradient-to-t from-black/45 via-black/15 to-black/25'
                : 'bg-gradient-to-t from-black/85 via-black/50 to-black/60'
            }`}
          />

          {/* 3. Floating Content Layer */}
          <div className="relative z-10 w-full flex flex-col items-center">
            {/* Active File Object Hovering on Top */}
            <AnimatePresence>
              {state.currentFile && (
                <motion.div
                  initial={{ opacity: 0, y: -16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -16, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4 z-20 flex items-center justify-center"
                >
                  <div className="relative flex flex-wrap items-center justify-center gap-2 p-1.5 rounded-2xl bg-black/40 backdrop-blur-md border border-white/20 shadow-2xl">
                    <ActiveFileObject
                      file={state.currentFile}
                      onDragStart={() => setIsInternalDragging(true)}
                      onDragEnd={() => setIsInternalDragging(false)}
                      className="bg-white/95 dark:bg-[#161822]/95 text-neutral-900 dark:text-white border-0 shadow-md"
                    />
                    <button
                      onClick={handleResetFlow}
                      className="w-7 h-7 rounded-xl bg-white/20 hover:bg-red-500/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Remove file"
                    >
                      <X className="w-3.5 h-3.5" strokeWidth={2} />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence initial={false}>
          {currentScreen === 'home' && (
            <HomeScreen
              key="screen-home"
              currentFile={state.currentFile}
              onSelectStation={handleSelectStation}
              onFileDrop={handleInitialFileDrop}
              onHoverSnap={setSnappedPos}
              theme={theme}
            />
          )}

          {currentScreen === 'convert' && (
            <ConvertScreen
              key="screen-convert"
              currentFile={state.currentFile}
              onConvert={handleExecuteConvert}
              onBack={navigateBack}
              isProcessing={state.processingStation === 'convert'}
              progress={state.processingProgress}
              onHoverSnap={setSnappedPos}
              theme={theme}
            />
          )}

          {currentScreen === 'compress' && (
            <CompressScreen
              key="screen-compress"
              currentFile={state.currentFile}
              onCompress={handleExecuteCompress}
              onBack={navigateBack}
              isProcessing={state.processingStation === 'compress'}
              progress={state.processingProgress}
              onHoverSnap={setSnappedPos}
              theme={theme}
            />
          )}

          {currentScreen === 'resize' && (
            <ResizeScreen
              key="screen-resize"
              currentFile={state.currentFile}
              onResize={handleExecuteResize}
              onBack={navigateBack}
              isProcessing={state.processingStation === 'resize'}
              progress={state.processingProgress}
              onHoverSnap={setSnappedPos}
              theme={theme}
            />
          )}

          {currentScreen === 'extract' && (
            <ExtractScreen
              key="screen-extract"
              currentFile={state.currentFile}
              onExtract={handleExecuteExtract}
              onBack={navigateBack}
              isProcessing={state.processingStation === 'extract'}
              progress={state.processingProgress}
              onHoverSnap={setSnappedPos}
              theme={theme}
            />
          )}

          {currentScreen === 'enhance' && (
            <EnhanceScreen
              key="screen-enhance"
              currentFile={state.currentFile}
              onEnhance={handleExecuteEnhance}
              onBack={navigateBack}
              isProcessing={state.processingStation === 'enhance'}
              progress={state.processingProgress}
              onHoverSnap={setSnappedPos}
              theme={theme}
            />
          )}

          {currentScreen === 'share' && (
            <ShareScreen
              key="screen-share"
              currentFile={state.currentFile}
              onShare={handleExecuteShare}
              onBack={navigateBack}
              isProcessing={state.processingStation === 'share'}
              progress={state.processingProgress}
              onHoverSnap={setSnappedPos}
              theme={theme}
            />
          )}

          {currentScreen === 'next-step' && state.currentFile && (
            <NextStepScreen
              key="screen-next-step"
              currentFile={state.currentFile}
              lastOperation={lastOperationName}
              onSelectStation={handleSelectStation}
              onFinish={() => navigateTo('final')}
              onBack={() => {
                undo();
                navigateBack();
              }}
              onHoverSnap={setSnappedPos}
              theme={theme}
            />
          )}

          {currentScreen === 'final' && state.currentFile && (
            <FinalScreen
              key="screen-final"
              currentFile={state.currentFile}
              originalFile={state.originalFile}
              versions={state.versions}
              onDownload={handleDownload}
              onContinueTransforming={() => navigateTo('next-step')}
              onNewFlow={handleResetFlow}
              onBack={navigateBack}
              theme={theme}
            />
          )}
        </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Error Toast */}
      <AnimatePresence>
        {state.error && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-[#1D1D1F] text-white rounded-2xl shadow-xl px-5 py-3.5 max-w-md w-full border border-black/10"
          >
            <div className="w-5 h-5 rounded-full bg-[#FF2D55]/20 text-[#FF2D55] flex items-center justify-center flex-shrink-0">
              <X className="w-3.5 h-3.5" strokeWidth={1.8} />
            </div>
            <p className="text-xs font-medium flex-1 leading-relaxed">{state.error}</p>
            <button onClick={dismissError} className="text-[#86868B] hover:text-white transition-colors cursor-pointer">
              <X className="w-4 h-4" strokeWidth={1.8} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {state.success && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 bg-[#1D1D1F] text-white rounded-2xl shadow-xl px-4.5 py-3 border border-black/10 text-xs font-medium"
          >
            <CheckCircle2 className="w-4 h-4 text-[#34C759]" strokeWidth={1.8} />
            <span>{state.success}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Clean Apple Minimal Footer */}
      <footer
        className={`h-11 shrink-0 px-6 flex items-center justify-center gap-3 border-t transition-colors text-xs ${
          theme === 'light'
            ? 'border-black/[0.04] bg-[#F5F5F7]/90 text-[#86868B]'
            : 'border-white/[0.06] bg-[#0B0C10]/90 text-white/60'
        }`}
      >
        <div className="flex items-center gap-2">
          <span>
            Founded by{' '}
            <strong className={theme === 'light' ? 'text-[#1D1D1F] font-semibold' : 'text-white font-semibold'}>
              Adel Muhammed
            </strong>
          </span>
          <span className="opacity-30">•</span>
          <div className="flex items-center gap-1.5">
            <a
              href="https://www.linkedin.com/in/adel-muhammed/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-md text-[#86868B] hover:text-[#0077B5] dark:text-white/60 dark:hover:text-[#0A66C2] hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="Adel Muhammed on LinkedIn"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.2V10.9H6.46M7.83 6.64a1.66 1.66 0 1 0 0 3.32 1.66 1.66 0 0 0 0-3.32Z" />
              </svg>
            </a>
            <a
              href="https://github.com/dragon486"
              target="_blank"
              rel="noopener noreferrer"
              className="p-1 rounded-md text-[#86868B] hover:text-[#1D1D1F] dark:text-white/60 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              title="Adel Muhammed on GitHub"
              aria-label="GitHub"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
