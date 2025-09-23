import React from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY_COLOR } from '../constants/notifications';

interface EmptyStateProps {
  title: string;
  message: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, message }) => {
  return (
    <View className="bg-white/10 rounded-2xl p-8 items-center border border-white/10">
      <Ionicons name="notifications-off" size={48} color={PRIMARY_COLOR} />
      <Text className="text-white font-bold text-xl mt-4">
        {title}
      </Text>
      <Text className="text-gray-400 text-center mt-2">
        {message}
      </Text>
    </View>
  );
};

export default EmptyState;