'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal } from 'lucide-react';
import { HoldTarget } from './HoldTarget';
import { BackZone } from './BackZone';
import { formatBytes, estimateCompressedSize } from '@/lib/fileUtils';
import { HOLD_DWELL_MS } from '@/lib/constants';
import type { ProcessedFile } from '@/types';

interface CompressScreenProps {
  currentFile: ProcessedFile | null;
  onCompress: (optionId: string, customQuality?: number, file?: File) => void;
  onBack: () => void;
  isProcessing: boolean;
  progress: number;
  onHoverSnap?: (pos: { x: number; y: number } | null) => void;
  theme?: 'light' | 'dark';
}

const COMPRESS_OPTIONS = [
  {
    id: 'under500kb',
    label: '< 500 KB',
    badge: 'Maximum',
    desc: 'Maximum compression. Ideal for quick email attachments and strict web upload limits.',
  },
  {
    id: 'under1mb',
    label: '< 1 MB',
    badge: 'High',
    desc: 'Superb balance of small file weight and visual crispness for standard web presentations.',
  },
  {
    id: 'under2mb',
    label: '< 2 MB',
    badge: 'Balanced',
    desc: 'Preserves sharp text and fine graphic details while significantly cutting overall weight.',
  },
  {
    id: 'under5mb',
    label: '< 5 MB',
    badge: 'Light',
    desc: 'Gentle compression leaving zero noticeable compression artifacts.',
  },
  {
    id: 'bestquality',
    label: 'Best Quality',
    badge: 'Lossless',
    desc: 'Near-lossless visual fidelity (95%+ quality). Strips metadata and optimizes byte encoding.',
  },
];

