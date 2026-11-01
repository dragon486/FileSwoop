'use client';

import { motion } from 'framer-motion';
import {
  Download,
  RotateCcw,
  Sparkles,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
} from 'lucide-react';
import { formatBytes, isImageType, isPdfType } from '@/lib/fileUtils';
import { BackZone } from './BackZone';
import type { ProcessedFile } from '@/types';

interface FinalScreenProps {
  currentFile: ProcessedFile;
  originalFile: ProcessedFile | null;
  versions: ProcessedFile[];
  onDownload: () => void;
  onContinueTransforming: () => void;
  onNewFlow: () => void;
  onBack: () => void;
  theme?: 'light' | 'dark';
}

export function FinalScreen({
  currentFile,
  originalFile,
  versions,
  onDownload,
  onContinueTransforming,
  onNewFlow,
  onBack,
  theme = 'light',
}: FinalScreenProps) {
  const isDark = theme === 'dark';
  const isImage = isImageType(currentFile.type);
  const sizeDiff = originalFile ? currentFile.size - originalFile.size : 0;
  const savingsPct =
    originalFile && originalFile.size > 0
      ? Math.round((Math.abs(currentFile.size - originalFile.size) / originalFile.size) * 100)
      : 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl flex flex-col items-center"
    >
      {/* Top navigation row */}
      <div className="w-full flex items-center justify-between mb-3">
        <BackZone onBack={onBack} label="Back to Workflow" />
        <button
          onClick={onNewFlow}
          className="text-xs font-medium text-white/80 hover:text-white transition-colors cursor-pointer bg-white/15 px-3 py-1 rounded-full border border-white/25 shadow-xs"
        >
          Start New Flow
        </button>
      </div>

      {/* Header */}
      <div className="text-center mb-4">
        <div className="w-10 h-10 rounded-xl bg-white/90 text-[#34C759] flex items-center justify-center mx-auto mb-2 shadow-md">
          <CheckCircle2 className="w-5 h-5" strokeWidth={1.8} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-white drop-shadow-md">
          Your file is ready.
        </h2>
        <p className="text-xs sm:text-sm text-white/85 mt-1 font-normal drop-shadow-xs">
          All transformations were completed privately in your browser.
        </p>
      </div>

      {/* Apple-style Preview Card Floating on Pixel Backdrop */}
      <div
        className={`w-full backdrop-blur-xl rounded-[20px] p-4 sm:p-5 mb-4 flex flex-col gap-4 ${
          isDark
            ? 'bg-[#15171F]/90 text-white border border-white/12 shadow-[0_16px_40px_rgba(0,0,0,0.65)]'
            : 'bg-white/95 text-[#1D1D1F] border border-white/80 shadow-[0_12px_36px_rgba(0,0,0,0.16)]'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* File Thumbnail or Icon Preview */}
          <div className="w-20 h-20 rounded-xl bg-neutral-50 dark:bg-white/10 border border-black/[0.06] dark:border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-2xs">
            {isImage && currentFile.thumbnail ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentFile.thumbnail}
                alt="Transformed result"
                className="w-full h-full object-cover"
              />
            ) : isPdfType(currentFile.type) ? (
              <FileText className="w-9 h-9 text-[#FF2D55]" strokeWidth={1.8} />
            ) : (
              <ImageIcon className="w-9 h-9 text-[#0071E3] dark:text-[#3898FF]" strokeWidth={1.8} />
            )}
          </div>

          {/* Details */}
          <div className="flex-1 text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-1">
              <span className="text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded-full bg-[#0071E3]/10 text-[#0071E3] dark:bg-[#0071E3]/20 dark:text-[#3898FF]">
                {currentFile.type.split('/')[1] || 'FILE'}
              </span>
              {currentFile.transformOption && (
                <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#34C759]/10 text-[#34C759] dark:bg-[#34C759]/20 dark:text-[#52E075]">
                  ✓ {currentFile.transformOption}
                </span>
              )}
            </div>

            <h3 className="text-base font-semibold text-[#1D1D1F] dark:text-white tracking-tight truncate">
              {currentFile.name}
            </h3>

            <div className="flex items-center justify-center sm:justify-start gap-2.5 mt-1 text-xs text-[#86868B] dark:text-neutral-400">
              <span className="font-semibold text-[#1D1D1F] dark:text-white">
                {formatBytes(currentFile.size)}
              </span>
              {originalFile && sizeDiff !== 0 && (
                <span
                  className={`font-semibold ${
                    sizeDiff < 0 ? 'text-[#34C759] dark:text-[#52E075]' : 'text-[#FF9500] dark:text-[#FFAE33]'
                  }`}
                >
                  {sizeDiff < 0 ? `${savingsPct}% smaller` : `+${savingsPct}%`}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Transformation Pipeline Journey */}
        {versions.length > 1 && (
          <div className="pt-3 border-t border-black/[0.04] dark:border-white/[0.08]">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#86868B] dark:text-neutral-400 block mb-1.5">
              Transformation Journey
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              {versions.map((v, i) => (
                <div key={v.id + i} className="flex items-center gap-1.5 text-[11px]">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-neutral-50 dark:bg-white/10 border border-black/[0.04] dark:border-white/10 text-[#1D1D1F] dark:text-white">
                    <span className="font-semibold">
                      {i === 0 ? 'Original' : v.transformOption || `Stage ${i}`}
                    </span>
                    <span className="text-[#86868B] dark:text-neutral-400 text-[9px]">
                      ({formatBytes(v.size)})
                    </span>
                  </div>
                  {i < versions.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-neutral-300 dark:text-neutral-600" strokeWidth={1.8} />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Prominent Apple Download Button */}
        <button
          onClick={onDownload}
          className="w-full py-3 px-5 rounded-xl bg-[#0071E3] text-white font-semibold text-sm hover:bg-[#0077ED] transition-all flex items-center justify-center gap-2 shadow-[0_8px_20px_rgba(0,113,227,0.24)] active:scale-[0.99] cursor-pointer"
        >
          <Download className="w-4 h-4" strokeWidth={1.8} />
          <span>Download Transformed File</span>
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto">
        <button
          onClick={onContinueTransforming}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/15 bg-white dark:bg-[#15171E] text-xs font-semibold text-[#1D1D1F] dark:text-white hover:border-black/[0.15] dark:hover:border-white/25 hover:bg-neutral-50 dark:hover:bg-[#1C1F28] transition-colors shadow-2xs cursor-pointer w-full sm:w-auto"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#0071E3] dark:text-[#3898FF]" strokeWidth={1.8} />
          <span>Apply Another Operation</span>
        </button>

        <button
          onClick={onNewFlow}
          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-black/[0.08] dark:border-white/15 bg-white dark:bg-[#15171E] text-xs font-semibold text-[#1D1D1F] dark:text-white hover:border-black/[0.15] dark:hover:border-white/25 hover:bg-neutral-50 dark:hover:bg-[#1C1F28] transition-colors shadow-2xs cursor-pointer w-full sm:w-auto"
        >
          <RotateCcw className="w-3.5 h-3.5 text-[#86868B] dark:text-neutral-400" strokeWidth={1.8} />
          <span>Transform Another File</span>
        </button>
      </div>
    </motion.div>
  );
}
