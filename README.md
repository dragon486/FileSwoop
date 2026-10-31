<p align="center">
  <img src="./public/images/logo.png" alt="FileSwoop Logo" width="560" />
</p>

# FileSwoop

FileSwoop is a client-side file transformation platform designed for converting, compressing, resizing, extracting, and enhancing files directly within the browser. All processing is executed locally using modern Web APIs and WebAssembly, ensuring that sensitive documents and media never leave the user's device.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fdragon486%2FFileSwoop)

---

## Features

- **Format Conversion**: Convert between standard formats including JPG, PNG, WebP, PDF, GIF, and plain-text (TXT).
- **Intelligent Compression**: Reduce file sizes with targeted thresholds (`< 500 KB`, `< 1 MB`, `< 2 MB`, `< 5 MB`, `Best Quality`) or specify exact quality parameters.
- **Image Resizing**: Scale dimensions using standard display presets or custom pixel dimensions with aspect-ratio preservation.
- **Archive Extraction**: Unpack ZIP archives and extract document pages, images, and text streams.
- **Image Enhancement**: Apply client-side filters including contrast optimization, sharpening, grayscale conversion, and saturation balancing.
- **Flexible Export**: Single-file downloads, ZIP archive packaging, and immediate file size savings metrics.
- **Local & Private**: Zero server uploads. Transformations occur in-memory within the client browser session.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **UI & Animation**: [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Processing Engines**:
  - `pdf-lib` & `pdfjs-dist`: Client-side PDF generation, rendering, and page extraction
  - `browser-image-compression`: Multi-threaded Canvas and Web Worker compression
  - `jszip`: In-browser archive extraction and compression
  - `lucide-react`: UI iconography

---

## Getting Started

### Prerequisites

- Node.js 18.17 or higher
- npm, pnpm, or yarn

### Installation

```bash
git clone https://github.com/dragon486/FileSwoop.git
cd FileSwoop
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Running Tests

Execute the automated test suite verifying format handlers, resizing calculations, and compression math:

```bash
npm test
```

### Production Build

```bash
npm run build
npm run start
```

---

## Deployment

### Deploy to Vercel

The application is optimized for deployment on Vercel:

1. Import the repository `dragon486/FileSwoop` into your [Vercel Dashboard](https://vercel.com/new).
2. Framework Preset will be automatically detected as **Next.js**.
3. Click **Deploy**.

Alternatively, deploy via the Vercel CLI:

```bash
npx vercel --prod
```

---

## License

This project is licensed under the MIT License.
