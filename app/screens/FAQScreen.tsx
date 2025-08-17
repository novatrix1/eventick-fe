import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import BackgroundWrapper from "@/components/BackgroundWrapper";

const primaryColor = "#ec673b";

const faqData = [
  {
    question: "Comment réserver un billet ?",
    answer:
      "Pour réserver un billet, choisissez un événement, sélectionnez la date et le nombre de billets, puis procédez au paiement via les options proposées.",
  },
  {
    question: "Quels moyens de paiement sont acceptés ?",
    answer:
      "Nous acceptons Bankily, Masrvi, ainsi que les cartes bancaires locales.",
  },
  {
    question: "Puis-je annuler ma réservation ?",
    answer:
      "Les annulations dépendent de la politique de l’organisateur de l’événement. Veuillez consulter les conditions avant l’achat.",
  },
  {
    question: "Comment récupérer mon billet après paiement ?",
    answer:
      "Après validation du paiement, un QR code vous sera généré. Vous pouvez le télécharger en PDF ou l’ajouter à votre Wallet.",
  },
  {
    question: "Puis-je transférer mon billet à une autre personne ?",
    answer:
      "Cela dépend de l’événement. Certains billets sont nominatifs et non transférables.",
  },
];

const FAQScreen = () => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <StatusBar style="light" />
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 60 }}
          showsVerticalScrollIndicator={false}
        >
          <Text className="text-white text-2xl font-bold mb-8">FAQ</Text>

          {faqData.map((item, index) => {
            const isExpanded = expandedIndex === index;
            return (
              <View
                key={index}
                className="mb-4 rounded-xl border border-white/20 bg-white/10"
              >
                <TouchableOpacity
                  className="flex-row justify-between items-center px-5 py-4"
                  onPress={() => toggleExpand(index)}
                  activeOpacity={0.7}
                >
                  <Text className="text-white font-semibold text-lg flex-1">
                    {item.question}
                  </Text>
                  <Ionicons
                    name={isExpanded ? "chevron-up" : "chevron-down"}
                    size={24}
                    color={primaryColor}
                  />
                </TouchableOpacity>
                {isExpanded && (
                  <View className="px-5 pb-4">
                    <Text className="text-gray-300 text-base">{item.answer}</Text>
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default FAQScreen;
