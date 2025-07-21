const CACHE_NAME = "hospital-management-v2"
const urlsToCache = [
  "/",
  "/patients",
  "/doctors",
  "/appointments",
  "/pharmacy",
  "/laboratory",
  "/financial",
  "/manifest.json",
]

// Install event - cache resources
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
  self.clients.claim()
})

// Fetch event - serve from cache, fallback to network
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  // Skip chrome-extension and other non-http requests
  if (!event.request.url.startsWith("http")) {
    return
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version if available
      if (response) {
        return response
      }

      // Clone the request because it's a stream
      const fetchRequest = event.request.clone()

      return fetch(fetchRequest)
        .then((response) => {
          // Check if valid response
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response
          }

          // Clone the response because it's a stream
          const responseToCache = response.clone()

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })

          return response
        })
        .catch(() => {
          // Return offline page for navigation requests
          if (event.request.mode === "navigate") {
            return caches.match("/")
          }
          return new Response("Offline", { status: 503 })
        })
    }),
  )
})

// Background sync for offline data
self.addEventListener("sync", (event) => {
  if (event.tag === "background-sync") {
    event.waitUntil(syncOfflineData())
  }
})

// Message handling for manual sync triggers
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SYNC_DATA") {
    event.waitUntil(syncOfflineData())
  }
})

async function syncOfflineData() {
  try {
    // This will be handled by the OfflineManager in the main thread
    // Send message to all clients to trigger sync
    const clients = await self.clients.matchAll()
    clients.forEach((client) => {
      client.postMessage({ type: "TRIGGER_SYNC" })
    })
  } catch (error) {
    console.error("Background sync failed:", error)
  }
}

// Push notification handling (for future use)
self.addEventListener("push", (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: "/icon-192x192.png",
      badge: "/icon-192x192.png",
      data: data.data,
    }

    event.waitUntil(self.registration.showNotification(data.title, options))
  }
})

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  event.waitUntil(clients.openWindow(event.notification.data?.url || "/"))
})
