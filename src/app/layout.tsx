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
  metadataBase: new URL('https://local-services-directory.vercel.app'),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <GlobalErrorBoundary>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
          </div>
          <CacheManager />
        </GlobalErrorBoundary>
      </body>
    </html>
  )
}
