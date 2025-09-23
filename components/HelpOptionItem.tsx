import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { HelpOption } from '../types';
import { PRIMARY_COLOR } from '../constants/profile';

interface HelpOptionItemProps {
  option: HelpOption;
  onPress: (id: string) => void;
  isLast: boolean;
}

const HelpOptionItem: React.FC<HelpOptionItemProps> = ({ option, onPress, isLast }) => {
  return (
    <TouchableOpacity
      className={`flex-row items-center p-4 ${!isLast ? 'border-b border-white/20' : ''}`}
      onPress={() => onPress(option.id)}
      activeOpacity={0.7}
    >
      <Ionicons name={option.icon as any} size={26} color={PRIMARY_COLOR} />
      <Text className="text-white flex-1 ml-4 text-lg">{option.title}</Text>
      <Ionicons name="chevron-forward" size={22} color={PRIMARY_COLOR} />
    </TouchableOpacity>
  );
};

export default HelpOptionItem;