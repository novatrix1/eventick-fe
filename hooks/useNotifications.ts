import { useState } from 'react';
import { Notification } from '../types';
import { SAMPLE_NOTIFICATIONS } from '../constants/notifications';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  return {
    notifications,
    markAsRead,
    markAllAsRead
  };
};