"use client"

import type React from "react"

import { useState, useCallback, useRef, useEffect } from "react"

// Extend Window interface for garbage collection
declare global {
  interface Window {
    gc?: () => void
  }
}
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Upload, Loader2, X, Play, FileVideo, FileAudio, RotateCcw, Settings, Zap, CheckCircle, Info } from "lucide-react"
import type { UploadedFile } from "@/types/transcription"
import { getOptimalProcessingOptions, convertAudioFormat, canProcessAudio, shouldSkipConversion, createPassThroughConversion, type ProcessingResult } from "@/lib/audio-processor"
import { getFileDuration, needsConversion, formatFileSize, formatDuration } from '@/lib/file-utils'
import { createPreviewVersion } from '../../lib/audio-processor'
import { PricingExplainer } from "@/components/pricing-explainer"

interface FileUploadStepProps {
  onFileProcessed: (file: UploadedFile) => void
  onFileContinue?: () => void
  uploadedFile?: UploadedFile | null
  onFileRemoved?: () => void
}

const SUPPORTED_FORMATS = ["MP4", "MOV", "AVI", "MP3", "WAV", "M4A", "AAC", "FLAC", "WMV", "AIFF", "WMA"]
const PRICE_PER_MINUTE = 0.18

export function FileUploadStep({ onFileProcessed, onFileContinue, uploadedFile, onFileRemoved }: FileUploadStepProps) {
  const [isDragActive, setIsDragActive] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isConverting, setIsConverting] = useState(false)
  const [conversionProgress, setConversionProgress] = useState("")
  const [localUploadedFile, setLocalUploadedFile] = useState<UploadedFile | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0) // Force file input re-render
  const fileInputRef = useRef<HTMLInputElement>(null)
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null)
  const [processingStep, setProcessingStep] = useState('')
  const [processingProgress, setProcessingProgress] = useState(0)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [canPlayPreview, setCanPlayPreview] = useState<boolean | null>(null)
      const [isTestingPreview, setIsTestingPreview] = useState(false)

  // Initialize from props
  useEffect(() => {
    if (uploadedFile && !localUploadedFile) {
      // Ensure the uploaded file has a cost calculated
      const fileWithCost = {
        ...uploadedFile,
        cost: uploadedFile.cost || calculateCost(uploadedFile.duration)
      }
      setLocalUploadedFile(fileWithCost)
      
      // Test preview for MOV files
      if (uploadedFile.file && (uploadedFile.type.includes('quicktime') || uploadedFile.name.toLowerCase().endsWith('.mov'))) {
        testMovPreview(uploadedFile.file)
      } else {
        setCanPlayPreview(true)
      }
    }
  }, [uploadedFile, localUploadedFile])

  // Comprehensive cleanup effect to prevent memory leaks
  useEffect(() => {
    return () => {
      console.log('🧹 Component cleanup effect triggered')
      if (localUploadedFile?.url) {
        try {
          URL.revokeObjectURL(localUploadedFile.url)
          console.log('🔗 Cleanup: Revoked file URL on unmount')
        } catch (e) {
          console.warn('⚠️ Cleanup: Failed to revoke URL on unmount:', e)
        }
      }
      
      // Also clean up media element if it exists
      if (mediaRef.current) {
        const mediaElement = mediaRef.current
        try {
          mediaElement.pause()
          mediaElement.removeAttribute('src')
          mediaElement.load()
          console.log('🎵 Cleanup: Media element cleared on unmount')
        } catch (e) {
          console.warn('⚠️ Cleanup: Failed to clear media element:', e)
        }
      }
    }
  }, [localUploadedFile?.url])

  // Sync with parent component's uploadedFile prop
  useEffect(() => {
    if (!uploadedFile && localUploadedFile) {
      // Parent has cleared the file, clear local state too
      setLocalUploadedFile(null)
      setError(null)
      setIsProcessing(false)
      setIsConverting(false)
      setConversionProgress("")
    }
  }, [uploadedFile, localUploadedFile])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const handleRemoveFile = () => {
    console.log('🗑️ Starting comprehensive file cleanup...')
    
    // 1. PROPER URL CLEANUP - Revoke all object URLs
    if (localUploadedFile) {
      // Revoke the main URL if it exists
      if (localUploadedFile.url) {
        console.log('🔗 Revoking main file URL:', localUploadedFile.url)
        try {
          URL.revokeObjectURL(localUploadedFile.url)
        } catch (e) {
          console.warn('⚠️ Failed to revoke main URL:', e)
        }
      }
      
      // Revoke any temporary URLs that might have been created
      try {
        const tempUrl = URL.createObjectURL(localUploadedFile.file)
        URL.revokeObjectURL(tempUrl)
        console.log('🔗 Revoked temporary URL')
      } catch (e) {
        // This is expected if no temp URL was created
      }
    }
    
    // 2. FILE INPUT RESET - Clear input and force browser to forget the file
    if (fileInputRef.current) {
      console.log('📁 Resetting file input...')
      fileInputRef.current.value = ''
      fileInputRef.current.type = 'text' // Temporarily change type
      fileInputRef.current.type = 'file'  // Change back to force reset
      
      // Also clear any cached file references
      const form = fileInputRef.current.form
      if (form) {
        form.reset()
      }
    }
    
    // 3. COMPLETE STATE RESET - Clear all component state
    console.log('🧹 Clearing all component state...')
    setLocalUploadedFile(null)
    setError(null)
    setIsProcessing(false)
    setIsConverting(false)
    setConversionProgress("")
    setIsDragActive(false)
    setFileInputKey(prev => prev + 1) // Force file input re-render
    
    // 4. MEDIA ELEMENT CLEANUP - Clear any media references
    if (mediaRef.current) {
      console.log('🎵 Cleaning up media element...')
      const mediaElement = mediaRef.current
      mediaElement.pause()
      mediaElement.removeAttribute('src')
      mediaElement.load() // Force reload to clear cache
    }
    
    // 5. FORCE GARBAGE COLLECTION (if available)
    if (window.gc && typeof window.gc === 'function') {
      try {
        window.gc()
        console.log('🗑️ Forced garbage collection')
      } catch (e) {
        // Garbage collection not available
      }
    }
    
    // 6. NOTIFY PARENT COMPONENT
    console.log('📤 Notifying parent component of file removal')
    onFileRemoved?.()
    
    console.log('✅ File cleanup completed successfully')
  }

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

  const estimateDuration = (file: File): Promise<{ seconds: number; minutes: number }> => {
    return new Promise((resolve) => {
      if (file.type.startsWith("video/") || file.type.startsWith("audio/")) {
        const mediaElement = file.type.startsWith("video/") 
          ? document.createElement("video")
          : document.createElement("audio")
        
        mediaElement.preload = "metadata"
        
        let timeoutId: NodeJS.Timeout | null = null
        
        // Set timeout for media loading
                 timeoutId = setTimeout(() => {
           URL.revokeObjectURL(mediaElement.src)
           
           // Fallback estimation based on file size and type
           let estimatedSeconds: number
           if (file.type.startsWith("video/")) {
             // For video: roughly 2MB per minute (conservative estimate)
             estimatedSeconds = Math.max(60, Math.round(file.size / (1024 * 1024 * 2)) * 60)
           } else {
             // For audio: roughly 128KB per minute
             estimatedSeconds = Math.max(60, Math.round(file.size / (1024 * 128)) * 60)
           }
           
           resolve({ seconds: estimatedSeconds, minutes: estimatedSeconds / 60 })
         }, 10000) // 10 second timeout
        
        mediaElement.onloadedmetadata = () => {
          if (timeoutId) {
            clearTimeout(timeoutId)
            timeoutId = null
          }
          URL.revokeObjectURL(mediaElement.src)
          
                     if (mediaElement.duration && mediaElement.duration > 0 && !isNaN(mediaElement.duration)) {
            const durationSeconds = Math.max(1, Math.round(mediaElement.duration))
            const durationMinutes = durationSeconds / 60
            resolve({ seconds: durationSeconds, minutes: durationMinutes })
           } else {
             // Duration is 0, NaN, or invalid - use fallback
            let estimatedSeconds: number
             if (file.type.startsWith("video/")) {
              estimatedSeconds = Math.max(60, Math.round(file.size / (1024 * 1024 * 2)) * 60)
             } else {
              estimatedSeconds = Math.max(60, Math.round(file.size / (1024 * 128)) * 60)
             }
            resolve({ seconds: estimatedSeconds, minutes: estimatedSeconds / 60 })
           }
        }
        
                 mediaElement.onerror = (error) => {
           if (timeoutId) {
             clearTimeout(timeoutId)
             timeoutId = null
           }
           URL.revokeObjectURL(mediaElement.src)
           
           // Fallback estimation based on file size
          let estimatedSeconds: number
           if (file.type.startsWith("video/")) {
            estimatedSeconds = Math.max(60, Math.round(file.size / (1024 * 1024 * 2)) * 60) // 2MB per minute for video
           } else {
            estimatedSeconds = Math.max(60, Math.round(file.size / (1024 * 128)) * 60) // 128KB per minute for audio
           }
          resolve({ seconds: estimatedSeconds, minutes: estimatedSeconds / 60 })
         }
        
        mediaElement.src = URL.createObjectURL(file)
      } else {
                 // Non-media file fallback
        const estimatedSeconds = Math.max(60, Math.round(file.size / (1024 * 128)) * 60)
        resolve({ seconds: estimatedSeconds, minutes: estimatedSeconds / 60 })
      }
    })
  }

  const calculateCost = (durationMinutes: number): number => {
    // Round duration to nearest 0.1 minutes (6 seconds) for fair pricing
    const roundedMinutes = Math.ceil(durationMinutes * 10) / 10; // Rounds to nearest 0.1 minutes
    return Math.max(0.50, roundedMinutes * PRICE_PER_MINUTE); // Minimum $0.50 (Stripe requirement)
  }

  const processFile = async (file: File) => {
    try {
      setIsProcessing(true)
      setError(null)
      setProcessingStep('Analyzing file...')
      setProcessingProgress(10)

      // Test preview compatibility for MOV files
      await testMovPreview(file)
      setProcessingProgress(20)

      // Get duration first
      setProcessingStep('Reading file duration...')
      const durationResult = await estimateDuration(file)
      setProcessingProgress(40)

      // Check if file needs conversion
      setProcessingStep('Checking format compatibility...')
      const needsAudioConversion = needsConversion(file.name, file.type)
      setProcessingProgress(60)

      let processedFile: File
      let finalType = file.type

      if (needsAudioConversion) {
        setProcessingStep('Converting for compatibility...')
        setProcessingProgress(70)
        
        // For MOV files, create pass-through conversion with proper naming for API
        if (file.type === 'video/quicktime' || file.name.toLowerCase().endsWith('.mov')) {
          console.log('Processing MOV file for transcription...')
          
          // For transcription, we create a pass-through file that signals to the API 
          // that it should be treated as MP4 for OpenAI compatibility
          const convertedFileName = file.name.replace(/\.mov$/i, '_converted.mov')
          
          processedFile = new File([file], convertedFileName, {
            type: 'video/quicktime', // Keep original type for now
            lastModified: file.lastModified
          })
          
          // Add special properties to signal API conversion needed
          ;(processedFile as any).__needsMimeConversion = true
          ;(processedFile as any).__apiMimeType = 'video/mp4'
          
          finalType = 'video/quicktime' // Keep original for preview
          console.log('MOV file prepared for transcription with API conversion flags')
        } else {
          // Regular audio conversion
          const result = await convertAudioFormat(file, {
            targetFormat: 'mp3',
            quality: 'medium',
            noiseReduction: false,
            volumeNormalization: true,
            fastMode: true
          }, (message) => setProcessingStep(message))
          
          if (!result.success || !result.processedFile) {
            throw new Error(result.error || 'Audio conversion failed')
          }
          
          processedFile = result.processedFile
          finalType = 'audio/mp3'
        }
        setProcessingProgress(90)
      } else {
        processedFile = file
      }

      setProcessingStep('Finalizing...')
      setProcessingProgress(100)

      // Calculate cost based on duration
      const cost = calculateCost(durationResult.minutes)

      // Create the uploaded file object
      const uploadedFile: UploadedFile = {
        id: Date.now().toString(),
        name: file.name,
        size: processedFile.size,
        type: finalType,
        file: processedFile,
        duration: durationResult.minutes,
        durationSeconds: durationResult.seconds,
        cost,
        uploadedAt: new Date(),
        status: 'ready'
      }

      setLocalUploadedFile(uploadedFile)
      onFileProcessed?.(uploadedFile)
      
      // Clean up
      setTimeout(() => {
        setIsProcessing(false)
        setProcessingStep('')
        setProcessingProgress(0)
      }, 500)

    } catch (error: any) {
      console.error('File processing error:', error)
      
      // Handle specific error types with user-friendly messages
      let errorMessage = error.message || 'Failed to process file'
      
      if (error.message?.includes('aborted') || error.message?.includes('abort')) {
        errorMessage = `File processing was interrupted. This can happen if:\n• The file is corrupted or incomplete\n• Your internet connection is unstable\n• The browser ran out of memory\n\nTry:\n• Refreshing the page and trying again\n• Using a smaller file\n• Converting the file to MP4/MP3 format first`
      } else if (error.message?.includes('timeout') || error.message?.includes('Timeout')) {
        errorMessage = `Processing timed out. This usually means:\n• The file is very large or complex\n• The file format is not fully supported\n• Your device is running low on resources\n\nTry:\n• Using a smaller file (under 100MB recommended)\n• Converting to MP4/MP3 format first\n• Closing other browser tabs to free up memory`
      } else if (error.message?.includes('decode') || error.message?.includes('codec')) {
        errorMessage = `Cannot decode this file format. Try:\n• Converting to MP4 (video) or MP3 (audio) format\n• Using a different browser (Chrome/Firefox/Safari support different codecs)\n• Re-exporting the file from your original software`
      } else if (error.message?.includes('network') || error.message?.includes('Network')) {
        errorMessage = `Network error during processing. Try:\n• Checking your internet connection\n• Refreshing the page\n• Uploading a smaller file`
      }
      
      setError(errorMessage)
    }
  }

  // Get user-friendly error message based on conversion result
  const getConversionErrorMessage = (result: any): string => {
    if (!result.error) return "Unknown conversion error"
    
    switch (result.errorType) {
      case 'codec':
        return `Unsupported audio format: ${result.error}\n\nThis file uses a codec that your browser cannot decode. Try:\n• Converting the file to MP3 or WAV format first\n• Using a different browser (Chrome/Firefox/Safari have different codec support)\n• Uploading a different file format`
      
      case 'memory':
        return `File too large for browser processing: ${result.error}\n\nTry:\n• Using a smaller file (under 100MB recommended)\n• Compressing the audio/video quality\n• Closing other browser tabs to free up memory`
      
      case 'corruption':
        return `File appears to be corrupted: ${result.error}\n\nTry:\n• Re-downloading or re-exporting the original file\n• Checking if the file plays correctly in other apps\n• Using a different file format`
      
      case 'network':
        return `Network error during processing: ${result.error}\n\nTry:\n• Checking your internet connection\n• Refreshing the page and trying again\n• Uploading a smaller file`
      
      default:
        return `Format conversion failed: ${result.error}\n\nTry:\n• Converting to MP3 or WAV format first\n• Using a different file\n• Refreshing the page and trying again`
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
    console.log('📁 File input changed')
    const files = e.target.files
    if (files && files.length > 0) {
      console.log('📁 Processing selected file:', files[0].name)
      await processFile(files[0])
      
      // Clear the input value after processing to prevent cache issues
      if (e.target) {
        e.target.value = ''
      }
    }
  }

  // Test if MOV file can be previewed in browser
  const testMovPreview = async (file: File) => {
    if (!file.type.includes('quicktime') && !file.name.toLowerCase().endsWith('.mov')) {
      setCanPlayPreview(true)
      return
    }

    setIsTestingPreview(true)
    setCanPlayPreview(null)

    try {
      const video = document.createElement('video')
      const url = URL.createObjectURL(file)
      
      const canPlay = await new Promise<boolean>((resolve) => {
        const timeout = setTimeout(() => {
          URL.revokeObjectURL(url)
          resolve(false)
        }, 3000)
        
        video.onloadedmetadata = () => {
          clearTimeout(timeout)
          URL.revokeObjectURL(url)
          resolve(video.duration > 0 && !isNaN(video.duration))
        }
        
        video.onerror = () => {
          clearTimeout(timeout)
          URL.revokeObjectURL(url)
          resolve(false)
        }
        
        video.src = url
        video.preload = 'metadata'
      })
      
      setCanPlayPreview(canPlay)
    } catch (error) {
      console.error('Error testing MOV preview:', error)
      setCanPlayPreview(false)
    } finally {
      setIsTestingPreview(false)
    }
  }

  // Show file preview if uploaded
  if (localUploadedFile) {
    const isVideo = localUploadedFile.type.startsWith("video/")
    const FileIcon = isVideo ? FileVideo : FileAudio
    
    // Create fresh URL for preview
    const fileUrl = URL.createObjectURL(localUploadedFile.file)
    
    

    return (
      <div className="max-w-4xl mx-auto">
        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  File Processing Error
                </h3>
                <div className="mt-2 text-sm text-red-700 whitespace-pre-line">
                  {error}
                </div>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setError(null)}
                  className="inline-flex rounded-md bg-red-50 p-1.5 text-red-400 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* File Preview Interface - Clean Layout */}
        <Card>
          <CardContent className="p-8">
            {/* File Preview Header */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Play className="h-5 w-5 text-blue-600" />
                <h2 className="text-xl font-semibold">File Preview</h2>
              </div>
              
              {/* Media Player */}
              <div className="bg-gray-100 rounded-lg p-8 mb-8">
                {isVideo ? (
                  <div className="relative">
                    {isTestingPreview && (
                      <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10 rounded">
                        <div className="text-center">
                          <div className="animate-spin h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                          <p className="text-sm text-gray-600">Testing video compatibility...</p>
                        </div>
                      </div>
                    )}
                    
                    <video
                      ref={mediaRef as React.RefObject<HTMLVideoElement>}
                      src={fileUrl}
                      controls
                      className="w-full max-h-64 mx-auto rounded"
                      preload="metadata"
                      crossOrigin="anonymous"
                      onError={(e) => {
                        console.error('Video playback error:', e)
                        const video = e.target as HTMLVideoElement
                        if (video.error) {
                          console.error('MediaError code:', video.error.code, 'message:', video.error.message)
                        }
                      }}
                    >
                      Your browser does not support the video tag.
                    </video>
                    
                    {/* Preview Status Indicator */}
                    {canPlayPreview !== null && (
                      <div className="mt-4">
                        {canPlayPreview ? (
                          <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
                            <CheckCircle className="h-5 w-5" />
                            <div>
                              <p className="font-medium">Video Preview Available</p>
                              <p className="text-sm">You can verify your content by playing the video above.</p>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                            <div className="flex items-start gap-3">
                              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                              <div>
                                <h4 className="font-medium text-blue-900 mb-2">Video Preview Not Available</h4>
                                <p className="text-sm text-blue-800 mb-3">
                                  This MOV file uses codecs that can't be played directly in your browser, but it will be processed correctly for transcription.
                                </p>
                                
                                {/* File Verification Info */}
                                <div className="bg-white p-3 rounded border">
                                  <h5 className="font-medium text-gray-900 mb-2">File Details for Verification:</h5>
                                  <div className="space-y-1 text-sm text-gray-600">
                                    <p><span className="font-medium">File Name:</span> {localUploadedFile.name}</p>
                                    <p><span className="font-medium">File Size:</span> {formatFileSize(localUploadedFile.size)}</p>
                                    <p><span className="font-medium">Duration:</span> ~{localUploadedFile.duration} minutes</p>
                                    <p><span className="font-medium">Format:</span> MOV video file</p>
                                  </div>
                                </div>
                                
                                <p className="text-xs text-blue-700 mt-2">
                                  ✓ File has been validated and is ready for transcription
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    <audio
                      ref={mediaRef as React.RefObject<HTMLAudioElement>}
                      src={fileUrl}
                      controls
                      className="w-full max-w-md mx-auto"
                      preload="metadata"
                      onError={(e) => {
                        console.error('Audio playback error:', e)
                        const audio = e.target as HTMLAudioElement
                        if (audio.error) {
                          console.error('MediaError code:', audio.error.code, 'message:', audio.error.message)
                        }
                      }}
                    >
                      Your browser does not support audio playback.
                    </audio>
                    <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded">
                      {localUploadedFile.type}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* File Info */}
            <div className="bg-blue-50 rounded-lg p-4 mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FileIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-gray-900">{localUploadedFile.name}</h3>
                      {localUploadedFile.name.includes('_converted') && (
                        <Badge 
                          variant="outline" 
                          className="text-xs bg-orange-50 text-orange-700 border-orange-200"
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Enhanced
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                                              {formatFileSize(localUploadedFile.size)} • {formatDuration(localUploadedFile.duration)} • ${(localUploadedFile.cost || calculateCost(localUploadedFile.duration)).toFixed(2)}
                    </p>
                  </div>
                </div>
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Ready to Process
                </Badge>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="mb-4">
              <PricingExplainer 
                duration={localUploadedFile.duration} 
                cost={localUploadedFile.cost || calculateCost(localUploadedFile.duration)} 
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <Button
                variant="outline"
                onClick={handleRemoveFile}
                className="flex items-center justify-center gap-2 flex-1"
              >
                <X className="h-4 w-4" />
                Remove & Upload Different File
              </Button>
              <Button
                onClick={() => onFileContinue ? onFileContinue() : onFileProcessed(localUploadedFile)}
                className="flex items-center justify-center gap-2 flex-1 bg-black text-white hover:bg-gray-800"
              >
                Continue with This File
              </Button>
            </div>

            {/* Helper Text */}
            <p className="text-center text-sm text-gray-500">
              You can preview your file to make sure it's the right one before continuing.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show processing state if processing
  if (isProcessing) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Processing Your File</h2>
          <p className="text-gray-600 mb-4">{processingStep}</p>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
              style={{ width: `${processingProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-500">{processingProgress}% complete</p>
        </div>
      </div>
    )
  }

  // Show upload interface
  return (
    <div className="max-w-4xl mx-auto">
      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <X className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-red-800">
                File Processing Error
              </h3>
              <div className="mt-2 text-sm text-red-700 whitespace-pre-line">
                {error}
              </div>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setError(null)}
                className="inline-flex rounded-md bg-red-50 p-1.5 text-red-400 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Interface */}
      {!localUploadedFile && (
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
              onClick={() => !(isProcessing || isConverting) && fileInputRef.current?.click()}
            >
              <CardContent className="p-12">
                <div className="text-center space-y-6">
                  <div
                    className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
                      isDragActive ? "bg-blue-100" : "bg-gray-100"
                    }`}
                  >
                    {isProcessing || isConverting ? (
                      isConverting ? (
                        <Settings className="h-10 w-10 text-orange-600 animate-spin" />
                      ) : (
                        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
                      )
                    ) : (
                      <Upload className={`h-10 w-10 ${isDragActive ? "text-blue-600" : "text-gray-600"}`} />
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-semibold text-gray-900">
                      {isConverting
                        ? "Enhancing Audio Quality..."
                        : isProcessing
                        ? "Processing your file..."
                        : isDragActive
                          ? "Drop your file here"
                          : "Upload your video or audio file"}
                    </h3>
                    <p className="text-gray-600">
                      {isConverting
                        ? conversionProgress || "Applying noise reduction, volume normalization & format optimization"
                        : isProcessing
                        ? "Please wait while we analyze your file"
                        : "Drag and drop a file here, or click to browse"}
                    </p>
                  </div>

                  {!(isProcessing || isConverting) && (
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
                        Maximum file size: 2GB • $0.18 per minute • Free 15-second preview
                      </p>
                    </>
                  )}

                  <input
                    key={fileInputKey}
                    ref={fileInputRef}
                    type="file"
                    accept=".mp4,.mov,.avi,.mp3,.wav,.m4a,.aac,.flac,.ogg,.webm,video/mp4,video/quicktime,video/x-msvideo,audio/mpeg,audio/wav,audio/m4a,audio/x-m4a,audio/mp4,audio/aac,audio/flac,audio/ogg,audio/webm"
                    onChange={handleFileInput}
                    className="hidden"
                    disabled={isProcessing || isConverting}
                  />
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
