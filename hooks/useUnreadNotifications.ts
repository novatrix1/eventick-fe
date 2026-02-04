// hooks/useUnreadNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Constants from 'expo-constants';

const { API_URL } = (Constants.expoConfig?.extra || {}) as { API_URL: string };


export const useUnreadNotifications = () => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      const response = await axios.get(
        `${API_URL}/api/notifications/user/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000, // Timeout de 10 secondes
        }
      );

      const unreadNotifications = response.data.notifications.filter(
        (notification: any) => notification.status === 'send'
      );
      
      setUnreadCount(unreadNotifications.length);
    } catch (error: any) {
      console.error('Erreur récupération compteur notifications:', error);
      setError(error.response?.data?.message || "Erreur de chargement");
      // On garde l'ancienne valeur en cas d'erreur
    } finally {
      setLoading(false);
    }
  }, []);

  // Fonction pour mettre à jour manuellement le compteur
  const updateUnreadCount = useCallback((count: number) => {
    setUnreadCount(count);
  }, []);

  useEffect(() => {
    fetchUnreadCount();

    // Rafraîchir moins fréquemment pour éviter les flashs
    const interval = setInterval(fetchUnreadCount, 60000); // Toutes les minutes
    
    return () => clearInterval(interval);
  }, [fetchUnreadCount]);

  return {
    unreadCount,
    loading,
    error,
    refreshUnreadCount: fetchUnreadCount,
    updateUnreadCount,
  };
};