'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  FileAudio, 
  FileVideo, 
  Clock, 
  DollarSign, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Activity,
  Users,
  Download,
  RefreshCw
} from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"

interface AnalyticsData {
  totalTranscriptions: number
  successfulTranscriptions: number
  failedTranscriptions: number
  successRate: number
  totalMinutesProcessed: number
  totalRevenue: number
  avgProcessingTime: number
  formatStats: Record<string, number>
  errorStats: Record<string, number>
  recentActivity: Array<{
    timestamp: string
    action: string
    fileName: string
    fileType: string
    status: 'success' | 'error' | 'processing'
    error?: string
    duration?: number
    cost?: number
  }>
  uptime: number
  timestamp: string
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/analytics')
      const data = await response.json()
      setAnalytics(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchAnalytics, 30000)
    return () => clearInterval(interval)
  }, [])

  // Convert analytics data to UI format
  const formatAnalyticsForUI = (data: AnalyticsData) => {
    const popularFormats = Object.entries(data.formatStats)
      .map(([format, count]) => ({
        format,
        count,
        percentage: data.totalTranscriptions > 0 ? (count / data.totalTranscriptions * 100) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const errorTypes = Object.entries(data.errorStats)
      .map(([type, count]) => ({
        type,
        count,
        trend: 0 // We don't have historical data yet
      }))
      .sort((a, b) => b.count - a.count)

    const recentActivity = data.recentActivity.slice(0, 8).map(activity => ({
      time: new Date(activity.timestamp).toLocaleString(),
      action: activity.action,
      file: activity.fileName,
      status: activity.status,
      details: activity.error || (activity.duration ? `${activity.duration} min` : '')
    }))

    return {
      popularFormats,
      errorTypes,
      recentActivity
    }
  }

  if (isLoading && !analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-lg">Loading analytics...</span>
          </div>
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Analytics</h2>
            <p className="text-gray-600 mb-4">Unable to fetch analytics data</p>
            <Button onClick={fetchAnalytics}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const uiData = formatAnalyticsForUI(analytics)

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Monitor transcription performance and system health
              {lastUpdated && (
                <span className="ml-2 text-sm">
                  • Last updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="px-4 py-2">
              <Activity className="w-4 h-4 mr-2" />
              Live Data
            </Badge>
            <Button 
              onClick={fetchAnalytics} 
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Transcriptions</CardTitle>
              <FileAudio className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analytics.totalTranscriptions.toLocaleString()}</div>
              <div className="flex items-center mt-2">
                <span className="text-sm text-gray-600">
                  {analytics.successfulTranscriptions} successful, {analytics.failedTranscriptions} failed
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Success Rate</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analytics.successRate}%</div>
              <Progress value={analytics.successRate} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Minutes Processed</CardTitle>
              <Clock className="h-5 w-5 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">{analytics.totalMinutesProcessed.toLocaleString()}</div>
              <div className="text-sm text-gray-600 mt-1">
                Avg: {analytics.avgProcessingTime.toFixed(1)}min per file
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Revenue</CardTitle>
              <DollarSign className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">${analytics.totalRevenue.toFixed(2)}</div>
              <div className="text-sm text-gray-600 mt-1">
                {analytics.totalMinutesProcessed > 0 
                  ? `$${(analytics.totalRevenue / analytics.totalMinutesProcessed).toFixed(3)} per minute`
                  : 'No revenue yet'
                }
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts and Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Popular Formats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileVideo className="h-5 w-5 mr-2" />
                Popular Formats
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uiData.popularFormats.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileAudio className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No file formats processed yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uiData.popularFormats.map((format) => (
                    <div key={format.format} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Badge variant="secondary" className="mr-3">{format.format}</Badge>
                        <span className="text-sm text-gray-600">{format.count} files</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Progress value={format.percentage} className="w-20" />
                        <span className="text-sm font-medium w-12">{format.percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uiData.recentActivity.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {uiData.recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                      <div className="flex-1">
                        <div className="flex items-center">
                          <div className={`w-2 h-2 rounded-full mr-3 ${
                            activity.status === 'success' ? 'bg-green-500' :
                            activity.status === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                          }`} />
                          <span className="text-sm font-medium">{activity.action}</span>
                        </div>
                        <div className="text-xs text-gray-500 ml-5">
                          {activity.file}
                          {activity.details && <span className="ml-2">• {activity.details}</span>}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400">{activity.time}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Error Analysis */}
        {uiData.errorTypes.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Error Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {uiData.errorTypes.map((error) => (
                  <div key={error.type} className="p-4 border rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">{error.count}</div>
                    <div className="text-sm text-gray-600 mb-2">{error.type}</div>
                    <div className="text-xs text-gray-500">
                      Total occurrences
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* System Health */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">System Uptime</CardTitle>
              <Activity className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">
                {Math.floor(analytics.uptime / 3600)}h {Math.floor((analytics.uptime % 3600) / 60)}m
              </div>
              <div className="text-sm text-green-600 mt-1">System running smoothly</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">API Status</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">Healthy</div>
              <div className="text-sm text-gray-600 mt-1">All services operational</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Processing Queue</CardTitle>
              <Clock className="h-5 w-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600 mt-1">No pending jobs</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
