import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
} from "react-native";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { StatusBar } from "expo-status-bar";
import BackgroundWrapper from "@/components/BackgroundWrapper";

const primaryColor = "#ec673b";

const EditProfileScreen = () => {
  const [profileImage, setProfileImage] = useState(
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80"
  );

  const [form, setForm] = useState({
    name: "Amadou Sow",
    email: "contact@amadousow.dev",
    phone: "+222 12 34 56 78",
    organization: "EventMR",
    city: "Nouakchott",
    country: "Mauritanie",
    language: "Français",
    bio: "",
    website: "",
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: "",
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const saveProfile = () => {
    alert("Profil mis à jour avec succès !");
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <StatusBar style="light" />
        <ScrollView
          className="flex-1 px-5 pt-6 pb-32"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-8">
            <TouchableOpacity onPress={pickImage}>
              <Image
                source={{ uri: profileImage }}
                className="w-32 h-32 rounded-full border-4"
                style={{ borderColor: primaryColor }}
              />
              <View className="absolute bottom-0 right-0 bg-white p-2 rounded-full">
                <Ionicons name="camera" size={20} color={primaryColor} />
              </View>
            </TouchableOpacity>
            <Text className="text-white text-lg mt-3">
              Changer la photo de profil
            </Text>
          </View>

          <Text className="text-white text-xl font-bold mb-4">
            Informations personnelles
          </Text>
          {[
            { label: "Nom complet", field: "name" },
            { label: "Email", field: "email" },
            { label: "Téléphone", field: "phone" },
            { label: "Organisation", field: "organization" },
            { label: "Ville", field: "city" },
            { label: "Pays", field: "country" },
          ].map((item, i) => (
            <TextInput
              key={i}
              placeholder={item.label}
              placeholderTextColor="#ccc"
              value={form[item.field as keyof typeof form]}
              onChangeText={(text) =>
                handleChange(item.field as keyof typeof form, text)
              }
              className="bg-white/10 text-white rounded-xl px-5 py-4 mb-4 text-lg border border-white/10"
            />
          ))}

          <Text className="text-white text-xl font-bold mb-4">Bio</Text>
          <TextInput
            placeholder="Parlez un peu de vous..."
            placeholderTextColor="#ccc"
            value={form.bio}
            onChangeText={(text) => handleChange("bio", text)}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            className="bg-white/10 text-white rounded-xl px-5 py-4 mb-4 text-lg border border-white/10"
          />

          <Text className="text-white text-xl font-bold mb-4">
            Réseaux sociaux
          </Text>
          {[
            { label: "Facebook", field: "facebook", icon: "facebook" },
            { label: "Instagram", field: "instagram", icon: "instagram" },
            { label: "Twitter / X", field: "twitter", icon: "twitter" },
            { label: "LinkedIn", field: "linkedin", icon: "linkedin" },
          ].map((item, i) => (
            <View
              key={i}
              className="flex-row items-center bg-white/10 rounded-xl px-5 py-4 mb-4 border border-white/10"
            >
              <FontAwesome name={item.icon as any} size={22} color="#ccc" />
              <TextInput
                placeholder={item.label}
                placeholderTextColor="#ccc"
                value={form[item.field as keyof typeof form]}
                onChangeText={(text) =>
                  handleChange(item.field as keyof typeof form, text)
                }
                className="flex-1 text-white ml-3"
              />
            </View>
          ))}

          <Text className="text-white text-xl font-bold mb-4">Site web</Text>
          <TextInput
            placeholder="Votre site web"
            placeholderTextColor="#ccc"
            value={form.website}
            onChangeText={(text) => handleChange("website", text)}
            className="bg-white/10 text-white rounded-xl px-5 py-4 mb-8 text-lg border border-white/10"
          />

          <TouchableOpacity
            className="py-4 rounded-xl items-center"
            style={{ backgroundColor: primaryColor }}
            onPress={saveProfile}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-lg">Sauvegarder</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default EditProfileScreen;
