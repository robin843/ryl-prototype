// Ryl Service Worker - Push Notifications + Video Performance Caching
const PUSH_CACHE = 'ryl-push-v1';
const MANIFEST_CACHE = 'ryl-manifests-v1';
const THUMBNAIL_CACHE = 'ryl-thumbnails-v1';
const MANIFEST_TTL = 60 * 1000; // 1 minute for manifests (allow updates)
const ASSET_TTL = 365 * 24 * 60 * 60 * 1000; // 1 year for immutable assets

// Install event
self.addEventListener('install', (event) => {
  console.log('[SW] Service Worker installed');
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Service Worker activated');
  event.waitUntil(
    Promise.all([
      self.clients.claim(),
      // Clean up old cache versions
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => 
              name.startsWith('ryl-') && 
              ![PUSH_CACHE, MANIFEST_CACHE, THUMBNAIL_CACHE].includes(name)
            )
            .map((name) => caches.delete(name))
        );
      }),
    ])
  );
});

// === VIDEO PERFORMANCE CACHING ===
// Cache HLS manifests and thumbnails for faster video startup

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const pathname = url.pathname;
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;
  
  // === HLS MANIFEST CACHING (.m3u8 files) ===
  // Critical for sub-500ms video startup
  if (pathname.includes('.m3u8') || pathname.includes('manifest')) {
    event.respondWith(
      caches.open(MANIFEST_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        
        // Stale-while-revalidate pattern
        const fetchPromise = fetch(event.request).then((response) => {
          if (response.ok) {
            // Clone and cache the response
            cache.put(event.request, response.clone());
          }
          return response;
        }).catch(() => {
          // Network failed, return cached if available
          return cached;
        });
        
        // Return cached immediately, update in background
        return cached || fetchPromise;
      })
    );
    return;
  }
  
  // === VIDEO SEGMENT CACHING (.ts, .m4s files) ===
  // Cache video segments for smoother playback
  if (pathname.endsWith('.ts') || pathname.endsWith('.m4s')) {
    event.respondWith(
      caches.open(MANIFEST_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        
        const response = await fetch(event.request);
        if (response.ok) {
          // Cache segments (they're immutable)
          cache.put(event.request, response.clone());
        }
        return response;
      })
    );
    return;
  }
  
  // === THUMBNAIL CACHING ===
  // Cache episode thumbnails for instant feed rendering
  const isStorageUrl = url.hostname.includes('supabase') && pathname.includes('/storage/');
  const isImageFile = pathname.match(/\.(jpg|jpeg|png|webp|gif)$/i);
  const isCloudflareImage = url.hostname.includes('cloudflare') || url.hostname.includes('imagedelivery');
  
  if ((isStorageUrl && isImageFile) || isCloudflareImage) {
    event.respondWith(
      caches.open(THUMBNAIL_CACHE).then(async (cache) => {
        const cached = await cache.match(event.request);
        if (cached) return cached;
        
        const response = await fetch(event.request);
        if (response.ok) {
          // Cache thumbnails (long TTL, they rarely change)
          cache.put(event.request, response.clone());
        }
        return response;
      })
    );
    return;
  }
});

// === PUSH NOTIFICATIONS ===

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);

  let data = {
    title: 'Ryl',
    body: 'Du hast eine neue Benachrichtigung',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    url: '/',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      console.error('[SW] Error parsing push data:', e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || '/favicon.ico',
    badge: data.badge || '/favicon.ico',
    image: data.image,
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: data.actions || [],
    tag: data.tag || 'ryl-notification',
    renotify: true,
    requireInteraction: data.requireInteraction || false,
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event);

  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already an open window
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(urlToOpen);
            return client.focus();
          }
        }
        // Open new window if none exists
        if (self.clients.openWindow) {
          return self.clients.openWindow(urlToOpen);
        }
      })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed:', event);
});

// Background sync for failed notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-notifications') {
    console.log('[SW] Syncing notifications');
  }
});
