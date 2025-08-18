import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, KeyboardAvoidingView, Platform, Modal, SafeAreaView, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';
import { Link, router } from 'expo-router';
import axios from "axios";

const API_URL = "https://eventick.onrender.com";

const RegisterScreen = () => {
  const [userType, setUserType] = useState<'client' | 'organizer' | null>(null);
  const [organizerStep, setOrganizerStep] = useState(1);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  
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

  const resendOtp = async () => {
    if (!formData.email) {
      Alert.alert("Erreur", "Email requis");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/auth/resend-otp`, {
        email: formData.email,
      });
      Alert.alert("Succès", "Nouveau code envoyé !");
    } catch (err: any) {
      Alert.alert("Erreur", err.response?.data?.message || "Échec du renvoi");
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'inscription utilisateur (commun aux clients et organisateurs)
  const handleUserRegistration = async () => {
    try {
      setLoading(true);
      const payload = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        ...(userType === "organizer" && { role: "organizer" })
      };

      const res = await axios.post(`${API_URL}/api/auth/register`, payload);
      setUserId(res.data.userId);
      setShowOtpModal(true);
      
      if (res.data.isReturningUser) {
        Alert.alert("Info", "Compte existant. Nouveau code envoyé !");
      } else {
        Alert.alert("Succès", res.data.message);
      }
      
      return res.data;

    } catch (err: any) {
      const message = err.response?.data?.message || "Une erreur est survenue";

      // Gestion des utilisateurs existants non vérifiés
      if (message.includes("Utilisateur existe déjà")) {
        const existingUserId = err.response?.data?.userId;

        if (existingUserId) {
          try {
            await axios.post(`${API_URL}/api/auth/resend-otp`, {
              email: formData.email,
            });

            setUserId(existingUserId);
            setShowOtpModal(true);
            Alert.alert("Info", "Compte existant. Nouveau code envoyé !");
          } catch (resendErr: any) {
            Alert.alert("Erreur", resendErr.response?.data?.message || "Impossible de renvoyer OTP");
          }
        } else {
          Alert.alert("Erreur", "Utilisateur existant. Veuillez vous connecter.");
        }
      } else {
        Alert.alert("Erreur", message);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Gestion de l'inscription organisateur
  const handleOrganizerRegistration = async () => {
    try {
      setLoading(true);
      
      // 1. Obtenir le token en se connectant
      const loginRes = await axios.post(`${API_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password,
      });

      const token = loginRes.data.token;

      console.log("email de l'organisateur : ", formData.email)
      console.log("Password : ", formData.password)
      console.log("Token Généré : ", token)

      // 2. Envoyer les données organisateur
      await axios.post(
        `${API_URL}/api/organizers/register`,
        {
          companyName: formData.companyName,
          address: formData.address,
          phone: formData.phone,
          type: formData.organizerType,
          socialMedia: formData.socialMedia,
          description: formData.description,
          contactEmail: formData.email,
          categories: [],
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert("Succès", "Compte organisateur créé !");
      router.replace("/(tabs-organisateur)/dashboard");

    } catch (err: any) {
      Alert.alert("Erreur", err.response?.data?.message || "Échec de création");
    } finally {
      setLoading(false);
    }
  };

  // Soumission principale
  const handleSubmit = async () => {
    if (userType === "client") {
      try {
        await handleUserRegistration();
      } catch (error) {
        console.error("Erreur inscription client", error);
      }
    } else if (userType === "organizer") {
      if (organizerStep === 1) {
        try {
          await handleUserRegistration();
        } catch (error) {
          console.error("Erreur inscription organisateur étape 1", error);
        }
      } else if (organizerStep === 2) {
        try {
          await handleOrganizerRegistration();
        } catch (error) {
          console.error("Erreur inscription organisateur étape 2", error);
        }
      }
    }
  };

  const verifyOtp = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const res = await axios.post(`${API_URL}/api/auth/verify-otp`, {
        userId,
        otp,
      });

      Alert.alert("Succès", res.data.message);
      setShowOtpModal(false);
      setOtp("");

      // Redirection après vérification
      if (userType === "client") {
        router.replace("/login");
      } else if (userType === "organizer") {
        setOrganizerStep(2);
      }

    } catch (err: any) {
      Alert.alert("Erreur", err.response?.data?.message || "Code invalide");
    } finally {
      setLoading(false);
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
          disabled={loading}
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
          disabled={loading}
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
          className={`py-4 rounded-xl items-center ${loading ? 'bg-gray-500' : 'bg-teal-400'}`}
          onPress={() => {
            if (userType === 'organizer') setOrganizerStep(1);
          }}
          disabled={loading}
        >
          <Text className="text-gray-900 font-bold text-lg">
            {loading ? "Chargement..." : "Continuer"}
          </Text>
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
            editable={!loading}
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
            editable={!loading}
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
            editable={!loading}
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
            editable={!loading}
          />
        </View>
        <Text className="text-gray-500 text-xs mt-2">Minimum 6 caractères</Text>
      </View>

      <TouchableOpacity
        className={`py-4 rounded-xl items-center mb-6 ${loading ? 'bg-gray-500' : 'bg-[#ec673b]'}`}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text className="text-white font-bold text-lg">
          {loading ? "Traitement..." : "S'inscrire"}
        </Text>
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
            editable={!loading}
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
            editable={!loading}
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
            editable={!loading}
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
            editable={!loading}
          />
        </View>
        <Text className="text-gray-500 text-xs mt-2">Minimum 6 caractères</Text>
      </View>

      <TouchableOpacity
        className={`py-4 rounded-xl items-center mb-6 ${loading ? 'bg-gray-500' : 'bg-[#ec673b]'}`}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text className="text-white font-bold text-lg">
          {loading ? "Traitement..." : "Continuer"}
        </Text>
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
            editable={!loading}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">Type d'organisateur</Text>
        <View className="flex-row justify-between mb-3">
          <TouchableOpacity
            className={`py-3 px-4 rounded-xl ${formData.organizerType === 'entreprise' ? 'bg-[#ec673b]' : 'bg-white/10'}`}
            onPress={() => handleInputChange('organizerType', 'entreprise')}
            disabled={loading}
          >
            <Text className={formData.organizerType === 'entreprise' ? 'text-white' : 'text-white'}>Entreprise</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`py-3 px-4 rounded-xl ${formData.organizerType === 'association' ? 'bg-[#ec673b]' : 'bg-white/10'}`}
            onPress={() => handleInputChange('organizerType', 'association')}
            disabled={loading}
          >
            <Text className={formData.organizerType === 'association' ? 'text-white' : 'text-white'}>Association</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`py-3 px-4 rounded-xl ${formData.organizerType === 'particulier' ? 'bg-[#ec673b]' : 'bg-white/10'}`}
            onPress={() => handleInputChange('organizerType', 'particulier')}
            disabled={loading}
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
            editable={!loading}
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
            editable={!loading}
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
            editable={!loading}
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
            editable={!loading}
          />
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-gray-400 mb-2">Documents légaux</Text>

        {formData.organizerType === 'particulier' ? (
          <View className="mb-3">
            <Text className="text-gray-500 mb-2">Pièce d'identité (CIN/Passeport)</Text>
            <TouchableOpacity 
              className="bg-white/10 rounded-xl p-4 items-center"
              disabled={loading}
            >
              <Ionicons name="cloud-upload" size={32} color="#ec673b" />
              <Text className="text-white mt-2">Télécharger la pièce d'identité</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View className="mb-3">
              <Text className="text-gray-500 mb-2">Registre de commerce</Text>
              <TouchableOpacity 
                className="bg-white/10 rounded-xl p-4 items-center"
                disabled={loading}
              >
                <Ionicons name="cloud-upload" size={32} color="#ec673b" />
                <Text className="text-white mt-2">Télécharger le registre</Text>
              </TouchableOpacity>
            </View>
            <View>
              <Text className="text-gray-500 mb-2">Pièce d'identité du représentant</Text>
              <TouchableOpacity 
                className="bg-white/10 rounded-xl p-4 items-center"
                disabled={loading}
              >
                <Ionicons name="cloud-upload" size={32} color="#ec673b" />
                <Text className="text-white mt-2">Télécharger la pièce d'identité</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity
        className={`py-4 rounded-xl items-center mb-6 ${loading ? 'bg-gray-500' : 'bg-[#ec673b]'}`}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text className="text-white font-bold text-lg">
          {loading ? "Soumission..." : "Soumettre pour vérification"}
        </Text>
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
                disabled={loading}
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
                <TouchableOpacity className="ml-2" disabled={loading}>
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
                    editable={!loading}
                  />
                ))}
              </View>

              <TouchableOpacity
                className={`py-3 rounded-xl items-center mb-4 ${loading ? 'bg-gray-500' : 'bg-[#ec673b]'}`}
                onPress={verifyOtp}
                disabled={loading}
              >
                <Text className="text-white font-bold">
                  {loading ? "Vérification..." : "Vérifier"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="items-center"
                onPress={resendOtp}
                disabled={loading}
              >
                <Text className={`${loading ? 'text-gray-500' : 'text-[#ec673b]'}`}>
                  Renvoyer le code
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default RegisterScreen;