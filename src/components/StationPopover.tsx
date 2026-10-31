'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Sliders,
  Maximize2,
  Lock,
  Unlock,
  FileText,
  Image as ImageIcon,
  Layers,
  Share2,
  Minimize2,
  ArrowLeftRight,
} from 'lucide-react';
import { formatBytes, estimateCompressedSize, isImageType } from '@/lib/fileUtils';
import type { StationConfig, ProcessedFile } from '@/types';

interface StationPopoverProps {
  station: StationConfig;
  currentFile: ProcessedFile | null;
  isOpen: boolean;
  onClose: () => void;
  onSelect: (optionId: string, extraParams?: { customWidth?: number; customHeight?: number }) => void;
  isProcessing: boolean;
  progress: number;
}

export function StationPopover({
  station,
  currentFile,
  isOpen,
  onClose,
  onSelect,
  isProcessing,
  progress,
}: StationPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  // Resize custom state
  const [customWidth, setCustomWidth] = useState<number>(1920);
  const [customHeight, setCustomHeight] = useState<number>(1080);
  const [aspectLocked, setAspectLocked] = useState<boolean>(true);
  const [aspectRatio, setAspectRatio] = useState<number>(16 / 9);

  // Compress custom slider
  const [customQuality, setCustomQuality] = useState<number>(80);

  // Close on Escape or click outside
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Read initial image dimensions if available
  useEffect(() => {
    if (currentFile && isImageType(currentFile.type)) {
      const img = new Image();
      img.onload = () => {
        setCustomWidth(img.naturalWidth);
        setCustomHeight(img.naturalHeight);
        if (img.naturalHeight > 0) {
          setAspectRatio(img.naturalWidth / img.naturalHeight);
        }
      };
      img.src = currentFile.url;
    }
  }, [currentFile]);

  const handleWidthChange = (w: number) => {
    setCustomWidth(w);
    if (aspectLocked && aspectRatio > 0) {
      setCustomHeight(Math.round(w / aspectRatio));
    }
  };

  const handleHeightChange = (h: number) => {
    setCustomHeight(h);
    if (aspectLocked && aspectRatio > 0) {
      setCustomWidth(Math.round(h * aspectRatio));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-neutral-900/30 backdrop-blur-xs">
        {/* Backdrop click to dismiss */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          ref={popoverRef}
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.18, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-neutral-200/90 overflow-hidden z-10 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50/50">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-xs"
                style={{ backgroundColor: station.color }}
              >
                {station.id === 'convert' && <ArrowLeftRight className="w-4 h-4" />}
                {station.id === 'compress' && <Minimize2 className="w-4 h-4" />}
                {station.id === 'resize' && <Maximize2 className="w-4 h-4" />}
                {station.id === 'extract' && <Layers className="w-4 h-4" />}
                {station.id === 'enhance' && <Sparkles className="w-4 h-4" />}
                {station.id === 'share' && <Share2 className="w-4 h-4" />}
              </div>
              <div>
                <h3 className="text-base font-semibold text-neutral-900 tracking-tight">
                  {station.label}
                </h3>
                <p className="text-xs text-neutral-500">
                  {currentFile
                    ? `Apply to ${currentFile.name} (${formatBytes(currentFile.size)})`
                    : station.description}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              disabled={isProcessing}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-50"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Processing Ring if running */}
          {isProcessing && (
            <div className="px-6 py-3.5 bg-indigo-50/60 dark:bg-indigo-950/20 border-b border-indigo-100 dark:border-indigo-900/30 flex items-center justify-center gap-3">
              <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
                <svg className="w-8 h-8 -rotate-90">
                  <circle
                    cx="16"
                    cy="16"
                    r="12"
                    stroke="rgba(79, 70, 229, 0.2)"
                    strokeWidth="2.5"
                    fill="none"
                  />
                  <motion.circle
                    cx="16"
                    cy="16"
                    r="12"
                    stroke="#4F46E5"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                    strokeDasharray="75.4"
                    animate={{ strokeDashoffset: 75.4 - (progress / 100) * 75.4 }}
                    transition={{ duration: 0.15, ease: 'easeOut' }}
                  />
                </svg>
                <span className="absolute text-[9px] font-bold text-indigo-600 dark:text-indigo-400">
                  {progress}%
                </span>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">
                  Processing transformation...
                </span>
                <span className="text-[10px] text-indigo-600/70 dark:text-indigo-400/70">
                  Executing browser-local pipeline
                </span>
              </div>
            </div>
          )}

          {/* Body Options */}
          <div className="p-6 overflow-y-auto max-h-[65vh] flex flex-col gap-4">
            {/* Convert Station */}
            {station.id === 'convert' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {station.options.map((opt) => {
                  const isCurrent = Boolean(
                    currentFile &&
                    currentFile.name.toLowerCase().endsWith(`.${opt.id.toLowerCase()}`)
                  );
                  return (
                    <button
                      key={opt.id}
                      disabled={isProcessing || isCurrent}
                      onClick={() => onSelect(opt.id)}
                      className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all group ${
                        isCurrent
                          ? 'border-neutral-200 bg-neutral-50/70 opacity-60 cursor-not-allowed'
                          : 'border-neutral-200/80 hover:border-indigo-400 hover:bg-indigo-50/30 hover:shadow-xs active:scale-[0.98]'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-semibold text-sm text-neutral-800 uppercase tracking-wide group-hover:text-indigo-600">
                          {opt.label}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] text-neutral-500 font-medium bg-neutral-200/80 px-1.5 py-0.5 rounded">
                            Current
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-neutral-500">{opt.sublabel}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Compress Station */}
            {station.id === 'compress' && (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {station.options.map((opt) => {
                    const est = currentFile ? estimateCompressedSize(currentFile.size, opt.id) : null;
                    return (
                      <button
                        key={opt.id}
                        disabled={isProcessing}
                        onClick={() => onSelect(opt.id)}
                        className="flex flex-col items-start p-3.5 rounded-xl border border-neutral-200/80 hover:border-purple-400 hover:bg-purple-50/30 hover:shadow-xs active:scale-[0.98] transition-all group text-left"
                      >
                        <span className="font-semibold text-sm text-neutral-800 group-hover:text-purple-700">
                          {opt.label}
                        </span>
                        <span className="text-xs text-neutral-500 mt-0.5">{opt.sublabel}</span>
                        {est && est.reduction > 0 && (
                          <span className="text-[11px] font-medium text-purple-600 mt-2 bg-purple-50 px-2 py-0.5 rounded-md">
                            ~{formatBytes(est.estimatedSize)} (-{est.reduction}%)
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Custom quality slider */}
                <div className="mt-2 p-4 rounded-xl bg-neutral-50 border border-neutral-200/60 flex flex-col gap-3">
                  <div className="flex items-center justify-between text-xs text-neutral-600">
                    <span className="font-medium flex items-center gap-1.5 text-neutral-700">
                      <Sliders className="w-3.5 h-3.5" /> Custom Compression Quality
                    </span>
                    <span className="font-semibold text-neutral-900">{customQuality}%</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="95"
                    value={customQuality}
                    onChange={(e) => setCustomQuality(Number(e.target.value))}
                    disabled={isProcessing}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={() => onSelect('custom')}
                      disabled={isProcessing}
                      className="px-3 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 transition-colors"
                    >
                      Apply Custom Quality
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Resize Station */}
            {station.id === 'resize' && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {station.options
                    .filter((opt) => opt.id !== 'custom')
                    .map((opt) => (
                      <button
                        key={opt.id}
                        disabled={isProcessing}
                        onClick={() => onSelect(opt.id)}
                        className="flex flex-col items-start p-3.5 rounded-xl border border-neutral-200/80 hover:border-emerald-400 hover:bg-emerald-50/30 hover:shadow-xs active:scale-[0.98] transition-all group text-left"
                      >
                        <span className="font-semibold text-sm text-neutral-800 group-hover:text-emerald-700">
                          {opt.label}
                        </span>
                        <span className="text-xs text-neutral-500 mt-0.5">{opt.sublabel}</span>
                      </button>
                    ))}
                </div>

                {/* Custom Dimension Inputs */}
                <div className="p-4 rounded-xl bg-neutral-50 border border-neutral-200/60 flex flex-col gap-3">
                  <span className="text-xs font-medium text-neutral-700 flex items-center gap-1.5">
                    <Maximize2 className="w-3.5 h-3.5" /> Exact Pixel Dimensions
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <label className="text-[11px] text-neutral-500 block mb-1">Width (px)</label>
                      <input
                        type="number"
                        min="10"
                        max="8000"
                        value={customWidth}
                        onChange={(e) => handleWidthChange(Number(e.target.value))}
                        disabled={isProcessing}
                        className="w-full px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() => setAspectLocked(!aspectLocked)}
                      className={`mt-4 p-2 rounded-lg border transition-colors ${
                        aspectLocked
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                          : 'bg-white border-neutral-200 text-neutral-400'
                      }`}
                      title={aspectLocked ? 'Aspect Ratio Locked' : 'Aspect Ratio Unlocked'}
                    >
                      {aspectLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                    </button>

                    <div className="flex-1">
                      <label className="text-[11px] text-neutral-500 block mb-1">Height (px)</label>
                      <input
                        type="number"
                        min="10"
                        max="8000"
                        value={customHeight}
                        onChange={(e) => handleHeightChange(Number(e.target.value))}
                        disabled={isProcessing}
                        className="w-full px-3 py-2 text-sm bg-white border border-neutral-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        onSelect('custom', {
                          customWidth,
                          customHeight,
                        })
                      }
                      disabled={isProcessing || !customWidth || !customHeight}
                      className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-medium hover:bg-emerald-700 transition-colors shadow-xs"
                    >
                      Apply Resize
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Extract Station */}
            {station.id === 'extract' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {station.options.map((opt) => (
                  <button
                    key={opt.id}
                    disabled={isProcessing}
                    onClick={() => onSelect(opt.id)}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-neutral-200/80 hover:border-amber-400 hover:bg-amber-50/30 hover:shadow-xs active:scale-[0.98] transition-all group text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center flex-shrink-0">
                      {opt.id === 'text' && <FileText className="w-4 h-4" />}
                      {opt.id === 'images' && <ImageIcon className="w-4 h-4" />}
                      {opt.id === 'pages' && <Layers className="w-4 h-4" />}
                      {opt.id === 'metadata' && <Sliders className="w-4 h-4" />}
                      {opt.id === 'base64' && <Sparkles className="w-4 h-4" />}
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-neutral-800 group-hover:text-amber-800 block">
                        {opt.label}
                      </span>
                      <span className="text-xs text-neutral-500">{opt.sublabel}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Enhance Station */}
            {station.id === 'enhance' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {station.options.map((opt) => (
                  <button
                    key={opt.id}
                    disabled={isProcessing}
                    onClick={() => onSelect(opt.id)}
                    className="flex flex-col items-start p-3.5 rounded-xl border border-neutral-200/80 hover:border-pink-400 hover:bg-pink-50/30 hover:shadow-xs active:scale-[0.98] transition-all group text-left"
                  >
                    <span className="font-semibold text-sm text-neutral-800 group-hover:text-pink-700">
                      {opt.label}
                    </span>
                    <span className="text-xs text-neutral-500 mt-0.5">{opt.sublabel}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Share Station */}
            {station.id === 'share' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {station.options.map((opt) => (
                  <button
                    key={opt.id}
                    disabled={isProcessing}
                    onClick={() => onSelect(opt.id)}
                    className="flex items-center gap-3 p-3.5 rounded-xl border border-neutral-200/80 hover:border-cyan-400 hover:bg-cyan-50/30 hover:shadow-xs active:scale-[0.98] transition-all group text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-cyan-100/70 text-cyan-700 flex items-center justify-center flex-shrink-0">
                      <Share2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-neutral-800 group-hover:text-cyan-800 block">
                        {opt.label}
                      </span>
                      <span className="text-xs text-neutral-500">{opt.sublabel}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer note */}
          <div className="px-6 py-3 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Runs 100% locally in browser</span>
            <span>Esc to close</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
