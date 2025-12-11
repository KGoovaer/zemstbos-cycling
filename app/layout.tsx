import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zemst BOS Cycling Club',
  description: 'Cycling club management application for seasonal rides',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="nl">
      <body className="antialiased">{children}</body>
    </html>
  )
}
