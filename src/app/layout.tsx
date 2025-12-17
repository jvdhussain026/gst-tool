import type {Metadata, Viewport} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { cn } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'GST File Automator | Convert GST Invoice PDF to Excel',
  description: 'Free online tool to automatically convert multiple GST invoice PDFs into a single, clean Excel file. Fast, accurate, and privacy-first. Built for Indian businesses.',
  keywords: ['GST invoice to Excel', 'PDF to GST Excel', 'GST automation tool', 'Free GST tools India', 'GST invoice converter'],
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Poppins:wght@600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn(
          "font-body antialiased h-full",
          "bg-background text-foreground"
        )}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
