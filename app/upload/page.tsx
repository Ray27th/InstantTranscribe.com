import { FileUpload } from "@/components/file-upload"

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upload Your Files</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Fast, accurate transcription for all your video and audio files. Professional quality at $0.18 per minute.
          </p>
        </div>

        <FileUpload />
      </div>
    </div>
  )
}
