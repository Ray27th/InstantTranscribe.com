"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Play, FileVideo, FileAudio, Clock, Users, Loader2, CheckCircle } from "lucide-react"
import type { UploadedFile, PreviewTranscript } from "@/types/transcription"
import { generateRealPreviewTranscript } from "@/lib/transcription-service"
import { formatDuration } from "@/lib/file-utils"

interface PreviewStepProps {
  file: UploadedFile
  onPreviewGenerated: (transcript: PreviewTranscript) => void
  onContinue: () => void
  transcript: PreviewTranscript | null
}

export function PreviewStep({ file, onPreviewGenerated, onContinue, transcript }: PreviewStepProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)

  const generatePreview = async () => {
    setIsGenerating(true)
    setProgress(0)

    try {
      // Use the actual file from the UploadedFile object
      const result = await generateRealPreviewTranscript(file.file, (progress, status) => {
        setProgress(progress)
      })

      // Convert the real API result to the PreviewTranscript format
      const realTranscript: PreviewTranscript = {
        text: result.transcript,
        confidence: Math.round(result.confidence * 100), // Convert to clean percentage
        speakers: result.segments?.map((segment, index) => ({
          speaker: `Speaker 1`, // For now, assume single speaker
          text: segment.text.trim(),
          timestamp: formatTimestamp(segment.start)
        })) || [
          { speaker: "Speaker 1", text: result.transcript, timestamp: "00:00" }
        ],
      }

      setProgress(100)
      setIsGenerating(false)
      onPreviewGenerated(realTranscript)
    } catch (error) {
      console.error('Preview generation failed:', error)
      setProgress(0)
      setIsGenerating(false)
      // Let the error bubble up to show proper error handling
      throw error
    }
  }

  const formatTimestamp = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const FileIcon = file.type.startsWith("video/") ? FileVideo : FileAudio

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 2: Free 15-Second Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Info */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <FileIcon className="h-10 w-10 text-blue-600" />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{file.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{formatFileSize(file.size)}</span>
                  <span>{formatDuration(file.duration)}</span>
                  <span className="font-medium text-green-600">${file.cost.toFixed(2)} total</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Generation */}
        {!transcript && (
          <Card>
            <CardContent className="p-6 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                  <Play className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Get a Free 15-Second Preview</h3>
                  <p className="text-gray-600 mb-4">
                    See the quality and accuracy of our AI transcription before you pay. We'll transcribe the first 15
                    seconds of your file for free.
                  </p>
                  <Button onClick={generatePreview} disabled={isGenerating} size="lg" className="px-8">
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Generating Preview...
                      </>
                    ) : (
                      <>
                        <Play className="mr-2 h-5 w-5" />
                        Generate Free Preview
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {isGenerating && (
                <div className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Transcribing first 15 seconds...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Preview Results */}
        {transcript && (
          <div className="space-y-6">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-green-800 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Preview Generated Successfully!
                  </CardTitle>
                  <Badge className="bg-green-600">{transcript.confidence}% Accuracy</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Full Text (First 15 seconds):</h4>
                    <p className="text-gray-700 bg-white p-4 rounded-lg border italic">"{transcript.text}"</p>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Speaker Timeline:
                    </h4>
                    <div className="space-y-2">
                      {transcript.speakers.map((speaker, index) => (
                        <div key={index} className="bg-white p-3 rounded-lg border flex items-start gap-3">
                          <Badge variant="outline" className="mt-0.5">
                            <Clock className="h-3 w-3 mr-1" />
                            {speaker.timestamp}
                          </Badge>
                          <div>
                            <p className="font-medium text-sm text-blue-600">{speaker.speaker}</p>
                            <p className="text-gray-700">{speaker.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-6 text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready for the Full Transcription?</h3>
                <p className="text-gray-600 mb-4">
                  This preview shows just the first 15 seconds. Get the complete transcription of your {formatDuration(file.duration)}
                  file with the same accuracy and speaker identification.
                </p>
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Badge variant="secondary">Full File: {formatDuration(file.duration)}</Badge>
                  <Badge variant="secondary">Total Cost: ${file.cost.toFixed(2)}</Badge>
                  <Badge variant="secondary">Same {transcript.confidence}% Accuracy</Badge>
                </div>
                <Button onClick={onContinue} size="lg" className="px-8">
                  Continue to Payment
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
