import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PwaRegister } from '@/components/PwaRegister';

export const metadata: Metadata = {
  title: '🖕 Ur Neighbor (F.U.N.) - 4-Player Card Game',
  description: 'Real-time 4-player trick-taking mobile card game with custom rules and Solitaire race final round',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'F.U.N.',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0f172a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark bg-slate-950 text-slate-100 select-none">
      <body suppressHydrationWarning className="min-h-screen bg-slate-950 antialiased overflow-y-auto">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}

