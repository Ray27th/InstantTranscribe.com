import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Upload, FileVideo, FileAudio, Zap } from "lucide-react"

const supportedFormats = [
  { name: "MP4", icon: FileVideo, type: "Video" },
  { name: "MOV", icon: FileVideo, type: "Video" },
  { name: "AVI", icon: FileVideo, type: "Video" },
  { name: "MP3", icon: FileAudio, type: "Audio" },
  { name: "WAV", icon: FileAudio, type: "Audio" },
]

export function UploadDemo() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4">
            <Zap className="mr-2 h-4 w-4" />
            Lightning Fast Upload
          </Badge>
          <h2 className="text-2xl font-bold text-gray-900">Drag, drop, and transcribe in seconds</h2>
        </div>

        <Card className="border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors">
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <Upload className="h-8 w-8 text-blue-600" />
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Drop your files here</h3>
                <p className="text-gray-600">Or click to browse and select your video or audio files</p>
              </div>

              <div className="flex flex-wrap justify-center gap-3">
                {supportedFormats.map((format, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    <format.icon className="mr-1 h-3 w-3" />
                    {format.name}
                  </Badge>
                ))}
              </div>

              <div className="text-sm text-gray-500">Maximum file size: 2GB • Processing starts immediately</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
