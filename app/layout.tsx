import { ClerkProvider } from '@clerk/nextjs'
import Script from 'next/script' // これを追加

export const metadata = {
  title: 'pulse',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="ja">
        <head>
          {/* ↓ これが魔法の1行！CSSファイルが壊れてても Tailwind を強制適用するよ */}
          <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        </head>
        <body className="bg-black text-white antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
