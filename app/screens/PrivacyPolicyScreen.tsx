import React from "react";
import { View, Text, ScrollView, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import BackgroundWrapper from "@/components/BackgroundWrapper";

const primaryColor = "#ec673b";

const privacyPolicyText = `
Politique de confidentialité

1. Introduction
Nous attachons une grande importance à la protection de vos données personnelles. Cette politique explique comment nous collectons, utilisons et protégeons vos informations.

2. Données collectées
Nous collectons les informations que vous fournissez lors de la création de compte, la réservation de billets, et l’utilisation de l’application.

3. Utilisation des données
Vos données sont utilisées pour traiter vos réservations, améliorer nos services, et vous envoyer des notifications pertinentes.

4. Partage des données
Nous ne partageons vos informations qu’avec des partenaires de confiance nécessaires à la prestation du service.

5. Sécurité
Nous mettons en œuvre des mesures techniques et organisationnelles pour protéger vos données contre tout accès non autorisé.

6. Vos droits
Vous avez le droit d’accéder, corriger ou supprimer vos données personnelles. Vous pouvez également vous opposer à certains traitements.

7. Cookies
Nous utilisons des cookies pour améliorer votre expérience utilisateur.

8. Modifications de la politique
Cette politique peut être mise à jour. Toute modification sera publiée dans l’application.

9. Contact
Pour toute question relative à la protection de vos données, contactez notre support.

Merci de votre confiance.
`;

const PrivacyPolicyScreen = () => {
  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <StatusBar style="light" />
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 60 }}
          showsVerticalScrollIndicator={true}
        >
          <Text className="text-white text-2xl font-bold mb-8">
            Politique de confidentialité
          </Text>

          <Text className="text-gray-300 text-base whitespace-pre-line">
            {privacyPolicyText}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default PrivacyPolicyScreen;
