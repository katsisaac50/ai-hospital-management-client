"use client"
import { useEffect, useState } from "react"
import { offlineManager } from "@/lib/offline-manager"

export default function SyncStatus() {
  const [isOnline, setIsOnline] = useState(offlineManager.getConnectionStatus())
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    const unsubscribe = offlineManager.onConnectionChange(setIsOnline)
    const loadCount = async () => {
      const count = await offlineManager.getPendingChangesCount()
      setPendingCount(count)
    }

    loadCount()
    const interval = setInterval(loadCount, 5000)

    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [])

  return (
    <div className="text-sm text-right text-slate-400">
      {isOnline ? "🟢 Online" : "🔴 Offline"} | Pending Syncs: {pendingCount}
    </div>
  )
}