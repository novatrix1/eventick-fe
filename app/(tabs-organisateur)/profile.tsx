import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';
import { Href, router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { SafeAreaView } from "react-native-safe-area-context";

import Constants from 'expo-constants';

const { API_URL } = (Constants.expoConfig?.extra || {}) as { API_URL: string };

const primaryColor = '#ec673b';

const helpOptions = [
  { id: 'contact', title: 'Contacter le support', icon: 'headset', screen: '/screens/ContactSupportScreen' },
  { id: 'faq', title: 'FAQ', icon: 'help-circle', screen: '/screens/FAQScreen' },
  { id: 'terms', title: "Conditions d'utilisation", icon: 'document-text', screen: 'screens/TermsOfUseScreen' },
  { id: 'privacy', title: 'Politique de confidentialité', icon: 'shield', screen: 'screens/PrivacyPolicyScreen' },
];

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  address: string;
  role: string;
  isVerified: boolean;
}

interface OrganizerProfile {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    profilePicture?: string;
  };
  companyName: string;
  address: string;
  isVerified: boolean;
  phone: string;
  type: string;
  socialMedia: any[];
  description: string;
  isActive: boolean;
  verificationStatus: string;
  categories: string[];
  rating: number;
  totalEvents: number;
  totalRevenue: number;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  verificationDate?: string;
  verifiedBy?: string;
  balance: number;
}

