import React, { useState } from 'react';
import { View, Text, ScrollView, Alert } from 'react-native';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import axios from 'axios';
import { SafeAreaView } from "react-native-safe-area-context";


import { useUserInfo } from '@/hooks/useUserInfo';
import { useOrganizerStatus } from '@/hooks/useOrganizerStatus';
import { HELP_OPTIONS } from '@/constants/profile';

import UserInfoSection from '@/components/UserInfoSection';
import ProfileActionItem from '@/components/ProfileActionItem';
import HelpOptionItem from '@/components/HelpOptionItem';
import DeleteAccountModal from '@/components/DeleteAccountModal';

import Constants from 'expo-constants';

const { API_URL } = (Constants.expoConfig?.extra || {}) as { API_URL: string };


const ProfileScreen = () => {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const { userInfo, isLoading: userInfoLoading } = useUserInfo();
  const { organizerStatus } = useOrganizerStatus(userInfo.role);

  const navigateToHelp = (id: string) => {
    switch (id) {
      case 'faq':
        router.push('/screens/FAQScreen');
        break;

      case 'contact':
        router.push('/screens/ContactSupportScreen');
        break;

      case 'terms':
        router.push('/screens/TermsOfUseScreen');
        break;

      case 'privacy':
        router.push('/screens/PrivacyPolicyScreen');
        break;

      default:
        Alert.alert(
          'Information',
          'Cette section est en cours de développement.'
        );
    }
  };


  const handleChangePassword = async () => {
    if (!userInfo?.email) {
      Alert.alert('Erreur', 'Impossible de récupérer votre email');
      return;
    }

    try {
      setLoading(true);

      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email: userInfo.email
      });

      Alert.alert(
        'Succès',
        response.data.message || 'Code de réinitialisation envoyé par email',
        [
          {
            text: 'OK',
            onPress: () => router.push({
              pathname: '/screens/reset-password',
              params: { email: userInfo.email }
            })
          }
        ]
      );
    } catch (error: any) {
      console.error('Erreur changement mot de passe:', error.response?.data || error.message);
      Alert.alert(
        'Erreur',
        error.response?.data?.message || 'Erreur lors de l\'envoi du code'
      );
    } finally {
      setLoading(false);
    }
  };

  const deleteAccount = () => {
    setShowDeleteModal(false);
    alert('Votre compte a été supprimé.');
  };

  const handleOrganizerPress = () => {
    if (organizerStatus.isOrganizer && organizerStatus.isVerified) {
      router.replace("/(tabs-organisateur)/dashboard");
    } else {
      router.push('/screens/OrganizerRegistrationScreen');
    }
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1" edges={['top']}>
        <StatusBar style="light" />
        <ScrollView
          className="flex-1 px-5 pt-6"
          showsVerticalScrollIndicator={false}
        >
          <UserInfoSection userInfo={userInfo} organizerStatus={organizerStatus} />

          <View className="mb-10">
            <Text className="text-white text-xl font-bold mb-5">Mon profil</Text>
            <View className="bg-white/10 rounded-xl overflow-hidden border border-white/10">
              <ProfileActionItem
                icon="create"
                title="Modifier le profil"
                onPress={() => router.push('/screens/EditProfileScreen')}
              />


              {/** 
              <View className="border-t border-white/20">
                <ProfileActionItem
                  icon="business"
                  title={
                    organizerStatus.isLoading
                      ? "Chargement..."
                      : organizerStatus.isOrganizer && organizerStatus.isVerified
                        ? "Naviguer vers organisateur"
                        : "Devenir organisateur"
                  }
                  onPress={handleOrganizerPress}
                  disabled={organizerStatus.isLoading}
                />
              </View>
              */}
            </View>
          </View>

          <View className="mb-10">
            <Text className="text-white text-xl font-bold mb-5">{"Centre d'aide"}</Text>
            <View className="bg-white/10 rounded-xl overflow-hidden border border-white/10">
              {HELP_OPTIONS.map((option, index) => (
                <HelpOptionItem
                  key={option.id}
                  option={option}
                  onPress={navigateToHelp}
                  isLast={index === HELP_OPTIONS.length - 1}
                />
              ))}
            </View>
          </View>

          <View className="mb-20 rounded-xl overflow-hidden border border-white/10 bg-white/10">
            <ProfileActionItem
              icon="key"
              title={loading ? "Envoi en cours..." : "Changer le mot de passe"}
              onPress={handleChangePassword}
              disabled={loading}
            />

            <View className="border-t border-white/20">
              <ProfileActionItem
                icon="log-out"
                title="Se déconnecter"
                onPress={() => router.replace("/(auth)/login")}
                color="#FF6347"
                showChevron={false}
              />
            </View>

            <View className="border-t border-white/20">
              <ProfileActionItem
                icon="trash"
                title="Supprimer mon compte"
                onPress={() => setShowDeleteModal(true)}
                color="#FF6347"
                showChevron={false}
              />
            </View>
          </View>
        </ScrollView>

        <DeleteAccountModal
          visible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={deleteAccount}
        />
        <Text className="mb-5"></Text>

      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default ProfileScreen;