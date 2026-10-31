'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check } from 'lucide-react';
import { HOLD_DWELL_MS } from '@/lib/constants';

interface HoldTargetProps {
  id: string;
  dwellMs?: number; // Slower deliberate dwell hold time (default 2500ms)
  holdLabel?: string; // e.g. "Opening...", "Converting..."
  onTrigger: (file?: File) => void;
  onHoverSnap?: (pos: { x: number; y: number } | null) => void;
  disabled?: boolean;
  className?: string;
  activeClassName?: string;
  children: React.ReactNode;
}

export function HoldTarget({
  id,
  dwellMs = HOLD_DWELL_MS,
  holdLabel = 'Opening...',
  onTrigger,
  onHoverSnap,
  disabled = false,
  className = '',
  activeClassName = '',
  children,
}: HoldTargetProps) {
  const [isActive, setIsActive] = useState(false);
  const [isCharged, setIsCharged] = useState(false);
  const dwellTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const targetRef = useRef<HTMLDivElement>(null);
  const triggeredRef = useRef<boolean>(false);
  const isHoveredRef = useRef<boolean>(false);
  const isHoldingPointerRef = useRef<boolean>(false);
  const dragCounterRef = useRef<number>(0);
  const capturedDragFileRef = useRef<File | undefined>(undefined);
  const activePointerIdRef = useRef<number | null>(null);

  const clearDwell = useCallback(() => {
    if (dwellTimerRef.current) {
      clearTimeout(dwellTimerRef.current);
      dwellTimerRef.current = null;
    }
    dragCounterRef.current = 0;
    isHoveredRef.current = false;
    isHoldingPointerRef.current = false;
    capturedDragFileRef.current = undefined;
    activePointerIdRef.current = null;
    setIsActive(false);
    setIsCharged(false);
    triggeredRef.current = false;
    onHoverSnap?.(null);
  }, [onHoverSnap]);

  useEffect(() => {
    return () => {
      if (dwellTimerRef.current) clearTimeout(dwellTimerRef.current);
    };
  }, []);

  const triggerAction = useCallback(
    (file?: File) => {
      if (dwellTimerRef.current) {
        clearTimeout(dwellTimerRef.current);
        dwellTimerRef.current = null;
      }
      triggeredRef.current = true;
      dragCounterRef.current = 0;
      isHoldingPointerRef.current = false;
      activePointerIdRef.current = null;
      setIsCharged(true);

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate?.(35);
        } catch {}
      }

      onTrigger(file);

      // Keep visual state stable for 250ms so dragover doesn't immediately re-arm during active drag
      setTimeout(() => {
        setIsActive(false);
        setIsCharged(false);
        isHoveredRef.current = false;
      }, 250);
    },
    [onTrigger]
  );

  const startDwellTimer = useCallback(() => {
    if (dwellTimerRef.current || disabled || triggeredRef.current) return;

    dwellTimerRef.current = setTimeout(() => {
      setIsCharged(true);
      // Automatically trigger conversion when hold reaches 100%
      triggerAction(capturedDragFileRef.current);
    }, dwellMs);
  }, [disabled, dwellMs, triggerAction]);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled || triggeredRef.current) return;
    dragCounterRef.current++;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      capturedDragFileRef.current = e.dataTransfer.files[0];
    }

    if (!isHoveredRef.current) {
      isHoveredRef.current = true;
      setIsActive(true);
      if (targetRef.current && onHoverSnap) {
        const rect = targetRef.current.getBoundingClientRect();
        onHoverSnap({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
      }
      startDwellTimer();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (disabled || triggeredRef.current) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      capturedDragFileRef.current = e.dataTransfer.files[0];
    }

    if (!isHoveredRef.current) {
      isHoveredRef.current = true;
      setIsActive(true);
      startDwellTimer();
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    if (triggeredRef.current) return;
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      clearDwell();
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current = 0;
    if (disabled) return;

    if (triggeredRef.current) {
      clearDwell();
      return;
    }

    const file = e.dataTransfer.files?.[0] || capturedDragFileRef.current;
    triggerAction(file);
  };

  // Pointer hold support: click-and-hold as well as drag-and-hold
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;
    triggeredRef.current = false;
    isHoveredRef.current = true;
    isHoldingPointerRef.current = true;
    activePointerIdRef.current = e.pointerId;

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}

    setIsActive(true);
    startDwellTimer();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (disabled || e.button !== 0) return;

    try {
      if (activePointerIdRef.current !== null && e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {}

    activePointerIdRef.current = null;
    isHoldingPointerRef.current = false;

    if (!triggeredRef.current) {
      // Released: if dwell was in progress, execute click conversion immediately
      triggerAction();
    } else {
      clearDwell();
    }
  };

  const handlePointerCancel = () => {
    clearDwell();
  };

  return (
    <div
      ref={targetRef}
      data-target-id={id}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      className={`relative select-none transition-all duration-200 ease-out cursor-pointer overflow-hidden ${className} ${
        isActive
          ? activeClassName ||
            'scale-[1.03] -translate-y-1 border-[#0071E3] bg-white dark:bg-[#182030] ring-4 ring-[#0071E3]/40 shadow-[0_20px_45px_rgba(0,113,227,0.38)]'
          : ''
      } ${disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
    >
      {/* Visual circular loading ring indicator during hold — strictly NO horizontal loading bar */}
      <AnimatePresence>
        {isActive && (
          <div className="pointer-events-none absolute inset-0 z-30 overflow-hidden">
            {/* Ambient subtle backdrop tint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-[#0071E3]/8 dark:bg-[#0071E3]/20"
            />

            {/* Top-right prominent circular loading ring badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.15 }}
              className={`absolute top-3 right-3 flex items-center gap-2 px-3 py-1.5 rounded-full text-white text-[11px] font-semibold tracking-tight shadow-[0_4px_16px_rgba(0,113,227,0.5)] border border-white/30 backdrop-blur-md transition-colors ${
                isCharged ? 'bg-[#34C759]' : 'bg-[#0071E3]'
              }`}
            >
              {/* Circular SVG countdown loading ring */}
              <div className="relative w-4 h-4 flex items-center justify-center">
                {isCharged ? (
                  <Check className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
                ) : (
                  <svg className="w-4 h-4 -rotate-90">
                    <circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="rgba(255, 255, 255, 0.25)"
                      strokeWidth="2.5"
                      fill="none"
                    />
                    <motion.circle
                      cx="8"
                      cy="8"
                      r="6"
                      stroke="#ffffff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                      strokeDasharray="37.7"
                      initial={{ strokeDashoffset: 37.7 }}
                      animate={{ strokeDashoffset: 0 }}
                      transition={{ duration: dwellMs / 1000, ease: 'linear' }}
                    />
                  </svg>
                )}
              </div>
              <span>{holdLabel}</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inner wrapper with pointer-events-none to prevent child hover from interrupting drag/pointer events */}
      <div className="pointer-events-none w-full h-full flex flex-col justify-between">
        {children}
      </div>
    </div>
  );
}
