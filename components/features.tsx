import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Zap, FileVideo, Brain, Download, Clock, Shield, Users, Globe, CheckCircle } from "lucide-react"

const features = [
  {
    icon: Zap,
    title: "Lightning Fast Processing",
    description: "5x faster than traditional transcription services. Get results in minutes, not hours.",
    badge: "Speed",
    stats: "5x Faster",
  },
  {
    icon: Brain,
    title: "AI-Powered Accuracy",
    description: "Advanced machine learning ensures 90%+ accuracy with continuous improvements.",
    badge: "Accuracy",
    stats: "90%+ Accurate",
  },
  {
    icon: FileVideo,
    title: "Multiple Format Support",
    description: "Support for MP4, MOV, AVI, MP3, WAV and many more video and audio formats.",
    badge: "Compatibility",
    stats: "15+ Formats",
  },
  {
    icon: Download,
    title: "Flexible Export Options",
    description: "Download as TXT, DOCX, or SRT subtitle files. Perfect for any workflow.",
    badge: "Export",
    stats: "3 Formats",
  },
  {
    icon: Users,
    title: "Speaker Identification",
    description: "Automatically identify and label different speakers in your audio content.",
    badge: "Smart",
    stats: "Multi-Speaker",
  },
  {
    icon: Clock,
    title: "Timestamp Precision",
    description: "Accurate timestamps for every sentence, perfect for video editing and subtitles.",
    badge: "Precision",
    stats: "Second-Level",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your files are encrypted and automatically deleted after processing. GDPR compliant.",
    badge: "Security",
    stats: "100% Secure",
  },
  {
    icon: Globe,
    title: "Multiple Languages",
    description: "Support for 50+ languages with native speaker-level accuracy and understanding.",
    badge: "Global",
    stats: "50+ Languages",
  },
]

export function Features() {
  return (
    <section className="py-24 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <CheckCircle className="mr-2 h-4 w-4" />
            Professional Features
          </Badge>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Everything you need for transcription
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Professional-grade features designed for content creators, businesses, and researchers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="relative overflow-hidden border-0 shadow-md hover:shadow-lg transition-shadow duration-300"
            >
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <CardDescription className="text-sm leading-relaxed mb-4">{feature.description}</CardDescription>
                <div className="text-sm font-semibold text-blue-600">{feature.stats}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
