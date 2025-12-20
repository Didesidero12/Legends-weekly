import type { Metadata } from 'next';
import { Inter } from 'next/font/google';  // Regular import — this is a function
import './globals.css';

import { FirebaseClientProvider } from '@/firebase/client-provider';  // Value import
import { Toaster } from "@/components/ui/toaster";                     // Value import
import { cn } from '@/lib/utils';                                        // Value import

const fontSans = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Ultimate Fantasy League',
  description: 'The ultimate fantasy football experience.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen font-sans antialiased', fontSans.variable)}>
        <FirebaseClientProvider>
          {children}
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}