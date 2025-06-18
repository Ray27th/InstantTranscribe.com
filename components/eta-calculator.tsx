"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Zap, Coffee, Timer } from "lucide-react"

interface ETACalculatorProps {
  duration: number // in minutes
  fileSize: number // in bytes
  fileType: string
}

export function ETACalculator({ duration, fileSize, fileType }: ETACalculatorProps) {
  const calculateETA = () => {
    // Base processing time: ~30 seconds per minute of audio
    let baseTime = duration * 30

    // Adjust for file type
    if (fileType.startsWith("video/")) {
      baseTime *= 1.2 // Video takes 20% longer
    }

    // Adjust for file size (larger files may take longer)
    const sizeInMB = fileSize / (1024 * 1024)
    if (sizeInMB > 100) {
      baseTime *= 1.1 // Large files take 10% longer
    }

    // Add some variance for server load
    const variance = Math.random() * 60 + 30 // 30-90 seconds
    return Math.round(baseTime + variance)
  }

  const eta = calculateETA()

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds} seconds`
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return secs > 0 ? `${mins}m ${secs}s` : `${mins} minutes`
  }

  const getETAInfo = (seconds: number) => {
    if (seconds <= 60) {
      return {
        category: "quick",
        icon: Zap,
        color: "green",
        title: "Quick Processing",
        description: "Perfect for staying on the page",
        recommendation: "wait",
      }
    }
    if (seconds <= 180) {
      return {
        category: "medium",
        icon: Clock,
        color: "yellow",
        title: "Medium Processing",
        description: "Good time for a quick break",
        recommendation: "either",
      }
    }
    if (seconds <= 600) {
      return {
        category: "long",
        icon: Coffee,
        color: "orange",
        title: "Long Processing",
        description: "Perfect time for a coffee break",
        recommendation: "email",
      }
    }
    return {
      category: "very-long",
      icon: Timer,
      color: "red",
      title: "Extended Processing",
      description: "Definitely time for email notification",
      recommendation: "email",
    }
  }

  const etaInfo = getETAInfo(eta)
  const IconComponent = etaInfo.icon

  return (
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
            <IconComponent
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
              className={`text-2xl font-bold mb-1 ${
                etaInfo.color === "green"
                  ? "text-green-900"
                  : etaInfo.color === "yellow"
                    ? "text-yellow-900"
                    : etaInfo.color === "orange"
                      ? "text-orange-900"
                      : "text-red-900"
              }`}
            >
              {formatTime(eta)}
            </h3>
            <p
              className={`text-lg font-medium ${
                etaInfo.color === "green"
                  ? "text-green-800"
                  : etaInfo.color === "yellow"
                    ? "text-yellow-800"
                    : etaInfo.color === "orange"
                      ? "text-orange-800"
                      : "text-red-800"
              }`}
            >
              {etaInfo.title}
            </p>
            <p
              className={`text-sm ${
                etaInfo.color === "green"
                  ? "text-green-700"
                  : etaInfo.color === "yellow"
                    ? "text-yellow-700"
                    : etaInfo.color === "orange"
                      ? "text-orange-700"
                      : "text-red-700"
              }`}
            >
              {etaInfo.description}
            </p>
          </div>

          <Badge
            className={`${
              etaInfo.recommendation === "wait"
                ? "bg-green-600"
                : etaInfo.recommendation === "either"
                  ? "bg-yellow-600"
                  : "bg-orange-600"
            }`}
          >
            {etaInfo.recommendation === "wait"
              ? "👀 Recommended: Wait on page"
              : etaInfo.recommendation === "either"
                ? "⚖️ Either option works"
                : "📧 Recommended: Email notification"}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}
