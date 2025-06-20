"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Download, FileText, FileVideo, FileAudio, CheckCircle, Clock, Users, Star, Copy, FileJson, Video, FileCheck, Globe, Code, Mail, Share2, Archive, BarChart3 } from "lucide-react"
import { downloadTranscript, downloadSRT, downloadJSON, downloadVTT, downloadEnhancedReport, copyToClipboard, formatFileSize, formatDuration } from "@/lib/file-utils"
import { useState } from "react"
import type { UploadedFile, ProcessingJob, TranscriptionResult } from "@/types/transcription"
import { useToast } from "@/hooks/use-toast"

interface DownloadStepProps {
  file: UploadedFile
  processingJob: ProcessingJob
  transcriptionResult?: {
    fullTranscript: string
    confidence: number
    segments?: Array<{
      text: string
      start: number
      end: number
    }>
    speakerCount?: number
  }
}

export function DownloadStep({ file, processingJob, transcriptionResult }: DownloadStepProps) {
  const [copySuccess, setCopySuccess] = useState<boolean | null>(null)
  const { toast } = useToast()

  const formatProcessingDuration = (start: Date, end?: Date) => {
    const endTime = end || new Date()
    const duration = Math.round((endTime.getTime() - start.getTime()) / 1000)
    const mins = Math.floor(duration / 60)
    const secs = duration % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const FileIcon = file.type.startsWith("video/") ? FileVideo : FileAudio

  // Get clean filename without extension for downloads
  const getCleanFilename = (filename: string) => {
    return filename.substring(0, filename.lastIndexOf('.')) || filename
  }

  const cleanFilename = getCleanFilename(file.name)

  // Handle individual downloads
  const handleDownloadTXT = () => {
    if (transcriptionResult?.fullTranscript) {
      downloadTranscript(transcriptionResult.fullTranscript, cleanFilename)
    }
  }

  const handleDownloadSRT = () => {
    if (transcriptionResult?.segments && transcriptionResult.segments.length > 0) {
      downloadSRT(transcriptionResult.segments, cleanFilename)
    } else if (transcriptionResult?.fullTranscript) {
      // Create a single segment if no segments available
      const singleSegment = [{
        text: transcriptionResult.fullTranscript,
        start: 0,
        end: file.duration ? file.duration * 60 : 300 // Default to 5 minutes if no duration
      }]
      downloadSRT(singleSegment, cleanFilename)
    }
  }

  const handleDownloadReport = () => {
    if (transcriptionResult?.fullTranscript) {
      downloadEnhancedReport(transcriptionResult, cleanFilename, file)
    }
  }

  const handleDownloadJSON = () => {
    if (transcriptionResult?.fullTranscript) {
      downloadJSON(transcriptionResult, cleanFilename, file)
    }
  }

  const handleDownloadVTT = () => {
    if (transcriptionResult?.segments && transcriptionResult.segments.length > 0) {
      downloadVTT(transcriptionResult.segments, cleanFilename)
    } else if (transcriptionResult?.fullTranscript) {
      // Create a single segment if no segments available
      const singleSegment = [{
        text: transcriptionResult.fullTranscript,
        start: 0,
        end: file.duration ? file.duration * 60 : 300 // Default to 5 minutes if no duration
      }]
      downloadVTT(singleSegment, cleanFilename)
    }
  }

  const handleCopyToClipboard = async () => {
    if (transcriptionResult?.fullTranscript) {
      const success = await copyToClipboard(transcriptionResult.fullTranscript)
      setCopySuccess(success)
      setTimeout(() => setCopySuccess(null), 3000) // Reset after 3 seconds
    }
  }

  // Calculate estimated file sizes
  const getEstimatedSize = (format: string) => {
    if (!transcriptionResult?.fullTranscript) return "N/A"
    const textLength = transcriptionResult.fullTranscript.length
    switch (format) {
      case 'TXT':
        return `${Math.round(textLength / 1024)} KB`
      case 'SRT':
      case 'VTT':
        return `${Math.round(textLength * 1.5 / 1024)} KB`
      case 'JSON':
        return `${Math.round(textLength * 2.5 / 1024)} KB`
      case 'Report':
        return `${Math.round(textLength * 2 / 1024)} KB`
      default:
        return "N/A"
    }
  }

  const downloadFormats = [
    {
      format: "TXT",
      description: "Plain text format, perfect for editing and copying",
      size: getEstimatedSize('TXT'),
      icon: FileText,
      handler: handleDownloadTXT,
      available: !!transcriptionResult?.fullTranscript
    },
    {
      format: "SRT Subtitles",
      description: "Subtitle file with timestamps for video editing",
      size: getEstimatedSize('SRT'),
      icon: Video,
      handler: handleDownloadSRT,
      available: !!(transcriptionResult?.segments || transcriptionResult?.fullTranscript)
    },
    {
      format: "VTT Subtitles",
      description: "WebVTT format for web video players",
      size: getEstimatedSize('VTT'),
      icon: Video,
      handler: handleDownloadVTT,
      available: !!(transcriptionResult?.segments || transcriptionResult?.fullTranscript)
    },
    {
      format: "JSON Data",
      description: "Structured data with metadata and segments",
      size: getEstimatedSize('JSON'),
      icon: FileJson,
      handler: handleDownloadJSON,
      available: !!transcriptionResult?.fullTranscript
    },
    {
      format: "Enhanced Report",
      description: "Detailed report with metadata and timestamps",
      size: getEstimatedSize('Report'),
      icon: FileCheck,
      handler: handleDownloadReport,
      available: !!transcriptionResult?.fullTranscript
    },
  ]

  const handleDownloadAll = () => {
    downloadFormats.forEach(format => {
      if (format.available) {
        setTimeout(() => format.handler(), 100 * downloadFormats.indexOf(format))
      }
    })
  }

  const generateEnhancedReport = (result: TranscriptionResult): string => {
    const report = {
      metadata: {
        fileName: file.name || 'Unknown',
        processingDate: new Date().toISOString(),
        duration: result.duration || file.duration || 0,
        fileSize: file.size || 0,
        processingTime: result.processingTime || 0,
        confidence: result.confidence || 0,
        language: result.language || 'en',
        model: 'whisper-1'
      },
      transcription: {
        fullText: result.transcript,
        wordCount: result.transcript.split(/\s+/).length,
        sentences: result.transcript.split(/[.!?]+/).filter((s: string) => s.trim().length > 0).length,
        avgWordsPerSentence: Math.round(result.transcript.split(/\s+/).length / Math.max(1, result.transcript.split(/[.!?]+/).filter((s: string) => s.trim().length > 0).length))
      },
      analysis: {
        readingTime: Math.ceil(result.transcript.split(/\s+/).length / 200), // Average reading speed
        speakingRate: result.duration ? Math.round(result.transcript.split(/\s+/).length / (result.duration / 60)) : 0, // Words per minute
        complexity: result.transcript.split(/\s+/).filter((word: string) => word.length > 6).length, // Long words count
        keyPhrases: extractKeyPhrases(result.transcript)
      },
      quality: {
        confidence: `${(result.confidence * 100).toFixed(1)}%`,
        rating: result.confidence > 0.9 ? 'Excellent' : result.confidence > 0.8 ? 'Good' : result.confidence > 0.7 ? 'Fair' : 'Poor',
        recommendations: getQualityRecommendations(result.confidence)
      }
    }
    
    return JSON.stringify(report, null, 2)
  }

  const extractKeyPhrases = (text: string): string[] => {
    // Simple key phrase extraction - in production would use NLP libraries
    const words = text.toLowerCase().split(/\s+/)
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall', 'this', 'that', 'these', 'those'])
    
    const wordFreq = new Map<string, number>()
    words.forEach(word => {
      const clean = word.replace(/[^\w]/g, '')
      if (clean.length > 3 && !stopWords.has(clean)) {
        wordFreq.set(clean, (wordFreq.get(clean) || 0) + 1)
      }
    })
    
    return Array.from(wordFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word)
  }

  const getQualityRecommendations = (confidence: number): string[] => {
    const recommendations = []
    
    if (confidence < 0.7) {
      recommendations.push("Consider using higher quality audio recording")
      recommendations.push("Reduce background noise in future recordings")
      recommendations.push("Ensure clear speech and proper microphone distance")
    }
    
    if (confidence < 0.8) {
      recommendations.push("Review transcription for potential errors")
      recommendations.push("Consider manual verification for important content")
    }
    
    if (confidence > 0.9) {
      recommendations.push("Excellent audio quality - transcription is highly reliable")
    }
    
    return recommendations
  }

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
                <p className="text-sm font-medium">{file.duration || 'N/A'} min</p>
                <p className="text-xs text-gray-500">Duration</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <Users className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <p className="text-sm font-medium">{transcriptionResult?.speakerCount || 'Unknown'}</p>
                <p className="text-xs text-gray-500">Speakers</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <Star className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <p className="text-sm font-medium">
                  {transcriptionResult?.confidence ? `${(transcriptionResult.confidence * 100).toFixed(1)}%` : 'N/A'}
                </p>
                <p className="text-xs text-gray-500">Accuracy</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <Clock className="h-5 w-5 text-gray-600 mx-auto mb-1" />
                <p className="text-sm font-medium">
                  {formatProcessingDuration(processingJob.startedAt, processingJob.completedAt)}
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
                        <h4 className="font-medium text-gray-900">{format.format}</h4>
                        <p className="text-sm text-gray-500">{format.description}</p>
                        <p className="text-xs text-gray-400">File size: {format.size}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="flex items-center gap-2"
                      onClick={format.handler}
                      disabled={!format.available}
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-6" />

            {/* Quick Actions */}
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <h4 className="font-medium text-blue-900 mb-3">Download All Formats</h4>
              <Button 
                size="lg" 
                className="flex items-center gap-2 mx-auto"
                onClick={handleDownloadAll}
                disabled={!transcriptionResult?.fullTranscript}
              >
                <Download className="h-4 w-4" />
                Download All Files
              </Button>
              <p className="text-xs text-blue-700 mt-2">
                Downloads all available formats (TXT, SRT, VTT, JSON, Report)
              </p>
            </div>

            <p className="text-sm text-gray-500 text-center">
              All files will be automatically deleted from our servers in 24 hours for your privacy.
            </p>
          </CardContent>
        </Card>

        {/* Full Transcript Display */}
        {transcriptionResult?.fullTranscript && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Your Transcript</CardTitle>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={handleCopyToClipboard}
                >
                  <Copy className="h-4 w-4" />
                  {copySuccess === true ? 'Copied!' : copySuccess === false ? 'Failed' : 'Copy'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-6 rounded-lg border-2 border-dashed border-gray-200">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                  {transcriptionResult.fullTranscript}
                </p>
              </div>
              <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                <span>
                  {transcriptionResult.fullTranscript.split(' ').length} words • 
                  {transcriptionResult.fullTranscript.length} characters
                </span>
                <span>
                  Confidence: {transcriptionResult.confidence ? (transcriptionResult.confidence * 100).toFixed(1) + '%' : 'N/A'}
                </span>
              </div>
              {copySuccess === true && (
                <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-700">
                  ✓ Text copied to clipboard successfully!
                </div>
              )}
              {copySuccess === false && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  ✗ Failed to copy text. Please try selecting and copying manually.
                </div>
              )}
            </CardContent>
          </Card>
        )}

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
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/upload'}>
                Transcribe Another File
              </Button>
              <Button variant="outline" size="sm" onClick={() => window.location.href = 'mailto:support@transcribefree.online'}>
                Contact Support
              </Button>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
