import React from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface LoadingErrorStateProps {
  isLoading: boolean;
  error: string | null;
  onRetry: () => void;
  primaryColor: string;
}

const LoadingErrorState: React.FC<LoadingErrorStateProps> = ({
  isLoading,
  error,
  onRetry,
  primaryColor
}) => {
  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color={primaryColor} />
        <Text className="text-white mt-4">Chargement des événements...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 justify-center items-center px-5">
        <MaterialIcons name="error-outline" size={48} color={primaryColor} />
        <Text className="text-white text-lg font-bold mt-4 text-center">{error}</Text>
        <TouchableOpacity
          className="mt-6 bg-[#ec673b] py-3 px-6 rounded-xl"
          onPress={onRetry}
        >
          <Text className="text-white font-bold">Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return null;
};

export default LoadingErrorState;