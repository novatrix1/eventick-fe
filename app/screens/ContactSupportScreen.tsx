import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import BackgroundWrapper from "@/components/BackgroundWrapper";
import { Ionicons } from "@expo/vector-icons";

const primaryColor = "#ec673b";

const ContactSupportScreen = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const validateEmail = (email: string) => {
    return /\S+@\S+\.\S+/.test(email);
  };

  const handleSubmit = () => {
    if (!form.name.trim()) {
      Alert.alert("Erreur", "Veuillez entrer votre nom");
      return;
    }
    if (!validateEmail(form.email)) {
      Alert.alert("Erreur", "Veuillez entrer un email valide");
      return;
    }
    if (!form.subject.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un sujet");
      return;
    }
    if (!form.message.trim()) {
      Alert.alert("Erreur", "Veuillez entrer un message");
      return;
    }

    Alert.alert(
      "Message envoyé",
      "Merci de nous avoir contactés. Nous vous répondrons rapidement."
    );

    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <StatusBar style="light" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          className="flex-1"
        >
          <ScrollView
            contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 60 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text className="text-white text-2xl font-bold mb-8">
              Contacter le support
            </Text>

            <View className="mb-6">
              <Text className="text-white mb-2 font-semibold">Nom complet</Text>
              <View className="flex-row items-center bg-white/10 rounded-xl border border-white/10 px-4">
                <Ionicons name="person" size={20} color="#ccc" />
                <TextInput
                  placeholder="Votre nom complet"
                  placeholderTextColor="#ccc"
                  value={form.name}
                  onChangeText={(text) => handleChange("name", text)}
                  className="flex-1 text-white px-3 py-3 text-lg"
                  autoCorrect={false}
                  autoCapitalize="words"
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-white mb-2 font-semibold">Email</Text>
              <View className="flex-row items-center bg-white/10 rounded-xl border border-white/10 px-4">
                <Ionicons name="mail" size={20} color="#ccc" />
                <TextInput
                  placeholder="Votre adresse email"
                  placeholderTextColor="#ccc"
                  value={form.email}
                  onChangeText={(text) => handleChange("email", text)}
                  keyboardType="email-address"
                  className="flex-1 text-white px-3 py-3 text-lg"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View className="mb-6">
              <Text className="text-white mb-2 font-semibold">Sujet</Text>
              <View className="flex-row items-center bg-white/10 rounded-xl border border-white/10 px-4">
                <Ionicons name="document-text" size={20} color="#ccc" />
                <TextInput
                  placeholder="Sujet de votre demande"
                  placeholderTextColor="#ccc"
                  value={form.subject}
                  onChangeText={(text) => handleChange("subject", text)}
                  className="flex-1 text-white px-3 py-3 text-lg"
                  autoCorrect={false}
                />
              </View>
            </View>

            <View className="mb-8">
              <Text className="text-white mb-2 font-semibold">Message</Text>
              <View className="bg-white/10 rounded-xl border border-white/10 px-4">
                <TextInput
                  placeholder="Écrivez votre message ici..."
                  placeholderTextColor="#ccc"
                  value={form.message}
                  onChangeText={(text) => handleChange("message", text)}
                  multiline
                  numberOfLines={6}
                  textAlignVertical="top"
                  className="text-white px-3 py-3 text-lg"
                />
              </View>
            </View>

            <TouchableOpacity
              className="py-4 rounded-xl items-center"
              style={{ backgroundColor: primaryColor }}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text className="text-white font-bold text-lg">Envoyer</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default ContactSupportScreen;
