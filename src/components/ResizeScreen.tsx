'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Scan, Lock, Unlock, Monitor, Smartphone, Square as SquareIcon } from 'lucide-react';
import { HoldTarget } from './HoldTarget';
import { BackZone } from './BackZone';
import { isImageType } from '@/lib/fileUtils';
import { HOLD_DWELL_MS } from '@/lib/constants';
import type { ProcessedFile } from '@/types';

interface ResizeScreenProps {
  currentFile: ProcessedFile | null;
  onResize: (optionId: string, customParams?: { customWidth?: number; customHeight?: number }, file?: File) => void;
  onBack: () => void;
  isProcessing: boolean;
  progress: number;
  onHoverSnap?: (pos: { x: number; y: number } | null) => void;
  theme?: 'light' | 'dark';
}

const RESIZE_PRESETS = [
  { id: '1080p', label: '1080p Full HD', desc: '1920 px wide (Full HD) • Standard display & monitor quality', icon: Monitor },
  { id: '720p', label: '720p HD', desc: '1280 px wide (HD) • Optimised for fast web & mobile delivery', icon: Monitor },
  { id: 'portrait', label: 'Portrait 9:16', desc: 'Tall vertical orientation, 1920 px height • Reels & stories', icon: Smartphone },
  { id: 'square', label: 'Square 1:1', desc: 'Crops to the shortest dimension • Avatars & profile cards', icon: SquareIcon },
  { id: '50pct', label: '50% Half Scale', desc: 'Scales both dimensions by 50% while preserving aspect ratio', icon: Scan },
];

