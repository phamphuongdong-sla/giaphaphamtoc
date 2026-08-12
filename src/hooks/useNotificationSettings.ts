import { useState, useEffect } from 'react';

export interface NotificationSettings {
  isEnabled: boolean;
  time: string; // "HH:MM"
}

export const useNotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings>(() => {
    const saved = localStorage.getItem('giapha_notification_settings');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing notification settings", e);
      }
    }
    return { isEnabled: false, time: '08:00' };
  });

  const [notifiedHistory, setNotifiedHistory] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('giapha_notification_history');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error parsing notification history", e);
      }
    }
    return {};
  });

  useEffect(() => {
    localStorage.setItem('giapha_notification_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('giapha_notification_history', JSON.stringify(notifiedHistory));
  }, [notifiedHistory]);

  const updateSettings = (newSettings: Partial<NotificationSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const markAsNotified = (key: string) => {
    setNotifiedHistory(prev => ({ ...prev, [key]: true }));
  };

  const hasBeenNotified = (key: string) => {
    return !!notifiedHistory[key];
  };

  // Utility to clean up old history (optional but good practice)
  const cleanOldHistory = () => {
    const today = new Date().toISOString().split('T')[0];
    const newHistory: Record<string, boolean> = {};
    
    // Only keep history for today to prevent localStorage from growing infinitely
    // The key format will be `${today}_${id}`
    Object.keys(notifiedHistory).forEach(key => {
      if (key.startsWith(today)) {
        newHistory[key] = true;
      }
    });

    if (Object.keys(newHistory).length !== Object.keys(notifiedHistory).length) {
      setNotifiedHistory(newHistory);
    }
  };

  return {
    settings,
    updateSettings,
    markAsNotified,
    hasBeenNotified,
    cleanOldHistory
  };
};
