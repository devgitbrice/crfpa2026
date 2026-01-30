import type { Metadata } from 'next'
import './globals.css'
import { ThemeProvider } from '@/lib/ThemeContext'
import { ChatbotProvider } from '@/lib/ChatbotContext'
import ChatbotWidget from '@/components/ChatbotWidget'

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
    <html lang="fr" suppressHydrationWarning>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <ChatbotProvider>
            {children}
            <ChatbotWidget />
          </ChatbotProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
