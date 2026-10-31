export type StationId = 'convert' | 'compress' | 'resize' | 'extract' | 'enhance' | 'share';

export type FileState = 'idle' | 'dragging' | 'processing' | 'ready' | 'error';

export interface ProcessedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  blob: Blob;
  url: string;
  thumbnail?: string;
  transformedBy?: StationId;
  transformOption?: string;
  timestamp: number;
}

export interface RadialOption {
  id: string;
  label: string;
  sublabel?: string;
  icon?: string;
  angle: number;
}

export interface StationConfig {
  id: StationId;
  label: string;
  description: string;
  icon: string;
  options: RadialOptionConfig[];
  color: string;
}

export interface RadialOptionConfig {
  id: string;
  label: string;
  sublabel?: string;
  supportedTypes?: string[];
}

export interface TransformationResult {
  file: ProcessedFile;
  success: boolean;
  error?: string;
}

export interface CompressionEstimate {
  originalSize: number;
  estimatedSize: number;
  reduction: number;
  quality: string;
}

export interface DragState {
  isDragging: boolean;
  x: number;
  y: number;
  overStation: StationId | null;
}
