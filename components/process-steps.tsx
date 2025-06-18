import { Card, CardContent } from "@/components/ui/card"
import { Upload, Cpu, Download, ArrowRight } from "lucide-react"

const steps = [
  {
    step: "01",
    title: "Upload",
    description: "Drag and drop your video or audio files. We support MP4, MOV, AVI, MP3, WAV and more formats.",
    icon: Upload,
    color: "blue",
  },
  {
    step: "02",
    title: "Process",
    description: "Our AI analyzes your content with 90%+ accuracy, identifying speakers and adding timestamps.",
    icon: Cpu,
    color: "purple",
  },
  {
    step: "03",
    title: "Download",
    description: "Get your transcription in TXT, DOCX, or SRT format. Ready to use in minutes, not hours.",
    icon: Download,
    color: "green",
  },
]

export function ProcessSteps() {
  return (
    <section className="py-24 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Simple 3-Step Process</h2>
          <p className="mt-4 text-lg text-gray-600">
            From upload to download in just a few clicks. No complex setup required.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
          {steps.map((step, index) => (
            <div key={step.step} className="relative">
              <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardContent className="p-8 text-center">
                  {/* Step number */}
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 text-gray-600 font-bold text-lg mb-6">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div
                    className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-6 ${
                      step.color === "blue" ? "bg-blue-100" : step.color === "purple" ? "bg-purple-100" : "bg-green-100"
                    }`}
                  >
                    <step.icon
                      className={`h-8 w-8 ${
                        step.color === "blue"
                          ? "text-blue-600"
                          : step.color === "purple"
                            ? "text-purple-600"
                            : "text-green-600"
                      }`}
                    />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">{step.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{step.description}</p>
                </CardContent>
              </Card>

              {/* Arrow connector (hidden on mobile) */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-6 transform -translate-y-1/2">
                  <ArrowRight className="h-6 w-6 text-gray-400" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
