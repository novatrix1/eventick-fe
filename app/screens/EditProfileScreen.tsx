import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
  ActivityIndicator,
  Alert,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import { useNavigation } from '@react-navigation/native';

const EditProfileScreen = () => {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    profilePicture: null as string | null,
  });

  const [location, setLocation] = useState({
    fullAddress: '', 
  });

  const [imageModalVisible, setImageModalVisible] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const token = await AsyncStorage.getItem('token');
        const res = await axios.get('https://eventick.onrender.com/api/users/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const userData = res.data.user;
        setProfile({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          profilePicture: userData.profilePicture || null,
        });

        if (userData.address) {
          setLocation({
            fullAddress: userData.address
          });
        }
      } catch (err) {
        console.error('Erreur profil:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const pickImage = async (source: 'camera' | 'library') => {
    try {
      if (source === 'camera') {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permission requise", "L'accès à la caméra est nécessaire.");
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert("Permission requise", "L'accès à la galerie est nécessaire.");
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfile(prev => ({
          ...prev,
          profilePicture: result.assets[0].uri
        }));
      }
    } catch (error) {
      console.error("Erreur sélection image:", error);
      Alert.alert("Erreur", "Erreur lors de la sélection de l'image");
    } finally {
      setImageModalVisible(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLocationLoading(true);
      
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          "Permission refusée",
          "L'accès à la localisation est nécessaire pour remplir automatiquement votre adresse."
        );
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      let geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode.length > 0) {
        const address = geocode[0];
        const fullAddress = [
          address.street,
          address.city,
          address.region,
          address.country
        ].filter(Boolean).join(', ');

        setLocation({
          fullAddress: fullAddress || "Adresse non déterminée"
        });

        Alert.alert("Succès", "Adresse remplie automatiquement depuis votre position actuelle");
      } else {
        Alert.alert("Erreur", "Impossible de déterminer votre adresse");
      }
    } catch (error) {
      console.error("Erreur géolocalisation:", error);
      Alert.alert("Erreur", "Impossible d'obtenir votre position");
    } finally {
      setLocationLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem('token');
      
      const formData = new FormData();
      formData.append('name', profile.name);
      formData.append('phone', profile.phone);
      
      if (location.fullAddress) {
        formData.append('address', location.fullAddress);
      }
      
      if (profile.profilePicture && !profile.profilePicture.startsWith('http')) {
        formData.append('profilePicture', {
          uri: profile.profilePicture,
          type: 'image/jpeg',
          name: 'profile-picture.jpg',
        } as any);
      }

      await axios.put(
        'https://eventick.onrender.com/api/users/profile',
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          } 
        }
      );
      
      Alert.alert('Succès', 'Profil mis à jour avec succès');
      navigation.goBack();
    } catch (err: any) {
      console.error('Erreur mise à jour:', err);
      Alert.alert('Erreur', err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <BackgroundWrapper>
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#68f2f4" />
          <Text className="text-white mt-4 text-base">Chargement du profil...</Text>
        </View>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View className="flex-row items-center mb-8">
              <TouchableOpacity onPress={() => navigation.goBack()} className="p-2">
                <Ionicons name="arrow-back" size={26} color="white" />
              </TouchableOpacity>
              <Text className="text-white text-3xl font-extrabold ml-4">Modifier le profil</Text>
            </View>

            <View className="items-center mb-10">
              <TouchableOpacity onPress={() => setImageModalVisible(true)}>
                <View className="relative">
                  <Image
                    source={{
                      uri: profile.profilePicture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&w=800',
                    }}
                    className="w-28 h-28 rounded-full border-4 border-teal-400"
                  />
                  <View className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg">
                    <Ionicons name="camera" size={20} color="#ec673b" />
                  </View>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className="bg-[#ec673b] py-3 px-6 rounded-full mt-5"
                activeOpacity={0.8}
                onPress={() => setImageModalVisible(true)}
              >
                <Text className="text-white font-semibold text-lg">Changer la photo</Text>
              </TouchableOpacity>
            </View>

            <Text className="text-teal-400 text-lg font-medium mb-3">Informations personnelles</Text>
            <TextInput
              className="bg-white/10 text-white rounded-xl px-5 py-4 mb-5 text-lg"
              placeholder="Nom complet"
              placeholderTextColor="#ccc"
              value={profile.name}
              onChangeText={text => setProfile({ ...profile, name: text })}
            />
            <TextInput
              className="bg-white/10 text-white rounded-xl px-5 py-4 mb-5 text-lg"
              placeholder="Email"
              placeholderTextColor="#ccc"
              editable={false}
              value={profile.email}
            />
            <TextInput
              className="bg-white/10 text-white rounded-xl px-5 py-4 mb-8 text-lg"
              placeholder="Téléphone"
              placeholderTextColor="#ccc"
              value={profile.phone}
              onChangeText={text => setProfile({ ...profile, phone: text })}
              keyboardType="phone-pad"
            />

            <Text className="text-teal-400 text-lg font-medium mb-3">Adresse</Text>
            
            <TouchableOpacity
              className="flex-row items-center justify-center bg-teal-400/20 py-4 px-4 rounded-xl mb-5"
              onPress={getCurrentLocation}
              disabled={locationLoading}
            >
              {locationLoading ? (
                <ActivityIndicator size="small" color="#68f2f4" />
              ) : (
                <Ionicons name="location" size={20} color="#68f2f4" />
              )}
              <Text className="text-teal-400 ml-2 font-medium text-lg">
                {locationLoading ? 'Localisation en cours...' : 'Utiliser ma position actuelle'}
              </Text>
            </TouchableOpacity>

            <TextInput
              className="bg-white/10 text-white rounded-xl px-5 py-4 mb-5 text-lg"
              placeholder="Votre adresse complète"
              placeholderTextColor="#ccc"
              value={location.fullAddress}
              onChangeText={text => setLocation({ fullAddress: text })}
              multiline
              numberOfLines={2}
            />

            <TouchableOpacity
              className={`py-4 rounded-xl items-center ${
                saving ? 'bg-gray-500' : 'bg-[#ec673b]'
              }`}
              activeOpacity={0.85}
              disabled={saving}
              onPress={handleSave}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#ffffff" />
              ) : (
                <Text className="text-white font-bold text-lg">Enregistrer les modifications</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>

        <Modal
          visible={imageModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View className="flex-1 justify-end bg-black/70">
            <View className="bg-[#1a2d3d] rounded-t-3xl p-6">
              <Text className="text-white text-xl font-bold text-center mb-6">
                Changer la photo de profil
              </Text>
              
              <View className="flex-row justify-around mb-6">
                <TouchableOpacity
                  className="items-center"
                  onPress={() => pickImage('camera')}
                >
                  <View className="bg-teal-400/20 p-4 rounded-full mb-2">
                    <Ionicons name="camera" size={32} color="#68f2f4" />
                  </View>
                  <Text className="text-white">Appareil photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="items-center"
                  onPress={() => pickImage('library')}
                >
                  <View className="bg-teal-400/20 p-4 rounded-full mb-2">
                    <Ionicons name="images" size={32} color="#68f2f4" />
                  </View>
                  <Text className="text-white">Galerie</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                className="py-3 rounded-xl items-center bg-white/10"
                onPress={() => setImageModalVisible(false)}
              >
                <Text className="text-white font-medium">Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default EditProfileScreen;