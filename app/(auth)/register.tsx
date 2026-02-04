import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Text, Alert, Image } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import BackgroundWrapper from '@/components/BackgroundWrapper';
import OtpModal from '@/components/OtpModal';
import UserTypeSelection from '@/components/UserTypeSelection';
import ClientRegisterForm from '@/components/ClientRegisterForm';
import OrganizerStep1Form from '@/components/OrganizerStep1Form';
import OrganizerProfessionalInfo from '@/components/OrganizerProfessionalInfo';
import { useRegisterForm } from '@/hooks/useRegisterForm';
import { useAuthApi } from '@/hooks/useAuthApi';
import { UserType, RegisterFormData } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';

const initialFormData: RegisterFormData = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '', 
  companyName: '',
  organizerType: 'entreprise',
  address: '',
  city: '',
  rib: '',
  bank: '',
  socialMedia: [{ type: 'facebook', url: '', name: '' }],
  description: '',
  website: '',
  contactEmail: '',
  categories: '',
  idFront: null,
  idBack: null,
};

const RegisterScreen = () => {
  const [userType, setUserType] = useState<UserType>(null);
  const [organizerStep, setOrganizerStep] = useState(1);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  const { formData, handleInputChange } = useRegisterForm(initialFormData);
  const { loading, registerUser, loginUser, verifyOtp, resendOtp, registerOrganizer } = useAuthApi();

  const handleUserRegistration = async () => {
    try {
      const payload = {
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        ...(userType === "organizer" && { role: "organizer" })
      };

      const res = await registerUser(payload);
      
      if (res) {
        setUserId(res.userId);
        setShowOtpModal(true);
        
        if (res.isReturningUser) {
          Alert.alert("Info", "Compte existant. Nouveau code envoyé !");
        } else {
          Alert.alert("Succès", res.message);
        }
      }
      
      return res;
    } catch (error) {
      console.error("Erreur lors de l'inscription utilisateur", error);
      throw error;
    }
  };

  const handleOrganizerRegistration = async () => {
    try {
      // Connexion pour obtenir le token
      const loginRes = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      if (!loginRes || !loginRes.token) {
        throw new Error("Échec de la connexion pour obtenir le token");
      }

      // Sauvegarder le token
      await AsyncStorage.setItem("token", loginRes.token);

      const formDataToSend = new FormData();
      
      // Mapper les types français vers anglais pour la base de données
      const organizerTypeMapping: { [key: string]: string } = {
        'entreprise': 'organization',
        'particulier': 'particular'
      };

      const backendOrganizerType = organizerTypeMapping[formData.organizerType] || 'organizer';
      
      const formFields = {
        companyName: formData.companyName,
        address: formData.address,
        phone: formData.phone,
        type: backendOrganizerType,
        banque: formData.bank, 
        rib: formData.rib,
        website: formData.website || "",
        description: formData.description || "",
        contactEmail: formData.contactEmail,
        categories: JSON.stringify(formData.categories.split(",").map(cat => cat.trim()).filter(cat => cat !== "")),
        socialMedia: JSON.stringify(formData.socialMedia
          .filter(item => item.url.trim() !== "")
          .map(item => ({
            type: item.type,
            url: item.url,
            name: item.name || formData.companyName,
          })))
      };

      Object.entries(formFields).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      if (formData.idFront) {
        formDataToSend.append('idFront', {
          uri: formData.idFront,
          name: 'id_front.jpg',
          type: 'image/jpeg',
        } as any);
      }

      if (formData.idBack) {
        formDataToSend.append('idBack', {
          uri: formData.idBack,
          name: 'id_back.jpg',
          type: 'image/jpeg',
        } as any);
      }


      console.log("Les données du registration : ", formData);

      await registerOrganizer(formDataToSend, loginRes.token);

      Alert.alert("Succès", "Demande soumise avec succès ! En attente de vérification.");
      // Redirection vers la page d'accueil client en attendant la vérification
      router.replace("/(auth)/login");

    } catch (error) {
      console.error("Erreur lors de l'inscription organisateur", error);
      throw error;
    }
  };

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

  const handleVerifyOtp = async (otpCode: string) => {
    if (!userId) return;

    try {
      const res = await verifyOtp(userId, otpCode);
      
      if (res) {
        Alert.alert("Succès", res.message);
        setShowOtpModal(false);

        // Connexion automatique après vérification OTP
        try {
          const loginRes = await loginUser({
            email: formData.email,
            password: formData.password,
          });

          if (loginRes && loginRes.token) {
            await AsyncStorage.setItem("token", loginRes.token);
            
            // Redirection selon le type d'utilisateur
            if (userType === "client") {
              router.replace("/(tabs-client)/home");
            } else if (userType === "organizer") {
              setOrganizerStep(2);
            }
          }
        } catch (loginError) {
          console.error("Erreur lors de la connexion automatique", loginError);
          // Redirection vers login en cas d'erreur
          router.replace("/login");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la vérification OTP", error);
    }
  };

  const handleResendOtp = async () => {
    if (!formData.email) {
      Alert.alert("Erreur", "Email requis");
      return;
    }

    try {
      await resendOtp(formData.email);
    } catch (error) {
      console.error("Erreur lors du renvoi OTP", error);
    }
  };

  const renderContent = () => {
    if (!userType) {
      return (
        <UserTypeSelection
          userType={userType}
          setUserType={setUserType}
          loading={loading}
          onContinue={() => {
            if (userType === 'organizer') setOrganizerStep(1);
          }}
        />
      );
    } else if (userType === 'client') {
      return (
        <ClientRegisterForm
          formData={formData}
          loading={loading}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      );
    } else if (organizerStep === 1) {
      return (
        <OrganizerStep1Form
          formData={formData}
          loading={loading}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      );
    } else {
      return (
        <OrganizerProfessionalInfo
          formData={formData}
          loading={loading}
          onInputChange={handleInputChange}
          onSubmit={handleSubmit}
        />
      );
    }
  };

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

            {renderContent()}

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

            {userType === 'organizer' && organizerStep === 2 && (
              <View className="mt-4">
                <Text className="text-gray-500 text-xs text-center mb-4">
                  Votre compte sera vérifié manuellement dans les 24-48h
                </Text>
                <Text className="text-gray-500 text-xs text-center">
                  {"En vous inscrivant, vous acceptez nos Conditions d'utilisation et notre Politique de confidentialité"}
                </Text>
              </View>
            )}

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

        <OtpModal
          showOtpModal={showOtpModal}
          setShowOtpModal={setShowOtpModal}
          formData={formData}
          verifyOtp={handleVerifyOtp}
          loading={loading}
          resendOtp={handleResendOtp}
        />
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default RegisterScreen;