import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from 'sonner';
import { LanguageProvider } from '@/lib/i18n/context';
import { Header } from '@/components/Header';
import { GlowEffect } from '@/components/GlowEffect';
import { ShapeGridBackground } from '@/components/ShapeGridBackground';

export const metadata: Metadata = {
  title: 'ScholarSync — Tribal Scholarship Management & Verification Platform',
  description: 'ScholarSync: AI-Assisted Config-Driven Scholarship Platform for Scheduled Tribe Students (Ministry of Tribal Affairs)',
  icons: {
    icon: '/ScholarSync.png',
    apple: '/ScholarSync.png',
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-transparent text-[#111827] antialiased flex flex-col font-sans selection:bg-[#FEE2E2] selection:text-[#D62828] relative">
        <LanguageProvider>
          <ShapeGridBackground />
          <GlowEffect />
          <Header />
          <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 relative z-0">
            {children}
          </main>
          <Toaster position="top-right" richColors />
        </LanguageProvider>
      </body>
    </html>
  );
}
