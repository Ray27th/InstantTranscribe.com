import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InstantTranscribe - AI-Powered Audio & Video Transcription',
  description: 'Convert audio and video to text instantly with 90%+ accuracy. Professional AI transcription service at $0.18/minute. Fast, accurate, affordable.',
  generator: 'InstantTranscribe',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
