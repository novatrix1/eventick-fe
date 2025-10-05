import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  TextInput,
  SafeAreaView,
  Switch,
} from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';

const primaryColor = '#ec673b';

const helpOptions = [
  { id: 'contact', title: 'Contacter le support', icon: 'headset', screen : '/screens/ContactSupportScreen' },
  { id: 'faq', title: 'FAQ', icon: 'help-circle', screen : '/screens/FAQScreen' },
  { id: 'terms', title: "Conditions d'utilisation", icon: 'document-text', screen : 'screens/TermsOfUseScreen' },
  { id: 'privacy', title: 'Politique de confidentialité', icon: 'shield', screen : 'screens/PrivacyPolicyScreen' },
];

const ProfileScreen = () => {


  const [userInfo] = useState({
    name: 'Amadou Dem',
    email: 'contact@amadoudem.dev',
    phone: '+222 12 34 56 78',
    profileImage: 'https://i.postimg.cc/fLPF4T98/Whats-App-Image-2025-06-27-12-01-22-36d8d6d7.jpg',
    organization: 'EventMR',
  });


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

  const [paymentSettings] = useState({
    bankily: true,
    masrvi: true,
    bankAccount: 'MR12345678901234567890123456',
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');



  const changePassword = () => {
    setShowPasswordModal(false);
    alert('Mot de passe changé avec succès!');
  };

  const deleteAccount = () => {
    setShowDeleteModal(false);
    alert('Votre compte a été supprimé.');
  };

  const logout = () => {
    alert('Déconnexion réussie.');
  };

  const toggleNotification = (type: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1" edges={['top']}>
        <StatusBar style="light" />
        <ScrollView
          className="flex-1 px-5 pt-6 pb-32"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-8">
            <Image
              source={{ uri: userInfo.profileImage }}
              className="w-32 h-32 rounded-full border-4 border-[#ec673b]"
            />
            <Text className="text-white text-2xl font-extrabold mt-5">
              {userInfo.name}
            </Text>
            <Text className="text-gray-400 mt-1">{userInfo.organization}</Text>
            <Text className="text-gray-400 mt-1">{userInfo.email}</Text>
            <Text className="text-gray-400">{userInfo.phone}</Text>
          </View>


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




            </View>
          </View>

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

          <View className="mb-8">
            <Text className="text-white text-xl font-bold mb-4">Centre d'aide</Text>
            <View className="bg-white/10 rounded-xl overflow-hidden border border-white/10">
              {helpOptions.map((option, i) => (
                <TouchableOpacity
                  key={option.id}
                  className={`flex-row items-center p-4 ${i < helpOptions.length - 1 ? 'border-b border-white/20' : ''
                    }`}
                  onPress={() => router.push(option.screen)}

                  activeOpacity={0.7}
                >
                  <Ionicons name={option.icon as any} size={26} color={primaryColor} />
                  <Text className="text-white flex-1 ml-4 text-lg">{option.title}</Text>
                  <Ionicons name="chevron-forward" size={22} color={primaryColor} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View className="mb-20 rounded-xl overflow-hidden border border-white/10 bg-white/10">

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

        <Modal
          visible={showBankModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowBankModal(false)}
        >
          <View className="flex-1 bg-black/70 justify-center items-center p-6">
            <View className="bg-[#0f172a] rounded-3xl p-6 w-full max-w-md shadow-lg border-t-4 border-[#ec673b]">
              <Text className="text-white text-2xl font-bold mb-6 text-center">
                Paramètres de paiement
              </Text>

              <View className="mb-6">
                <Text className="text-white mb-2 font-semibold">Méthodes de paiement</Text>

                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center">
                    <FontAwesome5 name="mobile-alt" size={24} color="#4CAF50" />
                    <Text className="text-white ml-3">Bankily</Text>
                  </View>
                  <Switch
                    value={paymentSettings.bankily}
                    trackColor={{ false: '#767577', true: '#4CAF50' }}
                  />
                </View>

                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center">
                    <FontAwesome5 name="credit-card" size={24} color="#2196F3" />
                    <Text className="text-white ml-3">Masrvi</Text>
                  </View>
                  <Switch
                    value={paymentSettings.masrvi}
                    trackColor={{ false: '#767577', true: '#2196F3' }}
                  />
                </View>
              </View>

              <View className="mb-6">
                <Text className="text-white mb-2 font-semibold">Compte bancaire</Text>
                <TextInput
                  className="bg-white/10 text-white rounded-xl px-5 py-4 text-lg border border-white/10"
                  placeholder="IBAN"
                  placeholderTextColor="#ccc"
                  value={paymentSettings.bankAccount}
                />
              </View>

              <View className="flex-row space-x-4">
                <TouchableOpacity
                  className="flex-1 py-4 rounded-xl items-center bg-white/10"
                  onPress={() => setShowBankModal(false)}
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold text-lg">Fermer</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  className="flex-1 py-4 rounded-xl items-center"
                  style={{ backgroundColor: primaryColor }}
                  onPress={() => {
                    setShowBankModal(false);
                    alert('Paramètres sauvegardés!');
                  }}
                  activeOpacity={0.8}
                >
                  <Text className="text-white font-bold text-lg">Sauvegarder</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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


