"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Download, Clock, DollarSign, BarChart3, FileVideo, Calendar, TrendingUp } from "lucide-react"

const recentTranscriptions = [
  {
    id: "1",
    name: "Marketing Meeting Q4.mp4",
    duration: "45:32",
    cost: "$8.20",
    status: "completed",
    date: "2024-01-15",
    accuracy: "94%",
  },
  {
    id: "2",
    name: "Product Demo.mov",
    duration: "12:15",
    cost: "$2.21",
    status: "completed",
    date: "2024-01-14",
    accuracy: "96%",
  },
  {
    id: "3",
    name: "Interview_John_Doe.mp3",
    duration: "28:45",
    cost: "$5.18",
    status: "processing",
    date: "2024-01-14",
    accuracy: "-",
  },
]

const stats = [
  {
    title: "Total Transcriptions",
    value: "24",
    change: "+12%",
    icon: FileText,
  },
  {
    title: "Hours Processed",
    value: "18.5",
    change: "+8%",
    icon: Clock,
  },
  {
    title: "Total Spent",
    value: "$45.60",
    change: "+15%",
    icon: DollarSign,
  },
  {
    title: "Avg. Accuracy",
    value: "94.2%",
    change: "+2%",
    icon: TrendingUp,
  },
]

export function Dashboard() {
  return (
    <div className="mx-auto max-w-7xl px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage your transcriptions and track your usage</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <stat.icon className="h-6 w-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <Badge variant="secondary" className="text-green-600">
                  {stat.change}
                </Badge>
                <span className="text-sm text-gray-500 ml-2">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content */}
      <Tabs defaultValue="recent" className="space-y-6">
        <TabsList>
          <TabsTrigger value="recent">Recent Transcriptions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transcriptions</CardTitle>
              <CardDescription>Your latest transcription jobs and their status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTranscriptions.map((transcription) => (
                  <div key={transcription.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileVideo className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{transcription.name}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {transcription.duration}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {transcription.date}
                            </span>
                            <span>Accuracy: {transcription.accuracy}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-medium">{transcription.cost}</span>

                        {transcription.status === "completed" ? (
                          <div className="flex gap-2">
                            <Badge variant="default" className="bg-green-600">
                              Completed
                            </Badge>
                            <Button size="sm" variant="outline">
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                          </div>
                        ) : (
                          <Badge variant="secondary">Processing</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>Track your transcription usage and spending over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-center justify-center text-gray-500">
                <BarChart3 className="h-12 w-12 mb-4" />
                <p>Analytics charts would be implemented here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences and billing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">Transcription Preferences</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span>Enable speaker identification</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span>Include timestamps</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" />
                      <span>Auto-punctuation</span>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Default Export Format</h3>
                  <select className="border rounded-md px-3 py-2">
                    <option>TXT</option>
                    <option>DOCX</option>
                    <option>SRT</option>
                  </select>
                </div>

                <Button>Save Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
