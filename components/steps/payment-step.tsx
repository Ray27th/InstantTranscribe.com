"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Shield, FileVideo, FileAudio, Loader2 } from "lucide-react"
import type { UploadedFile } from "@/types/transcription"

interface PaymentStepProps {
  file: UploadedFile
  onPaymentCompleted: () => void
}

export function PaymentStep({ file, onPaymentCompleted }: PaymentStepProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePayment = async () => {
    setIsProcessing(true)

    // Simulate Stripe payment processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setIsProcessing(false)
    onPaymentCompleted()
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
        <CardTitle>Step 3: Secure Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <FileIcon className="h-10 w-10 text-blue-600" />
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{file.name}</h3>
                  <p className="text-sm text-gray-500">{formatFileSize(file.size)}</p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Duration:</span>
                  <span className="font-medium">{file.duration} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rate:</span>
                  <span className="font-medium">$0.18 per minute</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Processing fee:</span>
                  <span className="font-medium">$0.00</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between text-lg font-semibold">
                <span>Total:</span>
                <span className="text-green-600">${file.cost.toFixed(2)}</span>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">What you'll get:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Complete transcription of your {file.duration}-minute file</li>
                  <li>• 90%+ accuracy with speaker identification</li>
                  <li>• Download in TXT, DOCX, and SRT formats</li>
                  <li>• Timestamps for every sentence</li>
                  <li>• Secure processing and automatic file deletion</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Payment Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mock Stripe Elements */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Card Number</label>
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <span className="text-gray-500">•••• •••• •••• 4242</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry Date</label>
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <span className="text-gray-500">MM / YY</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CVC</label>
                    <div className="border rounded-lg p-3 bg-gray-50">
                      <span className="text-gray-500">•••</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cardholder Name</label>
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <span className="text-gray-500">John Doe</span>
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg flex items-start gap-3">
                <Shield className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-green-900">Secure Payment</h4>
                  <p className="text-sm text-green-700">
                    Your payment is processed securely by Stripe. We never store your card details.
                  </p>
                </div>
              </div>

              <Button onClick={handlePayment} disabled={isProcessing} className="w-full" size="lg">
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pay ${file.cost.toFixed(2)} - Start Transcription
                  </>
                )}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                By clicking "Pay", you agree to our Terms of Service and Privacy Policy. You'll be charged $
                {file.cost.toFixed(2)} for transcribing {file.duration} minutes of audio/video.
              </p>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