export function CompressScreen({
  currentFile,
  onCompress,
  onBack,
  isProcessing,
  progress,
  onHoverSnap,
  theme = 'light',
}: CompressScreenProps) {
  const isDark = theme === 'dark';
  const [customQuality, setCustomQuality] = useState(80);

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
          How small should your file be?
        </h2>
        <p className="text-[11px] sm:text-sm text-white/85 mt-1 sm:mt-1.5 font-normal drop-shadow-xs px-2">
          {currentFile
            ? 'Drop or hold your file over a target to optimize file size.'
            : 'Drop your file onto a compression target to optimize instantly.'}
        </p>
      </div>

      {isProcessing && (
        <div className="w-full max-w-xs px-3.5 py-2.5 sm:px-4 sm:py-3 mb-4 sm:mb-5 bg-white/95 dark:bg-[#15171F]/95 backdrop-blur-xl border border-[#5856D6]/30 rounded-2xl flex items-center justify-center gap-3 shadow-lg">
          <div className="relative w-8 h-8 flex items-center justify-center shrink-0">
            <svg className="w-8 h-8 -rotate-90">
              <circle
                cx="16"
                cy="16"
                r="12"
                stroke="rgba(88, 86, 214, 0.2)"
                strokeWidth="2.5"
                fill="none"
              />
              <motion.circle
                cx="16"
                cy="16"
                r="12"
                stroke="#5856D6"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="75.4"
                animate={{ strokeDashoffset: 75.4 - (progress / 100) * 75.4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              />
            </svg>
            <span className="absolute text-[9px] font-bold text-[#5856D6] dark:text-[#8280FF]">
              {progress}%
            </span>
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-semibold text-[#5856D6] dark:text-[#8280FF]">
              Compressing file...
            </span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
              High-efficiency local compression
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4 w-full">
        {COMPRESS_OPTIONS.map((opt) => {
          const est = currentFile ? estimateCompressedSize(currentFile.size, opt.id) : null;

          return (
            <HoldTarget
              key={opt.id}
              id={`compress-${opt.id}`}
              dwellMs={HOLD_DWELL_MS}
              holdLabel="Compressing..."
              onTrigger={(file) => onCompress(opt.id, undefined, file)}
              onHoverSnap={onHoverSnap}
              disabled={isProcessing}
              className={`p-3.5 sm:p-5 rounded-[16px] sm:rounded-[18px] backdrop-blur-xl transition-all flex flex-col justify-between min-h-[115px] sm:min-h-[125px] group active:scale-[0.99] ${
                isDark
                  ? 'bg-[#15171F]/90 text-white border border-white/12 shadow-[0_16px_40px_rgba(0,0,0,0.65)] hover:bg-[#1C1F28]/95 hover:shadow-[0_20px_45px_rgba(0,0,0,0.8)]'
                  : 'bg-white/95 text-[#1D1D1F] border border-white/80 shadow-[0_12px_36px_rgba(0,0,0,0.16)] hover:bg-white hover:shadow-[0_18px_44px_rgba(0,0,0,0.22)]'
              }`}
              activeClassName={`border-[#5856D6] ring-4 ring-[#5856D6]/25 scale-[1.02] shadow-[0_16px_40px_rgba(88,86,214,0.35)] ${
                isDark ? 'bg-[#1D1B33]' : 'bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-lg font-bold font-mono tracking-tight transition-colors ${
                      isDark ? 'text-white group-hover:text-[#8280FF]' : 'text-[#1D1D1F] group-hover:text-[#5856D6]'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <span className="text-[10px] font-medium text-[#5856D6] bg-[#5856D6]/10 px-2 py-0.5 rounded-full">
                    {opt.badge}
                  </span>
                </div>
                <p className={`text-[11px] mt-1.5 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-[#6E6E73]'}`}>
                  {opt.desc}
                </p>
              </div>

              <div
                className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[10px] font-medium ${
                  isDark ? 'border-white/[0.08]' : 'border-black/[0.06]'
                }`}
              >
                {est && est.reduction > 0 ? (
                  <span className="text-[#5856D6] dark:text-[#8280FF] font-semibold">
                    ~{formatBytes(est.estimatedSize)} (-{est.reduction}%)
                  </span>
                ) : (
                  <span className={isDark ? 'text-neutral-400' : 'text-[#6E6E73]'}>Hold or click to compress</span>
                )}
                <span className="text-[#5856D6] dark:text-[#8280FF] opacity-0 group-hover:opacity-100 transition-opacity font-semibold">
                  Compress →
                </span>
              </div>
            </HoldTarget>
          );
        })}

        {/* Custom Slider Target */}
        <div
          className={`p-4 sm:p-5 rounded-[18px] backdrop-blur-xl flex flex-col justify-between min-h-[125px] ${
            isDark
              ? 'bg-[#15171F]/90 text-white border border-white/12 shadow-[0_16px_40px_rgba(0,0,0,0.65)]'
              : 'bg-white/95 text-[#1D1D1F] border border-white/80 shadow-[0_12px_36px_rgba(0,0,0,0.16)]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-semibold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-[#1D1D1F]'}`}>
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#5856D6]" strokeWidth={1.8} /> Custom Quality
              </span>
              <span
                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                  isDark ? 'text-white bg-[#202430] border-white/15' : 'text-[#1D1D1F] bg-neutral-100 border-black/[0.08]'
                }`}
              >
                {customQuality}%
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="95"
              value={customQuality}
              onChange={(e) => setCustomQuality(Number(e.target.value))}
              disabled={isProcessing}
              className="w-full accent-[#5856D6] cursor-pointer mt-1"
            />
            <p className={`text-[10px] mt-1 ${isDark ? 'text-neutral-400' : 'text-[#6E6E73]'}`}>
              Adjust quality trade-off manually.
            </p>
          </div>

          <div className={`mt-2.5 pt-2 border-t flex justify-end ${isDark ? 'border-white/[0.08]' : 'border-black/[0.06]'}`}>
            <HoldTarget
              id="compress-custom"
              dwellMs={HOLD_DWELL_MS}
              holdLabel="Applying Quality..."
              onTrigger={(file) => onCompress('custom', customQuality, file)}
              onHoverSnap={onHoverSnap}
              disabled={isProcessing}
              className="px-3.5 py-1.5 rounded-xl bg-[#5856D6] text-white text-[11px] font-medium hover:bg-[#4C4ABF] transition-colors shadow-2xs"
              activeClassName="bg-[#5856D6] scale-105 ring-2 ring-[#5856D6]/40"
            >
              Apply Quality
            </HoldTarget>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
