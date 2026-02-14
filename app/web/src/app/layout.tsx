import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Link from 'next/link';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Hive — ATProto Bot Registry',
  description: 'The registry for verified ATProto bots. Discover, register, and verify bots on the AT Protocol.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="min-h-screen flex flex-col">
          <header className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
              <Link
                href="/"
                className="text-xl font-bold text-honey-400 hover:text-honey-300 transition-colors"
              >
                Hive
              </Link>
              <div className="flex items-center gap-6">
                <Link
                  href="/bots"
                  className="text-sm text-gray-300 hover:text-honey-400 transition-colors"
                >
                  Bots
                </Link>
                <Link
                  href="/register"
                  className="text-sm text-gray-300 hover:text-honey-400 transition-colors"
                >
                  Register
                </Link>
                <Link
                  href="/docs"
                  className="text-sm text-gray-300 hover:text-honey-400 transition-colors"
                >
                  Docs
                </Link>
              </div>
            </nav>
          </header>

          <main className="flex-1">{children}</main>

          <footer className="border-t border-gray-800 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
              Hive &mdash; ATProto Bot Registry
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
