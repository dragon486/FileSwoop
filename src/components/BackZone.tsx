'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { HOLD_DWELL_MS } from '@/lib/constants';

interface BackZoneProps {
  onBack: () => void;
  label?: string;
  disabled?: boolean;
  dwellMs?: number;
}

export function BackZone({
  onBack,
  label = 'Back',
  disabled = false,
  dwellMs = HOLD_DWELL_MS,
}: BackZoneProps) {
  const [isHovered, setIsHovered] = useState(false);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragCounterRef = useRef<number>(0);
  const isHoldingRef = useRef<boolean>(false);

  const clearTimer = useCallback(() => {
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
    dragCounterRef.current = 0;
    isHoldingRef.current = false;
    setIsHovered(false);
  }, []);

  useEffect(() => {
    return () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    };
  }, []);

  const triggerBack = useCallback(() => {
    clearTimer();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.(20);
      } catch {}
    }
    onBack();
  }, [clearTimer, onBack]);

  const startDwellTimer = useCallback(() => {
    if (dwellTimerRef.current || disabled) return;

    dwellTimerRef.current = setTimeout(() => {
      if (isHoldingRef.current) {
        triggerBack();
      }
    }, dwellMs);
  }, [disabled, dwellMs, triggerBack]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    dragCounterRef.current++;

    if (!isHoldingRef.current) {
      isHoldingRef.current = true;
      setIsHovered(true);
      startDwellTimer();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (disabled) return;

    if (!isHoldingRef.current) {
      isHoldingRef.current = true;
      setIsHovered(true);
      startDwellTimer();
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      clearTimer();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    if (disabled) return;
    triggerBack();
  };

  return (
    <button
      type="button"
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => {
        if (!disabled) triggerBack();
      }}
      className={`group relative overflow-hidden flex items-center gap-2 px-4 py-2 rounded-2xl border transition-all duration-200 select-none cursor-pointer ${
        isHovered
          ? 'border-[#0071E3] bg-white dark:bg-[#182030] text-[#0071E3] dark:text-[#3898FF] scale-[1.03] shadow-[0_8px_24px_rgba(0,113,227,0.3)] ring-2 ring-[#0071E3]/30'
          : 'border-white/40 dark:border-white/10 bg-white/90 dark:bg-[#15171E]/90 backdrop-blur-md hover:bg-white dark:hover:bg-[#1C1F28] text-neutral-900 dark:text-white shadow-md'
      } ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
      title="Click or hold file here to return"
    >
      <div className="pointer-events-none flex items-center gap-2 z-10">
        {isHovered ? (
          <div className="relative w-4 h-4 flex items-center justify-center text-[#0071E3] dark:text-[#3898FF]">
            <svg className="w-4 h-4 -rotate-90">
              <circle
                cx="8"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                opacity="0.25"
              />
              <motion.circle
                cx="8"
                cy="8"
                r="6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                fill="none"
                strokeDasharray="37.7"
                initial={{ strokeDashoffset: 37.7 }}
                animate={{ strokeDashoffset: 0 }}
                transition={{ duration: dwellMs / 1000, ease: 'linear' }}
              />
            </svg>
          </div>
        ) : (
          <ArrowLeft
            className="w-4 h-4 text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-900 dark:group-hover:text-white transition-transform duration-150"
            strokeWidth={1.8}
          />
        )}
        <span
          className={`text-xs font-semibold tracking-tight transition-colors ${
            isHovered
              ? 'text-[#0071E3] dark:text-[#3898FF]'
              : 'text-neutral-800 dark:text-white/90 group-hover:text-neutral-900 dark:group-hover:text-white'
          }`}
        >
          {label}
        </span>
      </div>
    </button>
  );
}
