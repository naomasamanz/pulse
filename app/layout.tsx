import { ClerkProvider } from '@clerk/nextjs'

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
        <body style={{ backgroundColor: 'black', color: 'white' }}>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
