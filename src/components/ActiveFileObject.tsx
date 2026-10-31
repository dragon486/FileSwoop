'use client';

import { useState } from 'react';
import {
  FileText,
  Image as ImageIcon,
  FileArchive,
  FileCode,
  GripVertical,
  CheckCircle2,
} from 'lucide-react';
import { formatBytes, isImageType, isPdfType, isZipType } from '@/lib/fileUtils';
import type { ProcessedFile } from '@/types';

interface ActiveFileObjectProps {
  file: ProcessedFile;
  className?: string;
  isDraggable?: boolean;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function ActiveFileObject({
  file,
  className = '',
  isDraggable = true,
  onDragStart,
  onDragEnd,
}: ActiveFileObjectProps) {
  const [isDragging, setIsDragging] = useState(false);

  const getIcon = () => {
    if (isImageType(file.type)) return <ImageIcon className="w-4 h-4 text-[#0071E3]" strokeWidth={1.8} />;
    if (isPdfType(file.type)) return <FileText className="w-4 h-4 text-[#FF2D55]" strokeWidth={1.8} />;
    if (isZipType(file.type)) return <FileArchive className="w-4 h-4 text-[#FF9500]" strokeWidth={1.8} />;
    return <FileCode className="w-4 h-4 text-[#86868B]" strokeWidth={1.8} />;
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', file.id);
    e.dataTransfer.effectAllowed = 'copyMove';

    // Create a sleek Apple-style floating pill with Google file symbol for the drag ghost image
    if (typeof document !== 'undefined') {
      const ghost = document.createElement('div');
      ghost.style.position = 'fixed';
      ghost.style.top = '-9999px';
      ghost.style.left = '-9999px';
      ghost.style.pointerEvents = 'none';
      ghost.style.zIndex = '99999';
      ghost.style.display = 'flex';
      ghost.style.alignItems = 'center';
      ghost.style.gap = '10px';
      ghost.style.padding = '8px 16px';
      ghost.style.borderRadius = '9999px';
      ghost.style.background = 'rgba(18, 20, 28, 0.94)';
      ghost.style.backdropFilter = 'blur(20px)';
      ghost.style.border = '1.5px solid rgba(66, 133, 244, 0.7)';
      ghost.style.boxShadow = '0 12px 32px rgba(0,0,0,0.5), 0 0 16px rgba(66, 133, 244, 0.4)';
      ghost.style.color = '#ffffff';
      ghost.style.fontFamily = 'system-ui, -apple-system, sans-serif';
      ghost.style.fontSize = '12px';
      ghost.style.fontWeight = '600';
      ghost.style.whiteSpace = 'nowrap';
      ghost.innerHTML = `
        <div style="width: 26px; height: 30px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.3));">
          <svg width="22" height="26" viewBox="0 0 24 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 0C1.34315 0 0 1.34315 0 3V25C0 26.6569 1.34315 28 3 28H21C22.6569 28 24 26.6569 24 25V8L16 0H3Z" fill="#4285F4"/>
            <path d="M16 0V6C16 7.10457 16.8954 8 18 8H24L16 0Z" fill="#A1C2FA"/>
            <path d="M16 8L24 8L16 0V8Z" fill="rgba(0,0,0,0.15)"/>
            <rect x="4" y="11" width="16" height="2.2" rx="1.1" fill="#FFFFFF"/>
            <rect x="4" y="15" width="16" height="2.2" rx="1.1" fill="#FFFFFF"/>
            <rect x="4" y="19" width="10" height="2.2" rx="1.1" fill="#FFFFFF"/>
          </svg>
        </div>
        <div style="display: flex; flex-direction: column;">
          <span style="max-width: 190px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 12px; font-weight: 600; color: #ffffff;">${file.name}</span>
          <span style="font-size: 9.5px; color: rgba(255, 255, 255, 0.65);">${formatBytes(file.size)} • Hold to transform</span>
        </div>
      `;
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 30, 20);
      setTimeout(() => {
        try {
          document.body.removeChild(ghost);
        } catch {}
      }, 0);
    }

    onDragStart?.();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      className={`inline-flex items-center gap-3 px-3.5 py-2 rounded-2xl bg-white/95 dark:bg-[#161822]/95 backdrop-blur-xl border border-black/[0.08] dark:border-white/15 shadow-sm cursor-grab active:cursor-grabbing select-none transition-all duration-200 hover:border-black/[0.15] dark:hover:border-white/30 hover:-translate-y-0.5 ${
        isDragging
          ? 'opacity-40 scale-[0.98] ring-2 ring-[#0071E3]/40 shadow-inner'
          : 'hover:shadow-md'
      } ${className}`}
      title="Movable File Object — Drag this over any destination to apply an operation"
    >
      <div className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300">
        <GripVertical className="w-3.5 h-3.5" />
      </div>

      <div className="w-8 h-8 rounded-lg bg-neutral-100 dark:bg-white/10 border border-neutral-200/60 dark:border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {file.thumbnail ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={file.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
        ) : (
          getIcon()
        )}
      </div>

      <div className="flex flex-col min-w-0 pr-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-neutral-900 dark:text-white truncate max-w-[200px] sm:max-w-[280px]">
            {file.name}
          </span>
          <span className="text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded-sm bg-neutral-100 dark:bg-white/15 text-neutral-600 dark:text-neutral-200">
            {file.type.split('/')[1] || 'FILE'}
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-neutral-500 dark:text-neutral-400 mt-0.5">
          <span>{formatBytes(file.size)}</span>
          {file.transformOption && (
            <>
              <span>•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-0.5">
                <CheckCircle2 className="w-2.5 h-2.5" />
                {file.transformOption}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
