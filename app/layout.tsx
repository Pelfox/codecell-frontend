import type { PropsWithChildren } from 'react';
import { Geist_Mono, Inter } from 'next/font/google';
import { Toaster } from 'sonner';
import './globals.css';

const sans = Inter({
  variable: '--font-sans',
  subsets: ['latin', 'cyrillic'],
});

const mono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin', 'cyrillic'],
});

export default function RootLayout({ children }: Readonly<PropsWithChildren>) {
  return (
    <html lang="ru">
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
