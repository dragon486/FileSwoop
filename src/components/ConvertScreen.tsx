'use client';

import { motion } from 'framer-motion';
import { FileText, Image as ImageIcon, Sparkles } from 'lucide-react';
import { HoldTarget } from './HoldTarget';
import { BackZone } from './BackZone';
import { HOLD_DWELL_MS } from '@/lib/constants';
import type { ProcessedFile } from '@/types';

interface ConvertScreenProps {
  currentFile: ProcessedFile | null;
  onConvert: (formatId: string, file?: File) => void;
  onBack: () => void;
  isProcessing: boolean;
  progress: number;
  onHoverSnap?: (pos: { x: number; y: number } | null) => void;
  theme?: 'light' | 'dark';
}

const FORMAT_OPTIONS = [
  { id: 'jpg', label: 'JPG', desc: 'Standard photo format with universal device compatibility', icon: ImageIcon },
  { id: 'png', label: 'PNG', desc: 'Lossless quality supporting sharp edges & transparency', icon: ImageIcon },
  { id: 'webp', label: 'WebP', desc: 'Modern web image with 30%+ smaller file sizes', icon: Sparkles },
  { id: 'pdf', label: 'PDF', desc: 'Portable document format for sharing & high-res printing', icon: FileText },
  { id: 'gif', label: 'GIF', desc: 'Compact graphics with indexed color palette', icon: ImageIcon },
  { id: 'txt', label: 'TXT', desc: 'Extracted clean plain-text readable content', icon: FileText },
];

export function ConvertScreen({
  currentFile,
  onConvert,
  onBack,
  isProcessing,
  progress,
  onHoverSnap,
  theme = 'light',
}: ConvertScreenProps) {
  const isDark = theme === 'dark';
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl flex flex-col items-center"
    >
      <div className="w-full flex items-center justify-between mb-3 sm:mb-4">
        <BackZone onBack={onBack} label="Back to Tools" disabled={isProcessing} />
      </div>

      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-xl sm:text-3xl font-semibold tracking-[-0.025em] text-white drop-shadow-md">
          What format do you need?
        </h2>
        <p className="text-[11px] sm:text-sm text-white/85 mt-1 sm:mt-1.5 font-normal drop-shadow-xs px-2">
          {currentFile
            ? 'Drop or hold your file over a target format to convert in seconds.'
            : 'Drop your file directly onto a target format to convert instantly.'}
        </p>
      </div>

      {isProcessing && (
        <div className="w-full max-w-xs px-3.5 py-2.5 sm:px-4 sm:py-3 mb-4 sm:mb-5 bg-white/95 dark:bg-[#15171F]/95 backdrop-blur-xl border border-[#0071E3]/30 rounded-2xl flex items-center justify-center gap-3 shadow-lg">
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
            <svg className="w-8 h-8 -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="12"
                stroke="rgba(0, 113, 227, 0.2)"
                strokeWidth="2.5"
                fill="none"
              />
              <motion.circle
                cx="16"
                cy="16"
                r="12"
                stroke="#0071E3"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="75.4"
                animate={{ strokeDashoffset: 75.4 - (progress / 100) * 75.4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              />
            </svg>
            <span className="absolute text-[9px] font-bold text-[#0071E3] dark:text-[#3898FF]">
              {progress}%
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-[#0071E3] dark:text-[#3898FF]">
              Converting file...
            </span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Processing transformation
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 w-full">
        {FORMAT_OPTIONS.map((fmt) => {
          const isCurrentFormat = currentFile
            ? currentFile.name.toLowerCase().endsWith(`.${fmt.id.toLowerCase()}`)
            : false;
          const Icon = fmt.icon;

          return (
            <HoldTarget
              key={fmt.id}
              id={`format-${fmt.id}`}
              dwellMs={HOLD_DWELL_MS}
              holdLabel="Converting..."
              onTrigger={(file) => onConvert(fmt.id, file)}
              onHoverSnap={onHoverSnap}
              disabled={isProcessing || isCurrentFormat}
              className={`p-3 sm:p-5 rounded-[16px] sm:rounded-[18px] backdrop-blur-xl transition-all flex flex-col justify-between min-h-[110px] sm:min-h-[125px] group ${
                isCurrentFormat
                  ? isDark
                    ? 'border-white/[0.04] bg-white/[0.04] opacity-50 cursor-not-allowed'
                    : 'border-black/[0.06] bg-neutral-100/80 opacity-50 cursor-not-allowed'
                  : isDark
                  ? 'border border-white/12 bg-[#15171F]/90 shadow-[0_16px_40px_rgba(0,0,0,0.65)] hover:bg-[#1C1F28]/95 hover:shadow-[0_20px_45px_rgba(0,0,0,0.8)]'
                  : 'border border-white/80 bg-white/95 shadow-[0_12px_36px_rgba(0,0,0,0.16)] hover:bg-white hover:shadow-[0_18px_44px_rgba(0,0,0,0.22)]'
              }`}
              activeClassName={`border-[#0071E3] ring-4 ring-[#0071E3]/25 scale-[1.02] shadow-[0_16px_40px_rgba(0,113,227,0.35)] ${
                isDark ? 'bg-[#182030]' : 'bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-lg font-bold font-mono tracking-tight transition-colors uppercase ${
                      isDark ? 'text-white group-hover:text-[#3898FF]' : 'text-[#1D1D1F] group-hover:text-[#0071E3]'
                    }`}
                  >
                    {fmt.label}
                  </span>
                  {isCurrentFormat ? (
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                        isDark ? 'text-neutral-400 bg-white/10' : 'text-[#86868B] bg-neutral-100'
                      }`}
                    >
                      Current
                    </span>
                  ) : (
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                        isDark
                          ? 'bg-white/10 group-hover:bg-[#0071E3]/20 group-hover:text-[#3898FF] text-neutral-300'
                          : 'bg-neutral-100 group-hover:bg-[#0071E3]/10 group-hover:text-[#0071E3] text-[#86868B]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                    </div>
                  )}
                </div>
                <p className={`text-[11px] mt-1.5 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-[#6E6E73]'}`}>{fmt.desc}</p>
              </div>

              <div
                className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[10px] font-medium ${
                  isDark ? 'border-white/[0.08] text-neutral-400' : 'border-black/[0.06] text-[#6E6E73]'
                }`}
              >
                <span>Hold or click to convert</span>
                <span className={`opacity-0 group-hover:opacity-100 transition-opacity font-semibold ${isDark ? 'text-[#3898FF]' : 'text-[#0071E3]'}`}>
                  Convert →
                </span>
              </div>
            </HoldTarget>
          );
        })}
      </div>
    </motion.div>
  );
}
