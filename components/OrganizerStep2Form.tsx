import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RegisterFormData } from '../types';

interface OrganizerStep2FormProps {
  formData: RegisterFormData;
  loading: boolean;
  onInputChange: (field: keyof RegisterFormData, value: string) => void;
  onSubmit: () => void;
}

const OrganizerStep2Form: React.FC<OrganizerStep2FormProps> = ({
  formData,
  loading,
  onInputChange,
  onSubmit,
}) => {
  return (
    <ScrollView showsVerticalScrollIndicator={false} className="mb-4">
      <Text className="text-white text-2xl font-bold mb-6 text-center">Informations professionnelles</Text>
      <Text className="text-gray-400 text-center mb-8">
        {"Complétez votre profil d'organisateur"}
      </Text>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">{"Nom de l'entreprise/association"}</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="business" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="Nom officiel"
            placeholderTextColor="#9CA3AF"
            value={formData.companyName}
            onChangeText={text => onInputChange('companyName', text)}
            editable={!loading}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">{"Type d'organisateur"}</Text>
        <View className="flex-row justify-between mb-3">
          <TouchableOpacity
            className={`py-3 px-4 rounded-xl ${formData.organizerType === 'entreprise' ? 'bg-[#ec673b]' : 'bg-white/10'}`}
            onPress={() => onInputChange('organizerType', 'entreprise')}
            disabled={loading}
          >
            <Text className={formData.organizerType === 'entreprise' ? 'text-white' : 'text-white'}>Entreprise</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`py-3 px-4 rounded-xl ${formData.organizerType === 'association' ? 'bg-[#ec673b]' : 'bg-white/10'}`}
            onPress={() => onInputChange('organizerType', 'association')}
            disabled={loading}
          >
            <Text className={formData.organizerType === 'association' ? 'text-white' : 'text-white'}>Association</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`py-3 px-4 rounded-xl ${formData.organizerType === 'particulier' ? 'bg-[#ec673b]' : 'bg-white/10'}`}
            onPress={() => onInputChange('organizerType', 'particulier')}
            disabled={loading}
          >
            <Text className={formData.organizerType === 'particulier' ? 'text-white' : 'text-white'}>Particulier</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">Adresse complète</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="location" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="Quartier, ville"
            placeholderTextColor="#9CA3AF"
            value={formData.address}
            onChangeText={text => onInputChange('address', text)}
            editable={!loading}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">RIB ou compte de paiement</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="card" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="Compte Bankily, Masrvi ou bancaire"
            placeholderTextColor="#9CA3AF"
            value={formData.rib}
            onChangeText={text => onInputChange('rib', text)}
            editable={!loading}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">Liens réseaux sociaux</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="link" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="Facebook, Instagram, site web"
            placeholderTextColor="#9CA3AF"
            value={formData.socialMedia}
            onChangeText={text => onInputChange('socialMedia', text)}
            editable={!loading}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">{"Description de l'activité"}</Text>
        <View className="bg-white/10 rounded-xl px-4 py-3 h-32">
          <TextInput
            className="flex-1 text-white"
            placeholder="Décrivez votre activité..."
            placeholderTextColor="#9CA3AF"
            multiline
            value={formData.description}
            onChangeText={text => onInputChange('description', text)}
            editable={!loading}
          />
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-gray-400 mb-2">Documents légaux</Text>

        {formData.organizerType === 'particulier' ? (
          <View className="mb-3">
            <Text className="text-gray-500 mb-2">{"Pièce d'identité (CIN/Passeport)"}</Text>
            <TouchableOpacity
              className="bg-white/10 rounded-xl p-4 items-center"
              disabled={loading}
            >
              <Ionicons name="cloud-upload" size={32} color="#ec673b" />
              <Text className="text-white mt-2">{"Télécharger la pièce d'identité"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View className="mb-3">
              <Text className="text-gray-500 mb-2">Registre de commerce</Text>
              <TouchableOpacity
                className="bg-white/10 rounded-xl p-4 items-center"
                disabled={loading}
              >
                <Ionicons name="cloud-upload" size={32} color="#ec673b" />
                <Text className="text-white mt-2">Télécharger le registre</Text>
              </TouchableOpacity>
            </View>
            <View>
              <Text className="text-gray-500 mb-2">{"Pièce d'identité du représentant"}</Text>
              <TouchableOpacity
                className="bg-white/10 rounded-xl p-4 items-center"
                disabled={loading}
              >
                <Ionicons name="cloud-upload" size={32} color="#ec673b" />
                <Text className="text-white mt-2">{"Télécharger la pièce d'identité"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <TouchableOpacity
        className={`py-4 rounded-xl items-center mb-6 ${loading ? 'bg-gray-500' : 'bg-[#ec673b]'}`}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text className="text-white font-bold text-lg">
          {loading ? "Soumission..." : "Soumettre pour vérification"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default OrganizerStep2Form;