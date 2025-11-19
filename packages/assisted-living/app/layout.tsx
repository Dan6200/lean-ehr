import type { Metadata } from 'next'
import { Toaster } from '#root/components/ui/toaster'
// Replacing with Google Analytics...
// import { Analytics } from '@vercel/analytics/react'
import './globals.css'
import { ThemeProvider } from '#root/components/theme-provider'
import { AuthProvider } from '#root/auth/client/auth-context'

import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'], display: 'swap' })

export const metadata: Metadata = {
  title: 'Lean EHR: Assisted Living',
  description: 'An EHR software solution for assisted living facilities',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
