import React from 'react';
import { View, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Event, Category } from '../types';
import EventCard from './EventCard';

interface CategorySectionProps {
  categoryId: string;
  category: Category;
  events: Event[];
  onEventPress: (eventId: string) => void;
  primaryColor: string;
}

const CategorySection: React.FC<CategorySectionProps> = ({
  categoryId,
  category,
  events,
  onEventPress,
  primaryColor
}) => {
  if (events.length === 0) return null;

  return (
    <View key={categoryId} className="mb-8">
      <View className="flex-row justify-between items-center mb-4">
        <View className="flex-row items-center">
          <Ionicons 
            name={category.icon as any} 
            size={24} 
            color={primaryColor} 
            className="mr-2"
          />
          <Text className="text-white text-xl font-bold">
            À venir en {category.name}
          </Text>
        </View>
        <TouchableOpacity accessibilityRole="button" activeOpacity={0.7}>
          <Text style={{ color: primaryColor }} className="text-sm">Voir tout</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        horizontal
        data={events}
        renderItem={({ item }) => (
          <EventCard 
            event={item} 
            onPress={onEventPress} 
            primaryColor={primaryColor}
            variant="category"
          />
        )}
        keyExtractor={item => item._id}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );
};

export default CategorySection;