import type { Metadata } from 'next'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'
import './globals.css'
import { ThirdwebProvider } from '@/components/ThirdwebProvider'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { LanguageProvider } from '@/lib/i18n/LanguageProvider'
import { AIChatbox } from '@/components/ai/AIChatbox'
import { EnvironmentStatus } from '@/components/EnvironmentStatus'
import { ErrorBoundary } from '@/components/ErrorBoundary'

export const metadata: Metadata = {
  title: 'Land Registry Platform - Blockchain Land Verification',
  description: 'AI-powered land registry system for Ghana and Nigeria',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <ErrorBoundary>
              <ThirdwebProvider>
                {children}
                <ErrorBoundary fallback={<></>}>
                  <AIChatbox />
                </ErrorBoundary>
                <EnvironmentStatus />
              </ThirdwebProvider>
            </ErrorBoundary>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
