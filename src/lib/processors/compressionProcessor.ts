/**
 * Compression processor using browser-image-compression for images.
 * Lazy-loads the library on demand.
 */

import { generateId, blobToDataUrl } from '@/lib/fileUtils';
import type { ProcessedFile } from '@/types';

const TARGET_SIZES: Record<string, number> = {
  under500kb: 500 * 1024,
  under1mb: 1 * 1024 * 1024,
  under2mb: 2 * 1024 * 1024,
  under5mb: 5 * 1024 * 1024,
  bestquality: Infinity,
  custom: 1 * 1024 * 1024,
};

async function compressViaCanvas(
  source: ProcessedFile,
  qualityRatio: number,
  maxDimension = 4096,
  onProgress?: (p: number) => void
): Promise<Blob> {
  onProgress?.(30);
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(source.blob);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      onProgress?.(55);
      let w = img.naturalWidth || 800;
      let h = img.naturalHeight || 600;

      if (w > maxDimension || h > maxDimension) {
        if (w >= h) {
          h = Math.max(1, Math.round((h * maxDimension) / w));
          w = maxDimension;
        } else {
          w = Math.max(1, Math.round((w * maxDimension) / h));
          h = maxDimension;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(source.blob);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      const targetMime =
        source.type === 'image/jpeg' || source.type === 'image/webp'
          ? source.type
          : 'image/jpeg'; // JPEG/WebP provide true lossy compression; PNG does not compress via quality parameter

      if (targetMime === 'image/jpeg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, w, h);
      }

      ctx.drawImage(img, 0, 0, w, h);
      onProgress?.(75);

      canvas.toBlob(
        (blob) => {
          if (blob && (blob.size < source.blob.size || qualityRatio < 0.95)) {
            resolve(blob);
          } else {
            resolve(blob || source.blob);
          }
        },
        targetMime,
        Math.max(0.1, Math.min(0.98, qualityRatio))
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(source.blob);
    };
    img.src = objectUrl;
  });
}

export async function compressImage(
  source: ProcessedFile,
  optionId: string,
  customQuality?: number,
  onProgress?: (p: number) => void
): Promise<ProcessedFile> {
  onProgress?.(5);

  let compressedBlob: Blob | null = null;
  const targetSizeBytes = TARGET_SIZES[optionId] ?? 2 * 1024 * 1024;

  // 1. Try browser-image-compression first if not a manual custom slider
  if (optionId !== 'custom') {
    try {
      const imageCompression = (await import('browser-image-compression')).default;
      onProgress?.(15);

      const options = {
        maxSizeMB: targetSizeBytes === Infinity ? 50 : Math.max(0.2, targetSizeBytes / (1024 * 1024)),
        maxWidthOrHeight: optionId === 'bestquality' ? undefined : 3840,
        useWebWorker: true,
        // Do NOT force fileType — let the library pick the best encoding for the input
        initialQuality: optionId === 'bestquality' ? 0.95 : undefined,
        onProgress: (p: number) => onProgress?.(15 + Math.round(p * 0.7)),
      };

      const file = new File([source.blob], source.name, { type: source.type });
      const compressed = await imageCompression(file, options);
      // Use the blob type that the library actually chose, not source.type
      compressedBlob = new Blob([compressed], { type: compressed.type || source.type });
    } catch {
      // Fall through to native canvas compressor on any worker or library issue
      compressedBlob = null;
    }
  }

  // 2. High-fidelity native Canvas fallback (or primary for custom quality)
  if (!compressedBlob) {
    let q = 0.8;
    let maxDim = 4096;

    if (optionId === 'custom' && customQuality) {
      q = customQuality / 100;
    } else if (optionId === 'under500kb') {
      q = 0.65;
      maxDim = 1920;
    } else if (optionId === 'under1mb') {
      q = 0.75;
      maxDim = 2560;
    } else if (optionId === 'under2mb') {
      q = 0.82;
      maxDim = 3840;
    } else if (optionId === 'under5mb') {
      q = 0.90;
    } else if (optionId === 'bestquality') {
      q = 0.96;
    }

    compressedBlob = await compressViaCanvas(source, q, maxDim, onProgress);
  }

  onProgress?.(90);

  const finalBlob = compressedBlob || source.blob;
  const finalType = finalBlob.type || source.type;
  const url = URL.createObjectURL(finalBlob);
  const thumbnail = await blobToDataUrl(finalBlob);
  onProgress?.(100);

  const labels: Record<string, string> = {
    under500kb: '< 500 KB',
    under1mb: '< 1 MB',
    under2mb: '< 2 MB',
    under5mb: '< 5 MB',
    bestquality: 'Best Quality',
    custom: customQuality ? `${customQuality}% Quality` : 'Custom',
  };

  // Update filename extension if the output type changed (e.g. PNG → JPEG for compression)
  let finalName = source.name;
  if (finalType !== source.type) {
    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
    };
    const newExt = extMap[finalType];
    if (newExt) {
      finalName = source.name.replace(/\.[^.]+$/, '') + '.' + newExt;
    }
  }

  return {
    id: generateId(),
    name: finalName,
    type: finalType,
    size: finalBlob.size,
    blob: finalBlob,
    url,
    thumbnail,
    transformedBy: 'compress',
    transformOption: labels[optionId] || optionId,
    timestamp: Date.now(),
  };
}

