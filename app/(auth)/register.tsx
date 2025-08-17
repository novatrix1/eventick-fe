import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, Modal, SafeAreaView, TextInput, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';
import axios from "axios";


const API_URL = "https://eventick.onrender.com";

const RegisterScreen = () => {
  const [userType, setUserType] = useState<'client' | 'organizer' | null>(null);
  const [organizerStep, setOrganizerStep] = useState(1);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    companyName: '',
    organizerType: 'particulier',
    address: '',
    city: '',
    rib: '',
    socialMedia: '',
    description: '',
    cin: '',
    registerCommerce: '',
  });

  const [userId, setUserId] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  {/**
    const handleSubmit = () => {
    if (userType === 'client') {
      // Client registration - verify OTP
      setShowOtpModal(true);
    } else if (userType === 'organizer') {
      if (organizerStep === 1) {
        setOrganizerStep(2);
      } else {
        console.log('Organizer registration submitted', formData);
      }
    }
  };
    */}





  const handleSubmit = async () => {
    if (userType === "client") {
      try {
        const res = await axios.post(`${API_URL}/api/auth/register`, {
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        });

        setUserId(res.data.userId);
        setShowOtpModal(true);
        Alert.alert("Succès", res.data.message);

      } catch (err: any) {
        const message = err.response?.data?.message || "Une erreur est survenue";

        if (message.includes("Utilisateur existe déjà")) {
          const existingUserId = err.response?.data?.userId;

          if (existingUserId) {
            try {
              await axios.post(`${API_URL}/api/auth/resend-otp`, { userId: existingUserId });

              setUserId(existingUserId);
              setShowOtpModal(true);
              Alert.alert("Info", "Compte déjà créé mais non vérifié. Nouveau code OTP envoyé !");
            } catch (resendErr: any) {
              Alert.alert("Erreur", resendErr.response?.data?.message || "Impossible de renvoyer le code OTP");
            }
          } else {
            Alert.alert("Erreur", "Utilisateur déjà existant. Veuillez vous connecter.");
          }
        } else {
          Alert.alert("Erreur", message);
        }
      }
    }
  };




  const verifyOtp = async () => {
    if (!userId) return;

    try {
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        userId,
        otp,
      });

      Alert.alert("Succès", res.data.message);
      setShowOtpModal(false);
      setOtp("");
    } catch (err: any) {
      Alert.alert("Erreur", err.response?.data?.message || "Code invalide");
    }
  };

  // Étape 0 : Sélection du type d'utilisateur
  const renderUserTypeSelection = () => (
    <>
      <Text className="text-white text-2xl font-bold mb-6 text-center">Créer un compte</Text>
      <Text className="text-gray-400 text-center mb-8">
        Sélectionnez votre type de compte pour commencer
      </Text>

      <View className="mb-8">
        <TouchableOpacity
          className={`flex-row items-center p-6 mb-6 rounded-xl ${userType === 'client' ? 'bg-teal-400 border-2 border-teal-400' : 'bg-white/5 border border-white/10'}`}
          onPress={() => setUserType('client')}
        >
          <Ionicons name="person" size={32} color={userType === 'client' ? "#001215" : "#ec673b"} />
          <View className="ml-4">
            <Text className={`text-lg font-bold ${userType === 'client' ? 'text-gray-900' : 'text-white'}`}>
              Je suis Client
            </Text>
            <Text className={userType === 'client' ? 'text-gray-700' : 'text-gray-400'}>
              Acheteur de billets pour des événements
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-row items-center p-6 rounded-xl ${userType === 'organizer' ? 'bg-teal-400 border-2 border-teal-400' : 'bg-white/5 border border-white/10'}`}
          onPress={() => setUserType('organizer')}
        >
          <Ionicons name="business" size={32} color={userType === 'organizer' ? "#001215" : "#ec673b"} />
          <View className="ml-4">
            <Text className={`text-lg font-bold ${userType === 'organizer' ? 'text-gray-900' : 'text-white'}`}>
              Je suis Organisateur
            </Text>
            <Text className={userType === 'organizer' ? 'text-gray-700' : 'text-gray-400'}>
              Vendeur d'événements et gestionnaire
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {userType && (
        <TouchableOpacity
          className="bg-teal-400 py-4 rounded-xl items-center"
          onPress={() => {
            if (userType === 'organizer') setOrganizerStep(1);
          }}
        >
          <Text className="text-gray-900 font-bold text-lg">Continuer</Text>
        </TouchableOpacity>
      )}
    </>
  );

  // Inscription client
  const renderClientRegister = () => (
    <>
      <Text className="text-white text-2xl font-bold mb-6 text-center">Créer un compte client</Text>
      <Text className="text-gray-400 text-center mb-8">
        Inscrivez-vous en 1 minute pour acheter vos billets
      </Text>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">Nom complet</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="person" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="Votre nom complet"
            placeholderTextColor="#9CA3AF"
            value={formData.fullName}
            onChangeText={text => handleInputChange('fullName', text)}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">Email</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="mail" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="votre@email.com"
            placeholderTextColor="#9CA3AF"
            value={formData.email}
            onChangeText={text => handleInputChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">Téléphone</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="call" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="+222 XX XX XX XX"
            placeholderTextColor="#9CA3AF"
            value={formData.phone}
            onChangeText={text => handleInputChange('phone', text)}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-gray-400 mb-2">Mot de passe</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="lock-closed" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={formData.password}
            onChangeText={text => handleInputChange('password', text)}
          />
        </View>
        <Text className="text-gray-500 text-xs mt-2">Minimum 6 caractères</Text>
      </View>

      <TouchableOpacity
        className="bg-[#ec673b] py-4 rounded-xl items-center mb-6"
        onPress={handleSubmit}
      >
        <Text className="text-white font-bold text-lg">S'inscrire</Text>
      </TouchableOpacity>
    </>
  );

  // Étape 1 organisateur
  const renderOrganizerRegisterStep1 = () => (
    <>
      <Text className="text-white text-2xl font-bold mb-6 text-center">Informations de base</Text>
      <Text className="text-gray-400 text-center mb-8">
        Créez votre compte d'organisateur
      </Text>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">Nom complet</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="person" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="Votre nom complet"
            placeholderTextColor="#9CA3AF"
            value={formData.fullName}
            onChangeText={text => handleInputChange('fullName', text)}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">Email</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="mail" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="votre@email.com"
            placeholderTextColor="#9CA3AF"
            value={formData.email}
            onChangeText={text => handleInputChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">Téléphone</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="call" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="+222 XX XX XX XX"
            placeholderTextColor="#9CA3AF"
            value={formData.phone}
            onChangeText={text => handleInputChange('phone', text)}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-gray-400 mb-2">Mot de passe</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="lock-closed" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={formData.password}
            onChangeText={text => handleInputChange('password', text)}
          />
        </View>
        <Text className="text-gray-500 text-xs mt-2">Minimum 6 caractères</Text>
      </View>

      <TouchableOpacity
        className="bg-[#ec673b] py-4 rounded-xl items-center mb-6"
        onPress={handleSubmit}
      >
        <Text className="text-white font-bold text-lg">Continuer</Text>
      </TouchableOpacity>
    </>
  );

  // Étape 2 organisateur
  const renderOrganizerRegisterStep2 = () => (
    <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
      <Text className="text-white text-2xl font-bold mb-6 text-center">Informations professionnelles</Text>
      <Text className="text-gray-400 text-center mb-8">
        Complétez votre profil d'organisateur
      </Text>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">Nom de l'entreprise/association</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="business" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="Nom officiel"
            placeholderTextColor="#9CA3AF"
            value={formData.companyName}
            onChangeText={text => handleInputChange('companyName', text)}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">Type d'organisateur</Text>
        <View className="flex-row justify-between mb-3">
          <TouchableOpacity
            className={`py-3 px-4 rounded-xl ${formData.organizerType === 'entreprise' ? 'bg-[#ec673b]' : 'bg-white/10'}`}
            onPress={() => handleInputChange('organizerType', 'entreprise')}
          >
            <Text className={formData.organizerType === 'entreprise' ? 'text-white' : 'text-white'}>Entreprise</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`py-3 px-4 rounded-xl ${formData.organizerType === 'association' ? 'bg-[#ec673b]' : 'bg-white/10'}`}
            onPress={() => handleInputChange('organizerType', 'association')}
          >
            <Text className={formData.organizerType === 'association' ? 'text-white' : 'text-white'}>Association</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`py-3 px-4 rounded-xl ${formData.organizerType === 'particulier' ? 'bg-[#ec673b]' : 'bg-white/10'}`}
            onPress={() => handleInputChange('organizerType', 'particulier')}
          >
            <Text className={formData.organizerType === 'particulier' ? 'text-white' : 'text-white'}>Particulier</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">Adresse complète</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="location" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="Quartier, ville"
            placeholderTextColor="#9CA3AF"
            value={formData.address}
            onChangeText={text => handleInputChange('address', text)}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">RIB ou compte de paiement</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="card" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="Compte Bankily, Masrvi ou bancaire"
            placeholderTextColor="#9CA3AF"
            value={formData.rib}
            onChangeText={text => handleInputChange('rib', text)}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">Liens réseaux sociaux</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="link" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="Facebook, Instagram, site web"
            placeholderTextColor="#9CA3AF"
            value={formData.socialMedia}
            onChangeText={text => handleInputChange('socialMedia', text)}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">Description de l'activité</Text>
        <View className="bg-white/10 rounded-xl px-4 py-3 h-32">
          <TextInput
            className="flex-1 text-white"
            placeholder="Décrivez votre activité..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={formData.description}
            onChangeText={text => handleInputChange('description', text)}
          />
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-gray-400 mb-2">Documents légaux</Text>

        {formData.organizerType === 'particulier' ? (
          <View className="mb-3">
            <Text className="text-gray-500 mb-2">Pièce d'identité (CIN/Passeport)</Text>
            <TouchableOpacity className="bg-white/10 rounded-xl p-4 items-center">
              <Ionicons name="cloud-upload" size={32} color="#ec673b" />
              <Text className="text-white mt-2">Télécharger la pièce d'identité</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View className="mb-3">
              <Text className="text-gray-500 mb-2">Registre de commerce</Text>
              <TouchableOpacity className="bg-white/10 rounded-xl p-4 items-center">
                <Ionicons name="cloud-upload" size={32} color="#ec673b" />
                <Text className="text-white mt-2">Télécharger le registre</Text>
              </TouchableOpacity>
            </View>
            <View>
              <Text className="text-gray-500 mb-2">Pièce d'identité du représentant</Text>
              <TouchableOpacity className="bg-white/10 rounded-xl p-4 items-center">
                <Ionicons name="cloud-upload" size={32} color="#ec673b" />
                <Text className="text-white mt-2">Télécharger la pièce d'identité</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity
        className="bg-[#ec673b] py-4 rounded-xl items-center mb-6"
        onPress={handleSubmit}
      >
        <Text className="text-white font-bold text-lg">Soumettre pour vérification</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1">
        <StatusBar style="light" />

        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          className="flex-1"
        >
          <ScrollView
            className="flex-1 px-6 pt-10"
            contentContainerStyle={{ paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            <View className="items-center mb-8">
              <Image
                source={require('@/assets/logo.png')}
                className="w-48 h-36 mb-4"
              />
              <Text className="text-gray-400">Votre billetterie en ligne</Text>
            </View>

            {/* Logique d'affichage en fonction de l'état */}
            {!userType ? (
              renderUserTypeSelection()
            ) : userType === 'client' ? (
              renderClientRegister()
            ) : organizerStep === 1 ? (
              renderOrganizerRegisterStep1()
            ) : (
              renderOrganizerRegisterStep2()
            )}

            {/* Bouton retour pour changer de type */}
            {(userType && organizerStep === 1) && (
              <TouchableOpacity
                className="mt-6 flex-row items-center justify-center"
                onPress={() => setUserType(null)}
              >
                <Ionicons name="arrow-back" size={20} color="#ec673b" />
                <Text className="text-[#ec673b] ml-2">Changer le type de compte</Text>
              </TouchableOpacity>
            )}

            {/* Informations supplémentaires */}
            {userType === 'organizer' && organizerStep === 2 && (
              <View className="mt-4">
                <Text className="text-gray-500 text-xs text-center mb-4">
                  Votre compte sera vérifié manuellement dans les 24-48h
                </Text>
                <Text className="text-gray-500 text-xs text-center">
                  En vous inscrivant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité
                </Text>
              </View>
            )}

            {/* Lien vers le login */}
            <View className="mt-8 flex-row justify-center">
              <Text className="text-gray-400">Vous avez déjà un compte?</Text>
              <Link href="/login" asChild>
                <TouchableOpacity className="ml-2">
                  <Text className="text-[#ec673b] font-bold">Se connecter</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>

        {/* OTP Verification Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showOtpModal}
          onRequestClose={() => setShowOtpModal(false)}
        >
          <View className="flex-1 bg-black/70 justify-center items-center p-4">
            <View className="bg-gray-800 rounded-2xl p-6 w-full max-w-md">
              <View className="items-center mb-6">
                <Ionicons name="lock-closed" size={48} color="#ec673b" />
                <Text className="text-white text-xl font-bold mt-4">Vérification par Email</Text>
              </View>

              <Text className="text-gray-400 text-center mb-6">
                Nous avons envoyé un code à 6 chiffres au {formData.email}. Entrez-le ci-dessous.
              </Text>

              <View className="flex-row justify-between mb-6">
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <TextInput
                    key={index}
                    className="bg-white/10 text-white text-xl font-bold text-center rounded-xl w-12 h-12"
                    maxLength={1}
                    keyboardType="number-pad"
                    onChangeText={(text) => {
                      if (text) {
                        const newOtp = otp + text;
                        setOtp(newOtp);
                        if (newOtp.length === 6) verifyOtp();
                      }
                    }}
                  />
                ))}
              </View>

              <TouchableOpacity
                className="bg-[#ec673b] py-3 rounded-xl items-center mb-4"
                onPress={verifyOtp}
              >
                <Text className="text-white font-bold">Vérifier</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center"
                onPress={() => alert("Code renvoyé!")}
              >
                <Text className="text-[#ec673b]">Renvoyer le code</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default RegisterScreen;