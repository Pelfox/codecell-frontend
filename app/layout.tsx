import type { PropsWithChildren } from 'react';
import { ThemeProvider } from 'next-themes';
import { Geist_Mono, Inter } from 'next/font/google';
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
