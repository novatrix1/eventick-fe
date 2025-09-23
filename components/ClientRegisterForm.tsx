import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { RegisterFormData } from '../types';

interface ClientRegisterFormProps {
  formData: RegisterFormData;
  loading: boolean;
  onInputChange: (field: keyof RegisterFormData, value: string) => void;
  onSubmit: () => void;
}

const ClientRegisterForm: React.FC<ClientRegisterFormProps> = ({
  formData,
  loading,
  onInputChange,
  onSubmit,
}) => {
  return (
    <>
      <Text className="text-white text-2xl font-bold mb-6 text-center">Créer un compte client</Text>
      <Text className="text-gray-400 text-center mb-8">
        Inscrivez-vous en 1 minute pour acheter vos billets
      </Text>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">Nom complet</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="person" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="Votre nom complet"
            placeholderTextColor="#9CA3AF"
            value={formData.fullName}
            onChangeText={text => onInputChange('fullName', text)}
            editable={!loading}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">Email</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="mail" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="votre@email.com"
            placeholderTextColor="#9CA3AF"
            value={formData.email}
            onChangeText={text => onInputChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>
      </View>

      <View className="mb-4">
        <Text className="text-gray-400 mb-2">Téléphone</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="call" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="+222 XX XX XX XX"
            placeholderTextColor="#9CA3AF"
            value={formData.phone}
            onChangeText={text => onInputChange('phone', text)}
            keyboardType="phone-pad"
            editable={!loading}
          />
        </View>
      </View>

      <View className="mb-8">
        <Text className="text-gray-400 mb-2">Mot de passe</Text>
        <View className="flex-row items-center bg-white/10 rounded-xl px-4 py-3">
          <Ionicons name="lock-closed" size={20} color="#ec673b" className="mr-3" />
          <TextInput
            className="flex-1 text-white"
            placeholder="••••••••"
            placeholderTextColor="#9CA3AF"
            secureTextEntry
            value={formData.password}
            onChangeText={text => onInputChange('password', text)}
            editable={!loading}
          />
        </View>
        <Text className="text-gray-500 text-xs mt-2">Minimum 6 caractères</Text>
      </View>

      <TouchableOpacity
        className={`py-4 rounded-xl items-center mb-6 ${loading ? 'bg-gray-500' : 'bg-[#ec673b]'}`}
        onPress={onSubmit}
        disabled={loading}
      >
        <Text className="text-white font-bold text-lg">
          {loading ? "Traitement..." : "S'inscrire"}
        </Text>
      </TouchableOpacity>
    </>
  );
};

export default ClientRegisterForm;