export async function createZip(
  sources: ProcessedFile[],
  onProgress?: (p: number) => void
): Promise<ProcessedFile> {
  onProgress?.(5);
  const JSZip = (await import('jszip')).default;
  const zip = new JSZip();
  onProgress?.(15);

  for (let i = 0; i < sources.length; i++) {
    zip.file(sources[i].name, sources[i].blob);
    onProgress?.(Math.round(15 + (i / sources.length) * 60));
  }

  onProgress?.(75);
  const blob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
  const url = URL.createObjectURL(blob);
  onProgress?.(100);

  return {
    id: generateId(),
    name: sources.length === 1 ? `${sources[0].name}.zip` : 'files.zip',
    type: 'application/zip',
    size: blob.size,
    blob,
    url,
    transformedBy: 'share',
    transformOption: 'ZIP',
    timestamp: Date.now(),
  };
}

export async function unpackZipArchive(
  source: ProcessedFile,
  onProgress?: (p: number) => void
): Promise<ProcessedFile> {
  onProgress?.(10);
  const JSZip = (await import('jszip')).default;
  const zip = await JSZip.loadAsync(source.blob);
  onProgress?.(40);

  const entries = Object.keys(zip.files)
    .filter((path) => !zip.files[path].dir)
    .map((path) => zip.files[path]);

  if (entries.length === 0) {
    throw new Error('ZIP archive contains no files.');
  }

  onProgress?.(60);

  // If there is exactly one file in the zip, extract it directly
  if (entries.length === 1) {
    const entry = entries[0];
    const blob = await entry.async('blob');
    const ext = entry.name.split('.').pop()?.toLowerCase() || '';
    const { getMimeType } = await import('@/lib/fileUtils');
    const mime = getMimeType(ext);
    const typedBlob = new Blob([blob], { type: mime });
    const url = URL.createObjectURL(typedBlob);
    let thumbnail: string | undefined;
    if (mime.startsWith('image/') && mime !== 'image/svg+xml') {
      try {
        thumbnail = await blobToDataUrl(typedBlob);
      } catch {}
    }
    onProgress?.(100);

    const baseName = entry.name.split('/').pop() || entry.name;
    return {
      id: generateId(),
      name: baseName,
      type: mime,
      size: typedBlob.size,
      blob: typedBlob,
      url,
      thumbnail,
      transformedBy: 'extract',
      transformOption: 'Unpacked',
      timestamp: Date.now(),
    };
  }

  // If there are multiple files, generate extraction manifest
  const { formatBytes } = await import('@/lib/fileUtils');
  let manifest = `Archive Extraction Manifest: ${source.name}\n`;
  manifest += `Total Files: ${entries.length}\n`;
  manifest += `Generated: ${new Date().toISOString()}\n\n`;
  manifest += `Files Enclosed:\n`;
  manifest += `--------------------------------------------------\n`;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const uncompressedSize = (entry as any)._data?.uncompressedSize;
    const sizeStr = typeof uncompressedSize === 'number' ? formatBytes(uncompressedSize) : 'unknown size';
    manifest += `${i + 1}. ${entry.name} (${sizeStr})\n`;
  }

  onProgress?.(85);
  const manifestBlob = new Blob([manifest], { type: 'text/plain' });
  const url = URL.createObjectURL(manifestBlob);
  onProgress?.(100);

  return {
    id: generateId(),
    name: `${source.name.replace(/\.zip$/i, '')}-extracted-manifest.txt`,
    type: 'text/plain',
    size: manifestBlob.size,
    blob: manifestBlob,
    url,
    transformedBy: 'extract',
    transformOption: 'Unpacked',
    timestamp: Date.now(),
  };
}
