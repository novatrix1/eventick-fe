import React from "react";
import { View, Text, ScrollView, SafeAreaView } from "react-native";
import { StatusBar } from "expo-status-bar";
import BackgroundWrapper from "@/components/BackgroundWrapper";

const primaryColor = "#ec673b";

const termsText = `
Bienvenue sur notre application de réservation de billets d'événements en Mauritanie.

1. Acceptation des conditions
En utilisant cette application, vous acceptez de respecter les présentes conditions d'utilisation.

2. Utilisation du service
Vous vous engagez à utiliser notre service uniquement à des fins légales et conformément à toutes les lois applicables.

3. Comptes utilisateurs
Vous êtes responsable de la confidentialité de vos identifiants et de toutes les activités effectuées avec votre compte.

4. Paiements et billetterie
Les paiements sont sécurisés via les méthodes proposées. Les billets achetés sont personnels et non transférables sauf indication contraire.

5. Propriété intellectuelle
Tous les contenus, logos et marques présents sur l'application sont la propriété exclusive de leurs détenteurs respectifs.

6. Limitation de responsabilité
Nous ne pouvons être tenus responsables des interruptions de service, erreurs ou dommages liés à l'utilisation de l'application.

7. Modifications des conditions
Nous nous réservons le droit de modifier ces conditions à tout moment. Les modifications seront publiées sur cette page.

8. Contact
Pour toute question concernant ces conditions, veuillez contacter notre support.

Merci d’utiliser notre application.

`;

const TermsOfUseScreen = () => {
  return (
    <BackgroundWrapper>
      <SafeAreaView className="flex-1" edges={["top"]}>
        <StatusBar style="light" />
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 30, paddingBottom: 60 }}
          showsVerticalScrollIndicator={true}
        >
          <Text className="text-white text-2xl font-bold mb-8">
            Conditions d'utilisation
          </Text>

          <Text className="text-gray-300 text-base whitespace-pre-line">
            {termsText}
          </Text>
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
};

export default TermsOfUseScreen;
