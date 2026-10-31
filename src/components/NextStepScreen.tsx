'use client';

import { motion } from 'framer-motion';
import {
  Download,
  ArrowRight,
  RefreshCw,
  Minimize2,
  Scan,
  Files,
  WandSparkles,
  Share2,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { HoldTarget } from './HoldTarget';
import { BackZone } from './BackZone';
import { formatBytes } from '@/lib/fileUtils';
import { HOLD_DWELL_MS } from '@/lib/constants';
import type { ProcessedFile, StationId } from '@/types';

interface NextStepScreenProps {
  currentFile: ProcessedFile;
  lastOperation?: string;
  onSelectStation: (stationId: StationId) => void;
  onFinish: () => void;
  onBack: () => void;
  onHoverSnap?: (pos: { x: number; y: number } | null) => void;
  theme?: 'light' | 'dark';
}

export function NextStepScreen({
  currentFile,
  lastOperation,
  onSelectStation,
  onFinish,
  onBack,
  onHoverSnap,
  theme = 'light',
}: NextStepScreenProps) {
  const isDark = theme === 'dark';
  const nextTools: { id: StationId; label: string; icon: LucideIcon; color: string }[] = [
    { id: 'compress', label: 'Compress', icon: Minimize2, color: '#5856D6' },
    { id: 'resize', label: 'Resize', icon: Scan, color: '#34C759' },
    { id: 'enhance', label: 'Enhance', icon: WandSparkles, color: '#AF52DE' },
    { id: 'convert', label: 'Convert', icon: RefreshCw, color: '#0071E3' },
    { id: 'extract', label: 'Extract', icon: Files, color: '#FF9500' },
    { id: 'share', label: 'Share', icon: Share2, color: '#0071E3' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.99 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.99 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-4xl flex flex-col items-center"
    >
      <div className="w-full flex items-center justify-between mb-3">
        <BackZone onBack={onBack} label="Undo / Change Decision" />
      </div>

      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/90 text-[#34C759] text-[11px] font-semibold mb-2 border border-white/40 shadow-xs">
          <CheckCircle2 className="w-3.5 h-3.5" strokeWidth={1.8} />
          {lastOperation || 'Operation'} Applied Successfully
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-white drop-shadow-md">
          What would you like to do next?
        </h2>
        <p className="text-xs sm:text-sm text-white/85 mt-1 font-normal drop-shadow-xs">
          Hold over Finish to download, or drag onto another tool to continue your transformation journey.
        </p>
      </div>

      {/* Prominent Finish & Download Target */}
      <div className="w-full max-w-md mb-5">
        <HoldTarget
          id="finish-step"
          dwellMs={HOLD_DWELL_MS}
          holdLabel="Downloading..."
          onTrigger={onFinish}
          onHoverSnap={onHoverSnap}
          className="p-4 sm:p-5 rounded-[20px] bg-[#0071E3] text-white shadow-[0_8px_32px_rgba(0,113,227,0.35)] hover:bg-[#0077ED] border border-white/30 transition-all flex items-center justify-between group active:scale-[0.99]"
          activeClassName="ring-4 ring-white/50 scale-[1.02]"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white flex-shrink-0">
              <Download className="w-5 h-5" strokeWidth={1.8} />
            </div>
            <div className="text-left">
              <span className="text-base font-bold block">Finish & Download</span>
              <span className="text-[11px] text-white/80 line-clamp-1">
                {currentFile.name} ({formatBytes(currentFile.size)})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-xs font-semibold text-white/90">
            <span>Save</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" strokeWidth={1.8} />
          </div>
        </HoldTarget>
      </div>

      {/* Chain another operation section */}
      <div className="w-full">
        <div className="flex items-center gap-2.5 mb-3">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-white/80">
            Or chain another transformation
          </span>
          <div className="flex-1 h-px bg-white/20" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 w-full">
          {nextTools.map((tool) => {
            const Icon = tool.icon;

            return (
              <HoldTarget
                key={tool.id}
                id={`next-station-${tool.id}`}
                dwellMs={HOLD_DWELL_MS}
                holdLabel="Opening..."
                onTrigger={() => onSelectStation(tool.id)}
                onHoverSnap={onHoverSnap}
                className={`p-3 rounded-[16px] backdrop-blur-xl transition-all flex flex-col items-center text-center group active:scale-[0.98] ${
                  isDark
                    ? 'bg-[#15171F]/90 text-white border border-white/12 shadow-[0_16px_40px_rgba(0,0,0,0.65)] hover:bg-[#1C1F28]/95 hover:shadow-[0_20px_45px_rgba(0,0,0,0.8)]'
                    : 'bg-white/95 text-[#1D1D1F] border border-white/80 shadow-[0_12px_36px_rgba(0,0,0,0.16)] hover:bg-white hover:shadow-[0_18px_44px_rgba(0,0,0,0.22)]'
                }`}
                activeClassName={`border-[#0071E3] ring-4 ring-[#0071E3]/20 scale-105 ${
                  isDark ? 'bg-[#182030]' : 'bg-white'
                }`}
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-transform group-hover:scale-108"
                  style={{ backgroundColor: `${tool.color}10`, color: tool.color }}
                >
                  <Icon className="w-4 h-4" strokeWidth={1.8} />
                </div>
                <span
                  className={`text-[11px] font-semibold transition-colors ${
                    isDark ? 'text-white group-hover:text-[#3898FF]' : 'text-[#1D1D1F] group-hover:text-[#0071E3]'
                  }`}
                >
                  {tool.label}
                </span>
                <span className={`text-[9px] mt-0.5 ${isDark ? 'text-neutral-400' : 'text-[#86868B]'}`}>
                  Drop or click
                </span>
              </HoldTarget>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
