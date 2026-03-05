import { ClerkProvider } from '@clerk/nextjs'
// ↓これを追加して、さっき成功した globals.css を読み込ませるよ！
import "./globals.css"; 

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
        {/* body に antialiased を付けると文字が綺麗になるよ */}
        <body className="bg-black text-white antialiased">
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
