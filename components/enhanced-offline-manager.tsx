"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Wifi,
  WifiOff,
  Download,
  Upload,
  FolderSyncIcon as Sync,
  CheckCircle,
  AlertTriangle,
  Clock,
  Database,
  RefreshCw,
  AlertCircle,
} from "lucide-react"

// Mock offline manager service (in a real app, this would be implemented)
const offlineManager = {
  initializeOfflineData: () => Promise.resolve(),
  onConnectionChange: (callback) => {
    window.addEventListener("online", () => callback(true))
    window.addEventListener("offline", () => callback(false))
    return () => {
      window.removeEventListener("online", () => callback(true))
      window.removeEventListener("offline", () => callback(false))
    }
  },
  getPendingChangesCount: () => Promise.resolve(Math.floor(Math.random() * 10)),
  getLastSyncTime: () => Promise.resolve(new Date()),
  getConnectionStatus: () => navigator.onLine,
  syncPendingChanges: () =>
    Promise.resolve({
      success: true,
      synced: Math.floor(Math.random() * 10),
      failed: 0,
      errors: [],
    }),
}

export function EnhancedOfflineManager() {
  const [isOnline, setIsOnline] = useState(true)
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "error" | "success">("idle")
  const [pendingChanges, setPendingChanges] = useState(0)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncResult, setSyncResult] = useState<any>(null)

  useEffect(() => {
    // Initialize offline manager
    offlineManager.initializeOfflineData()

    // Listen for connection changes
    const unsubscribe = offlineManager.onConnectionChange((online) => {
      setIsOnline(online)
      if (online) {
        // Auto-sync when connection is restored
        handleSync()
      }
    })

    // Update pending changes count
    const updatePendingChanges = async () => {
      const count = await offlineManager.getPendingChangesCount()
      setPendingChanges(count)
    }

    // Update last sync time
    const updateLastSync = async () => {
      const lastSyncTime = await offlineManager.getLastSyncTime()
      setLastSync(lastSyncTime)
    }

    updatePendingChanges()
    updateLastSync()

    // Set up periodic updates
    const interval = setInterval(() => {
      updatePendingChanges()
      setIsOnline(offlineManager.getConnectionStatus())
    }, 5000)

    return () => {
      unsubscribe()
      clearInterval(interval)
    }
  }, [])

  const handleSync = async () => {
    if (!isOnline) return

    setSyncStatus("syncing")
    setSyncProgress(0)

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setSyncProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const result = await offlineManager.syncPendingChanges()

      clearInterval(progressInterval)
      setSyncProgress(100)

      if (result.success) {
        setSyncStatus("success")
        setSyncResult(result)
        setPendingChanges(0)
        setLastSync(new Date())

        // Reset status after 3 seconds
        setTimeout(() => {
          setSyncStatus("idle")
          setSyncResult(null)
        }, 3000)
      } else {
        setSyncStatus("error")
        setSyncResult(result)
      }
    } catch (error) {
      setSyncStatus("error")
      setSyncResult({ success: false, errors: [error.message] })
    }
  }

  const offlineCapabilities = [
    {
      feature: "Patient Records",
      status: "available",
      description: "Create, view, and edit patient information offline",
    },
    {
      feature: "Clinical Assessments",
      status: "available",
      description: "Complete assessments and diagnoses offline",
    },
    {
      feature: "Appointment Scheduling",
      status: "available",
      description: "Schedule and manage appointments offline",
    },
    {
      feature: "Medication Management",
      status: "available",
      description: "Prescribe medications and manage inventory offline",
    },
    {
      feature: "Lab Orders",
      status: "available",
      description: "Order lab tests and view results offline",
    },
    {
      feature: "Financial Data",
      status: "available",
      description: "Create invoices and manage billing offline",
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

  const getSyncStatusIcon = () => {
    switch (syncStatus) {
      case "syncing":
        return <RefreshCw className="w-4 h-4 animate-spin" />
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-400" />
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-400" />
      default:
        return <Sync className="w-4 h-4" />
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
              <p className="text-sm text-slate-400">
                {isOnline ? "All features available with real-time sync" : "Full functionality available offline"}
              </p>
            </div>
          </div>
          <Badge className={isOnline ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}>
            {isOnline ? "Connected" : "Disconnected"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Sync Status */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {getSyncStatusIcon()}
              <div>
                <h4 className="text-white font-medium">Sync Status</h4>
                <p className="text-slate-400 text-sm">
                  {pendingChanges} pending changes
                  {lastSync && ` • Last sync: ${lastSync.toLocaleTimeString()}`}
                </p>
              </div>
            </div>
            <Button
              onClick={handleSync}
              disabled={syncStatus === "syncing" || !isOnline}
              size="sm"
              className="bg-gradient-to-r from-cyan-500 to-purple-500 hover:opacity-90 disabled:opacity-50"
            >
              {syncStatus === "syncing" ? "Syncing..." : "Sync Now"}
            </Button>
          </div>

          {/* Sync Progress */}
          {syncStatus === "syncing" && (
            <div className="space-y-2">
              <Progress value={syncProgress} className="h-2" />
              <p className="text-xs text-slate-400">Syncing changes with server...</p>
            </div>
          )}

          {/* Sync Result */}
          {syncResult && (
            <div
              className={`mt-3 p-3 rounded ${
                syncResult.success
                  ? "bg-green-500/10 border border-green-500/20"
                  : "bg-red-500/10 border border-red-500/20"
              }`}
            >
              <p className={`text-sm font-medium ${syncResult.success ? "text-green-400" : "text-red-400"}`}>
                {syncResult.success
                  ? `Successfully synced ${syncResult.synced} changes`
                  : `Sync failed: ${syncResult.failed} errors`}
              </p>
              {syncResult.errors && syncResult.errors.length > 0 && (
                <ul className="mt-2 text-xs text-red-300">
                  {syncResult.errors.slice(0, 3).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Offline Capabilities */}
        <div>
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <Database className="w-4 h-4" />
            {isOnline ? "Full System Capabilities" : "Offline Capabilities"}
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

        {/* Offline Storage Info */}
        <div className="bg-slate-700/30 rounded-lg p-4">
          <h4 className="text-white font-medium mb-2 flex items-center gap-2">
            <Database className="w-4 h-4" />
            Local Storage
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-400">Pending Changes</p>
              <p className="text-white font-medium">{pendingChanges}</p>
            </div>
            <div>
              <p className="text-slate-400">Storage Status</p>
              <p className="text-green-400 font-medium">Available</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="border-slate-600 text-slate-300 hover:bg-slate-700"
            onClick={() => offlineManager.initializeOfflineData()}
          >
            <Download className="w-4 h-4 mr-2" />
            Initialize Data
          </Button>
          {pendingChanges > 0 && (
            <Button variant="outline" size="sm" className="border-yellow-600 text-yellow-300 hover:bg-yellow-700/20">
              <Upload className="w-4 h-4 mr-2" />
              {pendingChanges} Pending
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
