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
  SafeAreaView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { StatusBar } from 'expo-status-bar';
import { Link, router } from 'expo-router';
import Animated, { FadeInUp } from 'react-native-reanimated';

const API_URL = "https://eventick.onrender.com/api/auth/login";

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        Alert.alert("Erreur", data.message || "Échec de connexion");
        setLoading(false);
        return;
      }

      // Connexion réussie
      console.log("Réponse API login:", data);

      const { token, user } = data;

   

      if (user.role === "user") {
        router.replace("/(tabs-client)/home");
      } else if (user.role === "organizer") {
        router.replace("/(tabs-organisateur)/dashboard");
      } else {
        Alert.alert("Erreur", "Rôle inconnu !");
      }

    } catch (error) {
      console.error("Erreur login:", error);
      Alert.alert("Erreur", "Une erreur est survenue. Réessayez.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      "Mot de passe oublié",
      "La fonctionnalité sera bientôt disponible."
    );
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1 ">
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
            {/* Logo & titre */}
            <Animated.View entering={FadeInUp.delay(100)} className="items-center mb-12">
              <Image
                source={require('@/assets/logo.png')}
                className="w-36 h-36"
                accessibilityLabel="Logo EventMauritanie"
              />
              <Text className="text-gray-400 mt-2 text-xl">Votre billetterie en ligne</Text>
            </Animated.View>

            {/* Titre "Connectez-vous" */}
            <Animated.View entering={FadeInUp.delay(200)} className="mb-10">
              <Text className="text-white text-4xl font-bold text-center">Connectez-vous</Text>
            </Animated.View>

            {/* Email */}
            <Animated.View entering={FadeInUp.delay(300)} className="mb-8">
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

            {/* Mot de passe */}
            <Animated.View entering={FadeInUp.delay(400)} className="mb-10">
              <Text className="text-gray-400 mb-3 font-semibold text-lg">Mot de passe</Text>
              <View className="flex-row items-center bg-white/10 rounded-xl px-6 py-4">
                <Ionicons name="lock-closed" size={28} color="#ec673b" className="mr-4" />
                <TextInput
                  className="flex-1 text-white text-lg"
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>
              <TouchableOpacity
                className="self-end mt-3"
                onPress={handleForgotPassword}
              >
                <Text className="text-[#ec673b] font-semibold text-base">Mot de passe oublié?</Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Bouton connexion */}
            <Animated.View entering={FadeInUp.delay(500)}>
              <TouchableOpacity
                className="bg-[#ec673b] py-5 rounded-xl items-center mb-8 shadow-lg shadow-teal-600/70"
                onPress={handleLogin}
                disabled={loading}
              >
                <Text className="text-white font-bold text-xl">
                  {loading ? "Connexion..." : "Se connecter"}
                </Text>
              </TouchableOpacity>
            </Animated.View>

            {/* Séparateur */}
            <Animated.View entering={FadeInUp.delay(600)} className="flex-row items-center mb-8">
              <View className="flex-1 h-px bg-white/20" />
              <Text className="text-gray-400 mx-5 font-semibold text-base">Ou</Text>
              <View className="flex-1 h-px bg-white/20" />
            </Animated.View>

            {/* Inscription */}
            <Animated.View entering={FadeInUp.delay(800)} className="mt-10 flex-row justify-center">
              <Text className="text-gray-400 font-semibold text-lg">Vous n'avez pas de compte?</Text>
              <Link href="/register" asChild>
                <TouchableOpacity className="ml-3">
                  <Text className="text-[#ec673b] font-bold underline text-lg">S'inscrire</Text>
                </TouchableOpacity>
              </Link>
            </Animated.View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default LoginScreen;
