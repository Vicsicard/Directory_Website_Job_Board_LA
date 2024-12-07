import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CacheManager from '@/components/cache/CacheManager'
import GlobalErrorBoundary from '@/components/error/GlobalErrorBoundary'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Local Business Directory',
  description: 'Find the best local services in your area',
}

// Initialize database
async function initDb() {
  try {
    const response = await fetch('/api/init-db');
    if (!response.ok) {
      throw new Error('Failed to initialize database');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Call initDb in a way that doesn't block rendering
  if (typeof window !== 'undefined') {
    initDb();
  }

  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalErrorBoundary>
          <CacheManager />
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}
