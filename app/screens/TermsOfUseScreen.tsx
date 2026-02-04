import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import BackgroundWrapper from '@/components/BackgroundWrapper';

const TermsOfUseScreen = () => {
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
              Conditions d’utilisation
            </Text>
          </View>

          {/* Intro */}
          <Text className="text-gray-400 mb-6 leading-relaxed">
            Les présentes Conditions d’utilisation régissent l’accès et
            l’utilisation de l’application Eventick. En utilisant l’application,
            vous acceptez pleinement ces conditions.
          </Text>

          {/* Section */}
          <Text className="text-teal-400 text-lg font-bold mb-2">
            1. Présentation du service
          </Text>
          <Text className="text-gray-300 mb-6 leading-relaxed">
            Eventick est une plateforme de billetterie et de gestion
            d’événements permettant aux utilisateurs d’acheter des billets
            et aux organisateurs de créer et gérer leurs événements.
          </Text>

          <Text className="text-teal-400 text-lg font-bold mb-2">
            2. Accès à l’application
          </Text>
          <Text className="text-gray-300 mb-6 leading-relaxed">
            L’accès à certaines fonctionnalités nécessite la création d’un
            compte. Vous êtes responsable de la confidentialité de vos
            identifiants et de toute activité effectuée via votre compte.
          </Text>

          <Text className="text-teal-400 text-lg font-bold mb-2">
            3. Achat de billets
          </Text>
          <Text className="text-gray-300 mb-6 leading-relaxed">
            Les billets achetés via Eventick sont soumis aux conditions
            définies par l’organisateur de l’événement. Eventick agit
            uniquement comme intermédiaire et ne peut être tenu responsable
            de l’annulation ou de la modification d’un événement.
          </Text>

          <Text className="text-teal-400 text-lg font-bold mb-2">
            4. Paiements et remboursements
          </Text>
          <Text className="text-gray-300 mb-6 leading-relaxed">
            Les paiements sont traités via des prestataires sécurisés.
            Les politiques de remboursement dépendent de chaque organisateur
            et sont indiquées lors de l’achat.
          </Text>

          <Text className="text-teal-400 text-lg font-bold mb-2">
            5. Comportement de l’utilisateur
          </Text>
          <Text className="text-gray-300 mb-6 leading-relaxed">
            Vous vous engagez à utiliser Eventick de manière légale et
            respectueuse. Toute utilisation abusive, frauduleuse ou
            contraire à la loi pourra entraîner la suspension ou la
            suppression du compte.
          </Text>

          <Text className="text-teal-400 text-lg font-bold mb-2">
            6. Responsabilité
          </Text>
          <Text className="text-gray-300 mb-6 leading-relaxed">
            Eventick ne saurait être tenu responsable des dommages indirects
            résultant de l’utilisation de l’application ou de la participation
            à un événement.
          </Text>

          <Text className="text-teal-400 text-lg font-bold mb-2">
            7. Protection des données
          </Text>
          <Text className="text-gray-300 mb-6 leading-relaxed">
            Les données personnelles sont traitées conformément à notre
            politique de confidentialité. Nous mettons en œuvre des mesures
            de sécurité pour protéger vos informations.
          </Text>

          <Text className="text-teal-400 text-lg font-bold mb-2">
            8. Modification des conditions
          </Text>
          <Text className="text-gray-300 mb-6 leading-relaxed">
            Eventick se réserve le droit de modifier les présentes conditions
            à tout moment. Les utilisateurs seront informés en cas de mise à jour.
          </Text>

          <Text className="text-teal-400 text-lg font-bold mb-2">
            9. Contact
          </Text>
          <Text className="text-gray-300 mb-10 leading-relaxed">
            Pour toute question concernant ces conditions, vous pouvez
            contacter notre support via la page Contact.
          </Text>

          {/* Footer */}
          <View className="items-center mt-4">
            <Text className="text-gray-500 text-sm">
              Dernière mise à jour : {new Date().toLocaleDateString()}
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default TermsOfUseScreen;
