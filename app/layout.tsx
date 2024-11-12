// app/layout.tsx

import '../styles/globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Sidebar from '../components/Sidebar';
import { TooltipProvider } from '@/components/ui/tooltip'; 

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Testing Site',
  description: 'Under construction',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TooltipProvider>
          <div className="flex min-h-screen bg-gray-100">
            <Sidebar />
            <main className="flex-1 p-6">{children}</main>
          </div>
        </TooltipProvider>
      </body>
    </html>
  );
}
