'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  ArrowLeftRight,
  Minimize2,
  Maximize2,
  Layers,
  Sparkles,
  Share2,
  FileText,
  Upload,
} from 'lucide-react';
import type { StationConfig, StationId } from '@/types';

interface ToolStationProps {
  config: StationConfig;
  onOpenStation: (stationId: StationId) => void;
  onExternalFileDrop: (file: File, stationId: StationId) => void;
  onInternalFileDrop: (stationId: StationId) => void;
}

export function ToolStation({
  config,
  onOpenStation,
  onExternalFileDrop,
  onInternalFileDrop,
}: ToolStationProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounterRef = useRef(0);

  const getStationIcon = (id: StationId) => {
    switch (id) {
      case 'convert':
        return <ArrowLeftRight className="w-5 h-5" />;
      case 'compress':
        return <Minimize2 className="w-5 h-5" />;
      case 'resize':
        return <Maximize2 className="w-5 h-5" />;
      case 'extract':
        return <Layers className="w-5 h-5" />;
      case 'enhance':
        return <Sparkles className="w-5 h-5" />;
      case 'share':
        return <Share2 className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current++;
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      dragCounterRef.current = 0;
      setIsDragOver(false);

      // Check if this is an external file from user's operating system
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        onExternalFileDrop(file, config.id);
        return;
      }

      // Or if it's the internal active file being dragged
      onInternalFileDrop(config.id);
    },
    [config.id, onExternalFileDrop, onInternalFileDrop]
  );

  const handleClick = () => {
    onOpenStation(config.id);
  };

  return (
    <motion.div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleClick}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      transition={{ duration: 0.15 }}
      className={`relative flex flex-col justify-between p-6 rounded-2xl bg-white border transition-all cursor-pointer select-none group min-h-[150px] shadow-xs hover:shadow-md ${
        isDragOver
          ? 'border-indigo-600 ring-3 ring-indigo-500/20 bg-indigo-50/20 shadow-md'
          : 'border-neutral-200/80 hover:border-neutral-300'
      }`}
    >
      {/* Top row: Icon badge & Station tag */}
      <div className="flex items-start justify-between">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105"
          style={{ backgroundColor: config.color }}
        >
          {getStationIcon(config.id)}
        </div>

        <span className="text-[11px] font-medium text-neutral-400 group-hover:text-indigo-600 transition-colors bg-neutral-100 group-hover:bg-indigo-50 px-2 py-0.5 rounded-full">
          {config.options.length} options
        </span>
      </div>

      {/* Title & Description */}
      <div className="mt-4">
        <h4 className="text-base font-semibold text-neutral-900 tracking-tight group-hover:text-indigo-600 transition-colors">
          {config.label}
        </h4>
        <p className="text-xs text-neutral-500 mt-0.5 line-clamp-1">
          {config.description}
        </p>
      </div>

      {/* Bottom hint or format chips */}
      <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
        <div className="flex items-center gap-1 truncate">
          {config.id === 'convert' && <span>PDF · JPG · PNG · WebP</span>}
          {config.id === 'compress' && <span>Quality & size targets</span>}
          {config.id === 'resize' && <span>Presets & exact pixels</span>}
          {config.id === 'extract' && <span>Text · Pages · Assets</span>}
          {config.id === 'enhance' && <span>Contrast · Sharpen · Color</span>}
          {config.id === 'share' && <span>Download · QR · ZIP</span>}
        </div>

        <span className="text-neutral-400 group-hover:text-neutral-700 font-medium transition-colors text-[11px] flex-shrink-0">
          Open →
        </span>
      </div>

      {/* Dragging over indicator */}
      {isDragOver && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 rounded-2xl bg-indigo-600/10 border-2 border-indigo-600 flex items-center justify-center pointer-events-none"
        >
          <div className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            Drop to {config.label}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
