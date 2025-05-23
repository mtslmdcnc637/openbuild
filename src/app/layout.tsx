import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google'; // Corrected font import names
import './globals.css';
import { Toaster } from '@/components/ui/toaster'; // Ensure Toaster is imported

const geistSans = Geist({ // Corrected instantiation
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ // Corrected instantiation
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Code Canvas',
  description: 'Create HTML pages with drag-and-drop, by Firebase Studio.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
