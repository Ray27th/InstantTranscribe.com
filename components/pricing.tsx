import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Calculator } from "lucide-react"

const pricingExamples = [
  { duration: "5 minutes", cost: "$0.90", useCase: "Short video clip" },
  { duration: "30 minutes", cost: "$5.40", useCase: "Podcast episode" },
  { duration: "60 minutes", cost: "$10.80", useCase: "Full interview" },
  { duration: "120 minutes", cost: "$21.60", useCase: "Conference talk" },
]

const features = [
  "90%+ transcription accuracy",
  "All video/audio formats supported",
  "TXT, DOCX, SRT export formats",
  "Lightning fast processing",
  "Speaker identification included",
  "Timestamp precision",
  "Secure file handling",
  "No monthly subscriptions",
  "Pay only for what you use",
  "24/7 customer support",
]

export function Pricing() {
  return (
    <section className="py-24 bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Calculator className="mr-2 h-4 w-4" />
            Simple Pricing
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Transparent, pay-per-use pricing
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            No hidden fees, no monthly subscriptions. Pay only for the minutes you transcribe.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Main pricing card */}
          <Card className="relative overflow-hidden border-2 border-blue-200 shadow-xl">
            <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-center py-3">
              <Badge className="bg-white text-blue-600 font-semibold">
                <Zap className="mr-1 h-3 w-3" />
                Most Popular
              </Badge>
            </div>

            <CardHeader className="pt-16 text-center">
              <div className="space-y-2">
                <CardTitle className="text-5xl font-bold">
                  $0.18
                  <span className="text-xl font-normal text-gray-600">/minute</span>
                </CardTitle>
                <CardDescription className="text-lg">Professional AI transcription</CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Features list */}
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full" size="lg">
                Start Transcribing Now
              </Button>

              <p className="text-xs text-gray-500 text-center">
                No setup fees • No monthly commitments • Cancel anytime
              </p>
            </CardContent>
          </Card>

          {/* Pricing examples */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Pricing Examples</h3>
              <p className="text-gray-600 mb-6">See exactly what you'll pay for different content lengths:</p>
            </div>

            <div className="space-y-4">
              {pricingExamples.map((example, index) => (
                <Card key={index} className="border border-gray-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{example.duration}</p>
                        <p className="text-sm text-gray-500">{example.useCase}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">{example.cost}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
              <CardContent className="p-6 text-center">
                <h4 className="font-semibold text-gray-900 mb-2">Volume Discounts Available</h4>
                <p className="text-sm text-gray-600 mb-4">
                  Processing over 10 hours per month? Contact us for custom pricing.
                </p>
                <Button variant="outline" size="sm">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
