/**
 * Utility functions for PWA App Badging API (navigator.setAppBadge / navigator.clearAppBadge)
 */

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

export const sendTestNotificationWithBadge = async (unreadCount: number = 1): Promise<boolean> => {
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

  // 1. Cập nhật Badge trên icon PWA
  await setAppBadge(unreadCount);

  // 2. Gửi Notification banner
  const title = 'Gia Phả Phạm Tộc';
  const options: NotificationOptions = {
    body: `Thử nghiệm thông báo thành công! Icon ứng dụng đã được gắn số đỏ (${unreadCount}).`,
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
    return true;
  } catch (err) {
    console.warn('Lỗi hiển thị notification:', err);
    try {
      new Notification(title, options);
      return true;
    } catch (e) {
      return false;
    }
  }
};
