'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import {
  RefreshCw,
  Minimize2,
  Scan,
  Files,
  WandSparkles,
  Share2,
} from 'lucide-react';
import { HoldTarget } from './HoldTarget';
import { STATION_CONFIGS, ACCEPTED_TYPES, HOLD_DWELL_MS } from '@/lib/constants';
import type { StationId, ProcessedFile } from '@/types';

interface HomeScreenProps {
  currentFile: ProcessedFile | null;
  onSelectStation: (stationId: StationId) => void;
  onFileDrop: (file: File, targetStationId?: StationId) => void;
  onHoverSnap?: (pos: { x: number; y: number } | null) => void;
  theme?: 'light' | 'dark';
}

export function HomeScreen({
  currentFile,
  onSelectStation,
  onFileDrop,
  onHoverSnap,
  theme = 'light',
}: HomeScreenProps) {
  const isDark = theme === 'dark';
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const pendingStationRef = useRef<StationId | null>(null);

  const getStationIcon = (id: StationId) => {
    switch (id) {
      case 'convert':
        return <RefreshCw className="w-6 h-6 text-[#0071E3]" strokeWidth={1.8} />;
      case 'compress':
        return <Minimize2 className="w-6 h-6 text-[#5856D6]" strokeWidth={1.8} />;
      case 'resize':
        return <Scan className="w-6 h-6 text-[#34C759]" strokeWidth={1.8} />;
      case 'extract':
        return <Files className="w-6 h-6 text-[#FF9500]" strokeWidth={1.8} />;
      case 'enhance':
        return <WandSparkles className="w-6 h-6 text-[#AF52DE]" strokeWidth={1.8} />;
      case 'share':
        return <Share2 className="w-6 h-6 text-[#0071E3]" strokeWidth={1.8} />;
    }
  };

  const handleStationTrigger = (stationId: StationId, file?: File) => {
    if (file) {
      onFileDrop(file, stationId);
    } else {
      onSelectStation(stationId);
    }
  };

  const handleHiddenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileDrop(file, pendingStationRef.current || undefined);
      pendingStationRef.current = null;
    }
    e.target.value = '';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -14 }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-5xl flex flex-col items-center text-center px-2"
    >
      <input
        ref={hiddenInputRef}
        type="file"
        className="hidden"
        onChange={handleHiddenChange}
        accept={ACCEPTED_TYPES.join(',')}
      />

      {/* Typography on Pixel Backdrop */}
      <div className="mb-4 sm:mb-5">
        <h1 className="text-2xl sm:text-4xl font-semibold tracking-[-0.025em] text-white drop-shadow-md">
          {currentFile ? 'File ready! Select or drop onto a tool.' : 'Drop a file onto a tool to get started.'}
        </h1>
        <p className="text-xs sm:text-sm text-white/90 mt-1.5 font-normal max-w-lg mx-auto drop-shadow-xs">
          {currentFile
            ? 'Drag the hovering file onto a destination below or click a tool to get started.'
            : 'Fast, completely private file transformations directly inside your browser.'}
        </p>
      </div>

      {/* Six Large Apple-style Destinations Floating on Pixel Art */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 w-full">
        {STATION_CONFIGS.map((station) => (
          <HoldTarget
            key={station.id}
            id={station.id}
            dwellMs={HOLD_DWELL_MS}
            holdLabel="Opening..."
            onTrigger={(file) => handleStationTrigger(station.id, file)}
            onHoverSnap={onHoverSnap}
            className={`h-full p-4 sm:p-5 rounded-[18px] backdrop-blur-xl transition-all flex flex-col items-center text-center group active:scale-[0.99] ${
              isDark
                ? 'bg-[#15171F]/90 text-white border border-white/12 shadow-[0_16px_40px_rgba(0,0,0,0.65)] hover:bg-[#1E222D]/95 hover:shadow-[0_20px_45px_rgba(0,0,0,0.8)]'
                : 'bg-white/95 text-[#1D1D1F] border border-white/80 shadow-[0_12px_36px_rgba(0,0,0,0.16)] hover:bg-white hover:shadow-[0_18px_44px_rgba(0,0,0,0.22)]'
            }`}
            activeClassName={`border-[#0071E3] ring-4 ring-[#0071E3]/25 scale-[1.02] shadow-[0_16px_40px_rgba(0,113,227,0.35)] ${
              isDark ? 'bg-[#182030]' : 'bg-white'
            }`}
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-108 mb-2.5 shadow-2xs"
              style={{ backgroundColor: `${station.color}15` }}
            >
              {getStationIcon(station.id)}
            </div>

            <h3
              className={`text-base font-semibold tracking-tight transition-colors ${
                isDark ? 'text-white group-hover:text-[#3898FF]' : 'text-[#1D1D1F] group-hover:text-[#0071E3]'
              }`}
            >
              {station.label}
            </h3>

            <p
              className={`text-[11px] mt-1 line-clamp-1 leading-relaxed ${
                isDark ? 'text-[#A1A1A6]' : 'text-[#6E6E73]'
              }`}
            >
              {station.description}
            </p>

            <div
              className={`mt-3.5 pt-2 border-t w-full flex items-center justify-center text-[10px] font-medium transition-colors ${
                isDark
                  ? 'border-white/[0.08] text-[#A1A1A6] group-hover:text-[#3898FF]'
                  : 'border-black/[0.06] text-[#6E6E73] group-hover:text-[#0071E3]'
              }`}
            >
              <span>Hold or click to open →</span>
            </div>
          </HoldTarget>
        ))}
      </div>

      {/* Subtle Accessible Link */}
      <div className="mt-4 sm:mt-5 text-[11px] text-white/70 flex items-center gap-2">
        <span>Prefer browsing?</span>
        <button
          onClick={() => hiddenInputRef.current?.click()}
          className="text-white hover:text-white font-medium underline underline-offset-2 transition-colors cursor-pointer"
        >
          Select file manually
        </button>
      </div>
    </motion.div>
  );
}
