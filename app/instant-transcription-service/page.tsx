import { Metadata } from 'next'
import Link from 'next/link'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRight, Zap, Clock, Shield, Star } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Instant Transcription Service - InstantTranscribe | Audio & Video to Text',
  description: 'Professional instant transcription service by InstantTranscribe. Convert audio and video to text instantly with 90%+ accuracy. Fast, secure, and affordable at $0.18/minute.',
  keywords: [
    'instant transcription service',
    'instant transcribe service', 
    'audio transcription service',
    'video transcription service',
    'fast transcription',
    'instant audio to text',
    'instant video to text',
    'professional transcription service'
  ],
  alternates: {
    canonical: 'https://instanttranscribe.com/instant-transcription-service',
  },
}

export default function InstantTranscriptionServicePage() {
  return (
    <div className="min-h-screen bg-white">
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Professional Instant Transcription Service
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            InstantTranscribe provides the fastest and most accurate instant transcription service available. 
            Our AI-powered platform converts your audio and video files to text in seconds, not hours.
          </p>
          <Link href="/upload">
            <Button size="lg" className="px-8 py-4 text-lg">
              Start Instant Transcription
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>

        {/* Why Choose Our Instant Transcription Service */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose InstantTranscribe for Instant Transcription?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-6 w-6 text-blue-600 mr-2" />
                  Lightning Fast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Our instant transcription service processes files 5x faster than traditional services. 
                Get your transcripts in seconds, not hours.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Star className="h-6 w-6 text-yellow-500 mr-2" />
                  90%+ Accuracy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Advanced AI ensures 90%+ accuracy with speaker identification and timestamp precision 
                for professional-grade transcription results.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="h-6 w-6 text-green-600 mr-2" />
                  Secure & Private
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>Your files are processed securely and deleted after transcription. 
                Complete privacy protection for sensitive content.</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Instant Transcription Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center mb-8">
            Instant Transcription Service Features
          </h2>
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <Clock className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Real-Time Processing</h3>
                  <p className="text-gray-600">Instant transcription results with live progress tracking</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Star className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Multiple Export Formats</h3>
                  <p className="text-gray-600">Download as TXT, DOCX, SRT, or JSON format</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Zap className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold">Speaker Identification</h3>
                  <p className="text-gray-600">Automatically detect and label different speakers</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Shield className="h-6 w-6 text-blue-600 mt-1" />
                <div>
                  <h3 className="font-semibold">20+ File Formats</h3>
                  <p className="text-gray-600">Support for MP3, MP4, WAV, M4A, and more</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="text-center bg-blue-50 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-4">
            Experience the Best Instant Transcription Service
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of professionals who trust InstantTranscribe for fast, 
            accurate, and secure instant transcription services.
          </p>
          <Link href="/upload">
            <Button size="lg" className="px-8 py-4 text-lg">
              Try Instant Transcription Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </section>
      </main>
    </div>
  )
} 