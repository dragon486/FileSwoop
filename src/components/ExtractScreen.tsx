'use client';

import { motion } from 'framer-motion';
import { FileText, Files, SlidersHorizontal, Sparkles, Archive } from 'lucide-react';
import { HoldTarget } from './HoldTarget';
import { BackZone } from './BackZone';
import { isPdfType, isZipType } from '@/lib/fileUtils';
import { HOLD_DWELL_MS } from '@/lib/constants';
import type { ProcessedFile } from '@/types';

interface ExtractScreenProps {
  currentFile: ProcessedFile | null;
  onExtract: (optionId: string, file?: File) => void;
  onBack: () => void;
  isProcessing: boolean;
  progress: number;
  onHoverSnap?: (pos: { x: number; y: number } | null) => void;
  theme?: 'light' | 'dark';
}

export function ExtractScreen({
  currentFile,
  onExtract,
  onBack,
  isProcessing,
  progress,
  onHoverSnap,
  theme = 'light',
}: ExtractScreenProps) {
  const isDark = theme === 'dark';
  const options = [];

  if (!currentFile || isPdfType(currentFile.type)) {
    options.push(
      {
        id: 'text',
        label: 'Extract Full Text',
        badge: '.txt',
        desc: 'Extracts all readable paragraphs and sentences into a clean text document.',
        icon: FileText,
      },
      {
        id: 'pages',
        label: 'Split Pages to ZIP',
        badge: '.zip',
        desc: 'Separates each individual page into standalone single-page PDF files.',
        icon: Files,
      }
    );
  }

  if (currentFile && isZipType(currentFile.type)) {
    options.push({
      id: 'archive',
      label: 'Unpack Archive Contents',
      badge: '.zip',
      desc: 'Extracts all enclosed files and directories into an accessible bundle.',
      icon: Archive,
    });
  }

  // Universally available options
  options.push(
    {
      id: 'metadata',
      label: 'Extract File Metadata',
      badge: '.json',
      desc: 'Dumps all technical header attributes, byte sizes, and MIME properties.',
      icon: SlidersHorizontal,
    },
    {
      id: 'base64',
      label: 'Extract Base64 URI',
      badge: 'Data URL',
      desc: 'Encodes the file into a base64 string for embedding in web code or CSS.',
      icon: Sparkles,
    }
  );

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
          What do you want to extract?
        </h2>
        <p className="text-xs sm:text-sm text-white/85 mt-1.5 font-normal drop-shadow-xs">
          {currentFile
            ? 'Drop or hold your file over the content you wish to extract.'
            : 'Drop your file onto an extraction target to extract in one motion.'}
        </p>
      </div>

      {isProcessing && (
        <div className="w-full max-w-xs px-4 py-3 mb-5 bg-white/95 dark:bg-[#15171F]/95 backdrop-blur-xl border border-[#FF9500]/30 rounded-2xl flex items-center justify-center gap-3 shadow-lg">
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
            <svg className="w-8 h-8 -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="12"
                stroke="rgba(255, 149, 0, 0.2)"
                strokeWidth="2.5"
                fill="none"
              />
              <motion.circle
                cx="16"
                cy="16"
                r="12"
                stroke="#FF9500"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="75.4"
                animate={{ strokeDashoffset: 75.4 - (progress / 100) * 75.4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              />
            </svg>
            <span className="absolute text-[9px] font-bold text-[#FF9500] dark:text-[#FFA014]">
              {progress}%
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-[#FF9500] dark:text-[#FFA014]">
              Extracting contents...
            </span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
              In-browser extraction pipeline
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4 w-full max-w-2xl">
        {options.map((opt) => {
          const Icon = opt.icon;

          return (
            <HoldTarget
              key={opt.id}
              id={`extract-${opt.id}`}
              dwellMs={HOLD_DWELL_MS}
              holdLabel="Extracting..."
              onTrigger={(file) => onExtract(opt.id, file)}
              onHoverSnap={onHoverSnap}
              disabled={isProcessing}
              className={`p-4 sm:p-5 rounded-[18px] backdrop-blur-xl transition-all flex flex-col justify-between min-h-[120px] group active:scale-[0.99] ${
                isDark
                  ? 'bg-[#15171F]/90 text-white border border-white/12 shadow-[0_16px_40px_rgba(0,0,0,0.65)] hover:bg-[#1C1F28]/95 hover:shadow-[0_20px_45px_rgba(0,0,0,0.8)]'
                  : 'bg-white/95 text-[#1D1D1F] border border-white/80 shadow-[0_12px_36px_rgba(0,0,0,0.16)] hover:bg-white hover:shadow-[0_18px_44px_rgba(0,0,0,0.22)]'
              }`}
              activeClassName={`border-[#FF9500] ring-4 ring-[#FF9500]/25 scale-[1.02] shadow-[0_16px_40px_rgba(255,149,0,0.35)] ${
                isDark ? 'bg-[#251C12]' : 'bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#FF9500]/10 text-[#FF9500] flex items-center justify-center">
                      <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </div>
                    <span
                      className={`text-sm font-semibold tracking-tight transition-colors ${
                        isDark ? 'text-white group-hover:text-[#FFAE33]' : 'text-[#1D1D1F] group-hover:text-[#FF9500]'
                      }`}
                    >
                      {opt.label}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full ${
                      isDark ? 'text-[#FFAE33] bg-[#FF9500]/20' : 'text-[#FF9500] bg-[#FF9500]/10'
                    }`}
                  >
                    {opt.badge}
                  </span>
                </div>
                <p className={`text-[11px] mt-2 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-[#6E6E73]'}`}>{opt.desc}</p>
              </div>

              <div
                className={`mt-3 pt-2 border-t flex items-center justify-between text-[10px] font-medium ${
                  isDark ? 'border-white/[0.08] text-neutral-400' : 'border-black/[0.06] text-[#6E6E73]'
                }`}
              >
                <span>Hold or click to extract</span>
                <span className={`opacity-0 group-hover:opacity-100 transition-opacity font-semibold ${isDark ? 'text-[#FFAE33]' : 'text-[#FF9500]'}`}>
                  Extract →
                </span>
              </div>
            </HoldTarget>
          );
        })}
      </div>
    </motion.div>
  );
}
