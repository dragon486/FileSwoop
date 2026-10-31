'use client';

import { useCallback } from 'react';
import type { ProcessedFile, StationId } from '@/types';
import { isImageType, isPdfType, isZipType } from '@/lib/fileUtils';

interface UseTransformProps {
  currentFile: ProcessedFile | null;
  startProcessing: (station: StationId) => void;
  updateProgress: (p: number) => void;
  setCurrentFile: (file: ProcessedFile) => void;
  setError: (err: string) => void;
  setSuccess: (msg: string) => void;
}

export function useTransform({
  currentFile,
  startProcessing,
  updateProgress,
  setCurrentFile,
  setError,
  setSuccess,
}: UseTransformProps) {
  const transform = useCallback(async (
    stationId: StationId,
    optionId: string,
    extraParams?: { customWidth?: number; customHeight?: number; customQuality?: number },
    overrideFile?: ProcessedFile
  ) => {
    const file = overrideFile || currentFile;
    if (!file) return;

    startProcessing(stationId);

    try {
      let result: ProcessedFile | null = null;

      switch (stationId) {
        case 'convert': {
          if (!isImageType(file.type) && !isPdfType(file.type)) {
            throw new Error('Convert supports images and PDFs. Please select or drop an image or PDF file.');
          }

          if (isPdfType(file.type)) {
            if (optionId === 'jpg' || optionId === 'png' || optionId === 'webp') {
              const { convertPdfToImage } = await import('@/lib/processors/pdfProcessor');
              result = await convertPdfToImage(file, optionId as 'jpg' | 'png' | 'webp', updateProgress);
            } else if (optionId === 'txt') {
              const { extractPdfText } = await import('@/lib/processors/pdfProcessor');
              result = await extractPdfText(file, updateProgress);
            } else {
              throw new Error(`Cannot convert PDF to ${optionId.toUpperCase()}.`);
            }
          } else if (isImageType(file.type)) {
            if (optionId === 'pdf') {
              const { convertImageToPdf } = await import('@/lib/processors/imageProcessor');
              result = await convertImageToPdf([file], updateProgress);
            } else {
              const { convertImage } = await import('@/lib/processors/imageProcessor');
              result = await convertImage(file, optionId, updateProgress);
            }
          }
          break;
        }

        case 'compress': {
          if (isPdfType(file.type)) {
            const { compressPdf } = await import('@/lib/processors/pdfProcessor');
            result = await compressPdf(file, updateProgress);
          } else if (isImageType(file.type)) {
            const { compressImage } = await import('@/lib/processors/compressionProcessor');
            result = await compressImage(file, optionId, extraParams?.customQuality, updateProgress);
          } else {
            throw new Error('Compress currently supports images and PDF files.');
          }
          break;
        }

        case 'resize': {
          if (!isImageType(file.type)) {
            throw new Error('Resize works with image files. Convert your document to an image first to resize.');
          }
          const { resizeImage } = await import('@/lib/processors/imageProcessor');
          result = await resizeImage(
            file,
            optionId,
            extraParams?.customWidth,
            extraParams?.customHeight,
            updateProgress
          );
          break;
        }

        case 'extract': {
          if (optionId === 'text' || optionId === 'pages') {
            if (!isPdfType(file.type)) {
              throw new Error('Text and page extraction require a PDF file.');
            }
            if (optionId === 'text') {
              const { extractPdfText } = await import('@/lib/processors/pdfProcessor');
              result = await extractPdfText(file, updateProgress);
            } else {
              const { splitPdfPages } = await import('@/lib/processors/pdfProcessor');
              result = await splitPdfPages(file, updateProgress);
            }
          } else if (optionId === 'metadata') {
            const { extractMetadata } = await import('@/lib/processors/pdfProcessor');
            result = await extractMetadata(file, updateProgress);
          } else if (optionId === 'base64') {
            updateProgress(50);
            const { blobToDataUrl, generateId } = await import('@/lib/fileUtils');
            const dataUrl = await blobToDataUrl(file.blob);
            const blob = new Blob([dataUrl], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            updateProgress(100);
            result = {
              id: generateId(),
              name: `${file.name}.base64.txt`,
              type: 'text/plain',
              size: blob.size,
              blob,
              url,
              transformedBy: 'extract',
              transformOption: 'Base64',
              timestamp: Date.now(),
            };
          } else if (optionId === 'archive' && isZipType(file.type)) {
            const { unpackZipArchive } = await import('@/lib/processors/compressionProcessor');
            result = await unpackZipArchive(file, updateProgress);
          } else {
            throw new Error(`Extraction type "${optionId}" is not supported for this file.`);
          }
          break;
        }

        case 'enhance': {
          if (!isImageType(file.type)) {
            throw new Error('Enhance works with image files only. Drop an image to enhance it.');
          }
          const { enhanceImage } = await import('@/lib/processors/imageProcessor');
          result = await enhanceImage(file, optionId, updateProgress);
          break;
        }

        case 'share': {
          if (optionId === 'zip') {
            const { createZip } = await import('@/lib/processors/compressionProcessor');
            result = await createZip([file], updateProgress);
          } else if (optionId === 'base64') {
            updateProgress(30);
            const { blobToDataUrl, generateId } = await import('@/lib/fileUtils');
            const dataUrl = await blobToDataUrl(file.blob);
            const blob = new Blob([dataUrl], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            updateProgress(100);
            result = {
              id: generateId(),
              name: `${file.name}.dataurl.txt`,
              type: 'text/plain',
              size: blob.size,
              blob,
              url,
              transformedBy: 'share',
              transformOption: 'Base64 URL',
              timestamp: Date.now(),
            };
          } else if (optionId === 'qr') {
            updateProgress(20);
            const QRCode = await import('qrcode');
            const objectUrl = file.url;
            const canvas = document.createElement('canvas');
            await QRCode.toCanvas(canvas, objectUrl, { width: 512, margin: 2 });
            updateProgress(70);
            const blob = await new Promise<Blob>((resolve, reject) =>
              canvas.toBlob((b) => b ? resolve(b) : reject(new Error('QR failed')), 'image/png')
            );
            const url = URL.createObjectURL(blob);
            const { blobToDataUrl, generateId } = await import('@/lib/fileUtils');
            const thumbnail = await blobToDataUrl(blob);
            updateProgress(100);
            result = {
              id: generateId(),
              name: `${file.name}-qr.png`,
              type: 'image/png',
              size: blob.size,
              blob,
              url,
              thumbnail,
              transformedBy: 'share',
              transformOption: 'QR Code',
              timestamp: Date.now(),
            };
          } else if (optionId === 'native') {
            if (!navigator.share) {
              throw new Error('Native sharing is not supported in this browser. Try ZIP or Download instead.');
            }
            const nativeFile = new File([file.blob], file.name, { type: file.type });
            await navigator.share({ files: [nativeFile], title: file.name });
            setSuccess('File shared successfully!');
            return;
          } else if (optionId === 'copy') {
            await navigator.clipboard.writeText(file.url);
            setSuccess('Blob URL copied to clipboard!');
            return;
          } else if (optionId === 'download') {
            // Direct download
            const a = document.createElement('a');
            a.href = file.url;
            a.download = file.name;
            a.click();
            setSuccess('Download started!');
            return;
          } else {
            throw new Error(`Share option "${optionId}" is not available.`);
          }
          break;
        }

        default:
          throw new Error(`Unknown station: ${stationId}`);
      }

      if (result) {
        setCurrentFile(result);
        setSuccess(`✓ ${result.transformOption || stationId} applied`);
        return result;
      }
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Processing failed. Please try again.';
      setError(message);
      return null;
    }
  }, [currentFile, startProcessing, updateProgress, setCurrentFile, setError, setSuccess]);

  return { transform };
}
