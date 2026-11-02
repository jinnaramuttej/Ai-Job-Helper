import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Newsreader, Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
});

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Jaggle',
    template: '%s — Jaggle',
  },
  description: 'A calm, simple job finder for college students.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${newsreader.variable} ${geist.variable} ${geistMono.variable}`}>
      <body className="flex min-h-screen flex-col bg-canvas font-sans text-ink">
        {children}
      </body>
    </html>
  );
}
