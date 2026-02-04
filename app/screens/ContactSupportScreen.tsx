import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import Constants from 'expo-constants';
import { StatusBar } from 'expo-status-bar';
import { useUserInfo } from '@/hooks/useUserInfo';

const { API_URL } = (Constants.expoConfig?.extra || {}) as { API_URL: string };

const SUBJECTS = [
  'Problème de paiement',
  'Billet non reçu',
  'Compte / Profil',
  'Événement',
  'Bug technique',
  'Autre',
];

const ContactSupportScreen = () => {
  const { userInfo } = useUserInfo();

  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permission requise',
        'Autorisez l’accès à la galerie.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      setImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!subject || !message) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }

    try {
      setLoading(true);
      const token = await AsyncStorage.getItem('token');

      const formData = new FormData();
      formData.append('subject', subject);
      formData.append('message', message);
      formData.append('email', userInfo.email);

      if (image) {
        formData.append('attachment', {
          uri: image,
          type: 'image/jpeg',
          name: 'support.jpg',
        } as any);
      }

      await axios.post(
        `${API_URL}/api/support/contact`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      Alert.alert(
        'Message envoyé',
        'Notre équipe vous répondra rapidement.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (err) {
      console.error(err);
      Alert.alert(
        'Erreur',
        'Impossible d’envoyer votre message.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1">
        <StatusBar style="light" />

        <ScrollView
          contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View className="flex-row items-center mb-8">
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={26} color="white" />
            </TouchableOpacity>
            <Text className="text-white text-3xl font-extrabold ml-4">
              Contact Support
            </Text>
          </View>

          {/* Email */}
          <Text className="text-gray-400 mb-2">Email</Text>
          <TextInput
            value={userInfo.email}
            editable={false}
            className="bg-white/10 text-gray-300 px-5 py-4 rounded-xl mb-6"
          />

          {/* Sujet */}
          <Text className="text-teal-400 mb-2 font-medium">
            Sujet
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {SUBJECTS.map(item => (
              <TouchableOpacity
                key={item}
                onPress={() => setSubject(item)}
                className={`px-4 py-2 mr-3 rounded-full ${subject === item
                    ? 'bg-[#ec673b]'
                    : 'bg-white/10'
                  }`}
              >
                <Text className="text-white text-sm">{item}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* Message */}
          <Text className="text-teal-400 mt-8 mb-2 font-medium">
            Message
          </Text>
          <TextInput
            multiline
            numberOfLines={5}
            placeholder="Expliquez votre problème en détail..."
            placeholderTextColor="#999"
            value={message}
            onChangeText={setMessage}
            className="bg-white/10 text-white px-5 py-4 rounded-xl"
          />

          {/* Image */}
          <Text className="text-teal-400 mt-8 mb-3 font-medium">
            Pièce jointe (optionnel)
          </Text>

          {image ? (
            <View className="relative mb-5">
              <Image
                source={{ uri: image }}
                className="w-full h-48 rounded-xl"
              />
              <TouchableOpacity
                className="absolute top-2 right-2 bg-black/60 p-2 rounded-full"
                onPress={() => setImage(null)}
              >
                <Ionicons name="close" size={18} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={pickImage}
              className="bg-teal-400/20 py-4 rounded-xl flex-row justify-center items-center mb-6"
            >
              <Ionicons name="image" size={22} color="#68f2f4" />
              <Text className="text-teal-400 ml-2 font-medium">
                Ajouter une image
              </Text>
            </TouchableOpacity>
          )}

          {/* Submit */}
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={loading}
            className={`py-4 rounded-xl items-center ${loading ? 'bg-gray-500' : 'bg-[#ec673b]'
              }`}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white font-bold text-lg">
                Envoyer le message
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default ContactSupportScreen;
