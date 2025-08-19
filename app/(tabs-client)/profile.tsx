import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  SafeAreaView,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_URL = "https://eventick.onrender.com";

// Couleur principale
const primaryColor = '#ec673b';

const helpOptions = [
  { id: 'contact', title: 'Contacter le support', icon: 'headset' },
  { id: 'faq', title: 'FAQ', icon: 'help-circle' },
  { id: 'terms', title: "Conditions d'utilisation", icon: 'document-text' },
  { id: 'privacy', title: 'Politique de confidentialité', icon: 'shield' },
];

const ProfileScreen = () => {
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    phone: '',
    profileImage:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    role: 'user', // Ajout du rôle
  });

  const [organizerStatus, setOrganizerStatus] = useState({
    isOrganizer: false,
    isVerified: false,
    isLoading: true,
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (!token) return;

        // Récupérer les infos utilisateur
        const userRes = await axios.get(`${API_URL}/api/users/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const { name, email, phone, role } = userRes.data.user;
        setUserInfo({
          name,
          email,
          phone,
          role,
          profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
        });

        // Vérifier le statut organisateur si l'utilisateur est organisateur
        if (role === 'organizer') {
          try {
            const orgRes = await axios.get(`${API_URL}/api/organizers/profile`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            setOrganizerStatus({
              isOrganizer: true,
              isVerified: orgRes.data.organizer.isVerified,
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
        } else {
          setOrganizerStatus({
            isOrganizer: false,
            isVerified: false,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error("Erreur de chargement:", error);
        setOrganizerStatus(prev => ({...prev, isLoading: false}));
      }
    };
    
    fetchUserInfo();
  }, []);

  const navigateToHelp = (id: string) => {
    alert(`Navigation vers: ${id}`);
  };

  const changePassword = () => {
    setShowPasswordModal(false);
    alert('Mot de passe changé avec succès!');
  };

  const deleteAccount = () => {
    setShowDeleteModal(false);
    alert('Votre compte a été supprimé.');
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1" edges={['top']}>
        <StatusBar style="light" />
        <ScrollView
          className="flex-1 px-5 pt-6 pb-32"
          showsVerticalScrollIndicator={false}
        >
          {/* Infos personnelles */}
          <View className="items-center mb-10">
            <Image
              source={{ uri: userInfo.profileImage }}
              className="w-28 h-28 rounded-full border-4 border-[#ec673b]"
            />
            
            {/* Badge d'attente de vérification - Positionné sous la photo */}
            {organizerStatus.isOrganizer && !organizerStatus.isVerified && (
              <View className="mt-4 bg-orange-500/20 px-4 py-2 rounded-full flex-row items-center">
                <Ionicons name="time" size={16} color="#f97316" className="mr-2" />
                <Text className="text-orange-400 font-medium w-60 text-center">
                  Compte organisateur en attente de vérification
                </Text>
              </View>
            )}
            
            <Text className="text-white text-2xl font-extrabold mt-5">
              {userInfo.name}
            </Text>
            <Text className="text-gray-400 mt-1">{userInfo.email}</Text>
            <Text className="text-gray-400">{userInfo.phone}</Text>
          </View>

          {/* Section Mon Profil */}
          <View className="mb-10">
            <Text className="text-white text-xl font-bold mb-5">Mon profil</Text>
            <View className="bg-white/10 rounded-xl overflow-hidden border border-white/10">
              <TouchableOpacity
                className="flex-row items-center p-4"
                onPress={() => router.push('/screens/EditProfileScreen')}
                activeOpacity={0.7}
              >
                <Ionicons name="create" size={26} color={primaryColor} />
                <Text className="text-white flex-1 ml-4 text-lg font-semibold">
                  Modifier le profil
                </Text>
                <Ionicons name="chevron-forward" size={22} color={primaryColor} />
              </TouchableOpacity>

              {/* Bouton "Devenir organisateur" TOUJOURS visible et actif */}
              <TouchableOpacity
                className="flex-row items-center p-4 border-t border-white/20"
                onPress={() => {
                  if (organizerStatus.isOrganizer && organizerStatus.isVerified) {
                    router.replace("/(tabs-organisateur)/dashboard");
                  } else {
                    router.push('/screens/OrganizerRegistrationScreen');
                  }
                }}
                activeOpacity={0.7}
                disabled={organizerStatus.isLoading}
              >
                <Ionicons 
                  name="business" 
                  size={26} 
                  color={organizerStatus.isLoading ? "#6b7280" : primaryColor} 
                />
                <Text 
                  className={`flex-1 ml-4 text-lg font-semibold ${
                    organizerStatus.isLoading ? "text-gray-500" : "text-white"
                  }`}
                >
                  {organizerStatus.isLoading 
                    ? "Chargement..." 
                    : organizerStatus.isOrganizer && organizerStatus.isVerified
                      ? "Naviguer vers organisateur"
                      : "Devenir organisateur"}
                </Text>
                {!organizerStatus.isLoading && (
                  <Ionicons 
                    name="chevron-forward" 
                    size={22} 
                    color={primaryColor} 
                  />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Centre d'aide */}
          <View className="mb-10">
            <Text className="text-white text-xl font-bold mb-5">Centre d'aide</Text>
            <View className="bg-white/10 rounded-xl overflow-hidden border border-white/10">
              {helpOptions.map((option, i) => (
                <TouchableOpacity
                  key={option.id}
                  className={`flex-row items-center p-4 ${
                    i < helpOptions.length - 1 ? 'border-b border-white/20' : ''
                  }`}
                  onPress={() => navigateToHelp(option.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={option.icon as any} size={26} color={primaryColor} />
                  <Text className="text-white flex-1 ml-4 text-lg">{option.title}</Text>
                  <Ionicons name="chevron-forward" size={22} color={primaryColor} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Actions du compte */}
          <View className="mb-20 rounded-xl overflow-hidden border border-white/10 bg-white/10">
            <TouchableOpacity
              className="flex-row items-center p-5 border-b border-white/20"
              onPress={() => setShowPasswordModal(true)}
              activeOpacity={0.7}
            >
              <Ionicons name="key" size={26} color={primaryColor} />
              <Text className="text-white flex-1 ml-4 text-lg font-semibold">
                Changer le mot de passe
              </Text>
              <Ionicons name="chevron-forward" size={22} color={primaryColor} />
            </TouchableOpacity>

            <TouchableOpacity
              className="flex-row items-center p-5 border-b border-white/20"
              onPress={() => router.replace("/(auth)/login")}
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

        {/* Modal Changer mot de passe */}
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

        {/* Modal Supprimer compte */}
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