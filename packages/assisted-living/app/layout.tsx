import type { Metadata } from 'next'
import { Toaster } from '@/components/ui/toaster'
// Replacing with Google Analytics...
// import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'

import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Lean EHR: Assisted Living',
  description: 'An EHR software solution for assisted living facilities',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
