import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY_COLOR } from '../constants/notifications';

const InfoBanner: React.FC = () => {
  return (
    <View className="bg-[#ec673b]/10 rounded-xl p-4 mt-6 border border-[#ec673b]/20">
      <View className="flex-row items-start">
        <Ionicons name="information-circle" size={24} color={PRIMARY_COLOR} />
        <Text className="text-gray-300 ml-2 flex-1">
          Les notifications vous informent en temps réel des nouveaux événements, 
          promotions et rappels importants. Vous pouvez personnaliser les préférences ci-dessous.
        </Text>
      </View>
    </View>
  );
};

export default InfoBanner;