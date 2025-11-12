import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import axios from 'axios';

import Constants from 'expo-constants';

const { API_URL } = (Constants.expoConfig?.extra || {}) as { API_URL: string };

import { SafeAreaView } from 'react-native-safe-area-context';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      Alert.alert('Erreur', 'Veuillez saisir votre adresse email.');
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      
      Alert.alert(
        'Succès', 
        response.data.message || 'Code de réinitialisation envoyé par email',
        [
          {
            text: 'OK',
            onPress: () => router.push({
              pathname: '/screens/reset-password',
              params: { email }
            })
          }
        ]
      );
    } catch (error: any) {
      console.error('Erreur forgot password:', error.response?.data || error.message);
      Alert.alert(
        'Erreur', 
        error.response?.data?.message || 'Erreur lors de l\'envoi du code'
      );
    } finally {
      setLoading(false);
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
            className="flex-1 px-10 pt-14"
            contentContainerStyle={{ paddingBottom: 60 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Bouton retour */}
            <Animated.View entering={FadeInUp.delay(100)} className="mb-8">
              <TouchableOpacity
                onPress={() => router.back()}
                className="flex-row items-center"
              >
                <Ionicons name="arrow-back" size={28} color="#ec673b" />
                <Text className="text-[#ec673b] ml-2 text-lg font-semibold">Retour</Text>
              </TouchableOpacity>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(200)} className="items-center mb-12">
              <Image
                source={require('@/assets/logo.png')}
                className="w-36 h-36"
                accessibilityLabel="Logo EventMauritanie"
              />
              <Text className="text-gray-400 mt-2 text-xl">Votre billetterie en ligne</Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(300)} className="mb-10">
              <Text className="text-white text-4xl font-bold text-center">
                Mot de passe oublié
              </Text>
              <Text className="text-gray-400 text-lg text-center mt-4">
                Saisissez votre email pour recevoir un code de réinitialisation
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(400)} className="mb-8">
              <Text className="text-gray-400 mb-3 font-semibold text-lg">Email</Text>
              <View className="flex-row items-center bg-white/10 rounded-xl px-6 py-4">
                <Ionicons name="mail" size={28} color="#ec673b" className="mr-4" />
                <TextInput
                  className="flex-1 text-white text-lg"
                  placeholder="votre@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(500)}>
              <TouchableOpacity
                className="bg-[#ec673b] py-5 rounded-xl items-center mb-8 shadow-lg shadow-teal-600/70"
                onPress={handleForgotPassword}
                disabled={loading}
              >
                <Text className="text-white font-bold text-xl">
                  {loading ? "Envoi en cours..." : "Envoyer le code"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default ForgotPasswordScreen;