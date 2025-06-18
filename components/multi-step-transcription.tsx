"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Circle, Clock } from "lucide-react"
import { FileUploadStep } from "./steps/file-upload-step"
import { PreviewStep } from "./steps/preview-step"
import { PaymentStep } from "./steps/payment-step"
import { ProcessingStep } from "./steps/processing-step"
import { DownloadStep } from "./steps/download-step"
import type { TranscriptionStep, UploadedFile, PreviewTranscript, ProcessingJob } from "@/types/transcription"

const STEPS: TranscriptionStep[] = [
  { id: 1, title: "Upload File", description: "Select your video or audio file", status: "current" },
  { id: 2, title: "Preview", description: "See 30-second free transcription", status: "pending" },
  { id: 3, title: "Payment", description: "Secure payment processing", status: "pending" },
  { id: 4, title: "Processing", description: "Full file transcription", status: "pending" },
  { id: 5, title: "Download", description: "Get your transcription files", status: "pending" },
]

export function MultiStepTranscription() {
  const [currentStep, setCurrentStep] = useState(1)
  const [steps, setSteps] = useState<TranscriptionStep[]>(STEPS)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [previewTranscript, setPreviewTranscript] = useState<PreviewTranscript | null>(null)
  const [processingJob, setProcessingJob] = useState<ProcessingJob | null>(null)
  const [paymentCompleted, setPaymentCompleted] = useState(false)

  const updateStepStatus = (stepId: number, status: TranscriptionStep["status"]) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, status } : step)))
  }

  const goToNextStep = () => {
    updateStepStatus(currentStep, "completed")
    const nextStep = currentStep + 1
    updateStepStatus(nextStep, "current")
    setCurrentStep(nextStep)
  }

  const handleFileUploaded = (file: UploadedFile) => {
    setUploadedFile(file)
    goToNextStep()
  }

  const handlePreviewGenerated = (transcript: PreviewTranscript) => {
    setPreviewTranscript(transcript)
  }

  const handlePaymentCompleted = () => {
    setPaymentCompleted(true)
    goToNextStep()
  }

  const handleProcessingStarted = (job: ProcessingJob) => {
    setProcessingJob(job)
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <FileUploadStep onFileUploaded={handleFileUploaded} />
      case 2:
        return (
          <PreviewStep
            file={uploadedFile!}
            onPreviewGenerated={handlePreviewGenerated}
            onContinue={goToNextStep}
            transcript={previewTranscript}
          />
        )
      case 3:
        return <PaymentStep file={uploadedFile!} onPaymentCompleted={handlePaymentCompleted} />
      case 4:
        return (
          <ProcessingStep
            file={uploadedFile!}
            onProcessingStarted={handleProcessingStarted}
            processingJob={processingJob}
            onProcessingCompleted={goToNextStep}
          />
        )
      case 5:
        return <DownloadStep file={uploadedFile!} processingJob={processingJob!} />
      default:
        return null
    }
  }

  // Calculate step progress (0-100%)
  const getStepProgress = () => {
    if (currentStep === 1) return 0 // No progress until first step is completed
    return ((currentStep - 1) / steps.length) * 100
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Progress Header */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">Transcription Process</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                      step.status === "completed"
                        ? "bg-green-600 border-green-600 text-white"
                        : step.status === "current"
                          ? "bg-blue-600 border-blue-600 text-white"
                          : "bg-gray-100 border-gray-300 text-gray-400"
                    }`}
                  >
                    {step.status === "completed" ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : step.status === "current" ? (
                      <Clock className="w-5 h-5" />
                    ) : (
                      <Circle className="w-5 h-5" />
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={`text-sm font-medium ${
                        step.status === "current"
                          ? "text-blue-600"
                          : step.status === "completed"
                            ? "text-green-600"
                            : "text-gray-400"
                      }`}
                    >
                      {step.title}
                    </p>
                    <p className="text-xs text-gray-500">{step.description}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 ${
                      steps[index + 1].status === "completed" || step.status === "completed"
                        ? "bg-green-600"
                        : "bg-gray-300"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Overall Progress</span>
              <span>{Math.round(getStepProgress())}% Complete</span>
            </div>
            <Progress value={getStepProgress()} className="h-2" />
            <p className="text-xs text-gray-500 mt-1 text-center">
              {currentStep === 1 && "Upload your file to begin"}
              {currentStep === 2 && "Preview your transcription quality"}
              {currentStep === 3 && "Complete secure payment"}
              {currentStep === 4 && "AI processing your file"}
              {currentStep === 5 && "Download your transcription"}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Current Step Content */}
      {renderCurrentStep()}
    </div>
  )
}
