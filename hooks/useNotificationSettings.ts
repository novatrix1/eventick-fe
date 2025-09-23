import { useState } from 'react';
import { NotificationSettings } from '../types';

export const useNotificationSettings = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    pushEnabled: true,
    categories: {
      concerts: true,
      religion: true,
      sport: true,
      culture: true,
      business: true
    }
  });

  const togglePushEnabled = () => {
    setSettings(prev => ({
      ...prev,
      pushEnabled: !prev.pushEnabled
    }));
  };

  const toggleCategory = (category: keyof NotificationSettings['categories']) => {
    setSettings(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: !prev.categories[category]
      }
    }));
  };

  return {
    settings,
    togglePushEnabled,
    toggleCategory
  };
};