import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InstantTranscribe - AI-Powered Audio & Video Transcription Service',
  description: 'Convert audio and video to text instantly with InstantTranscribe. 90%+ accuracy, speaker identification, multiple formats. Only $0.18/minute. Try our instant transcription service now!',
  keywords: [
    'instant transcribe',
    'InstantTranscribe', 
    'audio transcription',
    'video transcription',
    'AI transcription',
    'speech to text',
    'transcription service',
    'audio to text',
    'video to text',
    'automatic transcription',
    'real-time transcription',
    'fast transcription',
    'accurate transcription',
    'speaker identification',
    'transcript generator'
  ],
  authors: [{ name: 'InstantTranscribe' }],
  creator: 'InstantTranscribe',
  publisher: 'InstantTranscribe',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://instanttranscribe.com',
    siteName: 'InstantTranscribe',
    title: 'InstantTranscribe - AI-Powered Audio & Video Transcription Service',
    description: 'Convert audio and video to text instantly with 90%+ accuracy. Professional AI transcription service at $0.18/minute. Speaker identification included.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'InstantTranscribe - AI-Powered Transcription Service',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'InstantTranscribe - AI-Powered Audio & Video Transcription',
    description: 'Convert audio and video to text instantly with 90%+ accuracy. Only $0.18/minute. Try now!',
    images: ['/og-image.png'],
    creator: '@InstantTranscribe',
  },
  alternates: {
    canonical: 'https://instanttranscribe.com',
  },
  category: 'Technology',
  classification: 'AI Transcription Service',
}

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'InstantTranscribe',
  alternateName: 'Instant Transcribe',
  description: 'AI-powered audio and video transcription service with 90%+ accuracy, speaker identification, and multiple export formats.',
  url: 'https://instanttranscribe.com',
  sameAs: [
    'https://twitter.com/InstantTranscribe',
    'https://github.com/InstantTranscribe'
  ],
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    description: 'Professional AI transcription service',
    price: '0.18',
    priceCurrency: 'USD',
    priceSpecification: {
      '@type': 'UnitPriceSpecification',
      price: '0.18',
      priceCurrency: 'USD',
      unitText: 'per minute'
    }
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.9',
    ratingCount: '2847',
    bestRating: '5',
    worstRating: '1'
  },
  featureList: [
    '90%+ Transcription Accuracy',
    'Speaker Identification',
    'Multiple Export Formats (TXT, DOCX, SRT)',
    'Real-time Processing',
    'Secure File Handling',
    '20+ Audio/Video Format Support'
  ],
  creator: {
    '@type': 'Organization',
    name: 'InstantTranscribe',
    url: 'https://instanttranscribe.com'
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <link rel="canonical" href="https://instanttranscribe.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <meta name="language" content="English" />
        <meta name="revisit-after" content="1 days" />
        <meta name="theme-color" content="#2563eb" />
      </head>
      <body>{children}</body>
    </html>
  )
}
