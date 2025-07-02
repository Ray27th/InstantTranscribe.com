export interface TranscriptionStep {
  id: number
  title: string
  description: string
  status: "pending" | "current" | "completed"
}

export interface UploadedFile {
  id?: string
  file: File
  name: string
  size: number
  type: string
  duration: number
  durationSeconds?: number
  cost: number
  url?: string
}

export interface PreviewTranscript {
  text: string
  confidence: number
  speakers: Array<{
    speaker: string
    text: string
    timestamp: string
  }>
}

export interface ProcessingJob {
  id: string
  fileId: string
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  estimatedTimeRemaining: number
  startedAt: Date
  completedAt?: Date
}

export interface TranscriptionResult {
  transcript: string
  fullTranscript: string
  confidence: number
  segments?: Array<{
    text: string
    start: number
    end: number
  }>
  speakerCount?: number
  processingTime?: number
  duration?: number
  language?: string
}
