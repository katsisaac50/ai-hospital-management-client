// // IndexedDB wrapper for offline storage
// class OfflineStorage {
//   private dbName = "HospitalManagementDB"
//   private version = 1
//   private db: IDBDatabase | null = null

//   async init(): Promise<void> {
//     return new Promise((resolve, reject) => {
//       const request = indexedDB.open(this.dbName, this.version)

//       request.onerror = () => reject(request.error)
//       request.onsuccess = () => {
//         this.db = request.result
//         resolve()
//       }

//       request.onupgradeneeded = (event) => {
//         const db = (event.target as IDBOpenDBRequest).result

//         // Create object stores
//         const stores = [
//           "patients",
//           "doctors",
//           "appointments",
//           "assessments",
//           "medications",
//           "lab_tests",
//           "invoices",
//           "pending_changes",
//         ]

//         stores.forEach((storeName) => {
//           if (!db.objectStoreNames.contains(storeName)) {
//             const store = db.createObjectStore(storeName, { keyPath: "id" })

//             // Add indexes for common queries
//             if (storeName === "patients") {
//               store.createIndex("name", "name", { unique: false })
//               store.createIndex("email", "email", { unique: false })
//               store.createIndex("status", "status", { unique: false })
//             }

//             if (storeName === "assessments") {
//               store.createIndex("patient_id", "patient_id", { unique: false })
//               store.createIndex("date", "date", { unique: false })
//             }

//             if (storeName === "pending_changes") {
//               store.createIndex("storeName", "storeName", { unique: false })
//               store.createIndex("synced", "synced", { unique: false })
//             }
//           }
//         })
//       }
//     })
//   }

//   private async ensureDB(): Promise<IDBDatabase> {
//     if (!this.db) {
//       await this.init()
//     }
//     return this.db!
//   }

//   async put<T>(storeName: string, data: T): Promise<void> {
//     const db = await this.ensureDB()
//     const transaction = db.transaction([storeName], "readwrite")
//     const store = transaction.objectStore(storeName)

//     return new Promise((resolve, reject) => {
//       const request = store.put(data)
//       request.onsuccess = () => resolve()
//       request.onerror = () => reject(request.error)
//     })
//   }

//   async get<T>(storeName: string, id: string): Promise<T | null> {
//     const db = await this.ensureDB()
//     const transaction = db.transaction([storeName], "readonly")
//     const store = transaction.objectStore(storeName)

//     return new Promise((resolve, reject) => {
//       const request = store.get(id)
//       request.onsuccess = () => resolve(request.result || null)
//       request.onerror = () => reject(request.error)
//     })
//   }

//   async getAll<T>(storeName: string): Promise<T[]> {
//     const db = await this.ensureDB()
//     const transaction = db.transaction([storeName], "readonly")
//     const store = transaction.objectStore(storeName)

//     return new Promise((resolve, reject) => {
//       const request = store.getAll()
//       request.onsuccess = () => resolve(request.result || [])
//       request.onerror = () => reject(request.error)
//     })
//   }

//   async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
//     const db = await this.ensureDB()
//     const transaction = db.transaction([storeName], "readonly")
//     const store = transaction.objectStore(storeName)
//     const index = store.index(indexName)

//     return new Promise((resolve, reject) => {
//       console.log('value', value)
//       if (value === undefined || value === null) {
//         console.error("IndexedDB getByIndex error: invalid value:", value);
//         reject(new Error("Invalid index value"));
//         return;
//       }
//       const request = index.getAll(value)
//       request.onsuccess = () => resolve(request.result || [])
//       request.onerror = () => reject(request.error)
//     })
//   }

//   async delete(storeName: string, id: string): Promise<void> {
//     const db = await this.ensureDB()
//     const transaction = db.transaction([storeName], "readwrite")
//     const store = transaction.objectStore(storeName)

//     return new Promise((resolve, reject) => {
//       const request = store.delete(id)
//       request.onsuccess = () => resolve()
//       request.onerror = () => reject(request.error)
//     })
//   }

//   async clear(storeName: string): Promise<void> {
//     const db = await this.ensureDB()
//     const transaction = db.transaction([storeName], "readwrite")
//     const store = transaction.objectStore(storeName)

//     return new Promise((resolve, reject) => {
//       const request = store.clear()
//       request.onsuccess = () => resolve()
//       request.onerror = () => reject(request.error)
//     })
//   }

//   async addPendingChange(operation: string, storeName: string, data: any): Promise<void> {
//     const change = {
//       id: `change-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
//       operation,
//       storeName,
//       data,
//       timestamp: new Date().toISOString(),
//       synced: false,
//     }

//     await this.put("pending_changes", change)
//   }

//   async getPendingChanges(): Promise<any[]> {
//     return this.getByIndex("pending_changes", "synced", false)
//   }

//   async markChangeAsSynced(changeId: string): Promise<void> {
//     const change = await this.get("pending_changes", changeId)
//     if (change) {
//       await this.put("pending_changes", { ...change, synced: true })
//     }
//   }
// }

// export const offlineStorage = new OfflineStorage()



// (your existing code here)

// Add this at the end if not already present
export const offlineStorage = {
  // ...implement your offline storage methods here
  // Example:
  async put(storeName: string, record: any) { /* ... */ },
  async get(storeName: string, id: string) { /* ... */ },
  async delete(storeName: string, id: string) { /* ... */ },
  async getAll<T>(storeName: string): Promise<T[]> { /* ... */ },
  async addPendingChange(operation: string, storeName: string, data: any) { /* ... */ },
  async getPendingChanges() { /* ... */ },
  async markChangeAsSynced(id: string) { /* ... */ },
  async clear(storeName: string) { /* ... */ },
  async getByIndex<T>(storeName: string, indexName: string, value: any): Promise<T[]> {
    // Implement your logic here
    console.error("getByIndex not implemented")
    return []
  },
  async init() {
    // Initialize your storage if needed
    console.log("Offline storage initialized")
  }
  }
