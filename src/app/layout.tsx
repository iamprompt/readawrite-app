import '../styles/globals.css'

import type { Metadata } from 'next'

import { GoogleSans } from '@/styles/fonts'

export const metadata: Metadata = {
  title: 'ReadAWrite App',
  description: 'ReadAWrite Reader App',
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="th" suppressHydrationWarning>
      <body className={`${GoogleSans.variable} antialiased`}>{children}</body>
    </html>
  )
}
