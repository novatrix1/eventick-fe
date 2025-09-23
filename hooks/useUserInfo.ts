import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { UserInfo } from '../types';
import { DEFAULT_PROFILE_IMAGE } from '../constants/profile';

const API_URL = "https://eventick.onrender.com";

export const useUserInfo = () => {
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    email: '',
    phone: '',
    profileImage: DEFAULT_PROFILE_IMAGE,
    role: 'user',
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserInfo = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await axios.get(`${API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { name, email, phone, role } = response.data.user;
      setUserInfo({
        name,
        email,
        phone,
        role,
        profileImage: DEFAULT_PROFILE_IMAGE,
      });
    } catch (error) {
      console.error("Erreur de chargement des infos utilisateur:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return {
    userInfo,
    isLoading,
    refetch: fetchUserInfo,
  };
};