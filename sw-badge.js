// Service Worker extension for handling PWA Push Notifications & App Badging

self.addEventListener('push', (event) => {
  let data = {};
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { body: event.data.text() };
    }
  }

  const title = data.title || 'Gia Phả Phạm Tộc';
  const count = typeof data.badgeCount === 'number' 
    ? data.badgeCount 
    : (typeof data.unreadCount === 'number' ? data.unreadCount : 1);

  event.waitUntil((async () => {
    // 1. Cập nhật số đỏ trên icon ứng dụng (App Badging API)
    if ('setAppBadge' in self.navigator) {
      try {
        await self.navigator.setAppBadge(count);
      } catch (err) {
        console.warn('SW setAppBadge error:', err);
      }
    }

    // 2. Hiển thị thông báo trên màn hình
    const options = {
      body: data.body || 'Bạn có thông báo ngày giỗ / sự kiện mới',
      icon: '/giaphaphamtoc/icons/icon-192.png',
      badge: '/giaphaphamtoc/icons/icon-192.png',
      data: data.url || '/giaphaphamtoc/',
      vibrate: [100, 50, 100],
      tag: data.tag || 'giapha-notification',
      renotify: true,
      requireInteraction: true
    };

    return self.registration.showNotification(title, options);
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data || '/giaphaphamtoc/';

  event.waitUntil((async () => {
    const windowClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const client of windowClients) {
      if (client.url.includes('/giaphaphamtoc/') && 'focus' in client) {
        return client.focus();
      }
    }
    if (self.clients.openWindow) {
      return self.clients.openWindow(urlToOpen);
    }
  })());
});

// Lắng nghe tin nhắn từ main app để cập nhật badge
self.addEventListener('message', (event) => {
  if (event.data) {
    if (event.data.type === 'SET_BADGE' && typeof event.data.count === 'number') {
      if ('setAppBadge' in self.navigator) {
        self.navigator.setAppBadge(event.data.count).catch(() => {});
      }
    } else if (event.data.type === 'CLEAR_BADGE') {
      if ('clearAppBadge' in self.navigator) {
        self.navigator.clearAppBadge().catch(() => {});
      }
    }
  }
});
