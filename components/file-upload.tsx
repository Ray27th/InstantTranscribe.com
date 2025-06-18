"use client"

import type React from "react"

import { useState, useCallback, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Upload, FileVideo, FileAudio, X, CheckCircle, AlertCircle, Download, Loader2, CloudUpload } from "lucide-react"

interface UploadFile {
  id: string
  file: File
  name: string
  size: number
  type: string
  duration?: number
  status: "pending" | "uploading" | "processing" | "completed" | "error"
  progress: number
  cost: number
  error?: string
}

const SUPPORTED_FORMATS = ["MP4", "MOV", "AVI", "MP3", "WAV"]
const PRICE_PER_MINUTE = 0.18

export function FileUpload() {
  const [files, setFiles] = useState<UploadFile[]>([])
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
      return { isValid: false, error: "Unsupported file format" }
    }

    if (file.size > 2 * 1024 * 1024 * 1024) {
      // 2GB
      return { isValid: false, error: "File size exceeds 2GB limit" }
    }

    return { isValid: true }
  }

  const estimateDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
      // Simple estimation based on file size (rough approximation)
      const estimatedMinutes = Math.max(1, Math.round(file.size / (1024 * 1024 * 2))) // ~2MB per minute
      resolve(estimatedMinutes)
    })
  }

  const processFile = async (file: File): Promise<UploadFile> => {
    const validation = validateFile(file)

    if (!validation.isValid) {
      return {
        id: Date.now().toString() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "error",
        progress: 0,
        cost: 0,
        error: validation.error,
      }
    }

    try {
      const duration = await estimateDuration(file)
      const cost = duration * PRICE_PER_MINUTE

      return {
        id: Date.now().toString() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        duration,
        status: "pending",
        progress: 0,
        cost,
      }
    } catch (error) {
      return {
        id: Date.now().toString() + Math.random(),
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        status: "error",
        progress: 0,
        cost: 0,
        error: "Failed to process file",
      }
    }
  }

  const handleFiles = async (fileList: FileList) => {
    setIsProcessing(true)
    const newFiles: UploadFile[] = []

    for (let i = 0; i < fileList.length; i++) {
      const processedFile = await processFile(fileList[i])
      newFiles.push(processedFile)
    }

    setFiles((prev) => [...prev, ...newFiles])
    setIsProcessing(false)
  }

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragActive(false)

    const droppedFiles = e.dataTransfer.files
    if (droppedFiles.length > 0) {
      await handleFiles(droppedFiles)
    }
  }, [])

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (selectedFiles && selectedFiles.length > 0) {
      await handleFiles(selectedFiles)
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id))
  }

  const startUpload = (id: string) => {
    setFiles((prev) => prev.map((file) => (file.id === id ? { ...file, status: "uploading" } : file)))

    let progress = 0
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5

      setFiles((prev) =>
        prev.map((file) => {
          if (file.id === id) {
            if (progress >= 100) {
              clearInterval(interval)
              setTimeout(() => {
                setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: "processing" } : f)))

                setTimeout(
                  () => {
                    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, status: "completed" } : f)))
                  },
                  Math.random() * 2000 + 2000,
                )
              }, 500)

              return { ...file, progress: 100, status: "processing" }
            }
            return { ...file, progress: Math.min(progress, 100) }
          }
          return file
        }),
      )
    }, 300)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    return type.startsWith("video/") ? FileVideo : FileAudio
  }

  const getStatusBadge = (file: UploadFile) => {
    switch (file.status) {
      case "completed":
        return (
          <Badge className="bg-green-600">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case "error":
        return (
          <Badge variant="destructive">
            <AlertCircle className="w-3 h-3 mr-1" />
            Error
          </Badge>
        )
      case "processing":
        return (
          <Badge variant="secondary">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Processing
          </Badge>
        )
      case "uploading":
        return (
          <Badge variant="secondary">
            <CloudUpload className="w-3 h-3 mr-1" />
            Uploading
          </Badge>
        )
      default:
        return <Badge variant="outline">Ready</Badge>
    }
  }

  const totalCost = files.reduce((sum, file) => sum + file.cost, 0)

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Upload Area */}
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
        onClick={() => fileInputRef.current?.click()}
      >
        <CardContent className="p-12">
          <div className="text-center space-y-6">
            <div
              className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
                isDragActive ? "bg-blue-100" : "bg-gray-100"
              }`}
            >
              <Upload className={`h-10 w-10 ${isDragActive ? "text-blue-600" : "text-gray-600"}`} />
            </div>

            <div className="space-y-2">
              <h3 className="text-2xl font-semibold text-gray-900">
                {isDragActive ? "Drop your files here" : "Upload your video or audio files"}
              </h3>
              <p className="text-gray-600">Drag and drop files here, or click to browse</p>
            </div>

            <Button
              size="lg"
              disabled={isProcessing}
              className="px-8 py-3"
              onClick={(e) => {
                e.stopPropagation()
                fileInputRef.current?.click()
              }}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-5 w-5" />
                  Choose Files
                </>
              )}
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".mp4,.mov,.avi,.mp3,.wav,video/mp4,video/quicktime,video/x-msvideo,audio/mpeg,audio/wav"
              onChange={handleFileInput}
              className="hidden"
            />

            <div className="flex flex-wrap justify-center gap-2">
              {SUPPORTED_FORMATS.map((format) => (
                <Badge key={format} variant="secondary" className="px-3 py-1">
                  {format}
                </Badge>
              ))}
            </div>

            <p className="text-sm text-gray-500">Maximum file size: 2GB • $0.18 per minute</p>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Display */}
      {files.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Estimated Cost</h3>
            <p className="text-3xl font-bold text-green-600">${totalCost.toFixed(2)}</p>
            <p className="text-sm text-gray-600 mt-2">
              {files.length} file{files.length !== 1 ? "s" : ""} • Final cost calculated after processing
            </p>
          </CardContent>
        </Card>
      )}

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold">Upload Queue ({files.length})</h3>
            </div>

            <div className="space-y-4">
              {files.map((file) => {
                const FileIcon = getFileIcon(file.type)

                return (
                  <div key={file.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <FileIcon className="h-8 w-8 text-blue-600 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">{file.name}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{formatFileSize(file.size)}</span>
                            {file.duration && (
                              <span>
                                {file.duration} min{file.duration !== 1 ? "s" : ""}
                              </span>
                            )}
                            {file.cost > 0 && (
                              <span className="font-medium text-green-600">${file.cost.toFixed(2)}</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        {getStatusBadge(file)}

                        {file.status === "pending" && (
                          <Button size="sm" onClick={() => startUpload(file.id)} className="px-4">
                            Upload
                          </Button>
                        )}

                        {file.status === "completed" && (
                          <Button size="sm" variant="outline" className="px-4">
                            <Download className="w-4 h-4 mr-1" />
                            Download
                          </Button>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(file.id)}
                          className="text-gray-400 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {file.error && <div className="text-sm text-red-600 bg-red-50 p-2 rounded">{file.error}</div>}

                    {(file.status === "uploading" || file.status === "processing") && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-blue-600">
                            {file.status === "uploading" ? "Uploading..." : "Processing transcription..."}
                          </span>
                          {file.status === "uploading" && (
                            <span className="text-gray-500">{Math.round(file.progress)}%</span>
                          )}
                        </div>
                        <Progress value={file.status === "uploading" ? file.progress : undefined} className="h-2" />
                      </div>
                    )}

                    {file.status === "completed" && (
                      <div className="flex gap-2 pt-2">
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
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
