import { Button } from "@/components/ui/button"
import { ArrowRight, Zap } from "lucide-react"
import Link from "next/link"

export function CTA() {
  return (
    <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="mx-auto max-w-4xl px-6 lg:px-8 text-center">
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to transcribe your content?
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Join thousands of content creators, researchers, and businesses who trust InstantTranscribe for fast,
              accurate transcriptions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/upload">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg font-semibold">
                <Zap className="mr-2 h-5 w-5" />
                Start Transcribing Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="flex flex-wrap justify-center gap-8 text-blue-100 text-sm">
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>No setup required</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Pay per use</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>90%+ accuracy</span>
            </div>
            <div className="flex items-center gap-2">
              <span>✓</span>
              <span>Results in minutes</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
