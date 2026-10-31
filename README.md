# FileSwoop — Files, in motion.

A high-performance, private file transformation platform built with Next.js, Framer Motion, and Tailwind CSS. All file operations execute 100% locally and privately within the client browser.

![FileSwoop Preview](/public/images/logo_light.png)

## Highlights

- **100% Client-Side Privacy**: Files never leave your device. All conversions, compressions, extractions, and edits run entirely via Web APIs and WebAssembly.
- **Dynamic Physics & Hold Interactions**: Apple-inspired fluid interactions with deliberate thinking time and haptic visual feedback.
- **Universal Transformation Stations**:
  - **Convert**: Convert between JPG, PNG, WebP, PDF, GIF, and TXT.
  - **Compress**: Size optimization targets (`< 500 KB`, `< 1 MB`, `< 2 MB`, `< 5 MB`, `Best Quality`) plus granular slider adjustments.
  - **Resize**: Smart aspect-ratio preservation with social presets, display standards, and custom pixel dimensions.
  - **Extract**: Unpack multi-file ZIP archives and extract clean document text or image frames.
  - **Enhance**: Apply client-side image filter enhancements (contrast, sharpen, saturate, grayscale).
  - **Share & Finish**: Direct single-file or zip bundle downloads with instant size-savings analytics.

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, pnpm, or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test Suite

Run the comprehensive engineering validation test suite:

```bash
npm test
```

### Production Build

```bash
npm run build
npm start
```

## Built With

- [Next.js](https://nextjs.org/) (App Router, Turbopack)
- [React 19](https://react.dev/)
- [Framer Motion](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
- [pdf-lib](https://pdf-lib.js.org/) & [pdfjs-dist](https://mozilla.github.io/pdf.js/)
- [browser-image-compression](https://github.com/Donaldcwl/browser-image-compression)
- [JSZip](https://stuk.github.io/jszip/)
- [Lucide React](https://lucide.dev/)

## License

MIT
