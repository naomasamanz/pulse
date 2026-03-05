import { ClerkProvider } from '@clerk/nextjs'
import Script from 'next/script'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: "PULSE",
  description: "あなたの鼓動を世界へ",
  // 👇 ここにコピーしたコードの content の中身を入れる！
  verification: {
    google: "nspDi4qQ83TID9WMpEf9JUCo5P42bi2hEo3hXdRu-vY",
  },
};

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
