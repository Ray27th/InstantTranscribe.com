import { NextRequest, NextResponse } from 'next/server'

// In a real app, this would come from a database
// For now, we'll use in-memory storage (resets on server restart)
let analytics = {
  totalTranscriptions: 0,
  successfulTranscriptions: 0,
  failedTranscriptions: 0,
  totalMinutesProcessed: 0,
  totalRevenue: 0,
  formatStats: {} as Record<string, number>,
  errorStats: {} as Record<string, number>,
  recentActivity: [] as Array<{
    timestamp: string,
    action: string,
    fileName: string,
    fileType: string,
    status: 'success' | 'error' | 'processing',
    error?: string,
    duration?: number,
    cost?: number
  }>,
  systemHealth: {
    uptime: Date.now(),
    lastRequest: Date.now(),
    activeConnections: 0
  }
}

export async function GET(request: NextRequest) {
  try {
    const now = Date.now()
    const uptime = Math.floor((now - analytics.systemHealth.uptime) / 1000)
    
    // Calculate success rate
    const successRate = analytics.totalTranscriptions > 0 
      ? Math.round((analytics.successfulTranscriptions / analytics.totalTranscriptions) * 100 * 100) / 100
      : 0
    
    // Calculate average processing time
    const avgProcessingTime = analytics.totalTranscriptions > 0
      ? Math.round((analytics.totalMinutesProcessed / analytics.totalTranscriptions) * 100) / 100
      : 0

    const response = {
      totalTranscriptions: analytics.totalTranscriptions,
      successfulTranscriptions: analytics.successfulTranscriptions,
      failedTranscriptions: analytics.failedTranscriptions,
      successRate,
      totalMinutesProcessed: analytics.totalMinutesProcessed,
      totalRevenue: analytics.totalRevenue,
      avgProcessingTime,
      formatStats: analytics.formatStats,
      errorStats: analytics.errorStats,
      recentActivity: analytics.recentActivity,
      uptime,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    
    // Update analytics based on the event
    switch (data.event) {
      case 'transcription_started':
        analytics.totalTranscriptions++
        analytics.recentActivity.unshift({
          timestamp: new Date().toISOString(),
          action: 'Transcription Started',
          fileName: data.fileName || 'Unknown',
          fileType: data.fileType || 'Unknown',
          status: 'processing'
        })
        break
        
      case 'transcription_completed':
        analytics.successfulTranscriptions++
        analytics.totalMinutesProcessed += data.duration || 0
        analytics.totalRevenue += data.cost || 0
        
        // Update format stats
        const format = data.fileType || 'Unknown'
        analytics.formatStats[format] = (analytics.formatStats[format] || 0) + 1
        
        analytics.recentActivity.unshift({
          timestamp: new Date().toISOString(),
          action: 'Transcription Completed',
          fileName: data.fileName || 'Unknown',
          fileType: data.fileType || 'Unknown',
          status: 'success',
          duration: data.duration,
          cost: data.cost
        })
        break
        
      case 'transcription_failed':
        analytics.failedTranscriptions++
        
        // Update error stats
        const errorType = data.errorType || 'Unknown Error'
        analytics.errorStats[errorType] = (analytics.errorStats[errorType] || 0) + 1
        
        analytics.recentActivity.unshift({
          timestamp: new Date().toISOString(),
          action: 'Transcription Failed',
          fileName: data.fileName || 'Unknown',
          fileType: data.fileType || 'Unknown',
          status: 'error',
          error: data.error
        })
        break
    }
    
    // Keep only last 50 activities
    analytics.recentActivity = analytics.recentActivity.slice(0, 50)
    analytics.systemHealth.lastRequest = Date.now()
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
} 