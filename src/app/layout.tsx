import type { Metadata } from 'next'
import '../styles/globals.css'

export const metadata: Metadata = {
  title: 'QRForge — QR Code & Barcode Generator',
  description: 'Generate beautiful QR codes and barcodes instantly. Customize colors, shapes, add logos. Download as PNG or SVG.',
  keywords: 'QR code generator, barcode generator, custom QR codes, free QR generator',
  openGraph: {
    title: 'QRForge — QR Code & Barcode Generator',
    description: 'Generate beautiful QR codes and barcodes instantly.',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('qrforge-theme') || 'light';
                if (theme === 'dark') document.documentElement.classList.add('dark');
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
