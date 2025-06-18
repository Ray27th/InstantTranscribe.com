import { UploadInterface } from "@/components/upload-interface"

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Upload Your Files</h1>
          <p className="text-lg text-gray-600">Fast, accurate transcription for all your video and audio files</p>
        </div>
        <UploadInterface />
      </div>
    </div>
  )
}
