import type { Metadata, Viewport } from 'next';
import './globals.css';
import { PwaRegister } from '@/components/PwaRegister';

export const metadata: Metadata = {
  title: '🖕 FU*K UR NEIGHBOR (F.U.N.) - 4-Player Card Game | TehWiz Productions',
  description:
    'High-stakes, cutthroat 4-player standalone trick-taking card game and Solitaire speed race produced by TehWiz Productions (tehwiz.com). Play Single Player vs AI bots or local Pass & Play 100% offline.',
  authors: [{ name: 'TehWiz Productions', url: 'https://tehwiz.com' }],
  creator: 'TehWiz Productions',
  publisher: 'TehWiz Productions',
  applicationName: 'FU*K UR NEIGHBOR (F.U.N.)',
  keywords: [
    'F.U.N.',
    'Fuck Ur Neighbor',
    'Ur Neighbor',
    'Card Game',
    'Trick Taking',
    'Solitaire Race',
    'TehWiz Productions',
    'TehWiz',
    'Single Player Card Game',
    'Pass and Play',
    'PWA Card Game',
  ],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'F.U.N.',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://hoytnix.github.io/FUN-R3/',
    siteName: 'FU*K UR NEIGHBOR (F.U.N.) - TehWiz Productions',
    title: '🖕 FU*K UR NEIGHBOR (F.U.N.) - 4-Player Card Game',
    description:
      'High-stakes, cutthroat 4-player standalone trick-taking card game and Solitaire speed race produced by TehWiz Productions (tehwiz.com).',
  },
  twitter: {
    card: 'summary',
    title: '🖕 FU*K UR NEIGHBOR (F.U.N.) | TehWiz Productions',
    description:
      'Cutthroat 4-player standalone trick-taking card game & Solitaire race by TehWiz Productions (tehwiz.com).',
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

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://tehwiz.com/#organization',
      name: 'TehWiz Productions',
      url: 'https://tehwiz.com',
      logo: 'https://tehwiz.com/logo.png',
      sameAs: [
        'https://github.com/hoytnix',
        'https://tehwiz.com',
      ],
    },
    {
      '@type': ['WebApplication', 'VideoGame'],
      '@id': 'https://hoytnix.github.io/FUN-R3/#game',
      name: 'FU*K UR NEIGHBOR (F.U.N.)',
      alternateName: [
        'Ur Neighbor',
        'F.U.N. Card Game',
        'Fuck Ur Neighbor',
        'FUN Card Game',
      ],
      url: 'https://hoytnix.github.io/FUN-R3/',
      description:
        'High-stakes, cutthroat 4-player standalone trick-taking card game and Solitaire speed race created by TehWiz Productions. Features Single Player vs AI bots, local Pass & Play with privacy hand shields, and an automated event-sourced replay engine.',
      applicationCategory: 'GameApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript. Requires HTML5 support.',
      genre: [
        'Card Game',
        'Trick-Taking',
        'Strategy',
        'Party Game',
        'Solitaire',
      ],
      playMode: 'SinglePlayer',
      numberOfPlayers: {
        '@type': 'QuantitativeValue',
        minValue: 1,
        maxValue: 4,
      },
      publisher: {
        '@id': 'https://tehwiz.com/#organization',
      },
      author: {
        '@id': 'https://tehwiz.com/#organization',
      },
      creator: {
        '@id': 'https://tehwiz.com/#organization',
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
      gamePlatform: ['Web Browser', 'Mobile Web', 'Progressive Web App'],
      inLanguage: 'en',
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark bg-slate-950 text-slate-100 select-none">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-screen bg-slate-950 antialiased overflow-y-auto">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
