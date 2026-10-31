import type { ProcessedFile } from '@/types';

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function getMimeType(extension: string): string {
  const map: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    pdf: 'application/pdf',
    txt: 'text/plain',
    zip: 'application/zip',
  };
  return map[extension.toLowerCase()] || 'application/octet-stream';
}

export function getExtension(mimeType: string): string {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'application/pdf': 'pdf',
    'text/plain': 'txt',
    'application/zip': 'zip',
  };
  return map[mimeType] || 'bin';
}

export function isImageType(type: string): boolean {
  return type.startsWith('image/');
}

export function isPdfType(type: string): boolean {
  return type === 'application/pdf';
}

export function isZipType(type: string): boolean {
  return type === 'application/zip' || type === 'application/x-zip-compressed';
}

export function isSupported(type: string): boolean {
  const supported = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml',
    'application/pdf', 'text/plain', 'application/zip', 'application/x-zip-compressed',
  ];
  return supported.includes(type);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export async function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function fileToProcessedFile(file: File): Promise<ProcessedFile> {
  const blob = new Blob([await file.arrayBuffer()], { type: file.type });
  const url = URL.createObjectURL(blob);
  let thumbnail: string | undefined;

  if (isImageType(file.type) && file.type !== 'image/svg+xml') {
    thumbnail = await blobToDataUrl(blob);
  }

  return {
    id: generateId(),
    name: file.name,
    type: file.type,
    size: file.size,
    blob,
    url,
    thumbnail,
    timestamp: Date.now(),
  };
}

export function changeExtension(filename: string, newExt: string): string {
  const dotIndex = filename.lastIndexOf('.');
  const base = dotIndex !== -1 ? filename.slice(0, dotIndex) : filename;
  return `${base}.${newExt}`;
}

export function estimateCompressedSize(originalSize: number, targetId: string): {
  estimatedSize: number;
  reduction: number;
  quality: string;
} {
  const targets: Record<string, { ratio: number; quality: string }> = {
    under500kb: { ratio: Math.min(1, 500 * 1024 / originalSize) * 0.9, quality: 'Maximum compression, some visible loss' },
    under1mb: { ratio: Math.min(1, 1 * 1024 * 1024 / originalSize) * 0.9, quality: 'High compression, minor quality reduction' },
    under2mb: { ratio: Math.min(1, 2 * 1024 * 1024 / originalSize) * 0.9, quality: 'Balanced compression, good quality' },
    under5mb: { ratio: Math.min(1, 5 * 1024 * 1024 / originalSize) * 0.9, quality: 'Light compression, near original quality' },
    bestquality: { ratio: 0.7, quality: 'Minimum loss, highest quality retained' },
    custom: { ratio: 0.5, quality: 'Configurable quality level' },
  };
  const config = targets[targetId] || { ratio: 0.5, quality: 'Unknown' };
  const estimatedSize = Math.round(originalSize * config.ratio);
  const reduction = Math.round((1 - config.ratio) * 100);
  return { estimatedSize, reduction, quality: config.quality };
}

export function estimateResizeDimensions(
  width: number,
  height: number,
  optionId: string
): { w: number; h: number } {
  const safeW = width > 0 ? width : 800;
  const safeH = height > 0 ? height : 600;
  const scale = (s: number) => ({ w: Math.max(1, Math.round(safeW * s)), h: Math.max(1, Math.round(safeH * s)) });
  const targetW = (tw: number) => {
    const ratio = tw / safeW;
    return { w: tw, h: Math.max(1, Math.round(safeH * ratio)) };
  };
  switch (optionId) {
    case '25pct': return scale(0.25);
    case '50pct': return scale(0.5);
    case '75pct': return scale(0.75);
    case '1080p': return targetW(1080);
    case '1920p': return targetW(1920);
    default: return { w: safeW, h: safeH };
  }
}
