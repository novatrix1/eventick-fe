import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import BackgroundWrapper from "@/components/BackgroundWrapper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useRouter } from "expo-router";

const API_URL = "https://eventick.onrender.com";

const primaryColor = "#ec673b";
const secondaryColor = "#68f2f4";

interface OrganizerProfile {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone: string;
  };
  companyName: string;
  address: string;
  isVerified: boolean;
  phone: string;
  type: string;
  socialMedia: Array<{ platform: string; url: string }>;
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
  const [organizerProfile, setOrganizerProfile] = useState<OrganizerProfile | null>(null);
  
  const [activeSection, setActiveSection] = useState("personal");
  const [imageModalVisible, setImageModalVisible] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    email: "",
    personalPhone: "",
    
    companyName: "",
    companyPhone: "",
    address: "",
    type: "entreprise",
    contactEmail: "",
    description: "",
    website: "",
    
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
    
    businessHours: "",
    categories: [] as string[],
    banque: "",
    rib: "",
    
    notifications: {
      sales: true,
      reminders: true,
      promotions: false,
      updates: true,
    },
    language: "fr",
    currency: "MRO",
  });

  const [profileImage, setProfileImage] = useState(
    "https://i.postimg.cc/fLPF4T98/Whats-App-Image-2025-06-27-12-01-22-36d8d6d7.jpg"
  );

  const fetchOrganizerProfile = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Erreur", "Vous devez être connecté");
        router.back();
        return;
      }

      const response = await axios.get(`${API_URL}/api/organizers/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.organizer) {
        const profile = response.data.organizer;
        setOrganizerProfile(profile);
        
        let socialMedia = {
          facebook: "",
          instagram: "",
          twitter: "",
          linkedin: ""
        };

        if (profile.socialMedia && Array.isArray(profile.socialMedia)) {
          profile.socialMedia.forEach((social: any) => {
            if (social && typeof social === 'object') {
              if (social.platform && social.url) {
                if (social.platform.toLowerCase().includes('facebook')) socialMedia.facebook = social.url;
                else if (social.platform.toLowerCase().includes('instagram')) socialMedia.instagram = social.url;
                else if (social.platform.toLowerCase().includes('twitter')) socialMedia.twitter = social.url;
                else if (social.platform.toLowerCase().includes('linkedin')) socialMedia.linkedin = social.url;
              }
              else if (social.url) {
                const url = social.url.toLowerCase();
                if (url.includes('facebook')) socialMedia.facebook = social.url;
                else if (url.includes('instagram')) socialMedia.instagram = social.url;
                else if (url.includes('twitter')) socialMedia.twitter = social.url;
                else if (url.includes('linkedin')) socialMedia.linkedin = social.url;
              }
            }
          });
        }

        setForm({
          name: profile.user?.name || "",
          email: profile.user?.email || "",
          personalPhone: profile.user?.phone || "",
          companyName: profile.companyName || "",
          companyPhone: profile.phone || "",
          address: profile.address || "",
          type: profile.type || "entreprise",
          contactEmail: profile.contactEmail || profile.user?.email || "",
          description: profile.description || "",
          website: profile.website || "",
          ...socialMedia,
          businessHours: profile.businessHours || "",
          categories: profile.categories || [],
          banque: profile.banque || "",
          rib: profile.rib || "",
          notifications: {
            sales: true,
            reminders: true,
            promotions: false,
            updates: true,
          },
          language: "fr",
          currency: "MRO",
        });

        if (profile.user?.image) {
          setProfileImage(profile.user.image);
        }
      }
    } catch (error: any) {
      console.error("Erreur chargement profil:", error);
      Alert.alert("Erreur", error.response?.data?.message || "Erreur lors du chargement du profil");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerProfile();
  }, []);

  const handleChange = (field: string, value: any) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setForm(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof form],
          [child]: value
        }
      }));
    } else {
      setForm(prev => ({ ...prev, [field]: value }));
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

      if (!result.canceled) {
        setProfileImage(result.assets[0].uri);
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

      const updateData: any = {
        companyName: form.companyName,
        address: form.address,
        phone: form.companyPhone,
        type: form.type,
        contactEmail: form.contactEmail,
        description: form.description,
        website: form.website,
        businessHours: form.businessHours,
        categories: form.categories,
        banque: form.banque,
        rib: form.rib,
      };

      const socialMediaData = [];
      if (form.facebook) socialMediaData.push({ platform: 'facebook', url: form.facebook });
      if (form.instagram) socialMediaData.push({ platform: 'instagram', url: form.instagram });
      if (form.twitter) socialMediaData.push({ platform: 'twitter', url: form.twitter });
      if (form.linkedin) socialMediaData.push({ platform: 'linkedin', url: form.linkedin });
      
      if (socialMediaData.length > 0) {
        updateData.socialMedia = socialMediaData;
      }

      console.log("✅ Données envoyées (format corrigé):", updateData);

      const response = await axios.put(
        `${API_URL}/api/organizers/profile`,
        updateData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data) {
        Alert.alert("Succès", "Profil mis à jour avec succès !");
        router.back();
      }
    } catch (error: any) {
      console.error("Erreur sauvegarde détaillée:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config
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
                <Image
                  source={{ uri: profileImage }}
                  className="w-32 h-32 rounded-full border-4"
                  style={{ borderColor: primaryColor }}
                />
                <View className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-lg">
                  <Ionicons name="camera" size={20} color={primaryColor} />
                </View>
              </View>
            </TouchableOpacity>
            <Text className="text-gray-300 text-sm mt-3">
              Appuyez pour changer la photo
            </Text>
          </View>

          <View className="space-y-4">
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
                      value={form.personalPhone}
                      onChangeText={(text) => handleChange("personalPhone", text)}
                      keyboardType="phone-pad"
                      className="bg-white/10 text-white rounded-xl px-4 py-3 text-base border border-white/10"
                    />
                  </View>
                </View>
              )}
            </View>

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
                    <Text className="text-teal-400 text-sm font-medium mb-2">Adresse</Text>
                    <TextInput
                      placeholder="Adresse de votre entreprise"
                      placeholderTextColor="#6b7280"
                      value={form.address}
                      onChangeText={(text) => handleChange("address", text)}
                      className="bg-white/10 text-white rounded-xl px-4 py-3 text-base border border-white/10"
                    />
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
                    <Text className="text-teal-400 text-sm font-medium mb-2">Heures d'ouverture</Text>
                    <TextInput
                      placeholder="Ex: Lun-Ven 9h-18h"
                      placeholderTextColor="#6b7280"
                      value={form.businessHours}
                      onChangeText={(text) => handleChange("businessHours", text)}
                      className="bg-white/10 text-white rounded-xl px-4 py-3 text-base border border-white/10"
                    />
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