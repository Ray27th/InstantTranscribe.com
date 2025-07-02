"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Info, Clock, DollarSign } from "lucide-react"

interface PricingExplainerProps {
  duration: number
  cost: number
}

export function PricingExplainer({ duration, cost }: PricingExplainerProps) {
  const isShortVideo = duration < 1
  
  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <h4 className="font-medium text-blue-900 mb-2">
              {isShortVideo ? "Short Video Pricing" : "Pricing Breakdown"}
            </h4>
            
            {isShortVideo ? (
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Your video is {Math.round(duration * 60)} seconds long</span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  <span>Minimum charge: $0.50 (payment processor requirement)</span>
                </div>
                <p className="mt-2">
                  Stripe requires a minimum charge of 50¢ USD for processing payments. 
                  Even short clips get full AI transcription at our 18¢/minute rate!
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-sm text-blue-800">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{duration.toFixed(1)} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Rate:</span>
                  <span>$0.18 per minute</span>
                </div>
                <div className="flex justify-between text-xs text-blue-600">
                  <span>Minimum:</span>
                  <span>$0.50 (Stripe requirement)</span>
                </div>
                <div className="flex justify-between font-medium">
                  <span>Total:</span>
                  <span>${cost.toFixed(2)}</span>
                </div>
                <p className="mt-2">
                  Charged in 6-second increments (0.1 minute) for fair pricing.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 