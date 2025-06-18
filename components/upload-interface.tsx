"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileVideo, X, Clock, DollarSign, CheckCircle } from "lucide-react"

interface UploadedFile {
  id: string
  name: string
  size: number
  duration: number
  status: "uploading" | "processing" | "completed"
  progress: number
  cost: number
}

export function UploadInterface() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    // Simulate file upload
    const newFile: UploadedFile = {
      id: Date.now().toString(),
      name: "sample-video.mp4",
      size: 25600000, // 25.6MB
      duration: 180, // 3 minutes
      status: "uploading",
      progress: 0,
      cost: 0.54, // 3 minutes * $0.18
    }

    setFiles((prev) => [...prev, newFile])

    // Simulate upload progress
    let progress = 0
    const interval = setInterval(() => {
      progress += 10
      setFiles((prev) =>
        prev.map((f) =>
          f.id === newFile.id ? { ...f, progress, status: progress === 100 ? "processing" : "uploading" } : f,
        ),
      )

      if (progress >= 100) {
        clearInterval(interval)
        // Simulate processing completion
        setTimeout(() => {
          setFiles((prev) => prev.map((f) => (f.id === newFile.id ? { ...f, status: "completed" } : f)))
        }, 2000)
      }
    }, 200)
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id))
  }

  const formatFileSize = (bytes: number) => {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB"
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors cursor-pointer ${
          dragActive ? "border-blue-400 bg-blue-50" : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-12">
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Upload className="h-8 w-8 text-blue-600" />
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Drop your files here</h3>
              <p className="text-gray-600 mb-4">Or click to browse and select your video or audio files</p>
              <Button>Choose Files</Button>
            </div>

            <div className="flex flex-wrap justify-center gap-2">
              {["MP4", "MOV", "AVI", "MP3", "WAV"].map((format) => (
                <Badge key={format} variant="secondary">
                  {format}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Upload Queue</CardTitle>
            <CardDescription>Track your file uploads and transcription progress</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {files.map((file) => (
              <div key={file.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <FileVideo className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {formatDuration(file.duration)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4" />
                      <span>${file.cost.toFixed(2)}</span>
                    </div>

                    {file.status === "completed" ? (
                      <Badge variant="default" className="bg-green-600">
                        <CheckCircle className="mr-1 h-3 w-3" />
                        Completed
                      </Badge>
                    ) : file.status === "processing" ? (
                      <Badge variant="secondary">
                        <Clock className="mr-1 h-3 w-3" />
                        Processing
                      </Badge>
                    ) : (
                      <Badge variant="outline">Uploading</Badge>
                    )}

                    <Button variant="ghost" size="sm" onClick={() => removeFile(file.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {file.status !== "completed" && <Progress value={file.progress} className="h-2" />}

                {file.status === "completed" && (
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline">
                      Download TXT
                    </Button>
                    <Button size="sm" variant="outline">
                      Download DOCX
                    </Button>
                    <Button size="sm" variant="outline">
                      Download SRT
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
