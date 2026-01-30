import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CRFPA 2026 - Révisions',
  description: 'Application de révision pour le CRFPA 2026',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
