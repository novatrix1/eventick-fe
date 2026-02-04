import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, GroupedTickets } from '../types';
import { formatTickets } from '../utils/ticketUtils';

import Constants from 'expo-constants';

const { API_URL } = (Constants.expoConfig?.extra || {}) as { API_URL: string };


export const useTickets = () => {
  const [activeTickets, setActiveTickets] = useState<GroupedTickets>({});
  const [expiredTickets, setExpiredTickets] = useState<GroupedTickets>({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchTickets = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Erreur', 'Token non trouvé');
        setLoading(false);
        return;
      }

      const eventsResponse = await fetch(`${API_URL}/api/events`);
      if (!eventsResponse.ok) throw new Error("Erreur lors de la récupération des événements");
      const eventsData = await eventsResponse.json();

      const eventImages: Record<string, string | null> = {};
      eventsData.forEach((event: any) => {
        eventImages[event._id] = event.image;
      });

      const response = await fetch(`${API_URL}/api/tickets/my-tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des tickets');
      }

      const data: ApiResponse = await response.json();
      console.log('API Response:', data); // Debug log

      const { activeTickets: formattedActiveTickets, expiredTickets: formattedExpiredTickets } =
        formatTickets(data.bookings, eventImages);

      console.log('Formatted Active Tickets:', formattedActiveTickets); // Debug log
      console.log('Formatted Expired Tickets:', formattedExpiredTickets); // Debug log

      setActiveTickets(formattedActiveTickets);
      setExpiredTickets(formattedExpiredTickets);
    } catch (error) {
      console.error('Erreur:', error);
      Alert.alert('Erreur', 'Impossible de récupérer les tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTickets();
  };

  return {
    activeTickets,
    expiredTickets,
    loading,
    refreshing,
    handleRefresh,
    refetch: fetchTickets
  };
};