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

const PrivacyPolicyScreen = () => {
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
              Politique de confidentialité
            </Text>
          </View>

          {/* Intro */}
          <Text className="text-gray-400 mb-6 leading-relaxed">
            Chez Eventick, la protection de vos données personnelles est une
            priorité. Cette Politique de confidentialité explique comment
            nous collectons, utilisons et protégeons vos informations lorsque
            vous utilisez notre application.
          </Text>

          {/* Section 1 */}
          <Text className="text-teal-400 text-lg font-bold mb-2">
            1. Données collectées
          </Text>
          <Text className="text-gray-300 mb-6 leading-relaxed">
            Nous pouvons collecter les données suivantes :
            {"\n"}• Nom et prénom
            {"\n"}• Adresse email
            {"\n"}• Numéro de téléphone
            {"\n"}• Photo de profil
            {"\n"}• Adresse (si fournie)
            {"\n"}• Informations liées aux achats de billets
          </Text>

          {/* Section 2 */}
          <Text className="text-teal-400 text-lg font-bold mb-2">
            2. Utilisation des données
          </Text>
          <Text className="text-gray-300 mb-6 leading-relaxed">
            Vos données sont utilisées pour :
            {"\n"}• Gérer votre compte utilisateur
            {"\n"}• Traiter les achats de billets
            {"\n"}• Fournir le support client
            {"\n"}• Améliorer l’expérience utilisateur
            {"\n"}• Envoyer des notifications liées aux services
          </Text>

          {/* Section 3 */}
          <Text className="text-teal-400 text-lg font-bold mb-2">
            3. Partage des données
          </Text>
          <Text className="text-gray-300 mb-6 leading-relaxed">
            Eventick ne vend jamais vos données personnelles.
            Certaines informations peuvent être partagées avec :
            {"\n"}• Les organisateurs d’événements (uniquement les données nécessaires)
            {"\n"}• Les prestataires de paiement sécurisés
            {"\n"}• Les autorités légales si la loi l’exige
          </Text>

          {/* Section 4 */}
          <Text className="text-teal-400 text-lg font-bold mb-2">
            4. Sécurité des données
          </Text>
          <Text className="text-gray-300 mb-6 leading-relaxed">
            Nous mettons en place des mesures techniques et organisationnelles
            pour protéger vos données contre tout accès non autorisé,
            perte ou divulgation.
          </Text>

          {/* Section 5 */}
          <Text className="text-teal-400 text-lg font-bold mb-2">
            5. Conservation des données
          </Text>
          <Text className="text-gray-300 mb-6 leading-relaxed">
            Vos données sont conservées uniquement le temps nécessaire
            à la fourniture des services ou conformément aux obligations légales.
          </Text>

          {/* Section 6 */}
          <Text className="text-teal-400 text-lg font-bold mb-2">
            6. Vos droits
          </Text>
          <Text className="text-gray-300 mb-6 leading-relaxed">
            Vous disposez des droits suivants :
            {"\n"}• Accès à vos données
            {"\n"}• Modification ou suppression
            {"\n"}• Limitation ou opposition au traitement
            {"\n"}• Suppression de votre compte
          </Text>

          {/* Section 7 */}
          <Text className="text-teal-400 text-lg font-bold mb-2">
            7. Cookies et technologies similaires
          </Text>
          <Text className="text-gray-300 mb-6 leading-relaxed">
            Eventick peut utiliser des technologies similaires aux cookies
            pour améliorer la navigation et analyser l’utilisation de
            l’application.
          </Text>

          {/* Section 8 */}
          <Text className="text-teal-400 text-lg font-bold mb-2">
            8. Modifications de la politique
          </Text>
          <Text className="text-gray-300 mb-6 leading-relaxed">
            Cette Politique de confidentialité peut être mise à jour à tout
            moment. En cas de modification importante, les utilisateurs
            seront informés via l’application.
          </Text>

          {/* Section 9 */}
          <Text className="text-teal-400 text-lg font-bold mb-2">
            9. Contact
          </Text>
          <Text className="text-gray-300 mb-10 leading-relaxed">
            Pour toute question concernant la protection de vos données,
            vous pouvez contacter notre support via la page Contact.
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

export default PrivacyPolicyScreen;
