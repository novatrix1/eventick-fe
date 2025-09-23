import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { Category } from '../types';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string;
  onCategorySelect: (categoryId: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onCategorySelect
}) => {
  return (
    <View className="mb-8">
      <Text className="text-white text-xl font-bold mb-4">Catégories</Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        className="pb-2"
      >
        {categories.map(category => (
          <TouchableOpacity
            key={category.id}
            className={`px-5 py-3 rounded-2xl mr-3 ${
              selectedCategory === category.id 
                ? 'bg-[#ec673b]' 
                : 'bg-white/10'
            }`}
            onPress={() => onCategorySelect(category.id)}
            accessibilityRole="button"
          >
            <Text className={selectedCategory === category.id ? 'text-gray-900 font-bold' : 'text-white'}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default CategoryFilter;