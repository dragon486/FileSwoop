'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Image as ImageIcon,
  FileArchive,
  FileCode,
  GripVertical,
  Download,
  Upload,
} from 'lucide-react';
import { formatBytes, isImageType, isPdfType, isZipType } from '@/lib/fileUtils';
import type { ProcessedFile } from '@/types';

interface FilePreviewProps {
  file: ProcessedFile;
  onReplaceFile: () => void;
  onDownload: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

export function FilePreview({
  file,
  onReplaceFile,
  onDownload,
  onDragStart,
  onDragEnd,
}: FilePreviewProps) {
  const [isDragging, setIsDragging] = useState(false);

  const getIcon = () => {
    if (isImageType(file.type)) return <ImageIcon className="w-5 h-5 text-indigo-600" />;
    if (isPdfType(file.type)) return <FileText className="w-5 h-5 text-rose-600" />;
    if (isZipType(file.type)) return <FileArchive className="w-5 h-5 text-amber-600" />;
    return <FileCode className="w-5 h-5 text-neutral-600" />;
  };

  const getFormatBadgeColor = () => {
    if (isImageType(file.type)) return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
    if (isPdfType(file.type)) return 'bg-rose-50 text-rose-700 border-rose-200/60';
    if (isZipType(file.type)) return 'bg-amber-50 text-amber-700 border-amber-200/60';
    return 'bg-neutral-100 text-neutral-700 border-neutral-200/60';
  };

  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true);
    e.dataTransfer.setData('text/plain', file.id);
    e.dataTransfer.effectAllowed = 'copyMove';
    onDragStart?.();
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    onDragEnd?.();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="w-full bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
    >
      {/* Movable file object */}
      <div
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        className={`flex items-center gap-3.5 p-2 rounded-xl border transition-all cursor-grab active:cursor-grabbing select-none group max-w-xl ${
          isDragging
            ? 'opacity-50 scale-98 border-dashed border-indigo-500 bg-indigo-50/20'
            : 'border-transparent hover:border-neutral-200 hover:bg-neutral-50/60'
        }`}
        title="Drag this file over any station below to transform"
      >
        <div className="text-neutral-400 group-hover:text-neutral-600 cursor-grab">
          <GripVertical className="w-4 h-4" />
        </div>

        {/* Thumbnail or Icon */}
        <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center flex-shrink-0 overflow-hidden border border-neutral-200/60">
          {file.thumbnail ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={file.thumbnail}
              alt="File preview"
              className="w-full h-full object-cover"
            />
          ) : (
            getIcon()
          )}
        </div>

        {/* File Information */}
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-neutral-900 truncate max-w-xs sm:max-w-md">
              {file.name}
            </h3>
            <span
              className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full border font-mono ${getFormatBadgeColor()}`}
            >
              {file.type.split('/')[1] || 'FILE'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-0.5">
            <span>{formatBytes(file.size)}</span>
            <span>•</span>
            <span className="text-indigo-600 font-medium">Movable file object</span>
          </div>
        </div>
      </div>

      {/* Right action buttons */}
      <div className="flex items-center gap-2 self-end sm:self-center">
        <button
          onClick={onReplaceFile}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200/80"
          title="Choose a different file"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Replace</span>
        </button>

        <button
          onClick={onDownload}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          title="Download current file"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download</span>
        </button>
      </div>
    </motion.div>
  );
}
