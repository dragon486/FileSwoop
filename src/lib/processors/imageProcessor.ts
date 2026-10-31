/**
 * Image processor — uses Canvas API for all image operations.
 * Runs entirely in the browser with no server uploads.
 */

import { generateId, changeExtension, blobToDataUrl } from '@/lib/fileUtils';
import type { ProcessedFile } from '@/types';

async function loadImage(blob: Blob): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(blob);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = reject;
    img.src = url;
  });
}

function createCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  return [canvas, ctx];
}

async function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality = 0.92): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to convert canvas to blob'));
      },
      mimeType,
      quality
    );
  });
}

export async function convertImage(
  source: ProcessedFile,
  targetFormat: string,
  onProgress?: (p: number) => void
): Promise<ProcessedFile> {
  onProgress?.(10);
  const img = await loadImage(source.blob);
  onProgress?.(40);

  const [canvas, ctx] = createCanvas(img.naturalWidth, img.naturalHeight);

  // Fill white background for formats that don't support transparency
  if (targetFormat === 'jpg' || targetFormat === 'jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.drawImage(img, 0, 0);
  onProgress?.(70);

  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    // Canvas API cannot produce real animated GIF — emit PNG instead and keep visual fidelity
    gif: 'image/png',
  };

  // For GIF output, we switch to PNG since browsers can't encode GIF via canvas
  const actualFormat = targetFormat === 'gif' ? 'png' : targetFormat;
  const targetMime = mimeMap[targetFormat] || 'image/jpeg';
  const quality = targetFormat === 'jpg' || targetFormat === 'jpeg' ? 0.92 : undefined;
  const blob = await canvasToBlob(canvas, targetMime, quality);
  onProgress?.(90);

  const newName = changeExtension(source.name, actualFormat);
  const url = URL.createObjectURL(blob);
  const thumbnail = await blobToDataUrl(blob);
  onProgress?.(100);

  return {
    id: generateId(),
    name: newName,
    type: targetMime,
    size: blob.size,
    blob,
    url,
    thumbnail,
    transformedBy: 'convert',
    transformOption: targetFormat.toUpperCase(),
    timestamp: Date.now(),
  };
}

export async function resizeImage(
  source: ProcessedFile,
  optionId: string,
  customWidth?: number,
  customHeight?: number,
  onProgress?: (p: number) => void
): Promise<ProcessedFile> {
  onProgress?.(10);
  const img = await loadImage(source.blob);
  const origW = img.naturalWidth || 800;
  const origH = img.naturalHeight || 600;
  onProgress?.(30);

  let targetW: number;
  let targetH: number;

  if (optionId === 'custom' && customWidth && customHeight && customWidth > 0 && customHeight > 0) {
    targetW = Math.max(1, Math.min(8192, Math.round(customWidth)));
    targetH = Math.max(1, Math.min(8192, Math.round(customHeight)));
  } else {
    const scale = (s: number) => ({
      w: Math.max(1, Math.round(origW * s)),
      h: Math.max(1, Math.round(origH * s)),
    });
    const targetWH = (tw: number) => ({
      w: tw,
      h: Math.max(1, Math.round(origH * (tw / Math.max(1, origW)))),
    });
    const targetHH = (th: number) => ({
      w: Math.max(1, Math.round(origW * (th / Math.max(1, origH)))),
      h: th,
    });
    const squareCrop = () => {
      const side = Math.max(1, Math.min(origW, origH));
      return { w: side, h: side };
    };

    const dims = (
      {
        '25pct':   scale(0.25),
        '50pct':   scale(0.5),
        '75pct':   scale(0.75),
        '1080p':   targetWH(1920),  // 1080p = 1920px wide Full HD
        '1920p':   targetWH(1920),
        '720p':    targetWH(1280),  // 720p = 1280px wide HD
        'portrait': targetHH(1920), // 9:16 portrait height 1920px
        'square':  squareCrop(),    // 1:1 square (smallest dimension)
      } as Record<string, { w: number; h: number }>
    )[optionId] || scale(0.5);

    targetW = dims.w;
    targetH = dims.h;
  }

  // Ensure bounds
  targetW = Math.max(1, Math.min(8192, targetW));
  targetH = Math.max(1, Math.min(8192, targetH));

  const [canvas, ctx] = createCanvas(targetW, targetH);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // Only JPEG/PNG/WebP are reliably round-trippable via canvas; everything else → PNG
  const supportedMime =
    source.type === 'image/jpeg' || source.type === 'image/webp' || source.type === 'image/png'
      ? source.type
      : 'image/png';

  // White background for JPEG (and WebP if opaque requested) to prevent black boxes
  if (supportedMime === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, targetW, targetH);
  }

  ctx.drawImage(img, 0, 0, targetW, targetH);
  onProgress?.(70);

  const blob = await canvasToBlob(canvas, supportedMime, 0.92);
  const url = URL.createObjectURL(blob);
  const thumbnail = await blobToDataUrl(blob);
  onProgress?.(100);

  const label = optionId === 'custom' ? `${targetW}×${targetH}` : optionId;

  return {
    id: generateId(),
    name: source.name,
    type: supportedMime,
    size: blob.size,
    blob,
    url,
    thumbnail,
    transformedBy: 'resize',
    transformOption: label,
    timestamp: Date.now(),
  };
}

