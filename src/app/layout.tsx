import type { Metadata } from 'next'
import './globals.css'
import AntdProvider from '@/components/AntdProvider'

export const metadata: Metadata = {
  title: 'YUDAGUIDE',
  description: '搞一个导航',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>
        <AntdProvider>{children}</AntdProvider>
      </body>
    </html>
  )
}
