// hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Notification, NotificationResponse } from '../types';

const API_URL = "https://eventick.onrender.com";
const CACHE_KEY = 'notifications_cache';

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Charger le cache au démarrage
  const loadFromCache = useCallback(async () => {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const cachedData = JSON.parse(cached);
        // Vérifier si le cache n'est pas trop vieux (5 minutes)
        const cacheTime = cachedData.timestamp;
        const now = Date.now();
        if (now - cacheTime < 5 * 60 * 1000) {
          setNotifications(cachedData.notifications);
          return true;
        }
      }
    } catch (error) {
      console.error('Erreur chargement cache:', error);
    }
    return false;
  }, []);

  // Sauvegarder dans le cache
  const saveToCache = useCallback(async (notifs: Notification[]) => {
    try {
      const cacheData = {
        notifications: notifs,
        timestamp: Date.now()
      };
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erreur sauvegarde cache:', error);
    }
  }, []);

  const fetchNotifications = useCallback(async (isRefresh = false) => {
    try {
      if (!isRefresh) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
      setError(null);
      
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        throw new Error("Token non trouvé");
      }

      const response = await axios.get<NotificationResponse>(
        `${API_URL}/api/notifications/user/me`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      // Trier par date de création (les plus récentes en premier)
      const sortedNotifications = response.data.notifications.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setNotifications(sortedNotifications);
      await saveToCache(sortedNotifications);
    } catch (err: any) {
      console.error('Erreur récupération notifications:', err);
      
      // En cas d'erreur, essayer de charger depuis le cache
      if (!isRefresh) {
        const hasCache = await loadFromCache();
        if (!hasCache) {
          setError(err.response?.data?.message || "Erreur de chargement des notifications");
        }
      } else {
        setError(err.response?.data?.message || "Erreur de rafraîchissement");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [loadFromCache, saveToCache]);

  const markAsRead = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Token non trouvé");

      // Optimistic update
      setNotifications(prev =>
        prev.map(notif =>
          notif._id === id ? { ...notif, status: 'read' } : notif
        )
      );

      await axios.put(
        `${API_URL}/api/notifications/${id}/read`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Mettre à jour le cache
      await saveToCache(notifications.map(notif =>
        notif._id === id ? { ...notif, status: 'read' } : notif
      ));
    } catch (err: any) {
      console.error('Erreur marquage comme lu:', err);
      
      // Revert optimistic update en cas d'erreur
      const hasCache = await loadFromCache();
      if (!hasCache) {
        Alert.alert("Erreur", "Impossible de marquer la notification comme lue");
      }
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Token non trouvé");

      // Optimistic update
      const updatedNotifications = notifications.filter(notif => notif._id !== id);
      setNotifications(updatedNotifications);

      await axios.delete(
        `${API_URL}/api/notifications/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Mettre à jour le cache
      await saveToCache(updatedNotifications);
    } catch (err: any) {
      console.error('Erreur suppression:', err);
      
      // Revert optimistic update
      const hasCache = await loadFromCache();
      if (!hasCache) {
        Alert.alert("Erreur", "Impossible de supprimer la notification");
      }
    }
  };

  const markAllAsRead = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("Token non trouvé");

      // Optimistic update
      const updatedNotifications = notifications.map(notif => ({ 
        ...notif, 
        status: 'read' as const 
      }));
      setNotifications(updatedNotifications);

      const unreadNotifications = notifications.filter(notif => notif.status === 'send');
      
      await Promise.all(
        unreadNotifications.map(notif => 
          axios.put(
            `${API_URL}/api/notifications/${notif._id}/read`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          )
        )
      );

      // Mettre à jour le cache
      await saveToCache(updatedNotifications);

      Alert.alert("Succès", "Toutes les notifications ont été marquées comme lues");
    } catch (err: any) {
      console.error('Erreur marquage global:', err);
      
      // Revert optimistic update
      const hasCache = await loadFromCache();
      if (!hasCache) {
        Alert.alert("Erreur", "Impossible de marquer toutes les notifications comme lues");
      }
    }
  };

  const refreshNotifications = () => {
    fetchNotifications(true);
  };

  useEffect(() => {
    // Essayer de charger depuis le cache d'abord, puis rafraîchir
    const initialize = async () => {
      const hasCache = await loadFromCache();
      // Rafraîchir les données même si on a un cache
      fetchNotifications();
    };
    
    initialize();
  }, [fetchNotifications, loadFromCache]);

  return {
    notifications,
    loading,
    refreshing,
    error,
    markAsRead,
    deleteNotification,
    markAllAsRead,
    refreshNotifications,
  };
};