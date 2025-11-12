import React, { useState, useEffect } from 'react';
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
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';
import axios from 'axios';

import Constants from 'expo-constants';

const { API_URL } = (Constants.expoConfig?.extra || {}) as { API_URL: string };

import { SafeAreaView } from 'react-native-safe-area-context';

const ResetPasswordScreen = () => {
  const params = useLocalSearchParams();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.email) {
      setEmail(params.email as string);
    }
  }, [params.email]);

  const handleResetPassword = async () => {
    if (!email || !otp || !newPassword || !confirmPassword) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post(`${API_URL}/api/auth/reset-password`, {
        email,
        otp,
        newPassword
      });
      
      Alert.alert(
        'Succès', 
        response.data.message || 'Mot de passe mis à jour avec succès',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login')
          }
        ]
      );
    } catch (error: any) {
      console.error('Erreur reset password:', error.response?.data || error.message);
      Alert.alert(
        'Erreur', 
        error.response?.data?.message || 'Erreur lors de la réinitialisation'
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

            {/* Logo & titre */}
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
                Nouveau mot de passe
              </Text>
              <Text className="text-gray-400 text-lg text-center mt-4">
                Saisissez le code reçu par email et votre nouveau mot de passe
              </Text>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(400)} className="mb-6">
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
                  editable={!params.email} 
                />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(500)} className="mb-6">
              <Text className="text-gray-400 mb-3 font-semibold text-lg">Code de vérification</Text>
              <View className="flex-row items-center bg-white/10 rounded-xl px-6 py-4">
                <Ionicons name="key" size={28} color="#ec673b" className="mr-4" />
                <TextInput
                  className="flex-1 text-white text-lg"
                  placeholder="123456"
                  placeholderTextColor="#9CA3AF"
                  value={otp}
                  onChangeText={setOtp}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(600)} className="mb-6">
              <Text className="text-gray-400 mb-3 font-semibold text-lg">Nouveau mot de passe</Text>
              <View className="flex-row items-center bg-white/10 rounded-xl px-6 py-4">
                <Ionicons name="lock-closed" size={28} color="#ec673b" className="mr-4" />
                <TextInput
                  className="flex-1 text-white text-lg"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(700)} className="mb-10">
              <Text className="text-gray-400 mb-3 font-semibold text-lg">Confirmer le mot de passe</Text>
              <View className="flex-row items-center bg-white/10 rounded-xl px-6 py-4">
                <Ionicons name="lock-closed" size={28} color="#ec673b" className="mr-4" />
                <TextInput
                  className="flex-1 text-white text-lg"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                />
              </View>
            </Animated.View>

            <Animated.View entering={FadeInUp.delay(800)}>
              <TouchableOpacity
                className="bg-[#ec673b] py-5 rounded-xl items-center mb-8 shadow-lg shadow-teal-600/70"
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text className="text-white font-bold text-xl">
                  {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default ResetPasswordScreen;