import React from 'react';
import { Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PRIMARY_COLOR } from '../constants/profile';

interface ProfileActionItemProps {
  icon: string;
  title: string;
  onPress: () => void;
  showChevron?: boolean;
  color?: string;
  disabled?: boolean;
}

const ProfileActionItem: React.FC<ProfileActionItemProps> = ({
  icon,
  title,
  onPress,
  showChevron = true,
  color = PRIMARY_COLOR,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      className={`flex-row items-center p-4 ${disabled ? 'opacity-50' : ''}`}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Ionicons name={icon as any} size={26} color={color} />
      <Text className={`flex-1 ml-4 text-lg font-semibold ${disabled ? 'text-gray-500' : 'text-white'}`}>
        {title}
      </Text>
      {showChevron && !disabled && (
        <Ionicons name="chevron-forward" size={22} color={PRIMARY_COLOR} />
      )}
    </TouchableOpacity>
  );
};

export default ProfileActionItem;