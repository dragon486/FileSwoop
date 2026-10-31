'use client';

import { useRef, useCallback, useState } from 'react';
import { Upload, Plus } from 'lucide-react';
import { ACCEPTED_TYPES, MAX_FILE_SIZE } from '@/lib/constants';

interface FileDropZoneProps {
  onFileDrop: (file: File) => void;
  onError: (msg: string) => void;
  isActive?: boolean;
}

export function FileDropZone({ onFileDrop, onError, isActive = false }: FileDropZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const validate = useCallback(
    (file: File): boolean => {
      if (!ACCEPTED_TYPES.includes(file.type)) {
        onError(
          `Unsupported file type: "${file.type || file.name}". Supported: PDF, JPG, PNG, WebP, GIF, TXT, ZIP.`
        );
        return false;
      }
      if (file.size > MAX_FILE_SIZE) {
        onError(`File too large (${(file.size / (1024 * 1024)).toFixed(1)} MB). Maximum is 100 MB.`);
        return false;
      }
      return true;
    },
    [onError]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file && validate(file)) {
        onFileDrop(file);
      }
    },
    [onFileDrop, validate]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && validate(file)) {
        onFileDrop(file);
      }
      e.target.value = '';
    },
    [onFileDrop, validate]
  );

  return (
    <div className="w-full">
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={handleChange}
        accept={ACCEPTED_TYPES.join(',')}
      />

      <div
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => inputRef.current?.click()}
        className={`w-full flex items-center justify-between p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all cursor-pointer group select-none bg-white ${
          isDragOver || isActive
            ? 'border-indigo-600 bg-indigo-50/30'
            : 'border-neutral-200/90 hover:border-neutral-300 hover:bg-neutral-50/50'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-neutral-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 text-neutral-500 flex items-center justify-center transition-colors flex-shrink-0">
            <Upload className="w-5 h-5" />
          </div>

          <div>
            <p className="text-sm font-semibold text-neutral-800 group-hover:text-indigo-600 transition-colors">
              Drop a file here, or{' '}
              <span className="text-indigo-600 underline underline-offset-2">browse</span>
            </p>
            <p className="text-xs text-neutral-400 mt-0.5">
              PDF, JPG, PNG, WebP, GIF, TXT, ZIP up to 100 MB • Or drop directly onto any station below
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 text-neutral-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 text-xs font-medium transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Select File
        </div>
      </div>
    </div>
  );
}
