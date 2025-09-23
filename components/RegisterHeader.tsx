import React from 'react';
import { View, Text, Image } from 'react-native';

interface RegisterHeaderProps {
  title: string;
  subtitle: string;
}

const RegisterHeader: React.FC<RegisterHeaderProps> = ({ title, subtitle }) => {
  return (
    <>
      <View className="items-center mb-8">
        <Image
          source={require('@/assets/logo.png')}
          className="w-48 h-36 mb-4"
        />
        <Text className="text-gray-400">Votre billetterie en ligne</Text>
      </View>
      
      <Text className="text-white text-2xl font-bold mb-6 text-center">{title}</Text>
      <Text className="text-gray-400 text-center mb-8">{subtitle}</Text>
    </>
  );
};

export default RegisterHeader;