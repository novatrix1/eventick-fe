import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ApiResponse, GroupedTickets } from '../types';
import { formatTickets } from '../utils/ticketUtils';

const API_URL = "https://eventick.onrender.com";

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
      const { activeTickets: formattedActiveTickets, expiredTickets: formattedExpiredTickets } = formatTickets(data.bookings);

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