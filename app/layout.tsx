import type { PropsWithChildren } from 'react';
import { ThemeProvider } from 'next-themes';
import { Geist_Mono, Inter } from 'next/font/google';
import Script from 'next/script';
import { Toaster } from '@/components/ui/sonner';
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
    <html lang="ru" suppressHydrationWarning>
      <Script
        defer={true}
        src="https://analytics.pelfox.dev/script.js"
        data-website-id="7a4099a2-5e53-43f4-af64-e43bb05a0043"
      />
      <body className={`${sans.variable} ${mono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
