import React from "react";
import {
  View,
  Text,
  FlatList,
  SafeAreaView,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import BackgroundWrapper from "@/components/BackgroundWrapper";

const primaryColor = "#ec673b";

const loginHistory = [
  {
    id: "1",
    date: "2025-08-10",
    time: "14:30",
    device: "iPhone 12",
    location: "Nouakchott, Mauritanie",
  },
  {
    id: "2",
    date: "2025-08-08",
    time: "09:15",
    device: "Samsung Galaxy S21",
    location: "Nouakchott, Mauritanie",
  },
  {
    id: "3",
    date: "2025-08-05",
    time: "19:45",
    device: "Web - Chrome",
    location: "Nouakchott, Mauritanie",
  },
];

const LoginHistoryScreen = () => {
  const renderItem = ({ item }: { item: typeof loginHistory[0] }) => (
    <View className="bg-white/10 rounded-xl p-4 mb-4 border border-white/20">
      <Text className="text-white text-lg font-semibold mb-1">
        {item.date} à {item.time}
      </Text>
      <Text className="text-gray-300 text-base mb-1">Appareil : {item.device}</Text>
      <Text className="text-gray-300 text-base">Localisation : {item.location}</Text>
    </View>
  );

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <StatusBar style="light" />
        <View className="px-5 pt-6 pb-20 flex-1">
          <Text className="text-white text-2xl font-bold mb-6">
            Historique de connexion
          </Text>
          <FlatList
            data={loginHistory}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 30 }}
          />
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default LoginHistoryScreen;
