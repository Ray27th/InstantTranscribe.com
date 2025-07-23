import { Play } from "lucide-react"

export function VideoDemo() {
  return (
    <section id="video-demo" className="py-16 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            See InstantTranscribe in Action
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Watch our complete demo showing the entire transcription process from upload to download
          </p>
        </div>
        
        <div className="mx-auto mt-12 max-w-4xl">
          <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl bg-white ring-1 ring-gray-200">
            <iframe
              src="https://www.youtube.com/embed/xAVJS9UJYaM"
              title="InstantTranscribe Demo - AI-Powered Transcription Service"
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
          
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Full demonstration: Upload → Preview → Payment → Transcription → Download
            </p>
          </div>
        </div>
      </div>
    </section>
  )
} 