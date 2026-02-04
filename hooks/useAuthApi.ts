import { useState } from 'react';
import axios from 'axios';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Constants from 'expo-constants';

const { API_URL } = (Constants.expoConfig?.extra || {}) as { API_URL: string };


export const useAuthApi = () => {
  const [loading, setLoading] = useState(false);

  const handleApiError = (error: any, defaultMessage: string) => {
    const message = error.response?.data?.message || defaultMessage;
    
    // Gestion spécifique des erreurs de token
    if (error.response?.status === 401) {
      AsyncStorage.removeItem("token");
      Alert.alert("Session expirée", "Veuillez vous reconnecter");
    } else {
      Alert.alert("Erreur", message);
    }
    
    throw error;
  };

  const registerUser = async (userData: any) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/auth/register`, userData);
      return res.data;
    } catch (error: any) {
      return handleApiError(error, "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  const loginUser = async (credentials: { email: string; password: string }) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/auth/login`, credentials);
      
      if (res.data.token) {
        await AsyncStorage.setItem("token", res.data.token);
      }
      
      return res.data;
    } catch (error: any) {
      return handleApiError(error, "Erreur lors de la connexion");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (userId: string, otp: string) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        userId,
        otp,
      });
      return res.data;
    } catch (error: any) {
      return handleApiError(error, "Erreur lors de la vérification OTP");
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async (email: string) => {
    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/auth/resend-otp`, {
        email,
      });
      Alert.alert("Succès", "Nouveau code envoyé !");
      return res.data;
    } catch (error: any) {
      return handleApiError(error, "Erreur lors du renvoi du code");
    } finally {
      setLoading(false);
    }
  };

  const registerOrganizer = async (organizerData: FormData, token: string) => {
    try {
      setLoading(true);
      const res = await axios.post(
        `${API_URL}/api/organizers/register`,
        organizerData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return res.data;
    } catch (error: any) {
      return handleApiError(error, "Erreur lors de l'inscription organisateur");
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    setLoading,
    registerUser,
    loginUser,
    verifyOtp,
    resendOtp,
    registerOrganizer,
  };
};