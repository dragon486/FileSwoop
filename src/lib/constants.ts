import type { StationConfig } from '@/types';

export const HOLD_DWELL_MS = 2500; // 2.5s deliberate dwell hold time across all stations & option cards

export const STATION_CONFIGS: StationConfig[] = [
  {
    id: 'convert',
    label: 'Convert',
    description: 'Change file format',
    icon: 'ArrowLeftRight',
    color: '#4454D8',
    options: [
      { id: 'pdf', label: 'PDF', sublabel: 'Document', supportedTypes: ['image/*', 'text/plain'] },
      { id: 'jpg', label: 'JPG', sublabel: 'Photo', supportedTypes: ['image/*', 'application/pdf'] },
      { id: 'png', label: 'PNG', sublabel: 'Lossless', supportedTypes: ['image/*', 'application/pdf'] },
      { id: 'webp', label: 'WebP', sublabel: 'Modern Web', supportedTypes: ['image/*', 'application/pdf'] },
      { id: 'gif', label: 'GIF', sublabel: 'Graphic', supportedTypes: ['image/*'] },
      { id: 'txt', label: 'TXT', sublabel: 'Text Extract', supportedTypes: ['application/pdf'] },
    ],
  },
  {
    id: 'compress',
    label: 'Compress',
    description: 'Reduce file size',
    icon: 'Minimize2',
    color: '#7C3AED',
    options: [
      { id: 'under500kb', label: '< 500 KB', sublabel: 'Maximum compression' },
      { id: 'under1mb', label: '< 1 MB', sublabel: 'High compression' },
      { id: 'under2mb', label: '< 2 MB', sublabel: 'Balanced' },
      { id: 'under5mb', label: '< 5 MB', sublabel: 'Light compression' },
      { id: 'bestquality', label: 'Best Quality', sublabel: 'Minimum loss' },
      { id: 'custom', label: 'Custom', sublabel: 'Set target size' },
    ],
  },
  {
    id: 'resize',
    label: 'Resize',
    description: 'Change dimensions',
    icon: 'Maximize2',
    color: '#059669',
    options: [
      { id: '25pct', label: '25%', sublabel: 'Quarter size' },
      { id: '50pct', label: '50%', sublabel: 'Half size' },
      { id: '75pct', label: '75%', sublabel: 'Three-quarter' },
      { id: '1080p', label: '1080px', sublabel: 'HD width' },
      { id: '1920p', label: '1920px', sublabel: 'Full HD width' },
      { id: 'custom', label: 'Custom', sublabel: 'Set dimensions' },
    ],
  },
  {
    id: 'extract',
    label: 'Extract',
    description: 'Pull content out',
    icon: 'Unplug',
    color: '#D97706',
    options: [
      { id: 'text', label: 'Text', sublabel: 'Extract content', supportedTypes: ['application/pdf'] },
      { id: 'images', label: 'Images', sublabel: 'From PDF', supportedTypes: ['application/pdf'] },
      { id: 'pages', label: 'Pages', sublabel: 'Split PDF', supportedTypes: ['application/pdf'] },
      { id: 'archive', label: 'Archive', sublabel: 'Unzip contents', supportedTypes: ['application/zip'] },
      { id: 'metadata', label: 'Metadata', sublabel: 'File info', supportedTypes: ['image/*'] },
      { id: 'base64', label: 'Base64', sublabel: 'Data URI' },
    ],
  },
  {
    id: 'enhance',
    label: 'Enhance',
    description: 'Improve quality',
    icon: 'Sparkles',
    color: '#DB2777',
    options: [
      { id: 'sharpen', label: 'Sharpen', sublabel: 'Crisp edges', supportedTypes: ['image/*'] },
      { id: 'brightness', label: 'Brighten', sublabel: '+20% bright', supportedTypes: ['image/*'] },
      { id: 'contrast', label: 'Contrast', sublabel: 'Pop colours', supportedTypes: ['image/*'] },
      { id: 'grayscale', label: 'Greyscale', sublabel: 'Remove colour', supportedTypes: ['image/*'] },
      { id: 'invert', label: 'Invert', sublabel: 'Flip colours', supportedTypes: ['image/*'] },
      { id: 'saturation', label: 'Saturate', sublabel: 'Vivid colours', supportedTypes: ['image/*'] },
    ],
  },
  {
    id: 'share',
    label: 'Share',
    description: 'Export and share',
    icon: 'Share2',
    color: '#0891B2',
    options: [
      { id: 'qr', label: 'QR Code', sublabel: 'Generate QR' },
      { id: 'zip', label: 'ZIP Archive', sublabel: 'Package file' },
      { id: 'base64', label: 'Base64 URL', sublabel: 'Data URI' },
      { id: 'native', label: 'Share', sublabel: 'Native share' },
      { id: 'copy', label: 'Copy Link', sublabel: 'Blob URL' },
      { id: 'download', label: 'Download', sublabel: 'Save file' },
    ],
  },
];

export const ACCEPTED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'application/zip',
  'application/x-zip-compressed',
];

export const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
