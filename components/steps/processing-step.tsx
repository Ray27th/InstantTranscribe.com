"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Mail, FileVideo, FileAudio, CheckCircle, Loader2, Timer, AlertCircle } from "lucide-react"
import type { UploadedFile, ProcessingJob } from "@/types/transcription"

interface TranscriptionResult {
  fullTranscript: string
  confidence: number
  segments?: Array<{
    text: string
    start: number
    end: number
  }>
  speakerCount?: number
}

interface ProcessingStepProps {
  file: UploadedFile
  onProcessingStarted: (job: ProcessingJob) => void
  processingJob: ProcessingJob | null
  onProcessingCompleted: (result: TranscriptionResult) => void
}

export function ProcessingStep({
  file,
  onProcessingStarted,
  processingJob,
  onProcessingCompleted,
}: ProcessingStepProps) {
  const [email, setEmail] = useState("")
  const [emailSubmitted, setEmailSubmitted] = useState(false)
  const [isTranscribing, setIsTranscribing] = useState(false)

  // Calculate initial ETA based on file duration
  const calculateInitialETA = (duration: number) => {
    // Base processing time: ~30 seconds per minute of audio
    // Add some variance for different file types and complexity
    const baseTime = duration * 30 // 30 seconds per minute
    const variance = Math.random() * 60 + 30 // Add 30-90 seconds variance
    return Math.round(baseTime + variance)
  }

  useEffect(() => {
    // Start processing automatically when component mounts
    if (!processingJob) {
      const initialETA = calculateInitialETA(file.duration)
      const job: ProcessingJob = {
        id: Date.now().toString(),
        fileId: file.id || file.name || Date.now().toString(),
        status: "processing",
        progress: 0,
        estimatedTimeRemaining: initialETA,
        startedAt: new Date(),
      }
      onProcessingStarted(job)
    }
  }, [])

  useEffect(() => {
    if (processingJob && processingJob.status === "processing" && !isTranscribing) {
      setIsTranscribing(true)
      
      // Call the real transcription API
      const transcribeFile = async () => {
        try {
          const formData = new FormData()
          formData.append('file', file.file)
          formData.append('isPreview', 'false') // Full transcription
          
          console.log('Starting full transcription for:', file.name)
          
          const response = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
          })
          
          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || 'Transcription failed')
          }
          
          const result = await response.json()
          console.log('Full transcription result:', result)
          
          // Create transcription result
          const transcriptionResult: TranscriptionResult = {
            fullTranscript: result.transcript,
            confidence: result.confidence || 0.9,
            segments: result.segments || [],
            speakerCount: 1 // Default to 1 speaker for now
          }
          
          // Update progress to 100% and complete
          onProcessingStarted({
            ...processingJob,
            progress: 100,
            estimatedTimeRemaining: 0,
            status: "completed",
            completedAt: new Date()
          })
          
          // Wait a moment then complete with results
          setTimeout(() => {
            onProcessingCompleted(transcriptionResult)
          }, 1500)
          
        } catch (error) {
          console.error('Transcription failed:', error)
          
          // Mark as failed and show error
          onProcessingStarted({
            ...processingJob,
            progress: 0,
            estimatedTimeRemaining: 0,
            status: "failed",
            completedAt: new Date()
          })
        }
      }
      
      // Start transcription after a short delay
      setTimeout(transcribeFile, 2000)
    }
    
    // Simulate progress updates while transcribing
    if (processingJob && processingJob.status === "processing" && processingJob.progress < 100) {
      const interval = setInterval(() => {
        const newProgress = Math.min(processingJob.progress + Math.random() * 8 + 2, 95) // Cap at 95% until real completion
        const newTimeRemaining = Math.max(0, processingJob.estimatedTimeRemaining - 5)

        onProcessingStarted({
          ...processingJob,
          progress: newProgress,
          estimatedTimeRemaining: newTimeRemaining,
        })
      }, 2000) // Slower updates while actually processing

      return () => clearInterval(interval)
    }
  }, [processingJob, isTranscribing])

  const handleEmailSubmit = () => {
    setEmailSubmitted(true)
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) {
      return `${seconds} seconds`
    }
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    if (mins < 60) {
      return secs > 0 ? `${mins}m ${secs}s` : `${mins} minutes`
    }
    const hours = Math.floor(mins / 60)
    const remainingMins = mins % 60
    return `${hours}h ${remainingMins}m`
  }

  const getETACategory = (seconds: number) => {
    if (seconds <= 60) return { category: "quick", color: "green", message: "Almost done!" }
    if (seconds <= 180) return { category: "medium", color: "yellow", message: "A few more minutes" }
    if (seconds <= 600) return { category: "long", color: "orange", message: "This will take a while" }
    return { category: "very-long", color: "red", message: "This is a long transcription" }
  }

  const FileIcon = file.type.startsWith("video/") ? FileVideo : FileAudio

  if (!processingJob) return null

  const etaInfo = getETACategory(processingJob.estimatedTimeRemaining)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Step 4: Processing Your Transcription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* File Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-4">
              <FileIcon className="h-10 w-10 text-blue-600" />
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{file.name}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{file.duration} minutes</span>
                  <Badge className="bg-green-600">Payment Confirmed</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ETA Display - Prominent Section */}
        <Card
          className={`border-2 ${
            etaInfo.color === "green"
              ? "border-green-300 bg-green-50"
              : etaInfo.color === "yellow"
                ? "border-yellow-300 bg-yellow-50"
                : etaInfo.color === "orange"
                  ? "border-orange-300 bg-orange-50"
                  : "border-red-300 bg-red-50"
          }`}
        >
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                  etaInfo.color === "green"
                    ? "bg-green-100"
                    : etaInfo.color === "yellow"
                      ? "bg-yellow-100"
                      : etaInfo.color === "orange"
                        ? "bg-orange-100"
                        : "bg-red-100"
                }`}
              >
                <Timer
                  className={`h-8 w-8 ${
                    etaInfo.color === "green"
                      ? "text-green-600"
                      : etaInfo.color === "yellow"
                        ? "text-yellow-600"
                        : etaInfo.color === "orange"
                          ? "text-orange-600"
                          : "text-red-600"
                  }`}
                />
              </div>

              <div>
                <h3
                  className={`text-2xl font-bold mb-2 ${
                    etaInfo.color === "green"
                      ? "text-green-900"
                      : etaInfo.color === "yellow"
                        ? "text-yellow-900"
                        : etaInfo.color === "orange"
                          ? "text-orange-900"
                          : "text-red-900"
                  }`}
                >
                  {formatTime(processingJob.estimatedTimeRemaining)} remaining
                </h3>
                <p
                  className={`text-lg ${
                    etaInfo.color === "green"
                      ? "text-green-800"
                      : etaInfo.color === "yellow"
                        ? "text-yellow-800"
                        : etaInfo.color === "orange"
                          ? "text-orange-800"
                          : "text-red-800"
                  }`}
                >
                  {etaInfo.message}
                </p>
              </div>

              {/* Decision Helper */}
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">👀 Wait on this page</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Watch real-time progress</li>
                    <li>• Instant download when ready</li>
                    <li>• No email required</li>
                  </ul>
                  <Badge variant="outline" className="mt-2">
                    {etaInfo.category === "quick" ? "Recommended" : "If you have time"}
                  </Badge>
                </div>

                <div className="bg-white p-4 rounded-lg border">
                  <h4 className="font-semibold text-gray-900 mb-2">📧 Get email notification</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Close tab and continue your day</li>
                    <li>• Direct download link via email</li>
                    <li>• No waiting required</li>
                  </ul>
                  <Badge variant="outline" className="mt-2">
                    {etaInfo.category === "quick" ? "Optional" : "Recommended"}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Processing Status */}
        <Card>
          <CardContent className="p-6">
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                {processingJob.status === "completed" ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                )}
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {processingJob.status === "completed" ? "Transcription Complete!" : "AI is transcribing your file..."}
                </h3>
                <p className="text-gray-600">
                  {processingJob.status === "completed"
                    ? "Your transcription is ready for download!"
                    : "Our advanced AI is analyzing your audio and generating an accurate transcription with speaker identification and timestamps."}
                </p>
              </div>

              {processingJob.status === "processing" && (
                <div className="space-y-4 max-w-md mx-auto">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Transcription Progress</span>
                    <span>{Math.round(processingJob.progress)}%</span>
                  </div>
                  <Progress value={processingJob.progress} className="h-3" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Email Notification Section */}
        {processingJob.status === "processing" && (
          <Card
            className={`${
              etaInfo.category === "quick"
                ? "bg-blue-50 border-blue-200"
                : etaInfo.category === "medium"
                  ? "bg-yellow-50 border-yellow-200"
                  : "bg-gradient-to-r from-orange-50 to-red-50 border-orange-300"
            }`}
          >
            <CardHeader>
              <CardTitle
                className={`text-lg flex items-center gap-2 ${
                  etaInfo.category === "quick"
                    ? "text-blue-800"
                    : etaInfo.category === "medium"
                      ? "text-yellow-800"
                      : "text-orange-800"
                }`}
              >
                <Mail className="h-5 w-5" />
                {etaInfo.category === "quick"
                  ? "Optional: Get Email Notification"
                  : etaInfo.category === "medium"
                    ? "Recommended: Email Notification"
                    : "Highly Recommended: Email Notification"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {etaInfo.category !== "quick" && (
                  <div className="bg-white p-4 rounded-lg border border-orange-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-orange-900">
                          {etaInfo.category === "medium"
                            ? "This will take a few minutes"
                            : "This is a long transcription"}
                        </p>
                        <p className="text-sm text-orange-800">
                          {etaInfo.category === "medium"
                            ? "You might want to do something else while waiting."
                            : "We recommend getting an email notification so you don't have to wait."}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {etaInfo.category === "quick"
                      ? "Want to be notified anyway?"
                      : "Leave your email and we'll notify you when ready"}
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {etaInfo.category === "quick"
                      ? "Get an email notification just in case you want to close this tab."
                      : "Close this tab, grab a coffee, or continue with your day. We'll send you an email with a direct download link."}
                  </p>
                </div>

                {!emailSubmitted ? (
                  <div className="space-y-3">
                    <div className="flex gap-3">
                      <Input
                        type="email"
                        placeholder="Enter your email address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="flex-1 text-lg p-3"
                      />
                      <Button
                        onClick={handleEmailSubmit}
                        disabled={!email || !email.includes("@")}
                        size="lg"
                        className="px-6"
                      >
                        {etaInfo.category === "quick" ? "Set Notification" : "Notify Me"}
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      We'll only use your email for this notification. No spam, ever.
                    </p>
                  </div>
                ) : (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-green-900 mb-2">You're all set!</h4>
                    <p className="text-green-800 mb-3">
                      We'll email you at <strong>{email}</strong> when your transcription is ready.
                    </p>
                    <div className="bg-white p-3 rounded border border-green-200 mb-4">
                      <p className="text-sm text-green-700">
                        ✉️ You'll receive a direct download link
                        <br />🔗 Access your files instantly
                        <br />⏰ ETA: {formatTime(processingJob.estimatedTimeRemaining)}
                      </p>
                    </div>
                    <div className="flex gap-3 justify-center">
                      <Button variant="outline" size="sm" onClick={() => window.close()}>
                        Close Tab - I'll Wait for Email
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setEmailSubmitted(false)}>
                        Change Email
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Processing Info */}
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">What's happening now:</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                Audio analysis and noise reduction
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                Speech-to-text conversion with AI
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                Speaker identification and separation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                Timestamp generation and formatting
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                Quality check and file preparation
              </li>
            </ul>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
