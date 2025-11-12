import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import BackgroundWrapper from "@/components/BackgroundWrapper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import Constants from 'expo-constants';

const { API_URL } = (Constants.expoConfig?.extra || {}) as { API_URL: string };


const primaryColor = "#ec673b";
const secondaryColor = "#68f2f4";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  phone: string;
  profilePicture?: string;
  address: string;
}

interface OrganizerProfile {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
    profilePicture?: string;
  };
  companyName: string;
  address: string;
  isVerified: boolean;
  phone: string;
  type: string;
  socialMedia: Array<{ type: string; url: string; name: string }>;
  description: string;
  isActive: boolean;
  verificationStatus: string;
  categories: string[];
  rating: number;
  totalEvents: number;
  totalRevenue: number;
  contactEmail: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  verificationDate?: string;
  verifiedBy?: string;
  balance: number;
  website?: string;
  businessHours?: string;
  banque?: string;
  rib?: string;
}

const EditProfileScreenOrganisateur = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [organizerProfile, setOrganizerProfile] = useState<OrganizerProfile | null>(null);
  
  const [activeSection, setActiveSection] = useState("personal");
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  
  const [form, setForm] = useState({
    // User information - from /api/users/profile
    name: "",
    email: "",
    phone: "",
    address: "",
    profilePicture: "",
    
    // Organizer information - from /api/organizers/profile
    companyName: "",
    companyPhone: "",
    contactEmail: "",
    description: "",
    website: "",
    type: "particular",
    
    // Social media
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    whatsapp: "",
    
    // Additional organizer info
    businessHours: "",
    categories: [] as string[],
    banque: "",
    rib: "",
  });

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState("");

  // Upload image to server
  const uploadImage = async (uri: string) => {
    try {
      setUploadingImage(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const formData = new FormData();
      formData.append('profilePicture', {
        uri,
        type: 'image/jpeg',
        name: 'profile-picture.jpg',
      } as any);

      const response = await axios.put(`${API_URL}/api/users/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.profilePicture;
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  // Fetch user profile
  const fetchUserProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté");
        router.back();
        return null;
      }

      const response = await axios.get(`${API_URL}/api/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ User profile data:", response.data);
      return response.data.user; // Return user object directly
    } catch (error: any) {
      console.error("Erreur chargement profil utilisateur:", error);
      Alert.alert("Erreur", error.response?.data?.message || "Erreur lors du chargement du profil utilisateur");
      return null;
    }
  };

  // Fetch organizer profile
  const fetchOrganizerProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté");
        router.back();
        return null;
      }

      const response = await axios.get(`${API_URL}/api/organizers/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("✅ Organizer profile data:", response.data);
      return response.data.organizer;
    } catch (error: any) {
      console.error("Erreur chargement profil organisateur:", error);
      Alert.alert("Erreur", error.response?.data?.message || "Erreur lors du chargement du profil organisateur");
      return null;
    }
  };

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        
        // Fetch both profiles in parallel
        const [userData, organizerData] = await Promise.all([
          fetchUserProfile(),
          fetchOrganizerProfile()
        ]);

        console.log("📊 Fetched data:", { userData, organizerData });

        // Set user data first
        if (userData) {
          setUserProfile(userData);
          
          // Auto-fill user information
          setForm(prev => ({
            ...prev,
            name: userData.name || "",
            email: userData.email || "",
            phone: userData.phone || "",
            address: userData.address || "",
            profilePicture: userData.profilePicture || "",
          }));

          // Set profile image
          if (userData.profilePicture) {
            setProfileImage(userData.profilePicture);
          } else {
            setProfileImage("https://i.postimg.cc/fLPF4T98/Whats-App-Image-2025-06-27-12-01-22-36d8d6d7.jpg");
          }
        }

        // Then set organizer data
        if (organizerData) {
          setOrganizerProfile(organizerData);
          
          // Extract social media URLs
          let socialMedia = {
            facebook: "",
            instagram: "",
            twitter: "",
            linkedin: "",
            whatsapp: ""
          };

          if (organizerData.socialMedia && Array.isArray(organizerData.socialMedia)) {
            organizerData.socialMedia.forEach((social: any) => {
              if (social && typeof social === 'object') {
                if (social.type && social.url) {
                  const type = social.type.toLowerCase();
                  if (type.includes('facebook')) socialMedia.facebook = social.url;
                  else if (type.includes('instagram')) socialMedia.instagram = social.url;
                  else if (type.includes('twitter')) socialMedia.twitter = social.url;
                  else if (type.includes('linkedin')) socialMedia.linkedin = social.url;
                  else if (type.includes('whatsapp')) socialMedia.whatsapp = social.url;
                }
              }
            });
          }

          // Auto-fill organizer information
          setForm(prev => ({
            ...prev,
            companyName: organizerData.companyName || "",
            companyPhone: organizerData.phone || "",
            contactEmail: organizerData.contactEmail || userData?.email || "",
            description: organizerData.description || "",
            website: organizerData.website || "",
            type: organizerData.type || "particular",
            ...socialMedia,
            businessHours: organizerData.businessHours || "",
            categories: organizerData.categories || [],
            banque: organizerData.banque || "",
            rib: organizerData.rib || "",
            // Use organizer address if available, otherwise keep user address
            address: organizerData.address || prev.address,
          }));

          // If user data wasn't available, use organizer's user data as fallback
          if (!userData && organizerData.user) {
            setForm(prev => ({
              ...prev,
              name: organizerData.user.name || prev.name,
              email: organizerData.user.email || prev.email,
              phone: organizerData.user.phone || prev.phone,
              profilePicture: organizerData.user.profilePicture || prev.profilePicture,
            }));

            if (organizerData.user.profilePicture) {
              setProfileImage(organizerData.user.profilePicture);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching profiles:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfiles();
  }, []);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const addCategory = () => {
    if (newCategory.trim() && !form.categories.includes(newCategory.trim())) {
      setForm(prev => ({
        ...prev,
        categories: [...prev.categories, newCategory.trim()]
      }));
      setNewCategory("");
    }
  };

  const removeCategory = (categoryToRemove: string) => {
    setForm(prev => ({
      ...prev,
      categories: prev.categories.filter(cat => cat !== categoryToRemove)
    }));
  };

  // Get current location
  const getCurrentLocation = async () => {
    try {
      setGettingLocation(true);
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Permission refusée", "L'accès à la localisation est nécessaire pour obtenir votre adresse actuelle.");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (address) {
        const formattedAddress = [
          address.street,
          address.city,
          address.region,
          address.country
        ].filter(Boolean).join(', ');
        
        if (formattedAddress) {
          handleChange("address", formattedAddress);
          Alert.alert("Succès", "Adresse mise à jour avec votre position actuelle");
        }
      }
    } catch (error) {
      console.error("Erreur localisation:", error);
      Alert.alert("Erreur", "Impossible d'obtenir votre position actuelle");
    } finally {
      setGettingLocation(false);
    }
  };

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

      if (!result.canceled && result.assets[0].uri) {
        const imageUri = result.assets[0].uri;
        setProfileImage(imageUri);
        
        try {
          const uploadedImageUrl = await uploadImage(imageUri);
          setProfileImage(uploadedImageUrl);
          setForm(prev => ({ ...prev, profilePicture: uploadedImageUrl }));
          Alert.alert("Succès", "Photo de profil mise à jour avec succès");
        } catch (error) {
          Alert.alert("Erreur", "Échec du téléchargement de l'image");
          // Keep the local image for preview anyway
        }
      }
    } catch (error) {
      console.error("Erreur sélection image:", error);
      Alert.alert("Erreur", "Erreur lors de la sélection de l'image");
    } finally {
      setImageModalVisible(false);
    }
  };

  const saveProfile = async () => {
    try {
      setSaving(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté");
        return;
      }

      // Update user profile
      const userUpdateData = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: form.address,
      };

      // Update organizer profile
      const organizerUpdateData: any = {
        companyName: form.companyName,
        address: form.address,
        contactEmail: form.contactEmail,
        description: form.description,
        website: form.website,
        type: form.type,
        categories: form.categories,
        banque: form.banque,
        rib: form.rib,
      };

      // Add phone only if it's different from user phone
      if (form.companyPhone && form.companyPhone !== form.phone) {
        organizerUpdateData.phone = form.companyPhone;
      }

      // Prepare social media data
      const socialMediaData = [];
      if (form.facebook) socialMediaData.push({ type: 'facebook', url: form.facebook, name: form.companyName });
      if (form.instagram) socialMediaData.push({ type: 'instagram', url: form.instagram, name: form.companyName });
      if (form.twitter) socialMediaData.push({ type: 'twitter', url: form.twitter, name: form.companyName });
      if (form.linkedin) socialMediaData.push({ type: 'linkedin', url: form.linkedin, name: form.companyName });
      if (form.whatsapp) socialMediaData.push({ type: 'whatsapp', url: form.whatsapp, name: form.companyName });
      
      if (socialMediaData.length > 0) {
        organizerUpdateData.socialMedia = socialMediaData;
      }

      console.log("✅ Données utilisateur envoyées:", userUpdateData);
      console.log("✅ Données organisateur envoyées:", organizerUpdateData);

      // Make both API calls
      await Promise.all([
        axios.put(`${API_URL}/api/users/profile`, userUpdateData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        axios.put(`${API_URL}/api/organizers/profile`, organizerUpdateData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      ]);

      Alert.alert("Succès", "Profil mis à jour avec succès !");
      router.back();
    } catch (error: any) {
      console.error("Erreur sauvegarde détaillée:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
      
      let errorMessage = "Erreur lors de la mise à jour du profil";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 500) {
        errorMessage = "Erreur serveur - Veuillez réessayer plus tard";
      }
      
      Alert.alert("Erreur", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const SectionHeader = ({ icon, title, isActive, onPress }: any) => (
    <TouchableOpacity
      className={`flex-row items-center p-4 rounded-xl mb-2 ${
        isActive ? "bg-white/20" : "bg-white/5"
      }`}
      onPress={onPress}
    >
      <Ionicons name={icon} size={24} color={secondaryColor} />
      <Text className="text-white font-semibold ml-3 text-lg flex-1">{title}</Text>
      <Ionicons 
        name={isActive ? "chevron-up" : "chevron-down"} 
        size={20} 
        color={secondaryColor} 
      />
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <BackgroundWrapper>
        <SafeAreaView className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color={primaryColor} />
          <Text className="text-white mt-4 text-lg">Chargement du profil...</Text>
        </SafeAreaView>
      </BackgroundWrapper>
    );
  }

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <StatusBar style="light" />
        
        <View className="px-5 pt-6 pb-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => router.back()} className="p-2">
            <Ionicons name="arrow-back" size={28} color={secondaryColor} />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Modifier le profil</Text>
          <TouchableOpacity 
            onPress={saveProfile} 
            disabled={saving}
            className="p-2"
          >
            {saving ? (
              <ActivityIndicator size="small" color={secondaryColor} />
            ) : (
              <Ionicons name="checkmark" size={28} color={secondaryColor} />
            )}
          </TouchableOpacity>
        </View>

        <ScrollView
          className="flex-1 px-5 pb-32"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-8">
            <TouchableOpacity onPress={() => setImageModalVisible(true)}>
              <View className="relative">
                {uploadingImage ? (
                  <View className="w-32 h-32 rounded-full border-4 justify-center items-center" style={{ borderColor: primaryColor }}>
                    <ActivityIndicator size="large" color={primaryColor} />
                  </View>
                ) : (
                  <>
                    <Image
                      source={{ uri: profileImage || "https://i.postimg.cc/fLPF4T98/Whats-App-Image-2025-06-27-12-01-22-36d8d6d7.jpg" }}
                      className="w-32 h-32 rounded-full border-4"
                      style={{ borderColor: primaryColor }}
                    />
                    <View className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg">
                      <Ionicons name="camera" size={20} color={primaryColor} />
                    </View>
                  </>
                )}
              </View>
            </TouchableOpacity>
            <Text className="text-gray-300 text-sm mt-3">
              {uploadingImage ? "Téléchargement..." : "Appuyez pour changer la photo"}
            </Text>
          </View>

          <View className="space-y-4">
            {/* Informations Personnelles */}
            <View>
              <SectionHeader
                icon="person"
                title="Informations personnelles"
                isActive={activeSection === "personal"}
                onPress={() => setActiveSection(activeSection === "personal" ? "" : "personal")}
              />
              
              {activeSection === "personal" && (
                <View className="bg-white/5 rounded-xl p-4 space-y-4">
                  <View>
                    <Text className="text-teal-400 text-sm font-medium mb-2">Nom complet</Text>
                    <TextInput
                      placeholder="Votre nom complet"
                      placeholderTextColor="#6b7280"
                      value={form.name}
                      onChangeText={(text) => handleChange("name", text)}
                      className="bg-white/10 text-white rounded-xl px-4 py-3 text-base border border-white/10"
                    />
                  </View>

                  <View>
                    <Text className="text-teal-400 text-sm font-medium mb-2">Email</Text>
                    <TextInput
                      placeholder="votre@email.com"
                      placeholderTextColor="#6b7280"
                      value={form.email}
                      onChangeText={(text) => handleChange("email", text)}
                      keyboardType="email-address"
                      className="bg-white/10 text-white rounded-xl px-4 py-3 text-base border border-white/10"
                    />
                  </View>

                  <View>
                    <Text className="text-teal-400 text-sm font-medium mb-2">Téléphone personnel</Text>
                    <TextInput
                      placeholder="+222 XX XX XX XX"
                      placeholderTextColor="#6b7280"
                      value={form.phone}
                      onChangeText={(text) => handleChange("phone", text)}
                      keyboardType="phone-pad"
                      className="bg-white/10 text-white rounded-xl px-4 py-3 text-base border border-white/10"
                    />
                  </View>

                  <View>
                    <View className="flex-row justify-between items-center mb-2">
                      <Text className="text-teal-400 text-sm font-medium">Adresse</Text>
                      <TouchableOpacity 
                        onPress={getCurrentLocation}
                        disabled={gettingLocation}
                        className="flex-row items-center"
                      >
                        {gettingLocation ? (
                          <ActivityIndicator size="small" color={secondaryColor} />
                        ) : (
                          <Ionicons name="location" size={16} color={secondaryColor} />
                        )}
                        <Text className="text-teal-400 text-xs ml-1">
                          {gettingLocation ? "Récupération..." : "Position actuelle"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                    <TextInput
                      placeholder="Votre adresse"
                      placeholderTextColor="#6b7280"
                      value={form.address}
                      onChangeText={(text) => handleChange("address", text)}
                      multiline
                      numberOfLines={2}
                      textAlignVertical="top"
                      className="bg-white/10 text-white rounded-xl px-4 py-3 text-base border border-white/10 min-h-[60px]"
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Informations de l'Entreprise */}
            <View>
              <SectionHeader
                icon="business"
                title="Informations de l'entreprise"
                isActive={activeSection === "company"}
                onPress={() => setActiveSection(activeSection === "company" ? "" : "company")}
              />
              
              {activeSection === "company" && (
                <View className="bg-white/5 rounded-xl p-4 space-y-4">
                  <View>
                    <Text className="text-teal-400 text-sm font-medium mb-2">Nom de l'entreprise</Text>
                    <TextInput
                      placeholder="Nom de votre entreprise"
                      placeholderTextColor="#6b7280"
                      value={form.companyName}
                      onChangeText={(text) => handleChange("companyName", text)}
                      className="bg-white/10 text-white rounded-xl px-4 py-3 text-base border border-white/10"
                    />
                  </View>

                  <View>
                    <Text className="text-teal-400 text-sm font-medium mb-2">Téléphone professionnel</Text>
                    <TextInput
                      placeholder="+222 XX XX XX XX"
                      placeholderTextColor="#6b7280"
                      value={form.companyPhone}
                      onChangeText={(text) => handleChange("companyPhone", text)}
                      keyboardType="phone-pad"
                      className="bg-white/10 text-white rounded-xl px-4 py-3 text-base border border-white/10"
                    />
                  </View>

                  <View>
                    <Text className="text-teal-400 text-sm font-medium mb-2">Type d'organisateur</Text>
                    <View className="flex-row space-x-4">
                      <TouchableOpacity
                        className={`flex-1 py-3 rounded-xl border ${
                          form.type === "particular" 
                            ? "border-teal-400 bg-teal-400/20" 
                            : "border-white/10 bg-white/5"
                        }`}
                        onPress={() => handleChange("type", "particular")}
                      >
                        <Text className={`text-center ${
                          form.type === "particular" ? "text-teal-400" : "text-white"
                        }`}>
                          Particulier
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        className={`flex-1 py-3 rounded-xl border ${
                          form.type === "entreprise" 
                            ? "border-teal-400 bg-teal-400/20" 
                            : "border-white/10 bg-white/5"
                        }`}
                        onPress={() => handleChange("type", "entreprise")}
                      >
                        <Text className={`text-center ${
                          form.type === "entreprise" ? "text-teal-400" : "text-white"
                        }`}>
                          Entreprise
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  <View>
                    <Text className="text-teal-400 text-sm font-medium mb-2">Email de contact</Text>
                    <TextInput
                      placeholder="contact@entreprise.com"
                      placeholderTextColor="#6b7280"
                      value={form.contactEmail}
                      onChangeText={(text) => handleChange("contactEmail", text)}
                      keyboardType="email-address"
                      className="bg-white/10 text-white rounded-xl px-4 py-3 text-base border border-white/10"
                    />
                  </View>

                  <View>
                    <Text className="text-teal-400 text-sm font-medium mb-2">Site web</Text>
                    <TextInput
                      placeholder="https://votre-site.com"
                      placeholderTextColor="#6b7280"
                      value={form.website}
                      onChangeText={(text) => handleChange("website", text)}
                      keyboardType="url"
                      className="bg-white/10 text-white rounded-xl px-4 py-3 text-base border border-white/10"
                    />
                  </View>

                  <View>
                    <Text className="text-teal-400 text-sm font-medium mb-2">Description</Text>
                    <TextInput
                      placeholder="Décrivez votre entreprise..."
                      placeholderTextColor="#6b7280"
                      value={form.description}
                      onChangeText={(text) => handleChange("description", text)}
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      className="bg-white/10 text-white rounded-xl px-4 py-3 text-base h-24 border border-white/10"
                    />
                  </View>

                  <View>
                    <Text className="text-teal-400 text-sm font-medium mb-2">Catégories</Text>
                    <View className="flex-row space-x-2 mb-2">
                      <TextInput
                        placeholder="Ajouter une catégorie"
                        placeholderTextColor="#6b7280"
                        value={newCategory}
                        onChangeText={setNewCategory}
                        className="flex-1 bg-white/10 text-white rounded-xl px-4 py-3 text-base border border-white/10"
                      />
                      <TouchableOpacity
                        onPress={addCategory}
                        className="bg-teal-400 px-4 rounded-xl justify-center"
                      >
                        <Text className="text-white font-bold">+</Text>
                      </TouchableOpacity>
                    </View>
                    <View className="flex-row flex-wrap gap-2">
                      {form.categories.map((category, index) => (
                        <View key={index} className="bg-teal-400/20 px-3 py-2 rounded-full flex-row items-center">
                          <Text className="text-teal-400 text-sm mr-2">{category}</Text>
                          <TouchableOpacity onPress={() => removeCategory(category)}>
                            <Ionicons name="close" size={16} color={secondaryColor} />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  </View>

                  <View>
                    <Text className="text-teal-400 text-sm font-medium mb-2">Banque</Text>
                    <TextInput
                      placeholder="Nom de votre banque"
                      placeholderTextColor="#6b7280"
                      value={form.banque}
                      onChangeText={(text) => handleChange("banque", text)}
                      className="bg-white/10 text-white rounded-xl px-4 py-3 text-base border border-white/10"
                    />
                  </View>

                  <View>
                    <Text className="text-teal-400 text-sm font-medium mb-2">RIB</Text>
                    <TextInput
                      placeholder="Votre RIB"
                      placeholderTextColor="#6b7280"
                      value={form.rib}
                      onChangeText={(text) => handleChange("rib", text)}
                      className="bg-white/10 text-white rounded-xl px-4 py-3 text-base border border-white/10"
                    />
                  </View>
                </View>
              )}
            </View>

            {/* Réseaux Sociaux */}
            <View>
              <SectionHeader
                icon="share-social"
                title="Réseaux sociaux"
                isActive={activeSection === "social"}
                onPress={() => setActiveSection(activeSection === "social" ? "" : "social")}
              />
              
              {activeSection === "social" && (
                <View className="bg-white/5 rounded-xl p-4 space-y-4">
                  {[
                    { label: "Facebook", field: "facebook", icon: "facebook", color: "#1877F2" },
                    { label: "Instagram", field: "instagram", icon: "instagram", color: "#E4405F" },
                    { label: "Twitter", field: "twitter", icon: "twitter", color: "#1DA1F2" },
                    { label: "LinkedIn", field: "linkedin", icon: "linkedin", color: "#0A66C2" },
                    { label: "WhatsApp", field: "whatsapp", icon: "whatsapp", color: "#25D366" },
                  ].map((social, index) => (
                    <View key={index} className="flex-row items-center bg-white/10 rounded-xl px-4 py-3 border border-white/10">
                      <FontAwesome name={social.icon as any} size={20} color={social.color} />
                      <TextInput
                        placeholder={`URL ${social.label}`}
                        placeholderTextColor="#6b7280"
                        value={form[social.field as keyof typeof form] as string}
                        onChangeText={(text) => handleChange(social.field, text)}
                        className="flex-1 text-white ml-3 text-base"
                      />
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>

          <TouchableOpacity
            className="py-4 rounded-xl items-center mt-8 mb-8 shadow-lg"
            style={{ backgroundColor: primaryColor }}
            onPress={saveProfile}
            disabled={saving}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#ffffff" />
            ) : (
              <Text className="text-white font-bold text-lg">Sauvegarder les modifications</Text>
            )}
          </TouchableOpacity>
        </ScrollView>

        <Modal
          visible={imageModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setImageModalVisible(false)}
        >
          <View className="flex-1 bg-black/70 justify-end">
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
                    <Ionicons name="camera" size={32} color={secondaryColor} />
                  </View>
                  <Text className="text-white">Appareil photo</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  className="items-center"
                  onPress={() => pickImage('library')}
                >
                  <View className="bg-teal-400/20 p-4 rounded-full mb-2">
                    <Ionicons name="images" size={32} color={secondaryColor} />
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

export default EditProfileScreenOrganisateur;