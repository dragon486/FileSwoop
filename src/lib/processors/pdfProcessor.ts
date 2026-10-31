/**
 * PDF processor — uses pdf-lib for manipulation.
 * Lazy-loaded on demand.
 */

import { generateId, changeExtension } from '@/lib/fileUtils';
import type { ProcessedFile } from '@/types';

export async function extractPdfText(
  source: ProcessedFile,
  onProgress?: (p: number) => void
): Promise<ProcessedFile> {
  onProgress?.(5);

  // Dynamically import pdfjs-dist only when needed
  const pdfjsLib = await import('pdfjs-dist');
  // Use the worker from the CDN to avoid bundling issues
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  onProgress?.(15);

  const arrayBuffer = await source.blob.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  onProgress?.(25);

  let fullText = '';
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const textContent = await page.getTextContent();
    const pageText = textContent.items
      .map((item) => ('str' in item ? (item as { str: string }).str : ''))
      .join(' ');
    fullText += `--- Page ${pageNum} ---\n${pageText}\n\n`;
    onProgress?.(Math.round(25 + (pageNum / pdf.numPages) * 60));
  }

  onProgress?.(90);
  const blob = new Blob([fullText], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  onProgress?.(100);

  return {
    id: generateId(),
    name: changeExtension(source.name, 'txt'),
    type: 'text/plain',
    size: blob.size,
    blob,
    url,
    transformedBy: 'extract',
    transformOption: 'Text',
    timestamp: Date.now(),
  };
}

export async function mergePdfs(
  sources: ProcessedFile[],
  onProgress?: (p: number) => void
): Promise<ProcessedFile> {
  onProgress?.(5);
  const { PDFDocument } = await import('pdf-lib');

  const mergedPdf = await PDFDocument.create();
  onProgress?.(10);

  for (let i = 0; i < sources.length; i++) {
    const source = sources[i];
    const bytes = await source.blob.arrayBuffer();
    const pdf = await PDFDocument.load(bytes);
    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((page) => mergedPdf.addPage(page));
    onProgress?.(Math.round(10 + (i / sources.length) * 80));
  }

  onProgress?.(90);
  const pdfBytes = await mergedPdf.save();
  const blob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  onProgress?.(100);

  return {
    id: generateId(),
    name: 'merged.pdf',
    type: 'application/pdf',
    size: blob.size,
    blob,
    url,
    transformedBy: 'extract',
    transformOption: 'Merged',
    timestamp: Date.now(),
  };
}

export async function splitPdfPages(
  source: ProcessedFile,
  onProgress?: (p: number) => void
): Promise<ProcessedFile> {
  onProgress?.(5);
  const { PDFDocument } = await import('pdf-lib');
  const JSZip = (await import('jszip')).default;

  const bytes = await source.blob.arrayBuffer();
  const pdf = await PDFDocument.load(bytes);
  const totalPages = pdf.getPageCount();
  onProgress?.(15);

  const zip = new JSZip();

  for (let i = 0; i < totalPages; i++) {
    const singlePage = await PDFDocument.create();
    const [page] = await singlePage.copyPages(pdf, [i]);
    singlePage.addPage(page);
    const pageBytes = await singlePage.save();
    zip.file(`page-${i + 1}.pdf`, new Uint8Array(pageBytes));
    onProgress?.(Math.round(15 + (i / totalPages) * 70));
  }

  onProgress?.(85);
  const zipBlob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(zipBlob);
  onProgress?.(100);

  return {
    id: generateId(),
    name: `${source.name.replace('.pdf', '')}-pages.zip`,
    type: 'application/zip',
    size: zipBlob.size,
    blob: zipBlob,
    url,
    transformedBy: 'extract',
    transformOption: 'Pages',
    timestamp: Date.now(),
  };
}

export async function extractMetadata(source: ProcessedFile, onProgress?: (p: number) => void): Promise<ProcessedFile> {
  onProgress?.(50);
  const meta = {
    name: source.name,
    type: source.type,
    size: source.size,
    id: source.id,
    transformedBy: source.transformedBy || 'none',
    transformOption: source.transformOption || 'none',
    timestamp: new Date(source.timestamp).toISOString(),
  };
  const text = JSON.stringify(meta, null, 2);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  onProgress?.(100);

  return {
    id: generateId(),
    name: `${source.name}.metadata.txt`,
    type: 'text/plain',
    size: blob.size,
    blob,
    url,
    transformedBy: 'extract',
    transformOption: 'Metadata',
    timestamp: Date.now(),
  };
}

export async function convertPdfToImage(
  source: ProcessedFile,
  targetFormat: 'jpg' | 'png' | 'webp' = 'jpg',
  onProgress?: (p: number) => void
): Promise<ProcessedFile> {
  onProgress?.(10);
  const pdfjsLib = await import('pdfjs-dist');
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
  const arrayBuffer = await source.blob.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  onProgress?.(35);

  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d')!;
  canvas.width = viewport.width;
  canvas.height = viewport.height;

  if (targetFormat === 'jpg') {
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  onProgress?.(65);
  // Render PDF page to canvas
  const renderContext = {
    canvasContext: context,
    viewport,
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (page.render as any)(renderContext).promise;
  onProgress?.(85);

  const mimeMap: Record<string, string> = {
    jpg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
  };
  const mimeType = mimeMap[targetFormat] || 'image/jpeg';
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Failed to render page to image'))), mimeType, 0.92);
  });

  const url = URL.createObjectURL(blob);
  const { blobToDataUrl } = await import('@/lib/fileUtils');
  const thumbnail = await blobToDataUrl(blob);
  onProgress?.(100);

  return {
    id: generateId(),
    name: changeExtension(source.name, targetFormat),
    type: mimeType,
    size: blob.size,
    blob,
    url,
    thumbnail,
    transformedBy: 'convert',
    transformOption: targetFormat.toUpperCase(),
    timestamp: Date.now(),
  };
}

export async function compressPdf(
  source: ProcessedFile,
  onProgress?: (p: number) => void
): Promise<ProcessedFile> {
  onProgress?.(10);
  const { PDFDocument } = await import('pdf-lib');
  const bytes = await source.blob.arrayBuffer();
  onProgress?.(40);
  const pdfDoc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  onProgress?.(70);
  const compressedBytes = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });
  onProgress?.(90);
  const blob = new Blob([new Uint8Array(compressedBytes)], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  onProgress?.(100);

  return {
    id: generateId(),
    name: source.name,
    type: 'application/pdf',
    size: blob.size,
    blob,
    url,
    transformedBy: 'compress',
    transformOption: 'Optimized',
    timestamp: Date.now(),
  };
}
