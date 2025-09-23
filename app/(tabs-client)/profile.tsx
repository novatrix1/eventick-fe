import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

import { useUserInfo } from '@/hooks/useUserInfo';
import { useOrganizerStatus } from '@/hooks/useOrganizerStatus';
import { HELP_OPTIONS } from '@/constants/profile';

import UserInfoSection from '@/components/UserInfoSection';
import ProfileActionItem from '@/components/ProfileActionItem';
import HelpOptionItem from '@/components/HelpOptionItem';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import DeleteAccountModal from '@/components/DeleteAccountModal';

const ProfileScreen = () => {
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const { userInfo, isLoading: userInfoLoading } = useUserInfo();
  const { organizerStatus } = useOrganizerStatus(userInfo.role);

  const navigateToHelp = (id: string) => {
    alert(`Navigation vers: ${id}`);
  };

  const changePassword = () => {
    setShowPasswordModal(false);
    alert('Mot de passe changé avec succès!');
    // Réinitialiser les champs
    setPassword('');
    setNewPassword('');
    setConfirmPassword('');
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
          className="flex-1 px-5 pt-6 pb-32"
          showsVerticalScrollIndicator={false}
        >
          <UserInfoSection userInfo={userInfo} organizerStatus={organizerStatus} />

          {/* Section Mon Profil */}
          <View className="mb-10">
            <Text className="text-white text-xl font-bold mb-5">Mon profil</Text>
            <View className="bg-white/10 rounded-xl overflow-hidden border border-white/10">
              <ProfileActionItem
                icon="create"
                title="Modifier le profil"
                onPress={() => router.push('/screens/EditProfileScreen')}
              />

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
            </View>
          </View>

          {/* Centre d'aide */}
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

          {/* Actions du compte */}
          <View className="mb-20 rounded-xl overflow-hidden border border-white/10 bg-white/10">
            <ProfileActionItem
              icon="key"
              title="Changer le mot de passe"
              onPress={() => setShowPasswordModal(true)}
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
                icon="delete"
                title="Supprimer mon compte"
                onPress={() => setShowDeleteModal(true)}
                color="#FF6347"
                showChevron={false}
              />
            </View>
          </View>
        </ScrollView>

        <ChangePasswordModal
          visible={showPasswordModal}
          onClose={() => setShowPasswordModal(false)}
          password={password}
          setPassword={setPassword}
          newPassword={newPassword}
          setNewPassword={setNewPassword}
          confirmPassword={confirmPassword}
          setConfirmPassword={setConfirmPassword}
          onSubmit={changePassword}
        />

        <DeleteAccountModal
          visible={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={deleteAccount}
        />
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default ProfileScreen;