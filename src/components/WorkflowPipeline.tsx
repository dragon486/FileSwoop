'use client';

import { motion } from 'framer-motion';
import { ArrowRight, RotateCcw, FileText, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { formatBytes, isPdfType } from '@/lib/fileUtils';
import type { ProcessedFile } from '@/types';

interface WorkflowPipelineProps {
  versions: ProcessedFile[];
  currentIndex: number;
  onSelectVersion: (index: number) => void;
  onUndo: () => void;
  onReset: () => void;
}

export function WorkflowPipeline({
  versions,
  currentIndex,
  onSelectVersion,
  onUndo,
  onReset,
}: WorkflowPipelineProps) {
  if (versions.length === 0) return null;

  return (
    <div className="w-full bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
            Transformation Workflow
          </span>
          <span className="text-[11px] font-medium bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">
            {versions.length} {versions.length === 1 ? 'stage' : 'stages'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {versions.length > 1 && (
            <button
              onClick={onUndo}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-neutral-600 hover:text-neutral-900 bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors border border-neutral-200/60"
              title="Undo last step"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Undo</span>
            </button>
          )}
          <button
            onClick={onReset}
            className="text-xs text-neutral-400 hover:text-neutral-700 px-2 py-1 rounded-md transition-colors"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Horizontal step sequence */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
        {versions.map((v, idx) => {
          const isSelected = idx === currentIndex;
          const isOriginal = idx === 0;
          const prevVersion = idx > 0 ? versions[idx - 1] : null;
          const sizeDiff = prevVersion ? v.size - prevVersion.size : 0;
          const sizePct = prevVersion ? Math.round(((v.size - prevVersion.size) / prevVersion.size) * 100) : 0;

          return (
            <div key={v.id + idx} className="flex items-center gap-2 flex-shrink-0">
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectVersion(idx)}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-left border transition-all ${
                  isSelected
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-600/20'
                    : 'border-neutral-200/70 bg-neutral-50/60 hover:bg-white hover:border-neutral-300'
                }`}
              >
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 text-white'
                      : 'bg-neutral-200/70 text-neutral-700'
                  }`}
                >
                  {isOriginal ? (
                    isPdfType(v.type) ? <FileText className="w-3.5 h-3.5" /> : <ImageIcon className="w-3.5 h-3.5" />
                  ) : (
                    <span>{idx}</span>
                  )}
                </div>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-neutral-900 truncate max-w-[130px]">
                      {isOriginal ? 'Original' : v.transformOption || v.transformedBy || `Stage ${idx}`}
                    </span>
                    <span className="text-[10px] text-neutral-400 uppercase font-mono font-medium">
                      {v.type.split('/')[1] || 'FILE'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 text-[11px] text-neutral-500">
                    <span>{formatBytes(v.size)}</span>
                    {!isOriginal && sizeDiff !== 0 && (
                      <span
                        className={`text-[10px] font-medium font-mono ${
                          sizeDiff < 0 ? 'text-emerald-600' : 'text-amber-600'
                        }`}
                      >
                        {sizeDiff < 0 ? `${sizePct}%` : `+${sizePct}%`}
                      </span>
                    )}
                  </div>
                </div>

                {isSelected && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 flex-shrink-0 ml-1" />
                )}
              </motion.button>

              {idx < versions.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
