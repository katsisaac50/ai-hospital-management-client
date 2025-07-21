"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Wifi,
  WifiOff,
  Download,
  Upload,
  FolderSyncIcon as Sync,
  CheckCircle,
  AlertTriangle,
  Clock,
} from "lucide-react"

export function OfflineManager() {
  const [isOnline, setIsOnline] = useState(true)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "error">("idle")
  const [pendingChanges, setPendingChanges] = useState(0)
  const [lastSync, setLastSync] = useState<Date>(new Date())

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    // Check initial status
    setIsOnline(navigator.onLine)

    // Simulate pending changes for demo
    const interval = setInterval(() => {
      if (!isOnline) {
        setPendingChanges((prev) => prev + Math.floor(Math.random() * 3))
      }
    }, 5000)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
      clearInterval(interval)
    }
  }, [isOnline])

  const handleSync = async () => {
    setSyncStatus("syncing")

    // Simulate sync process
    setTimeout(() => {
      setSyncStatus("idle")
      setPendingChanges(0)
      setLastSync(new Date())
    }, 3000)
  }

  const offlineCapabilities = [
    {
      feature: "Patient Records",
      status: "available",
      description: "View and edit patient information offline",
    },
    {
      feature: "Appointment Scheduling",
      status: "limited",
      description: "View schedules, limited booking capabilities",
    },
    {
      feature: "Medication Inventory",
      status: "available",
      description: "Check stock levels and update inventory",
    },
    {
      feature: "Lab Results",
      status: "view-only",
      description: "View existing results, no new entries",
    },
    {
      feature: "Financial Data",
      status: "limited",
      description: "View reports, no payment processing",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "limited":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      case "view-only":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30"
      default:
        return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle className="w-4 h-4" />
      case "limited":
        return <AlertTriangle className="w-4 h-4" />
      case "view-only":
        return <Clock className="w-4 h-4" />
      default:
        return <AlertTriangle className="w-4 h-4" />
    }
  }

  return (
    <Card className="bg-slate-800/50 border-slate-700/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOnline ? <Wifi className="w-5 h-5 text-green-400" /> : <WifiOff className="w-5 h-5 text-red-400" />}
            <div>
              <CardTitle className="text-cyan-400">{isOnline ? "Online Mode" : "Offline Mode"}</CardTitle>
              <p className="text-sm text-slate-400">{isOnline ? "All features available" : "Limited functionality"}</p>
            </div>
          </div>
          <Badge className={isOnline ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
            {isOnline ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Sync Status */}
        {!isOnline && (
          <div className="bg-slate-700/30 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-white font-medium">Sync Status</h4>
                <p className="text-slate-400 text-sm">
                  {pendingChanges} pending changes • Last sync: {lastSync.toLocaleTimeString()}
                </p>
              </div>
              <Button
                onClick={handleSync}
                disabled={syncStatus === "syncing"}
                size="sm"
                className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90"
              >
                {syncStatus === "syncing" ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <Sync className="w-4 h-4 mr-2" />
                    Sync Now
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Offline Capabilities */}
        <div>
          <h4 className="text-white font-medium mb-3">
            {isOnline ? "All Features Available" : "Offline Capabilities"}
          </h4>
          <div className="space-y-2">
            {offlineCapabilities.map((capability) => (
              <div
                key={capability.feature}
                className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(capability.status)}
                  <div>
                    <p className="text-white text-sm font-medium">{capability.feature}</p>
                    <p className="text-slate-400 text-xs">{capability.description}</p>
                  </div>
                </div>
                <Badge className={getStatusColor(capability.status)}>{capability.status.replace("-", " ")}</Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Offline Actions */}
        {!isOnline && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
              <Download className="w-4 h-4 mr-2" />
              Download Data
            </Button>
            <Button variant="outline" size="sm" className="border-slate-600 text-slate-300">
              <Upload className="w-4 h-4 mr-2" />
              Queue Upload
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
