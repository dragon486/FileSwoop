'use client';

import { useState } from 'react';
import { Download, CheckCircle2, Copy, FileDown } from 'lucide-react';
import { formatBytes } from '@/lib/fileUtils';
import type { ProcessedFile } from '@/types';

interface OutputDropZoneProps {
  file: ProcessedFile | null;
  onDownload: () => void;
  onCopyLink?: () => void;
  onShare?: () => void;
}

export function OutputDropZone({ file, onDownload, onCopyLink }: OutputDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (file) onDownload();
  };

  if (!file) return null;

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`w-full bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        isDragOver
          ? 'border-emerald-500 ring-3 ring-emerald-500/20 bg-emerald-50/20'
          : 'border-neutral-200/80 hover:border-neutral-300'
      }`}
    >
      <div className="flex items-center gap-3.5">
        <div
          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors flex-shrink-0 ${
            isDragOver ? 'bg-emerald-600 text-white' : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          {isDragOver ? <CheckCircle2 className="w-5 h-5" /> : <FileDown className="w-5 h-5" />}
        </div>

        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
              Ready for Download
            </span>
            {file.transformOption && (
              <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200/60">
                {file.transformOption} applied
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-neutral-900 mt-0.5 truncate max-w-sm sm:max-w-md">
            {file.name}{' '}
            <span className="text-xs font-normal text-neutral-500">
              ({formatBytes(file.size)})
            </span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 self-end sm:self-center">
        {onCopyLink && (
          <button
            onClick={onCopyLink}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors border border-neutral-200/80"
            title="Copy local link"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy Link</span>
          </button>
        )}

        <button
          onClick={onDownload}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-xs hover:shadow active:scale-98"
        >
          <Download className="w-4 h-4" />
          <span>Download Output</span>
        </button>
      </div>
    </div>
  );
}
