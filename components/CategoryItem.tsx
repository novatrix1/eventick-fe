import React from 'react';
import { TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Category } from '../types';

interface CategoryItemProps {
  category: Category;
  isSelected: boolean;
  onPress: (categoryId: string) => void;
}

const CategoryItem: React.FC<CategoryItemProps> = ({ 
  category, 
  isSelected, 
  onPress 
}) => {
  return (
    <TouchableOpacity
      className={`items-center mr-6 py-3 px-5 rounded-2xl ${isSelected ? 'bg-[#ec673b]' : 'bg-teal-400/20'}`}
      onPress={() => onPress(category.id)}
      activeOpacity={0.7}
    >
      <Ionicons
        name={category.icon}
        size={26}
        color={isSelected ? '#001215' : '#ec673b'}
      />
      <Text
        className={`mt-2 text-sm font-semibold ${isSelected ? 'text-gray-900' : 'text-white'}`}
      >
        {category.name}
      </Text>
    </TouchableOpacity>
  );
};

export default CategoryItem;