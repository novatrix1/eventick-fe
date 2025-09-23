import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { PRIMARY_COLOR } from '../constants/tickets';

const LoadingState: React.FC = () => {
  return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color={PRIMARY_COLOR} />
      <Text className="text-white mt-4">Chargement de vos billets...</Text>
    </View>
  );
};

export default LoadingState;