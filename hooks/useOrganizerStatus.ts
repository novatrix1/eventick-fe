import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { OrganizerStatus } from '../types';

const API_URL = "https://eventick.onrender.com";

export const useOrganizerStatus = (userRole: string) => {
  const [organizerStatus, setOrganizerStatus] = useState<OrganizerStatus>({
    isOrganizer: false,
    isVerified: false,
    isLoading: true,
  });

  const fetchOrganizerStatus = async () => {
    try {
      if (userRole !== 'organizer') {
        setOrganizerStatus({
          isOrganizer: false,
          isVerified: false,
          isLoading: false,
        });
        return;
      }

      const token = await AsyncStorage.getItem("token");
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/organizers/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrganizerStatus({
        isOrganizer: true,
        isVerified: response.data.organizer.isVerified,
        isLoading: false,
      });
    } catch (error) {
      console.error("Erreur profil organisateur:", error);
      setOrganizerStatus({
        isOrganizer: true,
        isVerified: false,
        isLoading: false,
      });
    }
  };

  useEffect(() => {
    if (userRole) {
      fetchOrganizerStatus();
    }
  }, [userRole]);

  return {
    organizerStatus,
    refetch: fetchOrganizerStatus,
  };
};