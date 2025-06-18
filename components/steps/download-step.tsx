"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, FileVideo, FileAudio, CheckCircle, Clock, Users, Star } from "lucide-react"
import type { UploadedFile, ProcessingJob } from "@/types/transcription"

interface DownloadStepProps {
  file: UploadedFile
  processingJob: ProcessingJob
}

export function DownloadStep({ file, processingJob }: DownloadStepProps) {
  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const formatDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date()
    const duration = Math.round((endTime.getTime() - start.getTime()) / 1000)
    const mins = Math.floor(duration / 60)
    const secs = duration % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const FileIcon = file.type.startsWith("video/") ? FileVideo : FileAudio

  const downloadFormats = [
    {
      format: "TXT",
      description: "Plain text format, perfect for editing and copying",
      size: "12 KB",
      icon: FileText,
    },
    {
      format: "DOCX",
      description: "Microsoft Word document with formatting and speakers",
      size: "28 KB",
      icon: FileText,
    },
    {
      format: "SRT",
      description: "Subtitle file with timestamps for video editing",
      size: "15 KB",
      icon: FileText,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 5: Download Your Transcription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Success Message */}
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-green-900 mb-2">Transcription Complete!</h3>
            <p className="text-green-700">
              Your file has been successfully transcribed with high accuracy. Download your files below.
            </p>
          </CardContent>
        </Card>

        {/* File Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transcription Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 mb-4">
              <FileIcon className="h-10 w-10 text-blue-600" />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{file.name}</h3>
                <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
              </div>
              <Badge className="bg-green-600">Completed</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-50 p-3 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <p className="text-sm font-medium">{file.duration} min</p>
                <p className="text-xs text-gray-500">Duration</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <Users className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <p className="text-sm font-medium">2 Speakers</p>
                <p className="text-xs text-gray-500">Identified</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <Star className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <p className="text-sm font-medium">94.2%</p>
                <p className="text-xs text-gray-500">Accuracy</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <p className="text-sm font-medium">
                  {formatDuration(processingJob.startedAt, processingJob.completedAt)}
                </p>
                <p className="text-xs text-gray-500">Process Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Download Your Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {downloadFormats.map((format, index) => (
                <div key={format.format} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <format.icon className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{format.format} Format</h4>
                        <p className="text-sm text-gray-500">{format.description}</p>
                        <p className="text-xs text-gray-400">File size: {format.size}</p>
                      </div>
                    </div>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            <div className="text-center">
              <Button size="lg" className="px-8">
                <Download className="mr-2 h-5 w-5" />
                Download All Formats
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                All files will be automatically deleted from our servers in 24 hours for your privacy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-blue-900 mb-3">What's Next?</h3>
            <ul className="text-sm text-blue-800 space-y-2">
              <li>• Your transcription files are ready for immediate use</li>
              <li>• Files will be automatically deleted in 24 hours for security</li>
              <li>• Need another transcription? Upload a new file anytime</li>
              <li>• Questions? Contact our support team for help</li>
            </ul>
            <div className="mt-4 flex gap-3">
              <Button variant="outline" size="sm">
                Transcribe Another File
              </Button>
              <Button variant="outline" size="sm">
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
