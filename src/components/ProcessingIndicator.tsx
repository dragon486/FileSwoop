'use client';

import { motion } from 'framer-motion';

interface ProcessingIndicatorProps {
  progress: number;
  color: string;
  label?: string;
}

export function ProcessingIndicator({ progress, color, label }: ProcessingIndicatorProps) {
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDash = (progress / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative w-12 h-12">
        <svg
          className="w-12 h-12 -rotate-90"
          viewBox="0 0 48 48"
        >
          {/* Track */}
          <circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke={`${color}20`}
            strokeWidth="3"
          />
          {/* Progress */}
          <motion.circle
            cx="24"
            cy="24"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animate={{ strokeDashoffset: circumference - strokeDash }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center text-[10px] font-bold"
          style={{ color }}
        >
          {Math.round(progress)}%
        </div>
      </div>
      {label && (
        <span className="text-[10px] font-medium text-[#85899A]">{label}</span>
      )}
    </div>
  );
}
