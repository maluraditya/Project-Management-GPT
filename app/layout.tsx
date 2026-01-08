import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Project Ops System',
  description: 'AI-Powered Project Management',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={cn(inter.className, "bg-slate-50 min-h-screen flex")}>
        <Sidebar />
        <main className="flex-1 h-screen overflow-y-auto">
          {children}
        </main>
      </body>
    </html>
  );
}
