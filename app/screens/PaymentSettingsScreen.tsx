import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import BackgroundWrapper from "@/components/BackgroundWrapper";
import { SafeAreaView } from "react-native-safe-area-context";

const primaryColor = "#ec673b";

const PaymentSettingsScreen = () => {
  const [form, setForm] = useState({
    bankily: "",
    masrvi: "",
    cardNumber: "",
    cardHolder: "",
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm({ ...form, [field]: value });
  };

  const saveSettings = () => {
    alert("Paramètres de paiement enregistrés avec succès !");
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <StatusBar style="light" />
        <ScrollView
          className="flex-1 px-5 pt-6 pb-32"
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-white text-2xl font-bold mb-8">
            Paramètres de paiement
          </Text>

          <View className="flex-row items-center bg-white/10 rounded-xl px-5 py-4 mb-4 border border-white/10">
            <MaterialCommunityIcons name="bank" size={22} color="#ccc" />
            <TextInput
              placeholder="Numéro Bankily"
              placeholderTextColor="#ccc"
              value={form.bankily}
              onChangeText={(text) => handleChange("bankily", text)}
              keyboardType="numeric"
              className="flex-1 text-white ml-3"
            />
          </View>

          <View className="flex-row items-center bg-white/10 rounded-xl px-5 py-4 mb-4 border border-white/10">
            <FontAwesome5 name="money-bill-wave" size={20} color="#ccc" />
            <TextInput
              placeholder="Numéro Masrvi"
              placeholderTextColor="#ccc"
              value={form.masrvi}
              onChangeText={(text) => handleChange("masrvi", text)}
              keyboardType="numeric"
              className="flex-1 text-white ml-3"
            />
          </View>

          <View className="flex-row items-center bg-white/10 rounded-xl px-5 py-4 mb-4 border border-white/10">
            <Ionicons name="card" size={22} color="#ccc" />
            <TextInput
              placeholder="Numéro Carte bancaire"
              placeholderTextColor="#ccc"
              value={form.cardNumber}
              onChangeText={(text) => handleChange("cardNumber", text)}
              keyboardType="numeric"
              maxLength={16}
              className="flex-1 text-white ml-3"
            />
          </View>

          <View className="flex-row items-center bg-white/10 rounded-xl px-5 py-4 mb-8 border border-white/10">
            <Ionicons name="person" size={22} color="#ccc" />
            <TextInput
              placeholder="Nom du titulaire"
              placeholderTextColor="#ccc"
              value={form.cardHolder}
              onChangeText={(text) => handleChange("cardHolder", text)}
              className="flex-1 text-white ml-3"
            />
          </View>

          <TouchableOpacity
            className="py-4 rounded-xl items-center"
            style={{ backgroundColor: primaryColor }}
            onPress={saveSettings}
            activeOpacity={0.8}
          >
            <Text className="text-white font-bold text-lg">Sauvegarder</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default PaymentSettingsScreen;
