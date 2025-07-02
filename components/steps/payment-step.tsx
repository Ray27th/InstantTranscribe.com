"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements
} from "@stripe/react-stripe-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Shield, FileVideo, FileAudio, Loader2, AlertCircle } from "lucide-react"
import type { UploadedFile } from "@/types/transcription"
import { formatDuration } from "@/lib/file-utils"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface PaymentStepProps {
  file: UploadedFile
  onPaymentCompleted: () => void
}

// Payment form component that uses Stripe hooks
function PaymentForm({ file, onPaymentCompleted }: PaymentStepProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [isProcessing, setIsProcessing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsProcessing(true)
    setErrorMessage(null)

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/transcription/processing`,
        },
        redirect: 'if_required'
      })

      if (error) {
        setErrorMessage(error.message || 'Payment failed')
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // Payment successful
        onPaymentCompleted()
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <form onSubmit={handlePayment} className="space-y-6">
      {/* Stripe Payment Element */}
      <div className="space-y-4">
        <PaymentElement
          options={{
            layout: 'tabs',
            fields: {
              billingDetails: {
                name: 'auto',
                email: 'auto',
              }
            }
          }}
        />
      </div>

      {errorMessage && (
        <div className="bg-red-50 p-4 rounded-lg flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-red-900">Payment Error</h4>
            <p className="text-sm text-red-700">{errorMessage}</p>
          </div>
        </div>
      )}

      <div className="bg-green-50 p-4 rounded-lg flex items-start gap-3">
        <Shield className="h-5 w-5 text-green-600 mt-0.5" />
        <div>
          <h4 className="font-medium text-green-900">Secure Payment</h4>
          <p className="text-sm text-green-700">
            Your payment is processed securely by Stripe. We never store your card details.
          </p>
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={!stripe || isProcessing} 
        className="w-full" 
        size="lg"
      >
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
        {file.cost.toFixed(2)} for transcribing {formatDuration(file.duration)} of audio/video.
      </p>
    </form>
  )
}

export function PaymentStep({ file, onPaymentCompleted }: PaymentStepProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [setupError, setSetupError] = useState<string | null>(null)

  useEffect(() => {
    // Create payment intent when component mounts
    async function createPaymentIntent() {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: file.cost,
            metadata: {
              fileName: file.name,
              duration: file.duration,
              fileSize: file.size.toString()
            }
          })
        })

        const data = await response.json()

        if (response.ok) {
          setClientSecret(data.clientSecret)
        } else {
          setSetupError(data.error || 'Failed to setup payment')
        }
      } catch (error: any) {
        setSetupError('Network error. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    createPaymentIntent()
  }, [file])

  const formatFileSize = (bytes: number) => {
    const sizes = ["Bytes", "KB", "MB", "GB"]
    if (bytes === 0) return "0 Bytes"
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i]
  }

  const FileIcon = file.type.startsWith("video/") ? FileVideo : FileAudio

  // Check if Stripe is properly configured
  const isStripeConfigured = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && 
                           process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.length > 0

  if (!isStripeConfigured) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Step 3: Payment Setup Required</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-yellow-50 p-6 rounded-lg text-center">
            <AlertCircle className="h-12 w-12 text-yellow-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-yellow-900 mb-2">
              Stripe Configuration Needed
            </h3>
            <p className="text-yellow-700 mb-4">
              To process payments, you need to configure your Stripe keys in the environment variables.
            </p>
            <div className="bg-white p-4 rounded border text-left text-sm">
              <p className="font-mono text-gray-600">
                Add to .env.local:<br/>
                STRIPE_SECRET_KEY=sk_test_...<br/>
                NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...<br/>
                STRIPE_WEBHOOK_SECRET=whsec_...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

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
                  <span className="font-medium">{formatDuration(file.duration)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Rate:</span>
                  <span className="font-medium">$0.18 per minute</span>
                </div>
                {file.duration < 2.8 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Minimum charge:</span>
                    <span className="text-gray-500">$0.50</span>
                  </div>
                )}
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
                  <li>• Complete transcription of your {formatDuration(file.duration)} file</li>
                  <li>• 90%+ accuracy with speaker identification</li>
                  <li>• Download in TXT, DOCX, and SRT formats</li>
                  <li>• Timestamps for every sentence</li>
                  {file.duration < 2.8 && (
                    <li>• Same quality processing even for short clips</li>
                  )}
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
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                  <span className="ml-2 text-gray-600">Setting up payment...</span>
                </div>
              ) : setupError ? (
                <div className="bg-red-50 p-6 rounded-lg text-center">
                  <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-red-900 mb-2">
                    Payment Setup Failed
                  </h3>
                  <p className="text-red-700">{setupError}</p>
                  <Button 
                    onClick={() => window.location.reload()} 
                    className="mt-4"
                    variant="outline"
                  >
                    Try Again
                  </Button>
                </div>
              ) : clientSecret ? (
                <Elements 
                  stripe={stripePromise} 
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'stripe',
                      variables: {
                        colorPrimary: '#3b82f6',
                      }
                    }
                  }}
                >
                  <PaymentForm file={file} onPaymentCompleted={onPaymentCompleted} />
                </Elements>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
