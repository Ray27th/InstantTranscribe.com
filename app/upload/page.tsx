import { MultiStepTranscription } from "@/components/multi-step-transcription"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Back to Homepage Button */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Homepage
            </Button>
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">AI Transcription Service</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Upload your file, preview the quality, pay securely, and download your professional transcription.
          </p>
        </div>

        <MultiStepTranscription />
      </div>
    </div>
  )
}
