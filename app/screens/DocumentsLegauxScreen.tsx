import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Linking,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from "expo-status-bar";
import BackgroundWrapper from "@/components/BackgroundWrapper";

const primaryColor = "#ec673b";

type DocumentStatus = "pending" | "validated" | "rejected";

interface LegalDocument {
  id: string;
  title: string;
  description?: string;
  fileUri?: string;
  status: DocumentStatus;
  feedback?: string;
}

const requiredDocumentsInitial: LegalDocument[] = [
  {
    id: "id_card",
    title: "Pièce d’identité",
    description: "Carte nationale d’identité ou passeport",
    status: "pending",
  },
  {
    id: "license",
    title: "Licence d’organisation",
    description: "Licence ou autorisation officielle d’organisateur d’événements",
    status: "pending",
  },
  {
    id: "company_registration",
    title: "Certificat d’enregistrement",
    description: "Certificat d’enregistrement légal de l’entreprise",
    status: "pending",
  },
  {
    id: "compliance_certificate",
    title: "Attestation de conformité",
    description: "Attestation de conformité aux normes locales",
    status: "pending",
  },
];

export default function DocumentsLegauxScreen() {
  const [documents, setDocuments] = useState<LegalDocument[]>(requiredDocumentsInitial);

  // Ouvre un fichier avec l'app native si possible
  const openFile = async (uri: string) => {
    try {
      await Linking.openURL(uri);
    } catch {
      Alert.alert("Erreur", "Impossible d'ouvrir le document");
    }
  };

  // Choisir un fichier pour un document donné
  const pickDocument = async (docId: string) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf", "image/*"], // accepte PDF et images
        copyToCacheDirectory: true,
      });

      if (result.type === "success") {
        // Met à jour le document avec le fichier sélectionné et remet status en pending (à valider)
        setDocuments((docs) =>
          docs.map((doc) =>
            doc.id === docId
              ? { ...doc, fileUri: result.uri, status: "pending", feedback: undefined }
              : doc
          )
        );
        Alert.alert("Succès", "Document téléversé, en attente de validation.");
      }
    } catch (error) {
      Alert.alert("Erreur", "Une erreur est survenue lors de la sélection du document.");
    }
  };

  // Affichage de l'état sous forme texte coloré
  const renderStatus = (status: DocumentStatus) => {
    switch (status) {
      case "pending":
        return <Text className="text-yellow-400 font-semibold">En attente</Text>;
      case "validated":
        return <Text className="text-green-400 font-semibold">Validé ✓</Text>;
      case "rejected":
        return <Text className="text-red-500 font-semibold">Rejeté ✗</Text>;
    }
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
            Documents légaux
          </Text>

          {documents.map((doc) => (
            <View
              key={doc.id}
              className="bg-white/10 rounded-xl p-5 mb-6 border border-white/10"
            >
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-white text-lg font-semibold">{doc.title}</Text>
                {renderStatus(doc.status)}
              </View>

              {doc.description && (
                <Text className="text-gray-300 mb-3">{doc.description}</Text>
              )}

              {doc.fileUri ? (
                <TouchableOpacity
                  className="mb-3"
                  onPress={() => openFile(doc.fileUri!)}
                  activeOpacity={0.7}
                >
                  <Text className="text-primaryColor underline text-white">
                    Voir le document
                  </Text>
                </TouchableOpacity>
              ) : (
                <Text className="text-gray-400 mb-3 italic">Aucun document téléversé</Text>
              )}

              {doc.status === "rejected" && doc.feedback && (
                <Text className="text-red-400 mb-3 italic">{doc.feedback}</Text>
              )}

              <TouchableOpacity
                className="bg-[#ec673b] rounded-xl py-3 items-center"
                onPress={() => pickDocument(doc.id)}
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold">Téléverser / Remplacer</Text>
              </TouchableOpacity>
            </View>
          ))}

          <Text className="text-gray-400 text-sm italic text-center">
            * Les documents doivent être au format PDF ou image, taille maximale 5 Mo.
          </Text>
        </ScrollView>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
