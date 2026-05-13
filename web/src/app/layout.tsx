import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Scaffold AC',
  description: 'Staff panel til serverkonfiguration og bans',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <body className="min-h-screen">{children}</body>
    </html>
  )
}
