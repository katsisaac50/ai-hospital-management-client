"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  FlaskConical,
  TestTube,
  Activity,
  Settings,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Filter,
  User,
  Calendar,
} from "lucide-react"
import Link from "next/link"
import { LabStats } from "@/components/lab-stats"

export default function LaboratoryPage() {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Laboratory Management
            </h1>
            <p className="text-slate-400 mt-2">Manage lab tests, results, and equipment</p>
          </div>
          <Link href="/">
            <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <LabStats />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-800/50 border-slate-700">
            <TabsTrigger
              value="overview"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Activity className="w-4 h-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tests" className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400">
              <TestTube className="w-4 h-4 mr-2" />
              Tests
            </TabsTrigger>
            <TabsTrigger
              value="results"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <FileText className="w-4 h-4 mr-2" />
              Results
            </TabsTrigger>
            <TabsTrigger
              value="equipment"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <Settings className="w-4 h-4 mr-2" />
              Equipment
            </TabsTrigger>
            <TabsTrigger
              value="reports"
              className="data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
            >
              <FlaskConical className="w-4 h-4 mr-2" />
              Reports
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <LaboratoryOverview />
          </TabsContent>

          <TabsContent value="tests" className="space-y-6">
            <TestManager />
          </TabsContent>

          <TabsContent value="results" className="space-y-6">
            <LabResults />
          </TabsContent>

          <TabsContent value="equipment" className="space-y-6">
            <EquipmentMonitor />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <LabReports />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

function LaboratoryOverview() {
  const recentTests = [
    {
      id: "LAB001",
      patientName: "Sarah Johnson",
      testType: "Complete Blood Count",
      status: "completed",
      priority: "routine",
      time: "15 minutes ago",
    },
    {
      id: "LAB002",
      patientName: "Michael Chen",
      testType: "Lipid Panel",
      status: "in_progress",
      priority: "urgent",
      time: "30 minutes ago",
    },
    {
      id: "LAB003",
      patientName: "Emily Rodriguez",
      testType: "Thyroid Function",
      status: "pending",
      priority: "routine",
      time: "1 hour ago",
    },
    {
      id: "LAB004",
      patientName: "David Kim",
      testType: "Cardiac Enzymes",
      status: "completed",
      priority: "stat",
      time: "2 hours ago",
    },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4" />
      case "in_progress":
        return <Clock className="w-4 h-4" />
      case "pending":
        return <TestTube className="w-4 h-4" />
      default:
        return <Activity className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-400"
      case "in_progress":
        return "text-blue-400"
      case "pending":
        return "text-yellow-400"
      default:
        return "text-slate-400"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "stat":
        return "text-red-400"
      case "urgent":
        return "text-orange-400"
      case "routine":
        return "text-green-400"
      default:
        return "text-slate-400"
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Tests */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Recent Lab Tests</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {recentTests.map((test) => (
            <div key={test.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-700/30">
              <div className={`${getStatusColor(test.status)}`}>{getStatusIcon(test.status)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-white text-sm font-medium">{test.patientName}</p>
                    <p className="text-slate-400 text-xs">{test.testType}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-medium ${getPriorityColor(test.priority)}`}>
                      {test.priority.toUpperCase()}
                    </p>
                    <p className="text-slate-400 text-xs">{test.time}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Equipment Status */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Equipment Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Hematology Analyzer</p>
                  <p className="text-slate-400 text-sm">Last calibrated: 2 hours ago</p>
                </div>
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Chemistry Analyzer</p>
                  <p className="text-slate-400 text-sm">Maintenance due in 3 days</p>
                </div>
                <AlertTriangle className="w-5 h-5 text-yellow-400" />
              </div>
            </div>
            <div className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-medium">Microscope Station 1</p>
                  <p className="text-slate-400 text-sm">Currently in use</p>
                </div>
                <Clock className="w-5 h-5 text-blue-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function TestManager() {
  const [searchTerm, setSearchTerm] = useState("")

  const tests = [
    {
      id: "LAB001",
      patientName: "Sarah Johnson",
      patientId: "P001",
      testType: "Complete Blood Count",
      orderedBy: "Dr. Amanda Wilson",
      priority: "routine",
      status: "completed",
      orderDate: "2024-01-15",
      sampleType: "Blood",
    },
    {
      id: "LAB002",
      patientName: "Michael Chen",
      patientId: "P002",
      testType: "Lipid Panel",
      orderedBy: "Dr. James Rodriguez",
      priority: "urgent",
      status: "in_progress",
      orderDate: "2024-01-15",
      sampleType: "Blood",
    },
    {
      id: "LAB003",
      patientName: "Emily Rodriguez",
      patientId: "P003",
      testType: "Thyroid Function",
      orderedBy: "Dr. Lisa Chen",
      priority: "routine",
      status: "pending",
      orderDate: "2024-01-14",
      sampleType: "Blood",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "in_progress":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "stat":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "urgent":
        return "bg-orange-500/20 text-orange-400 border-orange-500/30"
      case "routine":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <div className="space-y-6">
      {/* Search and Actions */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search tests by patient name or test type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Order Test
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tests List */}
      <div className="grid gap-4">
        {tests.map((test) => (
          <Card
            key={test.id}
            className="bg-slate-800/50 border-slate-700/50 hover:border-cyan-500/50 transition-all duration-300"
          >
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 flex items-center justify-center text-white">
                      <TestTube className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-white">{test.patientName}</h3>
                      <p className="text-slate-400">
                        {test.testType} • Ordered by {test.orderedBy}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-300">
                      <User className="w-4 h-4 text-slate-400" />
                      Patient ID: {test.patientId}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      Ordered: {test.orderDate}
                    </div>
                    <div className="flex items-center gap-2 text-slate-300">
                      <TestTube className="w-4 h-4 text-slate-400" />
                      Sample: {test.sampleType}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(test.status)}>{test.status.replace("_", " ")}</Badge>
                    <Badge className={getPriorityColor(test.priority)}>{test.priority}</Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                      View Details
                    </Button>
                    <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                      Process
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function LabResults() {
  const results = [
    {
      id: "LAB001",
      patientName: "Sarah Johnson",
      testType: "Complete Blood Count",
      status: "Final",
      resultDate: "2024-01-15",
      criticalValues: false,
      technician: "Lab Tech 1",
    },
    {
      id: "LAB002",
      patientName: "Michael Chen",
      testType: "Lipid Panel",
      status: "Preliminary",
      resultDate: "2024-01-15",
      criticalValues: true,
      technician: "Lab Tech 2",
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Lab Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {results.map((result) => (
            <div key={result.id} className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-white font-semibold">{result.patientName}</h4>
                  <p className="text-slate-400 text-sm">
                    {result.testType} • {result.technician}
                  </p>
                </div>
                <div className="flex gap-2">
                  {result.criticalValues && (
                    <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Critical</Badge>
                  )}
                  <Badge
                    className={
                      result.status === "Final"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }
                  >
                    {result.status}
                  </Badge>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-slate-400 text-sm">Result Date: {result.resultDate}</p>
                <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                  View Results
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function EquipmentMonitor() {
  const equipment = [
    {
      name: "Hematology Analyzer",
      model: "HA-2000",
      status: "Online",
      lastMaintenance: "2024-01-10",
      nextMaintenance: "2024-04-10",
      testsToday: 45,
    },
    {
      name: "Chemistry Analyzer",
      model: "CA-5000",
      status: "Maintenance Required",
      lastMaintenance: "2023-12-15",
      nextMaintenance: "2024-01-18",
      testsToday: 0,
    },
    {
      name: "Microscope Station 1",
      model: "MS-Pro",
      status: "In Use",
      lastMaintenance: "2024-01-05",
      nextMaintenance: "2024-04-05",
      testsToday: 12,
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Online":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "In Use":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      case "Maintenance Required":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "Offline":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Equipment Monitor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {equipment.map((item, index) => (
            <div key={index} className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h4 className="text-white font-semibold">{item.name}</h4>
                  <p className="text-slate-400 text-sm">Model: {item.model}</p>
                </div>
                <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-400">Tests Today</p>
                  <p className="text-white font-semibold">{item.testsToday}</p>
                </div>
                <div>
                  <p className="text-slate-400">Last Maintenance</p>
                  <p className="text-white">{item.lastMaintenance}</p>
                </div>
                <div>
                  <p className="text-slate-400">Next Maintenance</p>
                  <p className="text-white">{item.nextMaintenance}</p>
                </div>
                <div className="flex items-end">
                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
                    Manage
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

function LabReports() {
  const reports = [
    {
      title: "Daily Test Volume Report",
      description: "Summary of all tests performed today",
      type: "Volume",
      date: "2024-01-15",
      status: "Ready",
    },
    {
      title: "Quality Control Report",
      description: "Quality metrics and control results",
      type: "Quality",
      date: "2024-01-15",
      status: "Generating",
    },
    {
      title: "Equipment Utilization Report",
      description: "Equipment usage and efficiency metrics",
      type: "Equipment",
      date: "2024-01-15",
      status: "Ready",
    },
  ]

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-cyan-400">Laboratory Reports</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {reports.map((report, index) => (
            <div key={index} className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h4 className="text-white font-semibold mb-1">{report.title}</h4>
                  <p className="text-slate-400 text-sm mb-2">{report.description}</p>
                  <div className="flex gap-4 text-xs text-slate-400">
                    <span>Type: {report.type}</span>
                    <span>Date: {report.date}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      report.status === "Ready"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    }
                  >
                    {report.status}
                  </Badge>
                  {report.status === "Ready" && (
                    <Button size="sm" className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90">
                      Download
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
