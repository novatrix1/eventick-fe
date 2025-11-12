import { useState, useCallback } from 'react';
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NotificationSettings } from '../types';

import Constants from 'expo-constants';

const { API_URL } = (Constants.expoConfig?.extra || {}) as { API_URL: string };

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

  const [loading, setLoading] = useState(false);

  const fetchSettings = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      // Implémenter la récupération des paramètres si l'API le permet
      // const response = await axios.get(`${API_URL}/api/notification-settings`, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });
      // setSettings(response.data.settings);
    } catch (error) {
      console.error('Erreur récupération paramètres:', error);
    }
  }, []);

  const saveSettings = async (newSettings: NotificationSettings) => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Token non trouvé");

      // Implémenter la sauvegarde des paramètres si l'API le permet
      // await axios.put(`${API_URL}/api/notification-settings`, newSettings, {
      //   headers: { Authorization: `Bearer ${token}` },
      // });

      setSettings(newSettings);
      Alert.alert("Succès", "Paramètres sauvegardés");
    } catch (error: any) {
      console.error('Erreur sauvegarde paramètres:', error);
      Alert.alert("Erreur", "Impossible de sauvegarder les paramètres");
    } finally {
      setLoading(false);
    }
  };

  const togglePushEnabled = () => {
    const newSettings = {
      ...settings,
      pushEnabled: !settings.pushEnabled
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const toggleCategory = (category: keyof NotificationSettings['categories']) => {
    const newSettings = {
      ...settings,
      categories: {
        ...settings.categories,
        [category]: !settings.categories[category]
      }
    };
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  return {
    settings,
    loading,
    togglePushEnabled,
    toggleCategory,
    fetchSettings
  };
};