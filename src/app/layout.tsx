// src/app/layout.tsx
import { Metadata, Viewport } from 'next';
import './globals.css';
import RegisterSW from '@/components/ui/pwa/RegisterSW';
import InstallPrompt from '@/components/ui/pwa/InstallPrompt';

export const metadata: Metadata = {
  title: 'Gerador CV ATS',
  description: 'Gerador de currículos otimizados para algoritmos ATS',
  manifest: '/manifest.json',
  icons: {
    icon: '/imagens/logo/favicon.ico',
    shortcut: '/imagens/logo/favicon.ico',
    apple: '/imagens/logo/icons/apple-touch-icon.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Gerador CV ATS',
  },
  openGraph: {
    title: 'Gerador CV ATS',
    description: 'Gerador de currículos focados em algoritmos ATS.',
    url: 'https://gerador-cv-ats.vercel.app',
    siteName: 'Gerador CV ATS',
    locale: 'pt_BR',
    type: 'website',
    images: [
      {
        url: '/imagens/logo/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Gerador CV ATS',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gerador CV ATS',
    description: 'Gerador de currículos focados em algoritmos ATS.',
    images: ['/imagens/logo/og-image.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="pt-BR">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=Roboto:wght@400;700&family=Montserrat:wght@400;700;800;900&family=Cormorant+Garamond:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <style>{`
          * {
            max-width: 100vw;
          }
          html, body {
            overflow-x: hidden !important;
            width: 100% !important;
            max-width: 100vw !important;
          }
        `}</style>
      </head>
      <body>
        {children}
        <RegisterSW />
        <InstallPrompt />
      </body>
    </html>
  );
}