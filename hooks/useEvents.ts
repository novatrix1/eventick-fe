import { useState, useEffect } from 'react';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiEvent, Event, Category } from '../types';
import { transformApiEventToEvent } from '../utils/eventTransformer';

import Constants from 'expo-constants';

const { API_URL } = (Constants.expoConfig?.extra || {}) as { API_URL: string };

export const useEvents = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [categoryEvents, setCategoryEvents] = useState<Record<string, Event[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories: Category[] = [
    { id: 'all', name: 'Toutes', icon: 'apps' },
    { id: 'Concert', name: 'Concerts', icon: 'musical-notes' },
    { id: 'Sport', name: 'Sport', icon: 'football' },
    { id: 'Culture', name: 'Culture', icon: 'color-palette' },
    { id: 'Business', name: 'Business', icon: 'briefcase' },
    { id: 'Festival', name: 'Festivals', icon: 'wine' },
  ];

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('token');

      const response = await axios.get(`${API_URL}/api/events`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      const apiEvents: ApiEvent[] = response.data;
      
      // Cast pour résoudre les conflits de types temporairement
      const transformedEvents: Event[] = apiEvents.map(event => 
        transformApiEventToEvent(event as any)
      );

      setEvents(transformedEvents);

      // Grouper par catégorie
      const eventsByCategory: Record<string, Event[]> = {};
      categories.forEach(category => {
        if (category.id !== 'all') {
          eventsByCategory[category.id] = transformedEvents
            .filter(e => e.category === category.id)
            .slice(0, 3);
        }
      });

      setCategoryEvents(eventsByCategory);
      setError(null);
    } catch (err) {
      console.error('Erreur lors de la récupération des événements:', err);
      setError('Impossible de charger les événements');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchEvents();
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  return {
    events,
    categoryEvents,
    isLoading,
    refreshing,
    error,
    refetch: fetchEvents,
    onRefresh,
    categories,
  };
};