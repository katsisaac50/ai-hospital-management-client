import { offlineStorage } from "./offline-storage"
// import { supabase } from "./supabase"
const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api"
interface SyncResult {
  success: boolean
  synced: number
  failed: number
  errors: string[]
}

class OfflineManager {
  private isOnline = true
  private syncInProgress = false
  private listeners: Array<(isOnline: boolean) => void> = []

  constructor() {
    if (typeof window !== "undefined") {
      this.isOnline = navigator.onLine
      window.addEventListener("online", this.handleOnline.bind(this))
      window.addEventListener("offline", this.handleOffline.bind(this))
    }
  }

  private handleOnline() {
    this.isOnline = true
    this.notifyListeners()
    this.syncPendingChanges()
  }

  private handleOffline() {
    this.isOnline = false
    this.notifyListeners()
  }

  onConnectionChange(callback: (isOnline: boolean) => void) {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((listener) => listener !== callback)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener(this.isOnline))
  }

  getConnectionStatus() {
    return this.isOnline
  }

  // Generic CRUD operations that work offline-first
  async create<T extends { id: string }>(
    storeName: string,
    data: Omit<T, "id" | "created_at" | "updated_at">,
  ): Promise<T> {
    const now = new Date().toISOString()
    const record = {
      ...data,
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      created_at: now,
      updated_at: now,
      _offline_created: true,
    } as T

    // Store locally first
    await offlineStorage.put(storeName, record)

    // Queue for sync if offline
    if (!this.isOnline) {
      await offlineStorage.addPendingChange("create", storeName, record)
    } else {
      // Try to sync immediately if online
      try {
        const response = await fetch(`${API_URL}/v1/pharmacy/${storeName}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  const syncedData = await response.json();
        // const { data: syncedData, error } = await supabase.from(storeName).insert(data).select().single()

        if (response.ok) {
          // Update local storage with server ID
          await offlineStorage.delete(storeName, record.id)
          await offlineStorage.put(storeName, { ...syncedData, _offline_created: false })
          return syncedData
        } else {
          // If sync fails, queue for later
          await offlineStorage.addPendingChange("create", storeName, record)
        }
      } catch (error) {
        // If sync fails, queue for later
        await offlineStorage.addPendingChange("create", storeName, record)
      }
    }

    return record
  }

  async update<T extends { id: string }>(storeName: string, id: string, updates: Partial<T>): Promise<T> {
    const existing = await offlineStorage.get<T>(storeName, id)
    if (!existing) {
      throw new Error(`Record with id ${id} not found`)
    }

    const updated = {
      ...existing,
      ...updates,
      updated_at: new Date().toISOString(),
    }

    // Store locally first
    await offlineStorage.put(storeName, updated)

    // Queue for sync if offline or if this was created offline
    if (!this.isOnline || existing._offline_created) {
      await offlineStorage.addPendingChange("update", storeName, updated)
    } else {
      // Try to sync immediately if online
      try {
  const res = await fetch(`${API_URL}/v1/pharmacy${storeName}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });

  if (!res.ok) throw new Error("Update failed");
} catch (error) {
  await offlineStorage.addPendingChange("update", storeName, updated);
}

    }

    return updated
  }

  async delete(storeName: string, id: string): Promise<void> {
    const existing = await offlineStorage.get(storeName, id)

    // Remove from local storage
    await offlineStorage.delete(storeName, id)

    // Queue for sync if online and not created offline
    if (existing && !existing._offline_created) {
      if (!this.isOnline) {
        await offlineStorage.addPendingChange("delete", storeName, { id })
      } else {
        try {
          await fetch(`${API_URL}/v1/pharmacy/${storeName}/${id}`, {
  method: "DELETE",
});

        } catch (error) {
          await offlineStorage.addPendingChange("delete", storeName, { id })
        }
      }
    }
  }

  async getAll<T>(storeName: string): Promise<T[]> {
    // Always return from local storage for offline-first approach
    return offlineStorage.getAll<T>(storeName)
  }

  async getById<T>(storeName: string, id: string): Promise<T | null> {
    return offlineStorage.get<T>(storeName, id)
  }

  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    return offlineStorage.getByIndex<T>(storeName, indexName, value)
  }

  // Sync pending changes when connection is restored
  async syncPendingChanges(): Promise<SyncResult> {
    if (this.syncInProgress || !this.isOnline) {
      return { success: false, synced: 0, failed: 0, errors: ["Sync already in progress or offline"] }
    }

    this.syncInProgress = true
    const result: SyncResult = { success: true, synced: 0, failed: 0, errors: [] }

    try {
      const pendingChanges = await offlineStorage.getPendingChanges()

      for (const change of pendingChanges) {
        try {
          await this.syncSingleChange(change)
          await offlineStorage.markChangeAsSynced(change.id)
          result.synced++
        } catch (error) {
          result.failed++
          result.errors.push(`Failed to sync ${change.operation} on ${change.storeName}: ${error.message}`)
        }
      }

      // Download latest data from server to sync any changes made on other devices
      await this.downloadLatestData()
    } catch (error) {
      result.success = false
      result.errors.push(`Sync failed: ${error.message}`)
    } finally {
      this.syncInProgress = false
    }

    return result
  }

  private async syncSingleChange(change: any): Promise<void> {
    const { operation, storeName, data } = change

    switch (operation) {
      case "create":
        if (data._offline_created) {
          const { id, _offline_created, ...cleanData } = data
          const res = await fetch(`${API_URL}/v1/pharmacy/${storeName}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(cleanData),
          })
          const serverData = await res.json()
          if (!res.ok) throw new Error("Failed to create on server")
          await offlineStorage.delete(storeName, id)
          await offlineStorage.put(storeName, { ...serverData, _offline_created: false })
        }
        break

      case "update":
        const { id, _offline_created, created_at, updated_at, ...updateData } = data
        const updateRes = await fetch(`${API_URL}/v1/pharmacy/${storeName}/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updateData),
        })
        if (!updateRes.ok) throw new Error("Update failed")
        break

      case "delete":
        const deleteRes = await fetch(`${API_URL}/v1/pharmacy/${storeName}/${data.id}`, {
          method: "DELETE",
        })
        if (!deleteRes.ok) throw new Error("Delete failed")
        break

      default:
        throw new Error(`Unknown operation: ${operation}`)
    }
  }

  private async downloadLatestData(): Promise<void> {
    const tables = ["patients", "doctors", "appointments", "assessments", "medications", "lab_tests", "invoices"]

    for (const table of tables) {
      try {
        const res = await fetch(`${API_URL}/v1/pharmacy/${table}`);
const data = await res.json();

        if (res.ok && data) {
          // Clear existing data and replace with server data
          await offlineStorage.clear(table)
          for (const record of data) {
            await offlineStorage.put(table, { ...record, _offline_created: false })
          }
        }
      } catch (error) {
        console.warn(`Failed to download ${table}:`, error)
      }
    }
  }

  async getPendingChangesCount(): Promise<number> {
    const changes = await offlineStorage.getPendingChanges()
    return changes.length
  }

  async getLastSyncTime(): Promise<Date | null> {
    try {
      const lastSync = localStorage.getItem("lastSyncTime")
      return lastSync ? new Date(lastSync) : null
    } catch {
      return null
    }
  }

  private setLastSyncTime(): void {
    try {
      localStorage.setItem("lastSyncTime", new Date().toISOString())
    } catch {
      // Ignore localStorage errors
    }
  }

  // Initialize offline storage with sample data if empty
  async initializeOfflineData(): Promise<void> {
    const patients = await this.getAll("patients")
    if (patients.length === 0) {
      // Add sample data for offline demo
      const samplePatients = [
        {
          name: "Sarah Johnson",
          email: "sarah.j@email.com",
          phone: "+1 (555) 123-4567",
          date_of_birth: "1989-03-15",
          gender: "Female",
          address: "123 Main St, City, State 12345",
          insurance_provider: "BlueCross BlueShield",
          emergency_contact: "John Johnson +1-555-123-4568",
          medical_history: ["Hypertension", "Diabetes Type 2"],
          allergies: ["Penicillin", "Shellfish"],
        },
        {
          name: "Michael Chen",
          email: "m.chen@email.com",
          phone: "+1 (555) 234-5678",
          date_of_birth: "1975-08-22",
          gender: "Male",
          address: "456 Oak Ave, City, State 12345",
          insurance_provider: "Aetna",
          emergency_contact: "Lisa Chen +1-555-234-5679",
          medical_history: ["Asthma"],
          allergies: ["Latex"],
        },
      ]

      for (const patient of samplePatients) {
        await this.create("patients", patient)
      }
    }
  }
}

export const offlineManager = new OfflineManager()
