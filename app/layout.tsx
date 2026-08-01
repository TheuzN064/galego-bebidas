import type { Metadata } from 'next'
import { Anton, Manrope, Space_Mono } from 'next/font/google'
import './globals.css'

const anton = Anton({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-anton',
})

const manrope = Manrope({ 
  subsets: ['latin'],
  variable: '--font-manrope',
})

const spaceMono = Space_Mono({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-space-mono',
})

export const metadata: Metadata = {
  title: 'Galego — Depósito de Bebidas',
  description: 'Catálogo de bebidas com entrega rápida',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${anton.variable} ${manrope.variable} ${spaceMono.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
