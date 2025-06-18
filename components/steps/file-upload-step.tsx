"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, Loader2 } from "lucide-react"
import type { UploadedFile } from "@/types/transcription"

interface FileUploadStepProps {
  onFileUploaded: (file: UploadedFile) => void
}

const SUPPORTED_FORMATS = ["MP4", "MOV", "AVI", "MP3", "WAV"]
const PRICE_PER_MINUTE = 0.18

export function FileUploadStep({ onFileUploaded }: FileUploadStepProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true)
    } else if (e.type === "dragleave") {
      setIsDragActive(false)
    }
  }, [])

  const validateFile = (file: File) => {
    const allowedTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "audio/mpeg",
      "audio/wav",
      "audio/wave",
      "audio/x-wav",
    ]

    if (!allowedTypes.includes(file.type)) {
      throw new Error("Unsupported file format")
    }

    if (file.size > 2 * 1024 * 1024 * 1024) {
      throw new Error("File size exceeds 2GB limit")
    }
  }

  const estimateDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("video/")) {
        const video = document.createElement("video")
        video.preload = "metadata"
        video.onloadedmetadata = () => {
          URL.revokeObjectURL(video.src)
          resolve(Math.ceil(video.duration / 60)) // Convert to minutes
        }
        video.onerror = () => {
          // Fallback estimation
          const estimatedMinutes = Math.max(1, Math.round(file.size / (1024 * 1024 * 2)))
          resolve(estimatedMinutes)
        }
        video.src = URL.createObjectURL(file)
      } else {
        // Audio file estimation
        const estimatedMinutes = Math.max(1, Math.round(file.size / (1024 * 128)))
        resolve(estimatedMinutes)
      }
    })
  }

  const processFile = async (file: File) => {
    setIsProcessing(true)

    try {
      validateFile(file)
      const duration = await estimateDuration(file)
      const cost = duration * PRICE_PER_MINUTE

      const uploadedFile: UploadedFile = {
        id: Date.now().toString(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        duration,
        cost,
      }

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      onFileUploaded(uploadedFile)
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to process file")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const files = e.dataTransfer.files
    if (files.length > 0) {
      await processFile(files[0])
    }
  }, [])

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      await processFile(files[0])
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 1: Upload Your File</CardTitle>
      </CardHeader>
      <CardContent>
        <Card
          className={`border-2 border-dashed transition-all duration-200 cursor-pointer ${
            isDragActive
              ? "border-blue-500 bg-blue-50 scale-[1.02]"
              : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !isProcessing && fileInputRef.current?.click()}
        >
          <CardContent className="p-12">
            <div className="text-center space-y-6">
              <div
                className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
                  isDragActive ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
                {isProcessing ? (
                  <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                ) : (
                  <Upload className={`h-10 w-10 ${isDragActive ? "text-blue-600" : "text-gray-600"}`} />
                )}
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-semibold text-gray-900">
                  {isProcessing
                    ? "Processing your file..."
                    : isDragActive
                      ? "Drop your file here"
                      : "Upload your video or audio file"}
                </h3>
                <p className="text-gray-600">
                  {isProcessing
                    ? "Please wait while we analyze your file"
                    : "Drag and drop a file here, or click to browse"}
                </p>
              </div>

              {!isProcessing && (
                <>
                  <Button size="lg" className="px-8 py-3">
                    <Upload className="mr-2 h-5 w-5" />
                    Choose File
                  </Button>

                  <div className="flex flex-wrap justify-center gap-2">
                    {SUPPORTED_FORMATS.map((format) => (
                      <Badge key={format} variant="secondary" className="px-3 py-1">
                        {format}
                      </Badge>
                    ))}
                  </div>

                  <p className="text-sm text-gray-500">
                    Maximum file size: 2GB • $0.18 per minute • Free 30-second preview
                  </p>
                </>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".mp4,.mov,.avi,.mp3,.wav,video/mp4,video/quicktime,video/x-msvideo,audio/mpeg,audio/wav"
                onChange={handleFileInput}
                className="hidden"
                disabled={isProcessing}
              />
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
