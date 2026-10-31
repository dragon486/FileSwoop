import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({
  variable: '--font-geist',
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://fileswoop.app'),
  title: 'FileSwoop — Files, in motion.',
  description:
    'A beautiful drag-and-drop file transformation tool. Convert, compress, resize, extract, enhance and share files — all locally in your browser.',
  keywords: ['file converter', 'file compression', 'image resize', 'PDF tools', 'browser file tool', 'FileSwoop'],
  icons: {
    icon: '/favicon.ico',
    apple: '/images/icon_192.png',
  },
  openGraph: {
    title: 'FileSwoop',
    description: 'Files, in motion.',
    type: 'website',
    images: ['/images/logo_light.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col antialiased">{children}</body>
    </html>
  );
}
