"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Mail, CheckCircle, Clock, FileText, Star } from "lucide-react"

interface EmailReturnPageProps {
  transcriptionId: string
}

export function EmailReturnPage({ transcriptionId }: EmailReturnPageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [transcriptionData, setTranscriptionData] = useState<any>(null)

  useEffect(() => {
    // Simulate loading transcription data
    setTimeout(() => {
      setTranscriptionData({
        fileName: "meeting-recording.mp4",
        duration: "45 minutes",
        accuracy: "94.2%",
        speakers: 3,
        completedAt: new Date(),
        formats: [
          { type: "TXT", size: "28 KB" },
          { type: "DOCX", size: "45 KB" },
          { type: "SRT", size: "32 KB" },
        ],
      })
      setIsLoading(false)
    }, 1500)
  }, [transcriptionId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold mb-2">Loading your transcription...</h3>
            <p className="text-gray-600">Please wait while we retrieve your files.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Welcome Back Header */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
            <p className="text-lg text-gray-600 mb-4">Your transcription is complete and ready for download.</p>
            <Badge className="bg-green-600 text-lg px-4 py-2">
              <CheckCircle className="mr-2 h-5 w-5" />
              Processing Complete
            </Badge>
          </CardContent>
        </Card>

        {/* Transcription Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Transcription Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">File Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">File name:</span>
                    <span className="font-medium">{transcriptionData.fileName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Duration:</span>
                    <span className="font-medium">{transcriptionData.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Completed:</span>
                    <span className="font-medium">{transcriptionData.completedAt.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Quality Metrics</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg text-center">
                    <Star className="h-5 w-5 text-blue-600 mx-auto mb-1" />
                    <p className="font-semibold text-blue-900">{transcriptionData.accuracy}</p>
                    <p className="text-xs text-blue-700">Accuracy</p>
                  </div>
                  <div className="bg-purple-50 p-3 rounded-lg text-center">
                    <Clock className="h-5 w-5 text-purple-600 mx-auto mb-1" />
                    <p className="font-semibold text-purple-900">{transcriptionData.speakers}</p>
                    <p className="text-xs text-purple-700">Speakers</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Download Section */}
        <Card>
          <CardHeader>
            <CardTitle>Download Your Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              {transcriptionData.formats.map((format: any, index: number) => (
                <div key={format.type} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div>
                      <h4 className="font-medium">{format.type} Format</h4>
                      <p className="text-sm text-gray-500">Size: {format.size}</p>
                    </div>
                  </div>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              ))}
            </div>

            <div className="text-center border-t pt-6">
              <Button size="lg" className="px-8 mb-4">
                <Download className="mr-2 h-5 w-5" />
                Download All Formats
              </Button>
              <p className="text-sm text-gray-500">
                Files will be available for download for 7 days, then automatically deleted for your privacy.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="mt-6 bg-blue-50 border-blue-200">
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold text-blue-900 mb-3">Need another transcription?</h3>
            <p className="text-blue-800 mb-4">
              Experience the same fast, accurate service for your next audio or video file.
            </p>
            <Button variant="outline">Transcribe Another File</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