const ProfileScreen = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [organizerProfile, setOrganizerProfile] = useState<OrganizerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [notifications, setNotifications] = useState({
    sales: true,
    reminders: true,
    promotions: false,
    updates: true,
  });

  const [security] = useState({
    twoFactor: true,
    verified: true,
    lastLogin: '2023-10-15 14:30',
    devices: 2,
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setError("Vous devez être connecté");
        return null;
      }

      const response = await axios.get(`${API_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.user;
    } catch (err: any) {
      console.error("Erreur chargement profil utilisateur:", err);
      setError(err.response?.data?.message || "Erreur lors du chargement du profil utilisateur");
      return null;
    }
  };

  // Fetch organizer profile
  const fetchOrganizerProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setError("Vous devez être connecté");
        return null;
      }

      const response = await axios.get(`${API_URL}/api/organizers/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.organizer;
    } catch (err: any) {
      console.error("Erreur chargement profil organisateur:", err);
      setError(err.response?.data?.message || "Erreur lors du chargement du profil organisateur");
      return null;
    }
  };

  const fetchProfiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setError("Vous devez être connecté");
        return;
      }

      // Fetch both profiles in parallel
      const [userData, organizerData] = await Promise.all([
        fetchUserProfile(),
        fetchOrganizerProfile()
      ]);

      if (userData) {
        setUserProfile(userData);
      }

      if (organizerData) {
        setOrganizerProfile(organizerData);
      }

      // If no data at all
      if (!userData && !organizerData) {
        setError("Aucune donnée de profil trouvée");
      }
    } catch (err: any) {
      console.error("Erreur lors du chargement des profils:", err);
      setError(err.response?.data?.message || "Erreur lors du chargement des profils");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const changePassword = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté");
        return;
      }

      if (!password || !newPassword || !confirmPassword) {
        Alert.alert("Erreur", "Veuillez remplir tous les champs");
        return;
      }

      if (newPassword !== confirmPassword) {
        Alert.alert("Erreur", "Les mots de passe ne correspondent pas");
        return;
      }

      const response = await axios.put(
        `${API_URL}/api/auth/change-password`,
        {
          currentPassword: password,
          newPassword: newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        Alert.alert("Succès", "Mot de passe changé avec succès");
        setShowPasswordModal(false);
        setPassword('');
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (err: any) {
      console.error("Erreur changement mot de passe:", err);
      Alert.alert(
        "Erreur",
        err.response?.data?.message || "Erreur lors du changement de mot de passe"
      );
    }
  };

  const deleteAccount = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté");
        return;
      }

      const response = await axios.delete(`${API_URL}/api/organizers/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        Alert.alert("Succès", "Compte supprimé avec succès");
        setShowDeleteModal(false);
        // Clear storage and redirect to login
        await AsyncStorage.removeItem("token");
        await AsyncStorage.removeItem("user");
        router.replace("/(auth)/login");
      }
    } catch (err: any) {
      console.error("Erreur suppression compte:", err);
      Alert.alert(
        "Erreur",
        err.response?.data?.message || "Erreur lors de la suppression du compte"
      );
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
      Alert.alert("Succès", "Déconnexion réussie");
      router.replace("/(auth)/login");
    } catch (err) {
      console.error("Erreur déconnexion:", err);
      Alert.alert("Erreur", "Erreur lors de la déconnexion");
    }
  };

  const toggleNotification = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  // Get profile picture - prioritize user profile picture
  const getProfilePicture = () => {
    return userProfile?.profilePicture || 
           organizerProfile?.user?.profilePicture || 
           "https://i.postimg.cc/fLPF4T98/Whats-App-Image-2025-06-27-12-01-22-36d8d6d7.jpg";
  };

  // Get display name - prioritize user name
  const getDisplayName = () => {
    return userProfile?.name || organizerProfile?.user?.name || 'Non renseigné';
  };

  // Get display email - prioritize user email
  const getDisplayEmail = () => {
    return userProfile?.email || organizerProfile?.user?.email || 'Non renseigné';
  };

  // Get display phone - show both personal and company phones
  const getDisplayPhone = () => {
    const personalPhone = userProfile?.phone || organizerProfile?.user?.phone;
    const companyPhone = organizerProfile?.phone;
    
    if (personalPhone && companyPhone && personalPhone !== companyPhone) {
      return `Perso: ${personalPhone} | Pro: ${companyPhone}`;
    }
    return personalPhone || companyPhone || 'Non renseigné';
  };

  // Get company name
  const getCompanyName = () => {
    return organizerProfile?.companyName || 'Aucune entreprise';
  };

  if (loading) {
    return (
      <BackgroundWrapper>
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={primaryColor} />
          <Text className="text-white mt-4 text-lg">Chargement du profil...</Text>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  if (error) {
    return (
      <BackgroundWrapper>
        <SafeAreaView className="flex-1 justify-center items-center p-6">
          <MaterialIcons name="error-outline" size={64} color="#EF4444" />
          <Text className="text-white text-xl text-center mb-4">{error}</Text>
          <TouchableOpacity
            className="bg-teal-400 py-3 px-6 rounded-xl"
            onPress={fetchProfiles}
          >
            <Text className="text-gray-900 font-bold">Réessayer</Text>
          </TouchableOpacity>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1" edges={['top']}>
        <StatusBar style="light" />
        <ScrollView
          className="flex-1 px-5 pt-6 pb-32"
          showsVerticalScrollIndicator={false}
        >
          {/* Header avec informations du profil */}
          <View className="items-center mb-8">
            <Image
              source={{ uri: getProfilePicture() }}
              className="w-32 h-32 rounded-full border-4 border-[#ec673b]"
            />
            <Text className="text-white text-2xl font-extrabold mt-5">
              {getDisplayName()}
            </Text>
            
            <Text className="text-gray-400 mt-1">
              {getDisplayEmail()}
            </Text>
            <Text className="text-gray-400 text-center">
              {getDisplayPhone()}
            </Text>
            
            {organizerProfile?.companyName && (
              <View className="mt-2 bg-teal-400/20 px-4 py-2 rounded-full">
                <Text className="text-teal-400 font-medium">
                  {getCompanyName()}
                </Text>
              </View>
            )}

            {organizerProfile?.isVerified && (
              <View className="flex-row items-center mt-2 bg-green-400/20 px-3 py-1 rounded-full">
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text className="text-green-400 text-sm ml-1">Compte vérifié</Text>
              </View>
            )}
          </View>

          {/* Section Mon profil */}
          <View className="mb-8">
            <Text className="text-white text-xl font-bold mb-4">Mon profil</Text>
            <View className="bg-white/10 rounded-xl overflow-hidden border border-white/10">
              <TouchableOpacity
                className="flex-row items-center p-4"
                onPress={() => router.push('/screens/EditProfileScreenOrganisateur')}
                activeOpacity={0.7}
              >
                <Ionicons name="create" size={26} color={primaryColor} />
                <Text className="text-white flex-1 ml-4 text-lg font-semibold">
                  Modifier le profil
                </Text>
                <Ionicons name="chevron-forward" size={22} color={primaryColor} />
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center p-4 border-t border-white/20"
                onPress={() => router.push('/screens/PaymentSettingsScreen')}
                activeOpacity={0.7}
              >
                <Ionicons name="wallet" size={26} color={primaryColor} />
                <Text className="text-white flex-1 ml-4 text-lg font-semibold">
                  Paramètres de paiement
                </Text>
                <Ionicons name="chevron-forward" size={22} color={primaryColor} />
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center p-4 border-t border-white/20"
                onPress={() => router.push('/screens/DocumentsLegauxScreen')}
                activeOpacity={0.7}
              >
                <Ionicons name="document" size={26} color={primaryColor} />
                <Text className="text-white flex-1 ml-4 text-lg font-semibold">
                  Documents légaux
                </Text>
                <Ionicons name="chevron-forward" size={22} color={primaryColor} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section Notifications */}
          <View className="mb-8">
            <Text className="text-white text-xl font-bold mb-4">Notifications</Text>
            <View className="bg-white/10 rounded-xl overflow-hidden border border-white/10">
              <View className="flex-row items-center justify-between p-4">
                <View className="flex-row items-center">
                  <Ionicons name="cash" size={26} color={primaryColor} />
                  <Text className="text-white ml-4 text-lg">Alertes de ventes</Text>
                </View>
                <Switch
                  value={notifications.sales}
                  onValueChange={() => toggleNotification('sales')}
                  trackColor={{ false: '#767577', true: primaryColor }}
                />
              </View>

              <View className="flex-row items-center justify-between p-4 border-t border-white/20">
                <View className="flex-row items-center">
                  <Ionicons name="calendar" size={26} color={primaryColor} />
                  <Text className="text-white ml-4 text-lg">Rappels d'événements</Text>
                </View>
                <Switch
                  value={notifications.reminders}
                  onValueChange={() => toggleNotification('reminders')}
                  trackColor={{ false: '#767577', true: primaryColor }}
                />
              </View>

              <View className="flex-row items-center justify-between p-4 border-t border-white/20">
                <View className="flex-row items-center">
                  <Ionicons name="megaphone" size={26} color={primaryColor} />
                  <Text className="text-white ml-4 text-lg">Promotions</Text>
                </View>
                <Switch
                  value={notifications.promotions}
                  onValueChange={() => toggleNotification('promotions')}
                  trackColor={{ false: '#767577', true: primaryColor }}
                />
              </View>

              <View className="flex-row items-center justify-between p-4 border-t border-white/20">
                <View className="flex-row items-center">
                  <Ionicons name="notifications" size={26} color={primaryColor} />
                  <Text className="text-white ml-4 text-lg">Mises à jour</Text>
                </View>
                <Switch
                  value={notifications.updates}
                  onValueChange={() => toggleNotification('updates')}
                  trackColor={{ false: '#767577', true: primaryColor }}
                />
              </View>
            </View>
          </View>

          {/* Section Sécurité */}
          <View className="mb-8">
            <Text className="text-white text-xl font-bold mb-4">Sécurité</Text>
            <View className="bg-white/10 rounded-xl overflow-hidden border border-white/10">
              <TouchableOpacity
                className="flex-row items-center justify-between p-4"
                onPress={() => setShowPasswordModal(true)}
                activeOpacity={0.7}
              >
                <View className="flex-row items-center">
                  <Ionicons name="key" size={26} color={primaryColor} />
                  <Text className="text-white ml-4 text-lg">Changer le mot de passe</Text>
                </View>
                <Ionicons name="chevron-forward" size={22} color={primaryColor} />
              </TouchableOpacity>

              <View className="flex-row items-center justify-between p-4 border-t border-white/20">
                <View className="flex-row items-center">
                  <Ionicons name="lock-closed" size={26} color={primaryColor} />
                  <Text className="text-white ml-4 text-lg">Authentification à deux facteurs</Text>
                </View>
                <Switch
                  value={security.twoFactor}
                  trackColor={{ false: '#767577', true: primaryColor }}
                />
              </View>

              <TouchableOpacity
                className="flex-row items-center p-4 border-t border-white/20"
                onPress={() => router.push('/screens/LoginHistoryScreen')}
                activeOpacity={0.7}
              >
                <Ionicons name="time" size={26} color={primaryColor} />
                <Text className="text-white flex-1 ml-4 text-lg">Historique de connexion</Text>
                <Ionicons name="chevron-forward" size={22} color={primaryColor} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Section Centre d'aide */}
          <View className="mb-8">
            <Text className="text-white text-xl font-bold mb-4">Centre d'aide</Text>
            <View className="bg-white/10 rounded-xl overflow-hidden border border-white/10">
              {helpOptions.map((option, i) => (
                <TouchableOpacity
                  key={option.id}
                  className={`flex-row items-center p-4 ${i < helpOptions.length - 1 ? 'border-b border-white/20' : ''
                    }`}
onPress={() => router.push(option.screen as Href)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={option.icon as any} size={26} color={primaryColor} />
                  <Text className="text-white flex-1 ml-4 text-lg">{option.title}</Text>
                  <Ionicons name="chevron-forward" size={22} color={primaryColor} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Section Actions critiques */}
          <View className="mb-20 rounded-xl overflow-hidden border border-white/10 bg-white/10">
            <TouchableOpacity
              className="flex-row items-center p-5 border-b border-white/20"
              onPress={logout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out" size={26} color="#FF6347" />
              <Text className="text-white flex-1 ml-4 text-lg font-semibold">
                Se déconnecter
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-5"
              onPress={() => setShowDeleteModal(true)}
              activeOpacity={0.7}
            >
              <MaterialIcons name="delete" size={26} color="#FF6347" />
              <Text className="text-red-400 flex-1 ml-4 text-lg font-semibold">
                Supprimer mon compte
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Modal de changement de mot de passe */}
        <Modal
          visible={showPasswordModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowPasswordModal(false)}
        >
          <View className="flex-1 bg-black/70 justify-center items-center p-6">
            <View className="bg-[#0f172a] rounded-3xl p-6 w-full max-w-md shadow-lg border-t-4 border-[#ec673b]">
              <Text className="text-white text-2xl font-bold mb-6 text-center">
                Changer le mot de passe
              </Text>

              <TextInput
                className="bg-white/10 text-white rounded-xl px-5 py-4 mb-4 text-lg border border-white/10"
                placeholder="Mot de passe actuel"
                placeholderTextColor="#ccc"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <TextInput
                className="bg-white/10 text-white rounded-xl px-5 py-4 mb-4 text-lg border border-white/10"
                placeholder="Nouveau mot de passe"
                placeholderTextColor="#ccc"
                secureTextEntry
                value={newPassword}
                onChangeText={setNewPassword}
              />
              <TextInput
                className="bg-white/10 text-white rounded-xl px-5 py-4 mb-8 text-lg border border-white/10"
                placeholder="Confirmer le nouveau mot de passe"
                placeholderTextColor="#ccc"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <View className="flex-row space-x-4">
                <TouchableOpacity
                  className="flex-1 py-4 rounded-xl items-center bg-white/10"
                  onPress={() => setShowPasswordModal(false)}
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold text-lg">Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-4 rounded-xl items-center"
                  style={{ backgroundColor: primaryColor }}
                  onPress={changePassword}
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold text-lg">Confirmer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Modal de suppression de compte */}
        <Modal
          visible={showDeleteModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDeleteModal(false)}
        >
          <View className="flex-1 bg-black/70 justify-center items-center p-6">
            <View className="bg-[#0f172a] rounded-3xl p-6 w-full max-w-md items-center shadow-lg border-t-4 border-[#ec673b]">
              <MaterialIcons name="warning" size={56} color="#FF6347" />
              <Text className="text-white text-2xl font-bold mt-6 mb-5 text-center">
                Supprimer votre compte
              </Text>
              <Text className="text-gray-400 text-center mb-8 px-4">
                Êtes-vous sûr de vouloir supprimer définitivement votre compte ?
                Toutes vos données seront perdues.
              </Text>
              <View className="flex-row justify-between w-full px-4">
                <TouchableOpacity
                  className="bg-white/10 py-4 px-8 rounded-xl flex-1 mr-3 items-center"
                  onPress={() => setShowDeleteModal(false)}
                  activeOpacity={0.7}
                >
                  <Text className="text-white text-lg font-semibold">Annuler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="py-4 px-8 rounded-xl flex-1 ml-3 items-center"
                  style={{ backgroundColor: '#FF6347' }}
                  onPress={deleteAccount}
                  activeOpacity={0.7}
                >
                  <Text className="text-white text-lg font-bold">Supprimer</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default ProfileScreen;