export function ResizeScreen({
  currentFile,
  onResize,
  onBack,
  isProcessing,
  progress,
  onHoverSnap,
  theme = 'light',
}: ResizeScreenProps) {
  const isDark = theme === 'dark';
  const [customWidth, setCustomWidth] = useState<number>(1920);
  const [customHeight, setCustomHeight] = useState<number>(1080);
  const [aspectLocked, setAspectLocked] = useState(true);
  const [aspectRatio, setAspectRatio] = useState(16 / 9);

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

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl flex flex-col items-center"
    >
      <div className="w-full flex items-center justify-between mb-4">
        <BackZone onBack={onBack} label="Back to Tools" disabled={isProcessing} />
      </div>

      <div className="text-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-white drop-shadow-md">
          What size works for you?
        </h2>
        <p className="text-xs sm:text-sm text-white/85 mt-1.5 font-normal drop-shadow-xs">
          {currentFile
            ? 'Drop or hold your file over a dimension preset to scale.'
            : 'Drop your file onto a dimension preset to resize instantly.'}
        </p>
      </div>

      {isProcessing && (
        <div className="w-full max-w-xs px-4 py-3 mb-5 bg-white/95 dark:bg-[#15171F]/95 backdrop-blur-xl border border-[#34C759]/30 rounded-2xl flex items-center justify-center gap-3 shadow-lg">
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
            <svg className="w-8 h-8 -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="12"
                stroke="rgba(52, 199, 89, 0.2)"
                strokeWidth="2.5"
                fill="none"
              />
              <motion.circle
                cx="16"
                cy="16"
                r="12"
                stroke="#34C759"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="75.4"
                animate={{ strokeDashoffset: 75.4 - (progress / 100) * 75.4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              />
            </svg>
            <span className="absolute text-[9px] font-bold text-[#34C759] dark:text-[#30D158]">
              {progress}%
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-[#34C759] dark:text-[#30D158]">
              Resizing dimensions...
            </span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
              High-precision canvas resampling
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 w-full">
        {RESIZE_PRESETS.map((preset) => {
          const Icon = preset.icon;

          return (
            <HoldTarget
              key={preset.id}
              id={`resize-${preset.id}`}
              dwellMs={HOLD_DWELL_MS}
              holdLabel="Resizing..."
              onTrigger={(file) => onResize(preset.id, undefined, file)}
              onHoverSnap={onHoverSnap}
              disabled={isProcessing}
              className={`p-4 sm:p-5 rounded-[18px] backdrop-blur-xl transition-all flex flex-col justify-between min-h-[125px] group active:scale-[0.99] ${
                isDark
                  ? 'bg-[#15171F]/90 text-white border border-white/12 shadow-[0_16px_40px_rgba(0,0,0,0.65)] hover:bg-[#1C1F28]/95 hover:shadow-[0_20px_45px_rgba(0,0,0,0.8)]'
                  : 'bg-white/95 text-[#1D1D1F] border border-white/80 shadow-[0_12px_36px_rgba(0,0,0,0.16)] hover:bg-white hover:shadow-[0_18px_44px_rgba(0,0,0,0.22)]'
              }`}
              activeClassName={`border-[#34C759] ring-4 ring-[#34C759]/25 scale-[1.02] shadow-[0_16px_40px_rgba(52,199,89,0.35)] ${
                isDark ? 'bg-[#15241C]' : 'bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-base font-semibold tracking-tight transition-colors ${
                      isDark ? 'text-white group-hover:text-[#52E075]' : 'text-[#1D1D1F] group-hover:text-[#34C759]'
                    }`}
                  >
                    {preset.label}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isDark
                        ? 'bg-white/10 group-hover:bg-[#34C759]/20 group-hover:text-[#52E075] text-neutral-300'
                        : 'bg-neutral-100 group-hover:bg-[#34C759]/10 group-hover:text-[#34C759] text-[#86868B]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                  </div>
                </div>
                <p className={`text-[11px] mt-1.5 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-[#6E6E73]'}`}>
                  {preset.desc}
                </p>
              </div>

              <div
                className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[10px] font-medium ${
                  isDark ? 'border-white/[0.08] text-neutral-400' : 'border-black/[0.06] text-[#6E6E73]'
                }`}
              >
                <span>Hold or click to resize</span>
                <span className={`opacity-0 group-hover:opacity-100 transition-opacity font-semibold ${isDark ? 'text-[#52E075]' : 'text-[#34C759]'}`}>
                  Resize →
                </span>
              </div>
            </HoldTarget>
          );
        })}

        {/* Custom Exact Pixel Card */}
        <div
          className={`p-4 sm:p-5 rounded-[18px] backdrop-blur-xl flex flex-col justify-between min-h-[125px] ${
            isDark
              ? 'bg-[#15171F]/90 text-white border border-white/12 shadow-[0_16px_40px_rgba(0,0,0,0.65)]'
              : 'bg-white/95 text-[#1D1D1F] border border-white/80 shadow-[0_12px_36px_rgba(0,0,0,0.16)]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
                <Scan className="w-3.5 h-3.5 text-[#34C759]" strokeWidth={1.8} /> Custom Dimensions
              </span>
              <button
                type="button"
                onClick={() => setAspectLocked(!aspectLocked)}
                className={`p-1 rounded-md border text-[11px] flex items-center gap-1 transition-colors ${
                  aspectLocked
                    ? 'bg-[#34C759]/10 border-[#34C759]/20 text-[#34C759]'
                    : isDark
                    ? 'bg-[#202430] border-white/15 text-neutral-300'
                    : 'bg-neutral-100 border-black/[0.08] text-[#86868B]'
                }`}
                title={aspectLocked ? 'Lock aspect ratio' : 'Unlock aspect ratio'}
              >
                {aspectLocked ? <Lock className="w-3 h-3" strokeWidth={1.8} /> : <Unlock className="w-3 h-3" strokeWidth={1.8} />}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className={`text-[10px] block mb-0.5 ${isDark ? 'text-neutral-400' : 'text-[#6E6E73]'}`}>Width (px)</span>
                <input
                  type="number"
                  value={customWidth}
                  onChange={(e) => handleWidthChange(Number(e.target.value))}
                  disabled={isProcessing}
                  className={`w-full px-2 py-0.5 text-xs rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-[#34C759] border ${
                    isDark
                      ? 'bg-[#202430] border-white/15 text-white'
                      : 'bg-white border-black/[0.1] text-[#1D1D1F]'
                  }`}
                />
              </div>
              <div>
                <span className={`text-[10px] block mb-0.5 ${isDark ? 'text-neutral-400' : 'text-[#6E6E73]'}`}>Height (px)</span>
                <input
                  type="number"
                  value={customHeight}
                  onChange={(e) => handleHeightChange(Number(e.target.value))}
                  disabled={isProcessing}
                  className={`w-full px-2 py-0.5 text-xs rounded-md font-mono focus:outline-none focus:ring-1 focus:ring-[#34C759] border ${
                    isDark
                      ? 'bg-[#202430] border-white/15 text-white'
                      : 'bg-white border-black/[0.1] text-[#1D1D1F]'
                  }`}
                />
              </div>
            </div>
          </div>

          <div className={`mt-2.5 pt-2 border-t flex justify-end ${isDark ? 'border-white/[0.08]' : 'border-black/[0.06]'}`}>
            <HoldTarget
              id="resize-custom"
              dwellMs={HOLD_DWELL_MS}
              holdLabel="Applying Size..."
              onTrigger={(file) =>
                onResize('custom', {
                  customWidth,
                  customHeight,
                }, file)
              }
              onHoverSnap={onHoverSnap}
              disabled={isProcessing || !customWidth || !customHeight}
              className="px-3.5 py-1.5 rounded-xl bg-[#34C759] text-white text-[11px] font-medium hover:bg-[#2FB34F] transition-colors shadow-2xs"
              activeClassName="scale-105 ring-2 ring-[#34C759]/40"
            >
              Apply Dimensions
            </HoldTarget>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
