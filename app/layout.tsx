'use client'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { ThemeProvider } from '@/app/providers/ThemeProvider'
import '@zyther/react-toastify/styles'
import './styles/globals.css'
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ToastProvider } from '@zyther/react-toastify'

const inter = Inter({ subsets: ['latin'] })

 const metadata: Metadata = {
  title: 'DevTools Hub · Developer Toolkit',
  description: 'Free online developer tools: CSS Minifier, JavaScript Minifier, HTML Minifier, JSON Formatter, and more.',
  keywords: 'developer tools, minifier, CSS, JavaScript, HTML, JSON formatter, code optimizer',
  authors: [{ name: 'DevTools Hub Team' }],
  metadataBase: new URL('https://devtools.zyther.dev'),
  openGraph: {
    title: 'DevTools Hub · Developer Toolkit',
    description: 'Free online developer tools for minifying, formatting, and optimizing code.',
    url: 'https://devtools.zyther.dev',
    siteName: 'DevTools Hub',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DevTools Hub · Developer Toolkit',
    description: 'Free online developer tools for minifying, formatting, and optimizing code.',
    images: ['/og-image.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/assets/icons/favicon.ico" type="image/x-icon" />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body className={`${inter.className} bg-body text-primary min-h-screen flex flex-col`}>
        <ThemeProvider>
          <ToastProvider
            defaultPosition='top-right'
            defaultDuration={0}
            theme='system'
          >
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}