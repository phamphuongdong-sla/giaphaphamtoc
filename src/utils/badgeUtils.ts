/**
 * Utility functions for PWA App Badging API and Cloudflare Web Push
 */

import { CLOUDFLARE_API_URL } from '@/services/cloudflareApi';

export const VAPID_PUBLIC_KEY = 'BLMY9-zETzZBVOVYs-n4Cim0JPSDD97Z_QuLJDtR6UDd9HIrtM_WZ25_EvG9Io_A4AOv5ZlQGNfcyK_QuSLUHh4';

export const isAppBadgeSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'setAppBadge' in navigator;
};

export const setAppBadge = async (count?: number): Promise<boolean> => {
  if (isAppBadgeSupported()) {
    try {
      if (typeof count === 'number' && count > 0) {
        // @ts-ignore
        await navigator.setAppBadge(count);
      } else {
        // @ts-ignore
        await navigator.setAppBadge();
      }
      return true;
    } catch (error) {
      console.warn('Failed to set app badge:', error);
    }
  }
  return false;
};

export const clearAppBadge = async (): Promise<boolean> => {
  if (typeof navigator !== 'undefined' && 'clearAppBadge' in navigator) {
    try {
      // @ts-ignore
      await navigator.clearAppBadge();
      return true;
    } catch (error) {
      console.warn('Failed to clear app badge:', error);
    }
  }
  return false;
};

export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Đăng ký nhận thông báo đẩy Web Push với Cloudflare Worker
 */
export async function subscribeToCloudflarePush(): Promise<boolean> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    let subscription = await registration.pushManager.getSubscription();

    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });
    }

    if (subscription && CLOUDFLARE_API_URL) {
      await fetch(`${CLOUDFLARE_API_URL}/api/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription.toJSON())
      });
      return true;
    }
  } catch (err) {
    console.warn('Lỗi đăng ký Cloudflare Web Push:', err);
  }
  return false;
}

/**
 * Gửi lệnh thử nghiệm Web Push từ Cloudflare về điện thoại
 */
export async function sendTestNotificationWithBadge(unreadCount: number = 2): Promise<boolean> {
  if (typeof Notification === 'undefined') {
    alert('Trình duyệt của bạn không hỗ trợ thông báo.');
    return false;
  }

  let perm = Notification.permission;
  if (perm !== 'granted') {
    perm = await Notification.requestPermission();
  }

  if (perm !== 'granted') {
    alert('Vui lòng cho phép quyền Thông báo để thử nghiệm số đỏ trên icon.');
    return false;
  }

  // 1. Cập nhật Badge trên icon PWA ngay lập tức
  await setAppBadge(unreadCount);

  // 2. Đăng ký Web Push với Cloudflare
  await subscribeToCloudflarePush();

  // 3. Gửi thông báo test qua Cloudflare API
  let serverPushSent = false;
  if (CLOUDFLARE_API_URL) {
    try {
      const res = await fetch(`${CLOUDFLARE_API_URL}/api/send-test-push`, { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        serverPushSent = true;
      }
    } catch (e) {
      console.warn('Server push test error:', e);
    }
  }

  // Fallback hiển thị notification cục bộ nếu server push chưa gửi được
  if (!serverPushSent) {
    const title = 'Gia Phả Phạm Tộc';
    const options: NotificationOptions = {
      body: `Thử nghiệm thành công! Icon ứng dụng đã được gắn số đỏ (${unreadCount}).`,
      icon: '/giaphaphamtoc/icons/icon-192.png',
      badge: '/giaphaphamtoc/icons/icon-192.png',
      tag: 'test-badge-notification',
      // @ts-ignore
      renotify: true,
      // @ts-ignore
      requireInteraction: true,
    };

    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification(title, options);
      } else {
        new Notification(title, options);
      }
    } catch (e) {
      try { new Notification(title, options); } catch {}
    }
  }

  return true;
}
