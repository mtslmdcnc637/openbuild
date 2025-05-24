
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google'; 
import './globals.css';
import { Toaster } from '@/components/ui/toaster'; 

const geistSans = Geist({ 
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ 
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PageForge: OpenBuild',
  description: 'Construa páginas web com liberdade total usando o OpenBuild do PageForge.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="dark">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased h-screen flex flex-col`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
