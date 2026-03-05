import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
// 【重要】もし globals.css が空でも、このインポートは必要だよ！
import "./globals.css";

export const metadata: Metadata = {
  title: 'pulse',
  description: 'pulse system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <body className="bg-black text-white">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
