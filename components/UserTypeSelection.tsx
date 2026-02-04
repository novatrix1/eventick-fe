import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserType } from '../types';

interface UserTypeSelectionProps {
  userType: UserType;
  setUserType: (type: UserType) => void;
  loading: boolean;
  onContinue: () => void;
}

const UserTypeSelection: React.FC<UserTypeSelectionProps> = ({
  userType,
  setUserType,
  loading,
  onContinue,
}) => {
  return (
    <>
      <Text className="text-white text-2xl font-bold mb-6 text-center">Créer un compte</Text>
      <Text className="text-gray-400 text-center mb-8">
        Sélectionnez votre type de compte pour commencer
      </Text>

      <View className="mb-8">
        <TouchableOpacity
          className={`flex-row items-center p-6 mb-6 rounded-xl ${userType === 'client' ? 'bg-teal-400 border-2 border-teal-400' : 'bg-white/5 border border-white/10'}`}
          onPress={() => setUserType('client')}
          disabled={loading}
        >
          <Ionicons name="person" size={32} color={userType === 'client' ? "#001215" : "#ec673b"} />
          <View className="ml-4">
            <Text className={`text-lg font-bold ${userType === 'client' ? 'text-gray-900' : 'text-white'}`}>
              Je suis Client
            </Text>
            <Text className={userType === 'client' ? 'text-gray-700' : 'text-gray-400'}>
              Acheteur de billets pour des événements
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          className={`flex-row items-center p-6 rounded-xl ${userType === 'organizer' ? 'bg-teal-400 border-2 border-teal-400' : 'bg-white/5 border border-white/10'}`}
          onPress={() => setUserType('organizer')}
          disabled={loading}
        >
          <Ionicons name="business" size={32} color={userType === 'organizer' ? "#001215" : "#ec673b"} />
          <View className="ml-4">
            <Text className={`text-lg font-bold ${userType === 'organizer' ? 'text-gray-900' : 'text-white'}`}>
              Je suis Organisateur
            </Text>
            <Text className={userType === 'organizer' ? 'text-gray-700' : 'text-gray-400'}>
              {"Vendeur d'événements et gestionnaire"}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {userType && (
        <TouchableOpacity
          className={`py-4 rounded-xl items-center ${loading ? 'bg-gray-500' : 'bg-teal-400'}`}
          onPress={onContinue}
          disabled={loading}
        >
          <Text className="text-gray-900 font-bold text-lg">
            {loading ? "Chargement..." : "Continuer"}
          </Text>
        </TouchableOpacity>
      )}
    </>
  );
};

export default UserTypeSelection;