import type { Metadata } from 'next'
import './globals.css'
import Navbar from '@/components/Navbar'
import { ThemeProvider } from '@/components/theme-provider'

export const metadata: Metadata = {
  title: 'RecruiterGuard - Plataforma de Recrutamento Ético',
  description: 'Anonimize currículos e classifique candidatos com base em habilidades',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-background text-foreground">
          <ThemeProvider>
            <Navbar />
            {children}
          </ThemeProvider>
      </body>
    </html>
  )
}
