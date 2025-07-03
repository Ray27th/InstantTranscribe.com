import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Zap, Clock, Target, ArrowRight, Play } from "lucide-react"
import Link from "next/link"

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10" />

      <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm font-medium">
            <Zap className="mr-2 h-4 w-4" />
            AI-Powered Transcription Service
          </Badge>

          {/* Main headline */}
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
            <span className="block text-blue-600">InstantTranscribe</span>
            AI-Powered Transcription
          </h1>

          {/* Subheadline */}
          <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl max-w-3xl mx-auto">
            Convert your video and audio files to accurate text transcriptions instantly. Professional quality AI
            transcription with 90%+ accuracy at just $0.18 per minute.
          </p>

          {/* Key benefits */}
          <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm font-medium text-gray-700">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <span>90%+ Accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <span>5x Faster Processing</span>
            </div>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              <span>Multiple Formats</span>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/upload">
              <Button size="lg" className="px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-shadow">
                Start Transcribing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/upload">
              <Button variant="outline" size="lg" className="px-8 py-4 text-lg font-semibold">
                <Play className="mr-2 h-5 w-5" />
                Try Live Demo
              </Button>
            </Link>
          </div>

          {/* Trust indicators */}
          <div className="mt-12 text-center">
            <p className="text-sm text-gray-500 mb-4">Trusted by thousands of professionals</p>
            <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
              <div className="text-2xl font-bold text-gray-400">YouTube</div>
              <div className="text-2xl font-bold text-gray-400">Podcast</div>
              <div className="text-2xl font-bold text-gray-400">Education</div>
              <div className="text-2xl font-bold text-gray-400">Business</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
