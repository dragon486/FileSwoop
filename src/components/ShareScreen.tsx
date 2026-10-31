'use client';

import { motion } from 'framer-motion';
import { Download, QrCode, Archive, Copy, Share2 } from 'lucide-react';
import { HoldTarget } from './HoldTarget';
import { BackZone } from './BackZone';
import { HOLD_DWELL_MS } from '@/lib/constants';
import type { ProcessedFile } from '@/types';

interface ShareScreenProps {
  currentFile: ProcessedFile | null;
  onShare: (optionId: string, file?: File) => void;
  onBack: () => void;
  isProcessing: boolean;
  progress: number;
  onHoverSnap?: (pos: { x: number; y: number } | null) => void;
  theme?: 'light' | 'dark';
}

const SHARE_OPTIONS = [
  {
    id: 'download',
    label: 'Download File',
    desc: 'Directly saves the output file to your local computer disk.',
    icon: Download,
  },
  {
    id: 'copy',
    label: 'Copy Local Link',
    desc: 'Copies the browser-scoped resource URL to your clipboard for quick reference.',
    icon: Copy,
  },
  {
    id: 'zip',
    label: 'Package as ZIP',
    desc: 'Archives the file inside a standard compressed .zip container for transfer.',
    icon: Archive,
  },
  {
    id: 'qr',
    label: 'Generate QR Code',
    desc: 'Generates a scannable high-resolution QR image containing file data.',
    icon: QrCode,
  },
  {
    id: 'native',
    label: 'Native Device Share',
    desc: 'Opens your operating system or mobile share sheet if supported.',
    icon: Share2,
  },
];

export function ShareScreen({
  currentFile,
  onShare,
  onBack,
  isProcessing,
  progress,
  onHoverSnap,
  theme = 'light',
}: ShareScreenProps) {
  const isDark = theme === 'dark';
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
          Ready to share your file?
        </h2>
        <p className="text-xs sm:text-sm text-white/85 mt-1.5 font-normal drop-shadow-xs">
          {currentFile
            ? 'Drop or hold your file over a local export destination.'
            : 'Drop your file onto a sharing destination to export instantly.'}
        </p>
      </div>

      {isProcessing && (
        <div className="w-full max-w-xs px-4 py-3 mb-5 bg-white/95 dark:bg-[#15171F]/95 backdrop-blur-xl border border-[#0071E3]/30 rounded-2xl flex items-center justify-center gap-3 shadow-lg">
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
              Preparing export...
            </span>
            <span className="text-[10px] text-neutral-500 dark:text-neutral-400">
              Generating secure share payload
            </span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 w-full">
        {SHARE_OPTIONS.map((opt) => {
          const Icon = opt.icon;

          return (
            <HoldTarget
              key={opt.id}
              id={`share-${opt.id}`}
              dwellMs={HOLD_DWELL_MS}
              holdLabel="Exporting..."
              onTrigger={(file) => onShare(opt.id, file)}
              onHoverSnap={onHoverSnap}
              disabled={isProcessing}
              className={`p-4 sm:p-5 rounded-[18px] backdrop-blur-xl transition-all flex flex-col justify-between min-h-[120px] group active:scale-[0.99] ${
                isDark
                  ? 'bg-[#15171F]/90 text-white border border-white/12 shadow-[0_16px_40px_rgba(0,0,0,0.65)] hover:bg-[#1C1F28]/95 hover:shadow-[0_20px_45px_rgba(0,0,0,0.8)]'
                  : 'bg-white/95 text-[#1D1D1F] border border-white/80 shadow-[0_12px_36px_rgba(0,0,0,0.16)] hover:bg-white hover:shadow-[0_18px_44px_rgba(0,0,0,0.22)]'
              }`}
              activeClassName={`border-[#0071E3] ring-4 ring-[#0071E3]/25 scale-[1.02] shadow-[0_16px_40px_rgba(0,113,227,0.35)] ${
                isDark ? 'bg-[#182030]' : 'bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`text-base font-semibold tracking-tight transition-colors ${
                      isDark ? 'text-white group-hover:text-[#3898FF]' : 'text-[#1D1D1F] group-hover:text-[#0071E3]'
                    }`}
                  >
                    {opt.label}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                      isDark
                        ? 'bg-white/10 group-hover:bg-[#0071E3]/20 group-hover:text-[#3898FF] text-neutral-300'
                        : 'bg-neutral-100 group-hover:bg-[#0071E3]/10 group-hover:text-[#0071E3] text-[#86868B]'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" strokeWidth={1.8} />
                  </div>
                </div>
                <p className={`text-[11px] mt-1.5 leading-relaxed ${isDark ? 'text-neutral-400' : 'text-[#6E6E73]'}`}>{opt.desc}</p>
              </div>

              <div
                className={`mt-3 pt-2.5 border-t flex items-center justify-between text-[10px] font-medium ${
                  isDark ? 'border-white/[0.08] text-neutral-400' : 'border-black/[0.06] text-[#6E6E73]'
                }`}
              >
                <span>Hold or click to export</span>
                <span className={`opacity-0 group-hover:opacity-100 transition-opacity font-semibold ${isDark ? 'text-[#3898FF]' : 'text-[#0071E3]'}`}>
                  Export →
                </span>
              </div>
            </HoldTarget>
          );
        })}
      </div>
    </motion.div>
  );
}
