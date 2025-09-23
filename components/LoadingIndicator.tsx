import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

interface LoadingIndicatorProps {
  message?: string;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({ 
  message = "Chargement..." 
}) => {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#ec673b" />
      <Text className="text-white mt-4">{message}</Text>
    </View>
  );
};

export default LoadingIndicator;