export async function enhanceImage(
  source: ProcessedFile,
  optionId: string,
  onProgress?: (p: number) => void
): Promise<ProcessedFile> {
  onProgress?.(10);

  // Only raster images supported by Canvas API
  const canvasSupported = [
    'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/bmp',
  ];
  if (!canvasSupported.includes(source.type)) {
    throw new Error(`Enhance does not support ${source.type}. Please use a JPEG, PNG, or WebP image.`);
  }

  const img = await loadImage(source.blob);
  onProgress?.(30);

  const [canvas, ctx] = createCanvas(img.naturalWidth || 1, img.naturalHeight || 1);
  ctx.drawImage(img, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;
  onProgress?.(50);

  switch (optionId) {
    case 'sharpen': {
      // Unsharp mask approximation via convolution
      const kernel = [0, -1, 0, -1, 5, -1, 0, -1, 0];
      applyKernel(data, canvas.width, canvas.height, kernel);
      break;
    }
    case 'brightness': {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, data[i] + 51);
        data[i + 1] = Math.min(255, data[i + 1] + 51);
        data[i + 2] = Math.min(255, data[i + 2] + 51);
      }
      break;
    }
    case 'contrast': {
      const factor = (259 * (80 + 255)) / (255 * (259 - 80));
      for (let i = 0; i < data.length; i += 4) {
        data[i] = Math.min(255, Math.max(0, factor * (data[i] - 128) + 128));
        data[i + 1] = Math.min(255, Math.max(0, factor * (data[i + 1] - 128) + 128));
        data[i + 2] = Math.min(255, Math.max(0, factor * (data[i + 2] - 128) + 128));
      }
      break;
    }
    case 'grayscale': {
      for (let i = 0; i < data.length; i += 4) {
        const avg = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = data[i + 1] = data[i + 2] = avg;
      }
      break;
    }
    case 'invert': {
      for (let i = 0; i < data.length; i += 4) {
        data[i] = 255 - data[i];
        data[i + 1] = 255 - data[i + 1];
        data[i + 2] = 255 - data[i + 2];
      }
      break;
    }
    case 'saturation': {
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        const factor = 1.8;
        data[i] = Math.min(255, gray + factor * (r - gray));
        data[i + 1] = Math.min(255, gray + factor * (g - gray));
        data[i + 2] = Math.min(255, gray + factor * (b - gray));
      }
      break;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  onProgress?.(80);

  // Canvas cannot encode GIF — output PNG for quality preservation
  const outMime =
    source.type === 'image/jpeg' || source.type === 'image/webp' || source.type === 'image/png'
      ? source.type
      : 'image/png';
  const blob = await canvasToBlob(canvas, outMime, 0.95);
  const url = URL.createObjectURL(blob);
  const thumbnail = await blobToDataUrl(blob);
  onProgress?.(100);

  const labels: Record<string, string> = {
    sharpen: 'Sharpened',
    brightness: 'Brightened',
    contrast: 'Contrast+',
    grayscale: 'Greyscale',
    invert: 'Inverted',
    saturation: 'Saturated',
  };

  return {
    id: generateId(),
    name: source.name,
    type: outMime,
    size: blob.size,
    blob,
    url,
    thumbnail,
    transformedBy: 'enhance',
    transformOption: labels[optionId] || optionId,
    timestamp: Date.now(),
  };
}

function applyKernel(
  data: Uint8ClampedArray,
  width: number,
  height: number,
  kernel: number[]
): void {
  const copy = new Uint8ClampedArray(data);
  const kSize = Math.sqrt(kernel.length);
  const half = Math.floor(kSize / 2);

  for (let y = half; y < height - half; y++) {
    for (let x = half; x < width - half; x++) {
      let r = 0, g = 0, b = 0;
      for (let ky = 0; ky < kSize; ky++) {
        for (let kx = 0; kx < kSize; kx++) {
          const px = ((y + ky - half) * width + (x + kx - half)) * 4;
          const k = kernel[ky * kSize + kx];
          r += copy[px] * k;
          g += copy[px + 1] * k;
          b += copy[px + 2] * k;
        }
      }
      const i = (y * width + x) * 4;
      data[i] = Math.min(255, Math.max(0, r));
      data[i + 1] = Math.min(255, Math.max(0, g));
      data[i + 2] = Math.min(255, Math.max(0, b));
    }
  }
}

export async function convertImageToPdf(
  sources: ProcessedFile[],
  onProgress?: (p: number) => void
): Promise<ProcessedFile> {
  onProgress?.(5);
  const { PDFDocument } = await import('pdf-lib');
  const pdfDoc = await PDFDocument.create();

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    onProgress?.(Math.round(10 + (i / sources.length) * 80));

    const bytes = await source.blob.arrayBuffer();
    let pdfImage;

    if (source.type === 'image/jpeg') {
      pdfImage = await pdfDoc.embedJpg(bytes);
    } else {
      // Convert to PNG first if needed
      const img = await loadImage(source.blob);
      const [canvas, ctx] = createCanvas(img.naturalWidth, img.naturalHeight);
      ctx.drawImage(img, 0, 0);
      const pngBlob = await canvasToBlob(canvas, 'image/png');
      const pngBytes = await pngBlob.arrayBuffer();
      pdfImage = await pdfDoc.embedPng(pngBytes);
    }

    const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
    page.drawImage(pdfImage, { x: 0, y: 0, width: pdfImage.width, height: pdfImage.height });
  }

  onProgress?.(90);
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  onProgress?.(100);

  const firstName = sources[0]?.name || 'document';
  const baseName = firstName.replace(/\.[^.]+$/, '');

  return {
    id: generateId(),
    name: `${baseName}.pdf`,
    type: 'application/pdf',
    size: blob.size,
    blob,
    url,
    transformedBy: 'convert',
    transformOption: 'PDF',
    timestamp: Date.now(),
  };
}
